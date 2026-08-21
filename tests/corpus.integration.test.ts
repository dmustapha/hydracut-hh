import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Agent, MockAgent, setGlobalDispatcher } from "undici";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "../src/domain/canonical";
import { db } from "../src/db/client";
import { sourceCache } from "../src/db/schema";
import { extractSnapshot } from "../src/integrations/arborist";
import { enrichCve } from "../src/integrations/enrichment";
import { discoverProposedFixes, fetchRepositoryFile } from "../src/integrations/github";
import { assertAdvisoryActive, fetchAdvisory, osvRequestDigest, queryExactCoordinate, queryExactPackages, refreshSelectedAdvisory } from "../src/integrations/osv";

const execute = promisify(execFile);

function collectAdvisoryIds(value: unknown, ids = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((item) => collectAdvisoryIds(item, ids));
  else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "id" && typeof item === "string" && /^(GHSA|OSV|RUSTSEC|PYSEC|GO)-/.test(item)) ids.add(item);
      collectAdvisoryIds(item, ids);
    }
  }
  return ids;
}

interface OracleState { repository: string; commitSha: string; label: "baseline" | "proposed" }
interface OracleParity { key: string; scannerIds: string[]; applicationIds: string[] }

function oracleStates(repositories: Array<Record<string, string>>): OracleState[] {
  return repositories.flatMap((row) => [
    { repository: row.repository!, commitSha: row.baseline_commit!, label: "baseline" as const },
    { repository: row.repository!, commitSha: row["candidate_commit"]!, label: "proposed" as const },
  ]);
}

async function scanOracleState(directory: string, state: OracleState, index: number): Promise<OracleParity> {
  const [manifest, lock] = await Promise.all([
    fetchRepositoryFile(state.repository, state.commitSha, "package.json"),
    fetchRepositoryFile(state.repository, state.commitSha, "package-lock.json"),
  ]);
  const path = join(directory, `${index}-package-lock.json`);
  await writeFile(path, lock.bytes, { mode: 0o600 });
  let stdout = "";
  try {
    stdout = (await execute("osv-scanner", ["scan", "source", "-L", path, "--format", "json"],
      { maxBuffer: 64 * 1024 * 1024, timeout: 120_000 })).stdout;
  } catch (error) {
    stdout = String((error as { stdout?: string }).stdout ?? "");
  }
  if (!stdout) throw new Error("OSV_SCANNER_OUTPUT_MISSING");
  const key = `${state.repository}@${state.commitSha}:${state.label}`;
  const snapshot = await extractSnapshot({ snapshotKey: canonicalDigest(key), manifest: manifest.bytes, lockfile: lock.bytes,
    identity: { repository: state.repository, commitSha: state.commitSha, manifestBlobSha: manifest.blobSha,
      lockfileBlobSha: lock.blobSha, manifestSha256: manifest.sha256, lockfileSha256: lock.sha256,
      manifestBytes: manifest.bytes.length, lockfileBytes: lock.bytes.length, apiVersion: "2026-03-10", source: "github",
      sourceStamps: [manifest.sourceStamp, lock.sourceStamp], retrievedAt: new Date().toISOString() } });
  const matches = await queryExactPackages(snapshot.packages);
  return { key, scannerIds: [...collectAdvisoryIds(JSON.parse(stdout))].sort(),
    applicationIds: [...new Set([...matches.values()].flat())].sort() };
}

