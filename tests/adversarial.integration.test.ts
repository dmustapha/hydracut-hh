import { beforeAll, describe, expect, it } from "vitest";
import { canonicalDigest, canonicalJson } from "../src/domain/canonical";
import { finalizeReceipt } from "../src/domain/receipt";
import type { CanonicalReceipt, Scope } from "../src/domain/types";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { listPortfolioSnapshots, listReceipts, loadIncidentBundle, saveIncidentBaseline, saveReceipt, saveSnapshot } from "../src/db/repository";
import { snapshots } from "../src/db/schema";
import { assertProposedFixBytes, handleVerifyPlanRequest } from "../src/jobs/pipeline";
import { GET, POST } from "../src/app/api/[...path]/route";

type Proof = { receipt: CanonicalReceipt };
type Handler = (request: Request, context: { params: Promise<{ path: string[] }> }) => Promise<Response>;
let proof: Proof;

async function api(method: "GET" | "POST", path: string, body?: unknown): Promise<Response> {
  const headers = new Headers({ "x-request-id": `gate-${canonicalDigest({ method, path, body }).slice(0, 12)}` });
  if (method === "POST") {
    headers.set("content-type", "application/json");
    headers.set("origin", "http://127.0.0.1:3000");
    headers.set("idempotency-key", canonicalDigest({ path, body }).slice(0, 32));
  }
  const request = new Request(`http://127.0.0.1:3000/api/${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const handler = (method === "GET" ? GET : POST) as Handler;
  return handler(request, { params: Promise.resolve({ path: path.split("/") }) });
}

async function expectEnvelope(response: Response, statuses: number[]): Promise<void> {
  expect(statuses).toContain(response.status);
  if (response.ok) return;
  const value = await response.json() as Record<string, unknown>;
  expect(value).toMatchObject({
    code: expect.any(String),
    state: expect.stringMatching(/PARTIAL|UNKNOWN|ERROR/),
    message: expect.any(String),
    requestId: expect.any(String),
    retryable: expect.any(Boolean),
  });
}

beforeAll(async () => {
  const stored = (await listReceipts()).find((row) => row.resultState === "VERIFIED_WITHIN_BOUNDS");
  if (!stored) throw new Error("VERIFIED_ADVERSARIAL_RECEIPT_REQUIRED");
  proof = { receipt: stored.receipt };
});

describe("mandatory false-clean gates", () => {
  it("exercises all sixteen route contracts with authentic identities and failure envelopes", async () => {
    const planKey = proof.receipt.plan.key;
    const receiptDigest = canonicalDigest(proof.receipt);
    const cases: Array<["GET" | "POST", string, unknown?, number[]?]> = [
      ["GET", "health", undefined, [200]],
      ["GET", "incidents", undefined, [200]],
      ["GET", `incidents/${proof.receipt.incidentKey}`, undefined, [200]],
      ["POST", "imports", {}, [400]],
      ["GET", "jobs/missing-job", undefined, [404]],
      ["POST", "imports", { kind: "upload", repository: "fixture/repo", manifestBase64: "***", lockfileBase64: "***" }, [422]],
      ["POST", `incidents/${proof.receipt.incidentKey}/traversals`, {}, [400]],
      ["GET", `incidents/${proof.receipt.incidentKey}/impact`, undefined, [200]],
      ["POST", "incidents/missing-incident/proposed-fixes/discover", {}, [409]],
      ["POST", `incidents/${proof.receipt.incidentKey}/proposed-fixes`, {}, [400]],
      ["GET", `incidents/${proof.receipt.incidentKey}/proposed-fixes`, undefined, [200]],
      ["POST", `incidents/${proof.receipt.incidentKey}/plans`, { proposedFixKeys: proof.receipt.plan.proposedFixKeys, requiredFixKeys: [], forbiddenFixKeys: [] }, [201]],
      ["POST", `plans/${planKey}/verify`, { expectedPlanDigest: "0".repeat(64) }, [409]],
      ["GET", `plans/${planKey}`, undefined, [200]],
      ["GET", `receipts/${receiptDigest}`, undefined, [200]],
      ["GET", `receipts/${receiptDigest}/sarif`, undefined, [200]],
      ["GET", "system", undefined, [200]],
    ];
    for (const [method, path, body, statuses = [200]] of cases) {
      await expectEnvelope(await api(method, path, body), statuses);
    }
  }, 300_000);

  it("rejects receipt bytes and immutable snapshot identity collisions", async () => {
    const digest = canonicalDigest(proof.receipt);
    const changed = { ...proof.receipt, limitations: [...proof.receipt.limitations, "tampered"] };
    await expect(saveReceipt(digest, changed, canonicalJson(changed))).rejects.toThrow("RECEIPT_INSERT_CONFLICT");
    const snapshot = (await listPortfolioSnapshots(proof.receipt.portfolioKey))[0];
    if (!snapshot) throw new Error("ADVERSARIAL_SNAPSHOT_MISSING");
    await expect(saveSnapshot({ ...snapshot, lockfileSha256: "0".repeat(64) })).rejects.toThrow("SNAPSHOT_INSERT_CONFLICT");
    expect(() => assertProposedFixBytes({ manifestSha256: "a", lockfileSha256: "b" }, { manifestSha256: "a", lockfileSha256: "changed" })).toThrow("PROPOSED_FIX_BYTES_DRIFT");
  });

  it("rejects pair tampering and blocks SARIF for a partial receipt", async () => {
    const tampered = { ...proof.receipt, final: { ...proof.receipt.final, pairs: proof.receipt.final.pairs.slice(1) } };
    expect(() => finalizeReceipt(tampered)).toThrow("PAIR_DIGEST_MISMATCH");
    const partialInput: CanonicalReceipt = {
      ...proof.receipt,
      resultState: "PARTIAL",
      plan: { ...proof.receipt.plan, state: "FAILED" },
      final: { ...proof.receipt.final, state: "PARTIAL", refusalReasons: ["ADVERSARIAL_PARTIAL"] },
    };
    const partial = finalizeReceipt(partialInput);
    await saveReceipt(partial.digest, partial.receipt, partial.json);
    await expectEnvelope(await api("GET", `receipts/${partial.digest}/sarif`), [422]);
  });

  it("rejects source-universe, scope, and current-snapshot drift", async () => {
    const bundle = await loadIncidentBundle(proof.receipt.incidentKey);
    const selectedEvidence = bundle.advisories[0]?.evidence;
    if (!selectedEvidence) throw new Error("ADVERSARIAL_SELECTED_EVIDENCE_MISSING");
    const selectedCoordinate = `${selectedEvidence.packageName}@${selectedEvidence.exactVersion}`;
    if (!bundle.incident.baseline || !bundle.incident.verificationBaseline) throw new Error("ADVERSARIAL_BASELINE_MISSING");
    await saveIncidentBaseline(proof.receipt.incidentKey, bundle.incident.baseline, bundle.incident.verificationBaseline, bundle.incident.scopes as Scope[], [selectedCoordinate]);
    await expect(handleVerifyPlanRequest({ jobId: "adversarial-stale-source", planKey: proof.receipt.plan.key, expectedPlanDigest: proof.receipt.plan.key })).rejects.toThrow("PLAN_VERIFICATION_UNIVERSE_STALE");
    await saveIncidentBaseline(proof.receipt.incidentKey, bundle.incident.baseline, bundle.incident.verificationBaseline, ["production"], proof.receipt.plan.verificationSourceCoordinates);
    await expect(handleVerifyPlanRequest({ jobId: "adversarial-stale-plan", planKey: proof.receipt.plan.key, expectedPlanDigest: proof.receipt.plan.key })).rejects.toThrow(/PLAN_(BASELINE|SCOPE|VERIFICATION_UNIVERSE)_STALE/);
    await saveIncidentBaseline(proof.receipt.incidentKey, bundle.incident.baseline, bundle.incident.verificationBaseline, proof.receipt.plan.scopes, proof.receipt.plan.verificationSourceCoordinates);
    const snapshotKey = proof.receipt.plan.baselineSnapshotKeys[0];
    if (!snapshotKey) throw new Error("ADVERSARIAL_CURRENT_SNAPSHOT_MISSING");
    try {
      await db.update(snapshots).set({ role: "historical" }).where(eq(snapshots.key, snapshotKey));
      await expect(handleVerifyPlanRequest({ jobId: "adversarial-stale-snapshot", planKey: proof.receipt.plan.key, expectedPlanDigest: proof.receipt.plan.key })).rejects.toThrow("PLAN_BASELINE_STALE");
    } finally {
      await db.update(snapshots).set({ role: "current" }).where(eq(snapshots.key, snapshotKey));
    }
  }, 300_000);
});
