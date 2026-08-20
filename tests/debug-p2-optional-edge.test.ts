import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { canonicalDigest } from "../src/domain/canonical";
import type { ExtractedSnapshot } from "../src/domain/types";
import { cleanupScenario, verifySnapshotReadback, waitForHydraDBReady, writeApplicationRoot, writeSnapshot } from "../src/integrations/hydradb";

const scenarioKey = `debug-optional-${process.pid}`;
const snapshotKey = canonicalDigest({ scenarioKey });
const packageKey = `${snapshotKey}:node_modules/optional-fixture:optional-fixture@1.0.0`;
const dependencyKey = `${snapshotKey}:node_modules/optional-dependency:optional-dependency@1.0.0`;
const snapshot: ExtractedSnapshot = {
  key: snapshotKey,
  lockfileVersion: 3,
  maxDepth: 1,
  identity: {
    repository: "fixture/debug-optional",
    commitSha: "e".repeat(40),
    manifestBlobSha: "upload",
    lockfileBlobSha: "upload",
    manifestSha256: "f".repeat(64),
    lockfileSha256: "a".repeat(64),
    manifestBytes: 128,
    lockfileBytes: 512,
    apiVersion: "local-upload-v1",
    source: "upload",
    sourceStamps: [],
    retrievedAt: "2026-08-20T00:00:00.000Z",
  },
  packages: [
    { key: packageKey, snapshotKey, location: "node_modules/optional-fixture", name: "optional-fixture", version: "1.0.0", purl: "pkg:npm/optional-fixture@1.0.0" },
    { key: dependencyKey, snapshotKey, location: "node_modules/optional-dependency", name: "optional-dependency", version: "1.0.0", purl: "pkg:npm/optional-dependency@1.0.0" },
  ],
  applicationEdges: [],
  edges: [{ key: `${snapshotKey}:optional`, snapshotKey, fromKey: packageKey, toKey: dependencyKey, scope: "optional" }],
  rootPackageKeys: [packageKey, dependencyKey],
  extractionSha256: canonicalDigest({ packageKey, dependencyKey, scope: "optional" }),
};

describe("HydraDB optional-scope relationship contract", () => {
  beforeAll(async () => {
    if (!process.env.HYDRADB_HTTP_URL || !process.env.HYDRADB_TOKEN_FILE) throw new Error("HYDRADB_CONTRACT_ENV_REQUIRED");
    await waitForHydraDBReady();
  });
  afterAll(async () => { await cleanupScenario(scenarioKey); });

  it("writes and reads an OPTIONAL_DEPENDS_ON edge", async () => {
    await writeSnapshot(snapshot);
    await writeApplicationRoot(snapshot);
    await expect(verifySnapshotReadback(snapshot)).resolves.toBeUndefined();
  });
});
