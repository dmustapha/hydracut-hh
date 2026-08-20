import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { canonicalDigest } from "../src/domain/canonical";
import type { ExtractedSnapshot } from "../src/domain/types";
import { cleanupScenario, runTraversal, traversalBounds, validateTraversalResponse, waitForHydraDBReady, writeApplicationRoot, writeScenario, writeSnapshot } from "../src/integrations/hydradb";

const scenarioKey = `contract-${process.pid}`;
const finalScenarioKey = `${scenarioKey}-final`;
const snapshotKey = canonicalDigest({ fixture: scenarioKey });
const packageKey = `${snapshotKey}:node_modules/minimist:minimist@1.2.5`;
const snapshot: ExtractedSnapshot = {
  key: snapshotKey, lockfileVersion: 3, maxDepth: 1,
  identity: { repository: "fixture/native-direction", commitSha: "a".repeat(40), manifestBlobSha: "upload", lockfileBlobSha: "upload", manifestSha256: "b".repeat(64), lockfileSha256: "c".repeat(64), manifestBytes: 128, lockfileBytes: 512, apiVersion: "local-upload-v1", source: "upload", sourceStamps: [], retrievedAt: "2026-08-19T00:00:00.000Z" },
  packages: [{ key: packageKey, snapshotKey, location: "node_modules/minimist", name: "minimist", version: "1.2.5", purl: "pkg:npm/minimist@1.2.5" }],
  applicationEdges: [{ key: `${snapshotKey}:application->${packageKey}:production`, snapshotKey, fromKey: `application:${snapshotKey}`, toKey: packageKey, scope: "production" }],
  edges: [], rootPackageKeys: [packageKey], extractionSha256: canonicalDigest({ packageKey }),
};
const fixedSnapshotKey = canonicalDigest({ fixture: finalScenarioKey });
const fixedPackageKey = `${fixedSnapshotKey}:node_modules/minimist:minimist@1.2.6`;
const fixedSnapshot: ExtractedSnapshot = {
  ...snapshot, key: fixedSnapshotKey,
  identity: { ...snapshot.identity, commitSha: "d".repeat(40), lockfileSha256: "e".repeat(64) },
  packages: [{ key: fixedPackageKey, snapshotKey: fixedSnapshotKey, location: "node_modules/minimist", name: "minimist", version: "1.2.6", purl: "pkg:npm/minimist@1.2.6" }],
  applicationEdges: [{ key: `${fixedSnapshotKey}:application->${fixedPackageKey}:production`, snapshotKey: fixedSnapshotKey, fromKey: `application:${fixedSnapshotKey}`, toKey: fixedPackageKey, scope: "production" }],
  rootPackageKeys: [fixedPackageKey], extractionSha256: canonicalDigest({ fixedPackageKey }),
};

