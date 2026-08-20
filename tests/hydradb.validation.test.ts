import { readFileSync } from "node:fs";
import { Agent, MockAgent, setGlobalDispatcher } from "undici";
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "../src/domain/canonical";
import type { ExtractedSnapshot } from "../src/domain/types";
import { traversalBounds, validateTraversalResponse, waitForHydraDBReady, writeSnapshot } from "../src/integrations/hydradb";

const sourceKey = "GHSA-fixture:minimist@1.2.5";
const applicationKey = "fixture/application";

function bounds(sourceSelector: string, targetSelector: string, maxImportedDepth = 1) {
  return traversalBounds({
    sourceSelectors: [sourceSelector],
    targetSelector,
    scopes: ["production"],
    maxImportedDepth,
    targetCount: 1,
    expectedPairKeyDigest: canonicalDigest([`${sourceKey}:${applicationKey}`]),
  });
}

function response(path: unknown) {
  return { records: [{ path }], read_epoch: 1, bookmark: "bookmark" };
}

describe("HydraDB traversal witness validation", () => {
  it("reuses one query_id while an in-flight read retry resolves", async () => {
    const bodies: Array<Record<string, unknown>> = [];
    const mock = new MockAgent();
    mock.disableNetConnect();
    const hydra = mock.get("http://hydradb.test");
    hydra.intercept({ method: "POST", path: "/v1/graphs/default/query", body: (body) => { bodies.push(JSON.parse(body)); return true; } })
      .reply(400, { error: { code: "invalid_request", message: "query id test is already active" } });
    hydra.intercept({ method: "POST", path: "/v1/graphs/default/query", body: (body) => { bodies.push(JSON.parse(body)); return true; } })
      .reply(200, { columns: ["id"], rows: [] });
    const prior = { url: process.env.HYDRADB_HTTP_URL, token: process.env.HYDRADB_TOKEN, tokenFile: process.env.HYDRADB_TOKEN_FILE };
    Object.assign(process.env, { HYDRADB_HTTP_URL: "http://hydradb.test", HYDRADB_TOKEN: "test-token" });
    delete process.env.HYDRADB_TOKEN_FILE;
    setGlobalDispatcher(mock);
    try {
      await waitForHydraDBReady(1);
      expect(bodies.length).toBeGreaterThanOrEqual(2);
      expect(new Set(bodies.map((body) => body.query_id))).toHaveLength(1);
    } finally {
      await mock.close();
      setGlobalDispatcher(new Agent());
      restoreHydraEnv(prior);
    }
  });

  it("uses a fresh query_id for each logical mutation invocation", async () => {
    const bodies: Array<Record<string, unknown>> = [];
    const mock = new MockAgent();
    mock.disableNetConnect();
    const hydra = mock.get("http://hydradb.test");
    for (let requestIndex = 0; requestIndex < 4; requestIndex += 1) {
      hydra.intercept({ method: "POST", path: "/v1/graphs/default/query", body: (body) => { bodies.push(JSON.parse(body)); return true; } }).reply(200, requestIndex % 2 === 0 ? { columns: ["key"], rows: [] } : { columns: [], rows: [] });
    }
    const prior = { url: process.env.HYDRADB_HTTP_URL, token: process.env.HYDRADB_TOKEN, tokenFile: process.env.HYDRADB_TOKEN_FILE };
    Object.assign(process.env, { HYDRADB_HTTP_URL: "http://hydradb.test", HYDRADB_TOKEN: "test-token" });
    delete process.env.HYDRADB_TOKEN_FILE;
    setGlobalDispatcher(mock);
    try {
      const snapshot = httpContractSnapshot();
      await writeSnapshot(snapshot);
      await writeSnapshot(snapshot);
      const mutationIds = bodies.filter((body) => String(body.query).startsWith("UNWIND")).map((body) => body.query_id);
      const uniqueMutationIds = [...new Set(mutationIds)];
      expect(uniqueMutationIds).toHaveLength(2);
      expect(uniqueMutationIds).toEqual(uniqueMutationIds.map((id) => expect.stringMatching(/^[0-9a-f-]{36}$/)));
    } finally {
      await mock.close();
      setGlobalDispatcher(new Agent());
      restoreHydraEnv(prior);
    }
  });

  it("does not verify a witness with fewer than two nodes", () => {
    const traversal = bounds("short-source", "short-target");
    const path = { nodes: [{ properties: { source_key: sourceKey, application_key: applicationKey, source_selector: "short-source", portfolio_key: "short-target", key: "source" } }], relationships: [] };
    const result = validateTraversalResponse(traversal, { sources: 1, targets: 1 }, response(path));
    expect(result.state).not.toBe("VERIFIED_WITHIN_BOUNDS");
  });

  it("does not verify a witness when relationships do not equal nodes minus one", () => {
    const traversal = bounds("shape-source", "shape-target", 2);
    const path = { nodes: [{ properties: { source_key: sourceKey, source_selector: "shape-source", key: "source" } }, { properties: { key: "witness" } }, { properties: { application_key: applicationKey, portfolio_key: "shape-target", key: "target" } }], relationships: [{ type: "PROD_DEPENDS_ON" }] };
    const result = validateTraversalResponse(traversal, { sources: 1, targets: 1 }, response(path));
    expect(result.state).not.toBe("VERIFIED_WITHIN_BOUNDS");
  });

  it.each(["missing", "empty"])("does not verify a witness with a %s canonical node key", (keyState) => {
    const traversal = bounds("key-source", "key-target");
    const sourceNode = { source_key: sourceKey, source_selector: "key-source", ...(keyState === "empty" ? { key: "" } : {}) };
    const path = { nodes: [{ properties: sourceNode }, { properties: { application_key: applicationKey, portfolio_key: "key-target", key: "target" } }], relationships: [{ type: "PROD_DEPENDS_ON" }] };
    const result = validateTraversalResponse(traversal, { sources: 1, targets: 1 }, response(path));
    expect(result.state).not.toBe("VERIFIED_WITHIN_BOUNDS");
  });

  it.each(["missing", "empty"])("rejects a %s witness relationship type", (typeState) => {
    const traversal = bounds("relationship-source", "relationship-target");
    const relationship = typeState === "empty" ? { type: "" } : {};
    const path = { nodes: [{ properties: { source_key: sourceKey, source_selector: "relationship-source", key: "source" } }, { properties: { application_key: applicationKey, portfolio_key: "relationship-target", key: "target" } }], relationships: [relationship] };
    expect(() => validateTraversalResponse(traversal, { sources: 1, targets: 1 }, response(path))).toThrow("UNEXPECTED_RELATIONSHIP_TYPE");
  });

  it("rejects a witness whose depth exceeds the declared traversal shape", () => {
    const traversal = bounds("depth-source", "depth-target", 0);
    const path = { nodes: [{ properties: { source_key: sourceKey, source_selector: "depth-source", key: "source" } }, { properties: { application_key: applicationKey, portfolio_key: "depth-target", key: "target" } }], relationships: [{ type: "PROD_DEPENDS_ON" }, { type: "PROD_DEPENDS_ON" }, { type: "PROD_DEPENDS_ON" }, { type: "PROD_DEPENDS_ON" }] };
    expect(() => validateTraversalResponse(traversal, { sources: 1, targets: 1 }, response(path))).toThrow("PATH_DEPTH_EXCEEDED");
  });

  it("does not synthesize a source-to-application edge when witness keys are empty", () => {
    const source = readFileSync(new URL("../src/components/atlas.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("pair.witnessNodeKeys.length ? pair.witnessNodeKeys : [pair.sourceKey, pair.applicationKey]");
  });
});

function httpContractSnapshot(): ExtractedSnapshot {
  const key = "http-contract";
  const packageKey = `${key}:node_modules/example:example@1.0.0`;
  return {
    key, lockfileVersion: 3, maxDepth: 0,
    identity: { repository: "fixture/http-contract", commitSha: "a".repeat(40), manifestBlobSha: "upload", lockfileBlobSha: "upload", manifestSha256: "b".repeat(64), lockfileSha256: "c".repeat(64), manifestBytes: 1, lockfileBytes: 1, apiVersion: "local-upload-v1", source: "upload", sourceStamps: [], retrievedAt: "2026-08-20T00:00:00.000Z" },
    packages: [{ key: packageKey, snapshotKey: key, location: "node_modules/example", name: "example", version: "1.0.0", purl: "pkg:npm/example@1.0.0" }],
    applicationEdges: [], edges: [], rootPackageKeys: [packageKey], extractionSha256: canonicalDigest({ packageKey }),
  };
}

function restoreHydraEnv(prior: { url: string | undefined; token: string | undefined; tokenFile: string | undefined }): void {
  for (const [name, value] of [["HYDRADB_HTTP_URL", prior.url], ["HYDRADB_TOKEN", prior.token], ["HYDRADB_TOKEN_FILE", prior.tokenFile]] as const) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
}
