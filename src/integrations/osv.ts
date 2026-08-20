// File: src/integrations/osv.ts
import { request } from "undici";
import { canonicalDigest, sha256 } from "../domain/canonical";
import { appendAuditEvent, findFreshSourceCache, saveSourceCache } from "../db/repository";
import type { AdvisoryEvidence, PackageInstance, SourceStamp } from "../domain/types";

const baseUrl = "https://api.osv.dev";

interface OsvListResult {
  vulns?: Array<{ id: string; modified: string }>;
  next_page_token?: string;
}

interface OsvRecord {
  id: string;
  aliases?: string[];
  published: string;
  modified: string;
  withdrawn?: string;
  severity?: Array<{ type: string; score: string }>;
  database_specific?: Record<string, unknown>;
  affected: Array<{
    package: { ecosystem: string; name: string; purl?: string };
    ranges?: Array<{ events: Array<Record<string, string>> }>;
    versions?: string[];
  }>;
  references?: Array<{ type: string; url: string }>;
}

interface OsvHttpResult<T> {
  value: T;
  stamp: SourceStamp;
}

export function assertAdvisoryActive(advisory: AdvisoryEvidence): void {
  if (advisory.withdrawnAt) throw new Error("WITHDRAWN_ADVISORY_REVIEW_REQUIRED");
}