describe("HydraDB native contract", () => {
  beforeAll(async () => {
    if (!process.env.HYDRADB_HTTP_URL || !process.env.HYDRADB_TOKEN_FILE) throw new Error("HYDRADB_CONTRACT_ENV_REQUIRED");
    await waitForHydraDBReady();
  });
  afterAll(async () => { await cleanupScenario(scenarioKey); await cleanupScenario(finalScenarioKey); });
  it("returns a bounded strong-consistency MSpaths receipt", async () => {
    await writeSnapshot(snapshot); await writeApplicationRoot(snapshot);
    await writeScenario({ scenarioKey, portfolioKey: scenarioKey, applications: [{ applicationKey: snapshot.identity.repository, snapshotKey }], sources: [{ sourceKey: "GHSA-fixture:minimist@1.2.5", selector: "source-fixture", packageKeys: [packageKey] }] });
    const expected = canonicalDigest([`GHSA-fixture:minimist@1.2.5:${snapshot.identity.repository}`]);
    const bounds = traversalBounds({ sourceSelectors: ["source-fixture"], targetSelector: scenarioKey, scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest: expected });
    const result = await runTraversal(bounds);
    expect(result.query).toContain("CALL algo.MSpaths"); expect(result.state).toBe("VERIFIED_WITHIN_BOUNDS"); expect(result.pairs).toHaveLength(1); expect(result.cursorPresent).toBe(false); expect(result.readEpoch).toBeGreaterThanOrEqual(0); expect(result.bookmark).not.toBe("");
    expect((await runTraversal({ ...bounds, expectedPairKeyDigest: canonicalDigest([]) })).state).toBe("PARTIAL");
    expect((await runTraversal({ ...bounds, matchedTargetCount: 2, resultLimit: 2 })).state).toBe("PARTIAL");
    expect(() => traversalBounds({ sourceSelectors: ["source-fixture", "source-fixture"], targetSelector: scenarioKey, scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest: expected })).toThrow("SOURCE_SELECTOR_SET_INVALID");
  });
  it("proves a combined fixed snapshot with scenario-edge readback and zero selected pairs", async () => {
    await writeSnapshot(fixedSnapshot); await writeApplicationRoot(fixedSnapshot);
    await writeScenario({ scenarioKey: finalScenarioKey, portfolioKey: finalScenarioKey, applications: [{ applicationKey: fixedSnapshot.identity.repository, snapshotKey: fixedSnapshotKey }], sources: [{ sourceKey: "GHSA-fixture:minimist@1.2.5", selector: "source-fixture-final", packageKeys: [] }] });
    const bounds = traversalBounds({ sourceSelectors: ["source-fixture-final"], targetSelector: finalScenarioKey, scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest: canonicalDigest([]) });
    const result = await runTraversal(bounds); expect(result.query).toContain("CALL algo.MSpaths"); expect(result.state).toBe("VERIFIED_WITHIN_BOUNDS"); expect(result.pairs).toEqual([]);
  });
  it("fails closed when the native service is unavailable", async () => {
    const original = process.env.HYDRADB_HTTP_URL; process.env.HYDRADB_HTTP_URL = "http://127.0.0.1:1";
    try { const bounds = traversalBounds({ sourceSelectors: ["source-outage"], targetSelector: "outage-target", scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest: canonicalDigest([]) }); await expect(runTraversal(bounds)).rejects.toThrow(); } finally { process.env.HYDRADB_HTTP_URL = original; }
  });
  it("refuses cursor, duplicate, cardinality, metadata, and endpoint mutations", () => {
    const sourceKey = "GHSA-fixture:minimist@1.2.5"; const applicationKey = "fixture/application"; const expectedPairKeyDigest = canonicalDigest([`${sourceKey}:${applicationKey}`]);
    const bounds = traversalBounds({ sourceSelectors: ["mutation-source"], targetSelector: "mutation-target", scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest });
    const path = { nodes: [{ properties: { source_key: sourceKey, source_selector: "mutation-source", key: "source" } }, { properties: { application_key: applicationKey, portfolio_key: "mutation-target", key: "target" } }], relationships: [{ type: "PROD_DEPENDS_ON" }] };
    const complete = { records: [{ path }], read_epoch: 9, bookmark: "fixture-bookmark" };
    expect(validateTraversalResponse(bounds, { sources: 1, targets: 1 }, complete).state).toBe("VERIFIED_WITHIN_BOUNDS");
    const cursor = validateTraversalResponse(bounds, { sources: 1, targets: 1 }, { ...complete, next_cursor: "cursor" });
    expect(cursor.state).toBe("PARTIAL"); expect(cursor.refusalReasons).toContain("CURSOR_PRESENT");
    const duplicated = validateTraversalResponse(bounds, { sources: 1, targets: 1 }, { ...complete, records: [{ path }, { path }] });
    expect(duplicated.state).toBe("PARTIAL"); expect(duplicated.refusalReasons).toEqual(expect.arrayContaining(["DUPLICATE_PAIR_ROWS", "RESULT_BOUND_EXCEEDED"]));
    const missingSource = validateTraversalResponse(bounds, { sources: 0, targets: 1 }, complete);
    const missingTarget = validateTraversalResponse(bounds, { sources: 1, targets: 0 }, complete);
    expect(missingSource.state).toBe("PARTIAL"); expect(missingSource.refusalReasons).toContain("SOURCE_CARDINALITY_MISMATCH");
    expect(missingTarget.state).toBe("PARTIAL"); expect(missingTarget.refusalReasons).toContain("TARGET_CARDINALITY_MISMATCH");
    const missingMetadata = validateTraversalResponse(bounds, { sources: 1, targets: 1 }, { records: [{ path }] });
    expect(missingMetadata.state).toBe("PARTIAL"); expect(missingMetadata.refusalReasons).toEqual(expect.arrayContaining(["READ_EPOCH_MISSING", "BOOKMARK_MISSING"]));
    const wrong = structuredClone(path); wrong.nodes[1]!.properties.portfolio_key = "cross-scenario";
    expect(() => validateTraversalResponse(bounds, { sources: 1, targets: 1 }, { ...complete, records: [{ path: wrong }] })).toThrow("UNEXPECTED_TARGET_ENDPOINT");
  });
});
