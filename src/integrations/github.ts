// File: src/integrations/github.ts
import { readFileSync } from "node:fs";
import { request } from "undici";
import { canonicalDigest, sha256 } from "../domain/canonical";
import { appendAuditEvent } from "../db/repository";
import type { ProposedFixDiscoveryEvidence, SourceStamp } from "../domain/types";

const apiBase = "https://api.github.com";
const apiVersion = "2026-03-10";
const repositoryPattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const commitPattern = /^[a-f0-9]{40}$/;
const botLogins = new Set(["dependabot[bot]", "renovate[bot]", "renovate-bot"]);

interface GitHubCommit {
  sha: string;
  html_url: string;
}

interface GitHubContent {
  type: "file";
  encoding: "base64" | "none";
  content?: string;
  size: number;
  sha: string;
}

interface GitHubPull {
  number: number;
  html_url: string;
  user: { login: string; type: string };
  head: { ref: string; sha: string };
}

interface GitHubFile {
  filename: string;
  status: string;
}

export interface DiscoveredProposedFix {
  number: number;
  html_url: string;
  head: { ref: string; sha: string };
  evidence: ProposedFixDiscoveryEvidence;
}

function headers(): Record<string, string> {
  const value: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "HydraCut/1.0",
    "X-GitHub-Api-Version": apiVersion,
  };
  const token = process.env.GITHUB_TOKEN_FILE
    ? readFileSync(process.env.GITHUB_TOKEN_FILE, "utf8").trim()
    : process.env.GITHUB_TOKEN;
  if (token) value.Authorization = `Bearer ${token}`;
  return value;
}

function assertRepository(repository: string): void {
  if (!repositoryPattern.test(repository)) throw new Error("INVALID_GITHUB_REPOSITORY");
}

async function githubJson<T>(path: string, attempt = 0): Promise<{ value: T; link?: string; stamp: SourceStamp }> {
  const response = await request(`${apiBase}${path}`, {
    method: "GET",
    headers: headers(),
    headersTimeout: 15_000,
    bodyTimeout: 15_000,
  });
  if (response.statusCode === 403 || response.statusCode === 429) {
    const reset = response.headers["x-ratelimit-reset"] ?? response.headers["retry-after"];
    await response.body.dump();
    await appendAuditEvent("SOURCE_FETCH_FAILED", canonicalDigest({ source: "github", path }), {
      source: "github", url: `${apiBase}${path}`, method: "GET", apiVersion, responseStatus: response.statusCode,
      requestTupleSha256: canonicalDigest({ method: "GET", path }), retryCount: attempt,
      rateLimitRemaining: response.headers["x-ratelimit-remaining"], rateLimitReset: reset,
      errorCode: "GITHUB_RATE_LIMITED",
    }).catch(() => undefined);
    throw new Error(`GITHUB_RATE_LIMITED:${String(reset ?? "unknown")}`);
  }
  if (response.statusCode >= 500 && attempt < 2) {
    await response.body.dump();
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    return githubJson<T>(path, attempt + 1);
  }
  if (response.statusCode !== 200) {
    await response.body.dump();
    await appendAuditEvent("SOURCE_FETCH_FAILED", canonicalDigest({ source: "github", path }), {
      source: "github", url: `${apiBase}${path}`, method: "GET", apiVersion, responseStatus: response.statusCode,
      requestTupleSha256: canonicalDigest({ method: "GET", path }), retryCount: attempt,
      errorCode: `GITHUB_HTTP_${response.statusCode}`,
    }).catch(() => undefined);
    throw new Error(`GITHUB_HTTP_${response.statusCode}`);
  }
  const link = response.headers.link;
  const text = await response.body.text();
  const url = `${apiBase}${path}`;
  const stamp: SourceStamp = { source: "github", url, method: "GET", apiVersion,
    requestTupleSha256: canonicalDigest({ method: "GET", url }), responseStatus: response.statusCode,
    ...(typeof response.headers.etag === "string" ? { etag: response.headers.etag } : {}),
    ...(typeof response.headers["last-modified"] === "string" ? { lastModified: response.headers["last-modified"] } : {}),
    retrievedAt: new Date().toISOString(), payloadSha256: sha256(text), cacheState: "MISS", retryCount: attempt,
    ...(typeof response.headers["x-ratelimit-remaining"] === "string" ? { rateLimitRemaining: response.headers["x-ratelimit-remaining"] } : {}),
    ...(typeof response.headers["x-ratelimit-reset"] === "string" ? { rateLimitReset: response.headers["x-ratelimit-reset"] } : {}), stale: false };
  return { value: JSON.parse(text) as T, stamp, ...(typeof link === "string" ? { link } : {}) };
}

