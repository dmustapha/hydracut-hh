import { mkdir, readFile, writeFile } from "node:fs/promises";
import { canonicalDigest } from "../src/domain/canonical";
import type { CanonicalReceipt } from "../src/domain/types";

interface ProofClient {
  reproduceFrozenCorpus(): Promise<{ receipt: CanonicalReceipt; observed: {
    applications: number; packageInstances: number; packageEdges: number; bfsPairDigest: string;
    selectedFinalPairs: number; portfolioBaselinePairs: number; portfolioFinalPairs: number;
    lockfileSha256: string[]; applicationOsvIds: string[];
  } }>;
}

async function client(): Promise<ProofClient> {
  const module = await import("../src/jobs/pipeline");
  return { reproduceFrozenCorpus: module.reproduceFrozenCorpus };
}

function assertEqual(name: string, actual: number, expected: number): void {
  if (actual !== expected) throw new Error(`${name}: expected ${expected}, received ${actual}`);
}

async function run(): Promise<void> {
  const frozen = JSON.parse(await readFile("docs/evidence/2026-08-19-pre-forge-runtime.json", "utf8"));
  const result = await (await client()).reproduceFrozenCorpus();
  assertEqual("applications", result.observed.applications, frozen.corpus.applications);
  assertEqual("packageInstances", result.observed.packageInstances, frozen.corpus.package_instances);
  assertEqual("baselinePairs", result.receipt.baseline.pairs.length, frozen.selected_incident.baseline_pairs);
  assertEqual("selectedFinalPairs", result.observed.selectedFinalPairs, frozen.selected_incident["candidate_pairs"]);
  assertEqual("portfolioBaselinePairs", result.observed.portfolioBaselinePairs, frozen.many_source_proof.baseline_source_target_pairs);
  assertEqual("portfolioFinalPairs", result.observed.portfolioFinalPairs, frozen.many_source_proof.candidate_source_target_pairs);
  if (result.receipt.baseline.state !== "VERIFIED_WITHIN_BOUNDS" || result.receipt.final.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("PROOF_NOT_VERIFIED");
  const digest = canonicalDigest(result.receipt);
  await mkdir("artifacts", { recursive: true });
  await writeFile(`artifacts/receipt-${digest}.json`, JSON.stringify(result.receipt, null, 2));
  process.stdout.write(`${JSON.stringify({ status: "PASS", digest, observed: result.observed })}\n`);
}

run().catch((error) => { process.stderr.write(`${JSON.stringify({ status: "FAIL", error: String(error) })}\n`); process.exit(1); });
