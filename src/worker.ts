import type { Job } from "pg-boss";
import { canonicalDigest } from "./domain/canonical";
import { markJobState } from "./db/repository";
import type { JobResult } from "./domain/types";
import { boss, enqueue, startQueue } from "./jobs/queue";
import {
  handleDiscoverProposedFixes,
  handleEvaluateProposedFix,
  handleImport,
  handleRefreshEvidence,
  handleVerifyPlanRequest,
  type EvaluatePayload,
  type ImportPayload,
  type VerifyRequest,
} from "./jobs/pipeline";
import { cleanupScenario } from "./integrations/hydradb";

type RefreshPayload = { incidentKey: string; scopes: Array<"production" | "development" | "optional" | "peer">; sourceFindingIds: string[]; verificationSourceCoordinates: string[] };
type EvaluateJob = EvaluatePayload | { mode: "discover"; incidentKey: string };
type CleanupPayload = { scenarioKey: string };
type ProductJob<T> = T & { productJobId: string };

async function executeJob(productJobId: string, action: () => Promise<JobResult | undefined>): Promise<void> {
  await markJobState(productJobId, "RUNNING");
  try { const result = await action(); await markJobState(productJobId, "COMPLETE", undefined, result); }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const match = message.match(/^[A-Z][A-Z0-9_]{2,63}/);
    await markJobState(productJobId, "FAILED", match?.[0] ?? "UNKNOWN_ERROR");
    process.stderr.write(`${JSON.stringify({ level: "error", event: "job-failed", productJobId, message })}\n`);
    throw error;
  }
}

async function run(): Promise<void> {
  await startQueue();
  await boss.work("import-snapshot", { localConcurrency: 1 }, async ([job]: Job<ProductJob<ImportPayload>>[]) => { if (!job) throw new Error("WORKER_JOB_MISSING"); const { productJobId, ...payload } = job.data; await executeJob(productJobId, async () => { const result = await handleImport({ ...payload, jobId: productJobId }); return { kind: "import", portfolioKey: payload.portfolioKey, ...result, nextHref: `/portfolio?portfolio=${encodeURIComponent(payload.portfolioKey)}` }; }); });
  await boss.work("refresh-evidence", { localConcurrency: 1 }, async ([job]: Job<ProductJob<RefreshPayload>>[]) => { if (!job) throw new Error("WORKER_JOB_MISSING"); const { productJobId, ...payload } = job.data; await executeJob(productJobId, async () => { const result = await handleRefreshEvidence({ ...payload, jobId: productJobId }); return { kind: "refresh", incidentKey: payload.incidentKey, baselinePairDigest: result.baseline.pairDigest, verificationBaselinePairDigest: result.verificationBaseline.pairDigest, nextHref: `/incidents/${payload.incidentKey}/impact` }; }); });
  await boss.work("evaluate-proposed-fix", { localConcurrency: 2 }, async ([job]: Job<ProductJob<EvaluateJob>>[]) => {
    if (!job) throw new Error("WORKER_JOB_MISSING");
    const { productJobId, ...payload } = job.data;
    await executeJob(productJobId, async () => { if ("mode" in payload) { const inputs = await handleDiscoverProposedFixes(payload.incidentKey, productJobId); const candidateJobIds: string[] = []; for (const input of inputs) candidateJobIds.push(await enqueue("evaluate-proposed-fix", input, canonicalDigest({ incidentKey: input.incidentKey, repository: input.repository, ref: input.ref }))); return { kind: "discover", incidentKey: payload.incidentKey, candidateCount: inputs.length, candidateJobIds, candidates: inputs.map((input) => ({ repository: input.repository, ref: input.ref, ...(input.sourceUrl ? { sourceUrl: input.sourceUrl } : {}), pullNumber: input.discoveryEvidence!.pullNumber })), nextHref: `/incidents/${payload.incidentKey}/proposed-fixes` }; } const outcome = await handleEvaluateProposedFix({ ...payload, jobId: productJobId }); return { kind: "evaluate", incidentKey: payload.incidentKey, proposedFixKey: outcome.proposedFixKey, outcome, nextHref: `/incidents/${payload.incidentKey}/proposed-fixes` }; });
  });
  await boss.work("verify-plan", { localConcurrency: 1 }, async ([job]: Job<ProductJob<VerifyRequest>>[]) => { if (!job) throw new Error("WORKER_JOB_MISSING"); const { productJobId, ...payload } = job.data; await executeJob(productJobId, async () => { const result = await handleVerifyPlanRequest({ ...payload, jobId: productJobId }); return { kind: "verify", digest: result.digest, nextHref: `/proof/${result.digest}` }; }); });
  await boss.work("cleanup-scenario", { localConcurrency: 1 }, async ([job]: Job<ProductJob<CleanupPayload>>[]) => { if (!job) throw new Error("WORKER_JOB_MISSING"); const { productJobId, ...payload } = job.data; await executeJob(productJobId, async () => { await cleanupScenario(payload.scenarioKey); return { kind: "cleanup", scenarioKey: payload.scenarioKey }; }); });
  process.stdout.write(`${JSON.stringify({ level: "info", event: "worker-ready" })}\n`);
}

async function shutdown(signal: string): Promise<void> {
  process.stdout.write(`${JSON.stringify({ level: "info", event: "worker-stop", signal })}\n`);
  await boss.stop({ graceful: true, timeout: 30_000 });
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
run().catch((error) => { process.stderr.write(`${JSON.stringify({ level: "fatal", error: String(error) })}\n`); process.exit(1); });
