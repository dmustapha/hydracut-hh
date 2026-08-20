// File: src/integrations/enrichment.ts
import { request } from "undici";
import { canonicalDigest, sha256 } from "../domain/canonical";
import { appendAuditEvent, findFreshSourceCache, saveSourceCache } from "../db/repository";
import type { ExploitationEvidence, SourceStamp } from "../domain/types";

const kevUrl = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const epssBase = "https://api.first.org/data/v1/epss";

interface KevFeed {
  catalogVersion: string;
  dateReleased: string;
  vulnerabilities: Array<{ cveID: string }>;
}

interface EpssResponse {
  status: string;
  data: Array<{ cve: string; epss: string; percentile: string; date: string }>;
}

function isKevFeed(value: unknown): value is KevFeed {
  const item = value as Partial<KevFeed>;
  return typeof item?.catalogVersion === "string" && typeof item.dateReleased === "string" &&
    Array.isArray(item.vulnerabilities) && item.vulnerabilities.every((row) => typeof row?.cveID === "string");
}

function isEpssResponse(value: unknown): value is EpssResponse {
  const item = value as Partial<EpssResponse>;
  return typeof item?.status === "string" && Array.isArray(item.data) && item.data.every((row) =>
    typeof row?.cve === "string" && typeof row.epss === "string" &&
    typeof row.percentile === "string" && typeof row.date === "string");
}

async function getJson<T>(source: "cisa-kev" | "first-epss", url: string, timeout: number, attempt = 0): Promise<{ value: T; text: string; sourceStamp: SourceStamp }> {
  const response = await request(url, {
    method: "GET",
    headers: { "user-agent": "HydraCut/1.0" },
    headersTimeout: 15_000,
    bodyTimeout: timeout,
  });
  if (response.statusCode >= 500 && attempt < 2) {
    await response.body.dump();
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    return getJson<T>(source, url, timeout, attempt + 1);
  }
  if (response.statusCode !== 200) {
    await response.body.dump();
    await appendAuditEvent("SOURCE_FETCH_FAILED", canonicalDigest({ source, url }), {
      source, url, method: "GET", apiVersion: source === "first-epss" ? "v1" : "kev-json-v1",
      responseStatus: response.statusCode, requestTupleSha256: canonicalDigest({ method: "GET", url }),
      retryCount: attempt, errorCode: `ENRICHMENT_HTTP_${response.statusCode}`,
    }).catch(() => undefined);
    throw new Error(`ENRICHMENT_HTTP_${response.statusCode}`);
  }
  const text = await response.body.text();
  return { value: JSON.parse(text) as T, text, sourceStamp: { source, url, method: "GET",
    apiVersion: source === "first-epss" ? "v1" : "kev-json-v1",
    requestTupleSha256: canonicalDigest({ method: "GET", url }), responseStatus: response.statusCode,
    ...(typeof response.headers.etag === "string" ? { etag: response.headers.etag } : {}),
    ...(typeof response.headers["last-modified"] === "string" ? { lastModified: response.headers["last-modified"] } : {}),
    retrievedAt: new Date().toISOString(), payloadSha256: sha256(text), cacheState: "MISS", retryCount: attempt,
    ...(typeof response.headers["x-ratelimit-remaining"] === "string" ? { rateLimitRemaining: response.headers["x-ratelimit-remaining"] } : {}),
    ...(typeof response.headers["x-ratelimit-reset"] === "string" ? { rateLimitReset: response.headers["x-ratelimit-reset"] } : {}), stale: false } };
}

async function cachedJson<T>(source: "cisa-kev" | "first-epss", url: string, ttlMs: number, timeout: number) {
  const requestDigest = canonicalDigest({ source, url });
  const cached = await findFreshSourceCache(source, requestDigest);
  if (cached) {
    const prior = cached.stamps[0];
    if (!prior) throw new Error("SOURCE_CACHE_PROVENANCE_MISSING");
    return { value: cached.payload as T, text: JSON.stringify(cached.payload), sourceStamp: { ...prior, cacheState: "HIT" as const } };
  }
  const result = await getJson<T>(source, url, timeout);
  const retrievedAt = new Date();
  await saveSourceCache({ source, requestDigest, payloadSha256: sha256(result.text), payload: result.value as object,
    stamps: [result.sourceStamp],
    freshUntil: new Date(retrievedAt.getTime() + ttlMs) });
  return result;
}

export async function enrichCve(cve?: string): Promise<ExploitationEvidence> {
  if (!cve) return { kev: "UNKNOWN", sources: [] };
  const epssUrl = `${epssBase}?cve=${encodeURIComponent(cve)}`;
  const [kevResult, epssResult] = await Promise.allSettled([
    cachedJson<KevFeed>("cisa-kev", kevUrl, 6 * 60 * 60 * 1_000, 15_000),
    cachedJson<EpssResponse>("first-epss", epssUrl, 24 * 60 * 60 * 1_000, 10_000),
  ]);
  const kev = kevResult.status === "fulfilled" && isKevFeed(kevResult.value.value) ? kevResult.value : undefined;
  const epss = epssResult.status === "fulfilled" && isEpssResponse(epssResult.value.value) ? epssResult.value : undefined;
  const score = epss?.value.data.find((item) => item.cve === cve);
  return {
    cve,
    kev: kev
      ? kev.value.vulnerabilities.some((item) => item.cveID === cve) ? "LISTED" : "NOT_LISTED"
      : "UNKNOWN",
    ...(kev?.value.catalogVersion ? { kevCatalogVersion: kev.value.catalogVersion } : {}),
    ...(score?.epss ? { epssProbability: score.epss } : {}),
    ...(score?.percentile ? { epssPercentile: score.percentile } : {}),
    ...(score?.date ? { epssDate: score.date } : {}),
    sources: [
      ...(kev ? [{ ...kev.sourceStamp, modifiedAt: kev.value.dateReleased }] : []),
      ...(epss ? [{ ...epss.sourceStamp, ...(score?.date ? { modifiedAt: score.date } : {}) }] : []),
    ],
  };
}