async function osvParityRows(repositories: Array<Record<string, string>>): Promise<OracleParity[]> {
  const directory = await mkdtemp(join(tmpdir(), "hydracut-osv-oracle-"));
  try {
    const rows: OracleParity[] = [];
    for (const [index, state] of oracleStates(repositories).entries()) {
      rows.push(await scanOracleState(directory, state, index));
    }
    return rows;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

describe("authentic frozen corpus", () => {
  it("does not reuse package-keyed OSV cache payloads across snapshots", () => {
    const pkg = { key: "snapshot-a:pkg", snapshotKey: "snapshot-a", location: "node_modules/example",
      name: "example", version: "1.0.0", purl: "pkg:npm/example@1.0.0" };
    expect(osvRequestDigest([pkg])).not.toBe(osvRequestDigest([{ ...pkg, key: "snapshot-b:pkg", snapshotKey: "snapshot-b" }]));
  });

  it("extracts a malicious-script fixture without executing repository code", async () => {
    const marker = join(tmpdir(), `hydracut-execution-marker-${process.pid}`);
    await rm(marker, { force: true });
    const manifest = Buffer.from(JSON.stringify({ name: "no-execution-fixture", version: "1.0.0",
      scripts: { postinstall: `node -e \"require('fs').writeFileSync('${marker}','executed')\"` } }));
    const lockfile = Buffer.from(JSON.stringify({ name: "no-execution-fixture", version: "1.0.0",
      lockfileVersion: 3, requires: true, packages: { "": { name: "no-execution-fixture", version: "1.0.0" } } }));
    await extractSnapshot({ snapshotKey: "no-execution-fixture", manifest, lockfile,
      identity: { repository: "fixture/no-execution", commitSha: "a".repeat(40), manifestBlobSha: "fixture",
        lockfileBlobSha: "fixture", manifestSha256: canonicalDigest(manifest), lockfileSha256: canonicalDigest(lockfile),
        manifestBytes: manifest.length, lockfileBytes: lockfile.length, apiVersion: "local-upload-v1", source: "upload",
        sourceStamps: [], retrievedAt: "2026-08-19T00:00:00.000Z" } });
    await expect(access(marker)).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("rejects OSV misalignment, follows continuation, and refuses withdrawal", async () => {
    const pkg = { key: "osv-contract:pkg", snapshotKey: "osv-contract", location: "node_modules/osv-contract",
      name: "osv-contract-fixture", version: "0.0.1", purl: "pkg:npm/osv-contract-fixture@0.0.1" };
    const misaligned = new MockAgent();
    misaligned.disableNetConnect();
    misaligned.get("https://api.osv.dev").intercept({ method: "POST", path: "/v1/querybatch" })
      .reply(200, { results: [] });
    setGlobalDispatcher(misaligned);
    try {
      await expect(queryExactPackages([pkg])).rejects.toThrow("OSV_ALIGNMENT_MISMATCH");
    } finally { await misaligned.close(); }

    const paged = new MockAgent();
    paged.disableNetConnect();
    const osv = paged.get("https://api.osv.dev");
    osv.intercept({ method: "POST", path: "/v1/query" }).reply(200,
      { vulns: [{ id: "GHSA-page-one", modified: "2026-08-19T00:00:00Z" }], next_page_token: "next" });
    osv.intercept({ method: "POST", path: "/v1/query" }).reply(200,
      { vulns: [{ id: "GHSA-page-two", modified: "2026-08-19T00:00:00Z" }] });
    const withdrawnId = "GHSA-withdrawn-fixture";
    osv.intercept({ method: "POST", path: "/v1/query" }).reply(200,
      { vulns: [{ id: withdrawnId, modified: "2026-08-19T00:00:00Z" }] });
    osv.intercept({ method: "GET", path: `/v1/vulns/${withdrawnId}` }).reply(200, {
      id: withdrawnId, aliases: [], published: "2026-01-01T00:00:00Z", modified: "2026-08-19T00:00:00Z",
      withdrawn: "2026-08-18T00:00:00Z", affected: [{ package: { ecosystem: "npm", name: pkg.name },
        versions: [pkg.version], ranges: [] }], references: [],
    });
    setGlobalDispatcher(paged);
    try {
      const continuation = await queryExactCoordinate(pkg.name, pkg.version);
      expect(continuation.ids).toEqual(["GHSA-page-one", "GHSA-page-two"]);
      const refreshed = await refreshSelectedAdvisory(withdrawnId, pkg.name, pkg.version);
      expect(() => assertAdvisoryActive(refreshed.advisory)).toThrow("WITHDRAWN_ADVISORY_REVIEW_REQUIRED");
    } finally {
      await paged.close();
      setGlobalDispatcher(new Agent());
    }
  });
  it("discovers only evidenced bot proposed fixes across complete pagination", async () => {
    const mock = new MockAgent();
    mock.disableNetConnect();
    const github = mock.get("https://api.github.com");
    github.intercept({ method: "GET", path: "/repos/fixture/repo/pulls?state=open&per_page=100" })
      .reply(200, [{ number: 7, html_url: "https://github.com/fixture/repo/pull/7",
        user: { login: "dependabot[bot]", type: "Bot" },
        head: { sha: "a".repeat(40), ref: "dependabot/npm_and_yarn/minimist-1.2.6" } }],
        { headers: { link: '<https://api.github.com/repos/fixture/repo/pulls?state=open&per_page=100&page=2>; rel="next"' } });
    github.intercept({ method: "GET", path: "/repos/fixture/repo/pulls?state=open&per_page=100&page=2" }).reply(200, []);
    github.intercept({ method: "GET", path: "/repos/fixture/repo/pulls/7/files?per_page=100" })
      .reply(200, [{ filename: "package-lock.json", status: "modified" }]);
    setGlobalDispatcher(mock);
    try {
      const fixes = await discoverProposedFixes("fixture/repo");
      expect(fixes).toHaveLength(1);
      expect(fixes[0]?.evidence).toMatchObject({ actorLogin: "dependabot[bot]", actorType: "Bot",
        headRef: "dependabot/npm_and_yarn/minimist-1.2.6" });
      expect(fixes[0]?.evidence.fileListSha256).toMatch(/^[a-f0-9]{64}$/);
    } finally {
      await mock.close();
      setGlobalDispatcher(new Agent());
    }
  });
  it("fails closed under source rate limits and outages", async () => {
    await db.delete(sourceCache).where(eq(sourceCache.source, "cisa-kev"));
    await db.delete(sourceCache).where(eq(sourceCache.source, "first-epss"));
    const mock = new MockAgent();
    mock.disableNetConnect();
    mock.get("https://api.github.com").intercept({ method: "GET", path: /\/repos\/fixture\/repo\/contents\/package-lock\.json/ })
      .reply(429, {}, { headers: { "x-ratelimit-reset": "9999999999" } });
    mock.get("https://api.osv.dev").intercept({ method: "POST", path: "/v1/querybatch" }).reply(503, {}).times(4);
    mock.get("https://api.osv.dev").intercept({ method: "POST", path: "/v1/query" }).reply(503, {}).times(4);
    mock.get("https://www.cisa.gov").intercept({ method: "GET", path: "/sites/default/files/feeds/known_exploited_vulnerabilities.json" }).reply(503, {}).times(3);
    mock.get("https://api.first.org").intercept({ method: "GET", path: "/data/v1/epss?cve=CVE-2099-0001" }).reply(503, {}).times(3);
    setGlobalDispatcher(mock);
    try {
      await expect(fetchRepositoryFile("fixture/repo", "a".repeat(40), "package-lock.json")).rejects.toThrow("GITHUB_RATE_LIMITED");
      const pkg = { key: "failure:pkg", snapshotKey: "failure", location: "node_modules/failure", name: "failure-fixture", version: "0.0.0", purl: "pkg:npm/failure-fixture@0.0.0" };
      await expect(queryExactPackages([pkg])).rejects.toThrow("OSV_HTTP_503");
      await expect(refreshSelectedAdvisory("GHSA-fixture", pkg.name, pkg.version)).rejects.toThrow("OSV_HTTP_503");
      const exploitation = await enrichCve("CVE-2099-0001");
      expect(exploitation).toMatchObject({ kev: "UNKNOWN", sources: [] });
      expect(exploitation.epssProbability).toBeUndefined();
      expect(exploitation.kev).not.toBe("NOT_LISTED");
    } finally {
      await mock.close();
      setGlobalDispatcher(new Agent());
    }
  });
  it("captures complete live source provenance without defaulting unknown evidence to zero", async () => {
    const frozen = JSON.parse(await readFile("docs/evidence/2026-08-19-pre-forge-runtime.json", "utf8"));
    const repository = frozen.corpus.repositories[0];
    if (!repository?.repository || !repository?.baseline_commit) throw new Error("FROZEN_REPOSITORY_MISSING");
    const lock = await fetchRepositoryFile(repository.repository, repository.baseline_commit, "package-lock.json");
    expect(lock.sourceStamp).toMatchObject({ source: "github", method: "GET", apiVersion: "2026-03-10", responseStatus: 200, cacheState: "MISS" });
    expect(lock.sourceStamp.requestTupleSha256).toMatch(/^[a-f0-9]{64}$/);
    const selected = frozen.selected_incident;
    const pkg = { key: `oracle:${selected.package}@${selected.affected_version}`, snapshotKey: "oracle",
      location: `node_modules/${selected.package}`, name: selected.package, version: selected.affected_version,
      purl: `pkg:npm/${selected.package}@${selected.affected_version}` };
    const ids = await queryExactPackages([pkg]);
    expect(ids.get(pkg.key)).toContain(selected.advisory);
    const advisory = await fetchAdvisory(selected.advisory, selected.package, selected.affected_version);
    expect(advisory.source).toMatchObject({ source: "osv", method: "GET", apiVersion: "v1", responseStatus: 200 });
    const enrichment = await enrichCve(advisory.aliases.find((alias) => alias.startsWith("CVE-")));
    expect(["LISTED", "NOT_LISTED", "UNKNOWN"]).toContain(enrichment.kev);
    for (const stamp of enrichment.sources) expect(stamp.requestTupleSha256).toMatch(/^[a-f0-9]{64}$/);
  });
  it("reproduces hashes, topology, BFS parity, OSV oracle, baseline and final proof", async () => {
    const expected = JSON.parse(await readFile("docs/evidence/2026-08-19-pre-forge-runtime.json", "utf8"));
    const { reproduceFrozenCorpus } = await import("../src/jobs/pipeline");
    const actual = await reproduceFrozenCorpus();
    expect(actual.observed.applications).toBe(expected.corpus.applications);
    expect(actual.observed.packageInstances).toBe(expected.corpus.package_instances);
    expect(actual.observed.packageEdges).toBe(expected.corpus.package_dependency_edges);
    const expectedLocks = expected.corpus.repositories.flatMap((row: Record<string, string>) =>
      [row.baseline_lock_sha256, row["candidate_lock_sha256"]]).sort();
    expect(actual.observed.lockfileSha256).toEqual(expectedLocks);
    expect(actual.observed.bfsPairDigest).toBe(actual.receipt.baseline.pairKeyDigest);
    expect(actual.observed.portfolioBaselinePairs).toBe(expected.many_source_proof.baseline_source_target_pairs);
    expect(actual.observed.portfolioFinalPairs).toBe(expected.many_source_proof.candidate_source_target_pairs);
    expect(actual.observed.selectedFinalPairs).toBe(expected.selected_incident["candidate_pairs"]);
    const parity = await osvParityRows(expected.corpus.repositories);
    expect(parity).toHaveLength(6);
    for (const row of parity) expect(row.scannerIds, row.key).toEqual(row.applicationIds);
    expect(parity.flatMap((row) => row.scannerIds)).toContain(expected.selected_incident.advisory);
    expect(actual.receipt.final.pairs).toHaveLength(expected.many_source_proof.candidate_source_target_pairs);
  }, 300_000);
});