async function osvJson<T>(path: string, body?: unknown, attempt = 0): Promise<OsvHttpResult<T>> {
  const method = body ? "POST" : "GET";
  const url = `${baseUrl}${path}`;
  const response = await request(`${baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json", "user-agent": "HydraCut/1.0" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    headersTimeout: 15_000,
    bodyTimeout: 10_000,
  });
  if ((response.statusCode === 429 || response.statusCode >= 500) && attempt < 3) {
    await response.body.dump();
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    return osvJson<T>(path, body, attempt + 1);
  }
  if (response.statusCode !== 200) {
    await response.body.dump();
    await appendAuditEvent("SOURCE_FETCH_FAILED", canonicalDigest({ source: "osv", url, body }), {
      source: "osv", url, method, apiVersion: "v1", responseStatus: response.statusCode,
      requestTupleSha256: canonicalDigest({ method, url, body }), retryCount: attempt,
      rateLimitRemaining: response.headers["x-ratelimit-remaining"], rateLimitReset: response.headers["x-ratelimit-reset"],
      errorCode: `OSV_HTTP_${response.statusCode}`,
    }).catch(() => undefined);
    throw new Error(`OSV_HTTP_${response.statusCode}`);
  }
  const text = await response.body.text();
  return { value: JSON.parse(text) as T, stamp: { source: "osv", url, method, apiVersion: "v1",
    requestTupleSha256: canonicalDigest({ method, url, body }), responseStatus: response.statusCode,
    ...(typeof response.headers.etag === "string" ? { etag: response.headers.etag } : {}),
    ...(typeof response.headers["last-modified"] === "string" ? { lastModified: response.headers["last-modified"] } : {}),
    retrievedAt: new Date().toISOString(), payloadSha256: sha256(text), cacheState: "MISS", retryCount: attempt,
    ...(typeof response.headers["x-ratelimit-remaining"] === "string" ? { rateLimitRemaining: response.headers["x-ratelimit-remaining"] } : {}),
    ...(typeof response.headers["x-ratelimit-reset"] === "string" ? { rateLimitReset: response.headers["x-ratelimit-reset"] } : {}), stale: false } };
}

async function queryPage(packages: PackageInstance[]) {
  const queries = packages.map((item) => ({
    package: { ecosystem: "npm", name: item.name },
    version: item.version,
  }));
  return osvJson<{ results: OsvListResult[] }>("/v1/querybatch", { queries });
}

async function queryContinuation(item: PackageInstance, pageToken: string) {
  return osvJson<OsvListResult>("/v1/query", {
    package: { ecosystem: "npm", name: item.name },
    version: item.version,
    page_token: pageToken,
  });
}

export async function queryExactPackages(packages: PackageInstance[]): Promise<Map<string, string[]>> {
  const requestDigest = osvRequestDigest(packages);
  const cached = await findFreshSourceCache("osv-querybatch", requestDigest);
  if (cached) return new Map(Object.entries(cached.payload as Record<string, string[]>));
  const matches = new Map<string, string[]>();
  const stamps: SourceStamp[] = [];
  for (let offset = 0; offset < packages.length; offset += 1_000) {
    const batch = packages.slice(offset, offset + 1_000);
    const response = await queryPage(batch);
    stamps.push(response.stamp);
    if (response.value.results.length !== batch.length) throw new Error("OSV_ALIGNMENT_MISMATCH");
    for (const [index, first] of response.value.results.entries()) {
      const item = batch[index];
      if (!item) throw new Error("OSV_ALIGNMENT_MISMATCH");
      let page = first;
      const ids: string[] = [];
      while (true) {
        ids.push(...(page.vulns?.map(({ id }) => id) ?? []));
        if (!page.next_page_token) break;
        const continuation = await queryContinuation(item, page.next_page_token);
        stamps.push(continuation.stamp);
        page = continuation.value;
      }
      matches.set(item.key, [...new Set(ids)].sort());
    }
  }
  const payload = Object.fromEntries(matches);
  const retrievedAt = new Date();
  await saveSourceCache({ source: "osv-querybatch", requestDigest,
    payloadSha256: canonicalDigest(payload), payload,
    stamps,
    freshUntil: new Date(retrievedAt.getTime() + 60 * 60 * 1_000) });
  return matches;
}

export async function fetchAdvisory(
  id: string,
  packageName: string,
  exactVersion: string,
): Promise<AdvisoryEvidence> {
  const requestDigest = canonicalDigest({ id, packageName, exactVersion });
  const cached = await findFreshSourceCache("osv-detail", requestDigest);
  if (cached) return cached.payload as AdvisoryEvidence;
  const response = await osvJson<OsvRecord>(`/v1/vulns/${encodeURIComponent(id)}`);
  const record = response.value;
  const affected = record.affected.find((item) => item.package.ecosystem === "npm" && item.package.name === packageName);
  if (!affected) throw new Error("OSV_NPM_RANGE_MISSING");
  const events = affected.ranges?.flatMap((range) => range.events) ?? [];
  const fixedVersions = events.flatMap((event) => (event.fixed ? [event.fixed] : []));
  const retrievedAt = new Date().toISOString();
  const rawCvssScore = record.database_specific?.cvss_score;
  const cvssScore = typeof rawCvssScore === "number" && Number.isFinite(rawCvssScore) && rawCvssScore >= 0 && rawCvssScore <= 10 ? rawCvssScore : undefined;
  const evidence: AdvisoryEvidence = {
    osvId: record.id,
    aliases: [...new Set(record.aliases ?? [])].sort(),
    packageName: affected.package.name,
    ecosystem: "npm",
    exactVersion,
    purl: affected.package.purl ?? `pkg:npm/${affected.package.name}`,
    rangeEvents: events,
    publishedAt: record.published,
    modifiedAt: record.modified,
    ...(record.withdrawn ? { withdrawnAt: record.withdrawn } : {}),
    ...(record.severity?.find((item) => item.type === "CVSS_V3")?.score
      ? { cvssVector: record.severity.find((item) => item.type === "CVSS_V3")!.score }
      : {}),
    ...(cvssScore === undefined ? {} : { cvssScore }),
    fixedVersions: [...new Set(fixedVersions)].sort(),
    references: [...new Set(record.references?.map((item) => item.url) ?? [])].sort(),
    source: { ...response.stamp, retrievedAt, modifiedAt: record.modified },
  };
  await saveSourceCache({ source: "osv-detail", requestDigest,
    payloadSha256: canonicalDigest(evidence), payload: evidence, stamps: [evidence.source],
    freshUntil: new Date(Date.now() + 6 * 60 * 60 * 1_000) });
  return evidence;
}

export async function refreshSelectedAdvisory(id: string, packageName: string, exactVersion: string) {
  let token: string | undefined;
  const ids = new Set<string>();
  const queryStamps: SourceStamp[] = [];
  for (let pageNumber = 0; pageNumber < 100; pageNumber += 1) {
    const body = { package: { ecosystem: "npm", name: packageName }, version: exactVersion,
      ...(token ? { page_token: token } : {}) };
    const page = await osvJson<OsvListResult>("/v1/query", body);
    queryStamps.push(page.stamp);
    page.value.vulns?.forEach((item) => ids.add(item.id));
    token = page.value.next_page_token;
    if (!token) break;
    if (pageNumber === 99) throw new Error("OSV_CONTINUATION_BOUND_EXCEEDED");
  }
  if (!ids.has(id)) throw new Error("OSV_SELECTED_ADVISORY_NO_LONGER_MATCHES");
  return { advisory: await fetchAdvisory(id, packageName, exactVersion), queryStamps };
}

export async function queryExactCoordinate(packageName: string, exactVersion: string) {
  let token: string | undefined;
  const ids = new Set<string>();
  const queryStamps: SourceStamp[] = [];
  for (let pageNumber = 0; pageNumber < 100; pageNumber += 1) {
    const body = { package: { ecosystem: "npm", name: packageName }, version: exactVersion,
      ...(token ? { page_token: token } : {}) };
    const page = await osvJson<OsvListResult>("/v1/query", body);
    queryStamps.push(page.stamp);
    page.value.vulns?.forEach((item) => ids.add(item.id));
    token = page.value.next_page_token;
    if (!token) return { ids: [...ids].sort(), queryStamps };
  }
  throw new Error("OSV_CONTINUATION_BOUND_EXCEEDED");
}

export function osvRequestDigest(packages: PackageInstance[]): string {
  return canonicalDigest(packages.map(({ name, version }) => ({ name, version })));
}