export async function resolveCommit(repository: string, ref: string): Promise<GitHubCommit & { sourceStamp: SourceStamp }> {
  assertRepository(repository);
  const encodedRef = encodeURIComponent(ref);
  const { value, stamp } = await githubJson<GitHubCommit>(`/repos/${repository}/commits/${encodedRef}`);
  if (!commitPattern.test(value.sha)) throw new Error("GITHUB_NON_IMMUTABLE_SHA");
  return { ...value, sourceStamp: stamp };
}

export async function fetchRepositoryFile(
  repository: string,
  commitSha: string,
  path: "package.json" | "package-lock.json",
): Promise<{ bytes: Uint8Array; sha256: string; blobSha: string; sourceStamp: SourceStamp }> {
  assertRepository(repository);
  if (!commitPattern.test(commitSha)) throw new Error("INVALID_COMMIT_SHA");
  const { value, stamp } = await githubJson<GitHubContent>(
    `/repos/${repository}/contents/${path}?ref=${commitSha}`,
  );
  if (value.type !== "file" || value.encoding !== "base64" || !value.content) {
    throw new Error("GITHUB_UNSUPPORTED_CONTENT_RESPONSE");
  }
  if (value.size > 10 * 1024 * 1024) throw new Error("LOCKFILE_TOO_LARGE");
  const bytes = Uint8Array.from(Buffer.from(value.content.replace(/\n/g, ""), "base64"));
  if (bytes.length !== value.size) throw new Error("GITHUB_CONTENT_SIZE_MISMATCH");
  return { bytes, sha256: sha256(bytes), blobSha: value.sha, sourceStamp: stamp };
}

function nextPath(link?: string): string | undefined {
  const next = link?.split(",").find((part) => part.includes('rel="next"'));
  const url = next?.match(/<([^>]+)>/)?.[1];
  return url?.startsWith(apiBase) ? url.slice(apiBase.length) : undefined;
}

async function pullFiles(repository: string, number: number): Promise<{ files: GitHubFile[]; stamps: SourceStamp[] }> {
  const files: GitHubFile[] = [];
  const stamps: SourceStamp[] = [];
  let path: string | undefined = `/repos/${repository}/pulls/${number}/files?per_page=100`;
  while (path) {
    const page = await githubJson<GitHubFile[]>(path);
    files.push(...page.value);
    stamps.push(page.stamp);
    path = nextPath(page.link);
  }
  return { files, stamps };
}

export async function discoverProposedFixes(repository: string): Promise<DiscoveredProposedFix[]> {
  assertRepository(repository);
  const pulls: GitHubPull[] = [];
  const listStamps: SourceStamp[] = [];
  let path: string | undefined = `/repos/${repository}/pulls?state=open&per_page=100`;
  while (path) {
    const page = await githubJson<GitHubPull[]>(path);
    pulls.push(...page.value);
    listStamps.push(page.stamp);
    path = nextPath(page.link);
  }
  const verified: DiscoveredProposedFix[] = [];
  for (const pull of pulls) {
    const identityMatches = pull.user.type === "Bot" && botLogins.has(pull.user.login);
    if (!identityMatches || !commitPattern.test(pull.head.sha)) continue;
    const { files, stamps } = await pullFiles(repository, pull.number);
    const changedFiles = files.map((file) => `${file.status}:${file.filename}`).sort();
    if (files.some((file) => file.filename === "package-lock.json")) verified.push({
      number: pull.number,
      html_url: pull.html_url,
      head: pull.head,
      evidence: { pullNumber: pull.number, actorLogin: pull.user.login, actorType: pull.user.type,
        headRef: pull.head.ref, changedFiles, fileListSha256: canonicalDigest(changedFiles),
        sourceStamps: [...listStamps, ...stamps] },
    });
  }
  return verified;
}
