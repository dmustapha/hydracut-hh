# Technical Spike: HydraCut powered by CampaignRadius

Verified: 2026-08-19  
Mode: Forge only; no product implementation performed  
Authority: primary documentation, official registries, current public APIs, and the frozen local runtime evidence

## 1. Decision summary

The P0 architecture is a TypeScript monorepo with a Next.js web/BFF process, a separate Node worker, PostgreSQL for durable product state and jobs, and self-hosted HydraDB OSS for graph truth. The app calls HydraDB through the already-proven HTTP OpenCypher endpoint. PostgreSQL is deliberately reused for durable jobs through pg-boss; Redis is omitted. Canonical receipts are immutable PostgreSQL JSONB rows keyed by SHA-256; raw lockfiles are discarded after extraction unless the user downloads the receipt in the same session.

This design has four non-replaceable computations:

1. npm Arborist reconstructs each complete committed or uploaded lockfile without installing packages.
2. OSV and its enrichments establish advisory evidence and freshness.
3. Native `algo.MSpaths` computes baseline source-to-application pairs.
4. Native `algo.MSpaths` recomputes the final combined proposed-fix plan; no client-side result may replace this proof.

## 2. Technology versions

Version policy: pin every direct dependency exactly in `package.json`; pin container images by immutable digest when available. “Current” means observed on 2026-08-19 and is not a promise about later releases.

| Technology | Exact version | Evidence | Confidence | Ownership and consequence |
|---|---:|---|:---:|---|
| Node.js | 24.10.0 | Local runtime `node --version`; pg-boss requires Node 22.12+ | HIGH | Runtime for web and worker; one language across boundary |
| pnpm | 11.22.0 | Official npm registry `npm view pnpm version` | HIGH | Workspace and frozen lockfile |
| Next.js | 16.3.1 | Official Next.js docs display “Latest Version 16.3.1”; npm registry agrees | HIGH | App Router UI and route-handler BFF |
| React / React DOM | 19.2.8 | Official npm registry | HIGH | UI runtime |
| TypeScript | 7.0.2 | Official npm registry | HIGH | Strict shared types; build gate verifies library compatibility |
| Tailwind CSS | 4.3.3 | Official npm registry | HIGH | Token-driven styling; no separate CSS-in-JS runtime |
| Radix UI aggregate | 1.6.7 | Official npm registry | HIGH | Accessible dialogs, tabs, menus, and focus primitives |
| TanStack Query | 5.101.4 | Official npm registry | HIGH | Server-state polling and invalidation; URL owns durable selection state |
| Zod | 4.4.3 | Official npm registry | HIGH | Runtime validation at every integration boundary |
| @xyflow/react | 12.11.3 | Official npm registry | HIGH | Bounded witness graph; table remains the canonical accessible result |
| PostgreSQL | 18.6 | Official PostgreSQL release notes, 2026-08-13 | HIGH | Product metadata, provenance, immutable receipts, job state |
| pg | 8.23.0 | Official npm registry | HIGH | PostgreSQL client |
| Drizzle ORM | 0.45.2 | Official npm registry | HIGH | Typed schema/migrations; raw SQL remains allowed for immutable constraints |
| pg-boss | 12.27.0 | Official npm registry; official repository documents PostgreSQL-backed durable jobs | HIGH | One durable queue, retry/backoff, no Redis operational surface |
| @npmcli/arborist | 10.0.2 | Official npm registry | HIGH | `loadVirtual()` lockfile reconstruction; never `reify()` |
| undici | 8.10.0 | Official npm registry | HIGH | Time-bounded HTTP clients and connection pools |
| Pino | 10.3.1 | Official npm registry | HIGH | Structured logs with scan/job/query correlation IDs |
| Vitest | 4.1.11 | Official npm registry | HIGH | Unit, property, and integration tests |
| Playwright | 1.62.1 | Official npm registry | HIGH | Browser demo path and responsive/accessibility checks |
| axe-core | 4.13.0 | Official npm registry | HIGH | Automated accessibility assertions |
| OSV-Scanner | 2.5.1 | Official GitHub latest release, published 2026-08-17 | HIGH | Test oracle only; never the production decision path |
| SARIF | 2.1.0 + Errata 01 | OASIS standard and official schema | HIGH | Optional interoperable export |
| HydraDB | image digest `sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709`; source commit `6a2fbb192f37f51a93690a2ae2d2f5e27e6e4219` | Frozen runtime JSON plus current official repository main commit | HIGH for frozen image/runtime | Graph truth; never public-facing ports |

## 3. Alternatives considered

### Application boundary

| Approach | Strength | Cost | Decision |
|---|---|---|---|
| Next.js route handlers plus separate worker | Fewest deployable processes while keeping long jobs out of request lifetimes | Web and worker share a package; requires disciplined boundary | **Chosen** |
| Next.js plus Fastify API plus worker | Strong API isolation and independent scaling | Third process and duplicated HTTP surface are unnecessary for the sprint | Rejected |
| Static SPA plus one API service | Clear separation | Loses server rendering and duplicates routing/config | Rejected |

### Jobs and cache

| Approach | Strength | Cost | Decision |
|---|---|---|---|
| PostgreSQL + pg-boss + persisted source cache tables | One durable system, atomic jobs, inspectable retry state | PostgreSQL carries more responsibility | **Chosen** |
| Redis + BullMQ | Mature queue and fast cache | Adds a service, persistence policy, secrets, and failure mode | Rejected |
| In-process queue | Minimal code | Loses jobs on restart and cannot support reproducible phase state | Rejected |

### Graph transport

| Approach | Strength | Cost | Decision |
|---|---|---|---|
| HydraDB HTTPS/HTTP OpenCypher | Already round-tripped with strong consistency, JSON/NDJSON, read epochs, bookmarks, and actual parser limitations | Requires a strict query renderer for path selector arrays | **Chosen** |
| Neo4j Bolt driver | Standard driver interface and brief recommendation | The critical `MSpaths` behavior and receipt fields were proven over HTTP, not Bolt | P1 fallback only after contract proof |
| Hosted HydraDB SDK | Managed service | Hides graph work and violates the product and hackathon contract | Forbidden |

### Frontend information architecture

| Approach | First question answered | Strength | Weakness | Decision |
|---|---|---|---|---|
| Action-first incident command | “What requires action now?” | Fits AppSec coordination, exposes urgency, affected apps, proposed fixes, and verification | Graph spectacle is one click deeper | **Chosen** |
| Graph-first workbench | “How is everything connected?” | Strong visual demonstration | Makes the operator interpret topology before deciding | Rejected as default; retained as secondary explorer |
| Portfolio-health dashboard | “How healthy are we overall?” | Good leader summary | Can hide uncertainty and selected-incident action | Rejected as default; retained as leader projection |

## 4. Verified integration contracts

### HydraDB OSS

- [VERIFIED] HTTP endpoint: `POST /v1/graphs/default/query` with bearer token and graph namespace.
- [VERIFIED] Strong-consistency OpenCypher writes, reads, JSON, NDJSON, epochs, and bookmarks round-tripped on the frozen image.
- [VERIFIED] `algo.MSpaths` works with incoming traversal across scenario source anchors, typed dependency edges, immutable snapshots, and scenario application targets.
- [VERIFIED] HTTP composite parameters do not safely carry selector arrays in the tested procedure call. The server renders only server-generated selectors matching `^[a-z0-9-]+$`, allowlisted relationship types, and computed integers.
- [VERIFIED] `resultLimit` can silently truncate; the only P0 safe value for `pathCount: 1` is matched source count multiplied by matched target count, followed by cursor, duplicate-pair, and depth checks.
- [VERIFIED] Baseline and final combined plan must use separate native traversals and store exact query text/hash, read epoch, bookmark, timing, and sorted pair digest.
- [UNVERIFIED] `SPpaths` witness expansion on the pinned image. P0 uses the one shortest witness returned by `MSpaths`; no P0 dependency on `SPpaths`.
- [UNVERIFIED] Production restart behavior and local-file GC warning. Deployment gate must restart the exact stack and rerun the frozen receipt before public demo.

### GitHub public read-only API

- [VERIFIED] API version header observed in current official examples: `X-GitHub-Api-Version: 2026-03-10`.
- [VERIFIED] Repository content: `GET /repos/{owner}/{repo}/contents/{path}?ref={sha}`; public resources need no token, read-only token raises rate limit.
- [VERIFIED] Contents API supports raw media, has a 1,000-file directory limit, and rejects files above 100 MB. HydraCut asks only for `package.json` and `package-lock.json` and enforces 10 MiB itself.
- [VERIFIED] Commit resolution: `GET /repos/{owner}/{repo}/commits/{ref}`; persist returned 40-character SHA before any file fetch.
- [VERIFIED] Proposed-fix discovery: `GET /repos/{owner}/{repo}/pulls?state=open&per_page=100`, follow `Link` pagination, then inspect changed files. Classify Dependabot/Renovate only from explicit bot identity/branch evidence; never infer from title alone.
- [VERIFIED] Unauthenticated public limit is 60 requests/hour; authenticated user limit is 5,000/hour. `403`/`429` must honor `Retry-After` or `X-RateLimit-Reset`; repeated secondary-limit responses fail the input rather than hammering GitHub.
- [ASSUMED] Bot identity sets can change. Keep an allowlist as configuration and display the GitHub actor/branch evidence used for classification.

### OSV

- [VERIFIED] `POST https://api.osv.dev/v1/querybatch` accepts ordered package/version queries and can return `next_page_token` per result; every page must complete before a verified conclusion.
- [VERIFIED] `GET https://api.osv.dev/v1/vulns/{id}` supplies canonical record detail including aliases, ranges, severity vectors, published/modified/withdrawn state, and references.
- [VERIFIED] Live selected record: `GHSA-xvch-5gv4-984h`, alias `CVE-2021-44906`, not withdrawn, modified `2026-03-13T22:11:59.523514Z`, CVSS 3.1 vector `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`, npm range fixed at `1.2.6`.
- [VERIFIED] Cache key is exact query tuple plus OSV record modified time. Freshness is visible; a cache hit never deletes its retrieval timestamp.
- [UNVERIFIED] OSV publishes no fixed application request quota in the cited API contract. HydraCut uses bounded batches, concurrency two, 10-second timeouts, and capped exponential retry for `429`/`5xx` only.

### CISA KEV

- [VERIFIED] Feed: `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`.
- [VERIFIED] Live catalog version `2026.08.19`, released `2026-08-19T17:00:32.1366Z`, with 1,671 entries.
- [VERIFIED] Selected `CVE-2021-44906` is absent from that frozen catalog.
- [VERIFIED] Store the full feed SHA-256, catalog version, release time, retrieval time, and membership result. Absence means “not listed in this catalog snapshot,” never “not exploited.”

### FIRST EPSS

- [VERIFIED] Query: `GET https://api.first.org/data/v1/epss?cve={CVE}`.
- [VERIFIED] Live selected result dated `2026-08-19`: probability `0.045810000`, percentile `0.908780000`.
- [VERIFIED] Persist score date and retrieval time; no CVE alias means EPSS is `UNKNOWN`, not zero.
- [ASSUMED] Public service quota is not fixed in the available official page. Batch CVEs, cache by score date, cap concurrency, and degrade prioritization to `UNKNOWN` on outage without changing OSV exposure truth.

### npm Arborist

- [VERIFIED] The pre-Forge runtime used `loadVirtual()` to reconstruct all six frozen before/after committed lockfiles without install or repository code execution.
- [VERIFIED] P0 accepts lockfile versions 2 and 3 only; unknown lockfile versions fail closed.
- [VERIFIED] Never call `reify()`, `buildIdealTree()`, package-manager commands, lifecycle scripts, registry resolution, or repository binaries in the service path.
- [VERIFIED] Normalize one package instance per lockfile location and exactly one mutually exclusive dependency-scope edge per relation.

### OSV-Scanner differential oracle

- [VERIFIED] Official OSV-Scanner 2.5.1 is the frozen test oracle.
- [VERIFIED] It is executed only in CI or an isolated fixture test container against frozen public lockfiles.
- [VERIFIED] Production HydraCut never shells out to it and never uses its result as a runtime fallback.
- [VERIFIED] Acceptance is 100% package/advisory parity for supported frozen fixtures after documented alias normalization; any mismatch blocks the release fixture gate.

### SARIF 2.1.0

- [VERIFIED] Emit OASIS SARIF 2.1.0 with one `run`, HydraCut tool metadata, OSV advisory as `ruleId`, exact lockfile URI/location where available, and properties for bounded graph result and receipt digest.
- [VERIFIED] SARIF is an export view, not the canonical receipt. Missing graph/provenance fields remain in `receipt.json`.

### PostgreSQL storage and pg-boss jobs

- [VERIFIED] PostgreSQL 18.6 is current stable on the official release page.
- [VERIFIED] pg-boss uses PostgreSQL `SKIP LOCKED`, supports retries/backoff, queue policies, and durable asynchronous work.
- [VERIFIED] Job phases are persisted: `VALIDATE`, `FETCH`, `HASH`, `EXTRACT`, `ADVISORY_QUERY`, `GRAPH_WRITE`, `VERIFY_COUNTS`, `TRAVERSE`, `COMPARE`, `RECEIPT`.
- [VERIFIED] Canonical receipts are insert-only rows with unique digest. Corrections create a new receipt linked to the prior digest; no update-in-place.
- [VERIFIED] Cache rows retain source, retrieval time, freshness deadline, payload digest, and raw normalized payload.

## 5. Timeouts, retries, and failure policy

| Integration | Connect / total timeout | Retry | Cache | Fail-closed behavior |
|---|---|---|---|---|
| GitHub | 3s / 15s | 2 for idempotent `5xx`; rate-limit headers govern | Immutable SHA content indefinitely by SHA/hash; PR lists 60s | Input `ERROR`; no stale mutable-ref substitution |
| OSV querybatch/detail | 3s / 10s | 3 on `429`/`5xx`, exponential + jitter | 6h, retain modified/retrieved | Advisory coverage `UNKNOWN`; never clean |
| CISA KEV feed | 3s / 15s | 2 on `5xx` | 6h by catalog version/digest | KEV enrichment `UNKNOWN`; exposure result may remain verified |
| FIRST EPSS | 3s / 10s | 2 on `429`/`5xx` | Through score date + 24h | EPSS `UNKNOWN`; no numeric zero |
| HydraDB query | 3s / 30s baseline/final | one retry only before receipt write and only if idempotent read | no result cache for final proof; receipt is immutable evidence | Scenario `ERROR`; no stored-result fallback |
| PostgreSQL | 2s / statement 10s | pool reconnect; job retry policy | n/a | Request unavailable; job remains durable |

## 6. Unresolved build gates

| Gate | Status | Required proof before demo |
|---|---|---|
| HydraDB x86_64 behavior on target host | UNVERIFIED | Frozen corpus baseline and final receipt parity |
| HydraDB GC warning on final storage | UNVERIFIED | 30-minute soak, restart, cleanup, no lost receipt graph |
| TypeScript 7 compatibility across direct dependencies | UNVERIFIED | install, typecheck, unit tests |
| pg-boss 12.27.0 exact ESM API shape | UNVERIFIED | enqueue/claim/retry/restart contract test |
| Proposed-fix bot classification coverage | ASSUMED | golden GitHub API fixtures plus visible evidence and manual acceptance path |
| 50,000-instance scale | UNVERIFIED and not claimed | separate benchmark; does not block three-repository demo |
| Multi-user isolation | OUT OF SCOPE | single-operator disclosure remains visible |

## 7. Technical-spike conclusion

The architecture is feasible for the authentic three-repository demo if the build executes risk-first: prove the pinned HydraDB query and Postgres job restart first, then build the AppSec incident queue and final combined receipt. The design does not require an LLM, vector store, hosted HydraDB SDK, Redis, package-manager execution, or fabricated fallback. Every remaining unknown has a deterministic test and a fail-closed result state.

## 8. Primary sources

- https://nextjs.org/docs
- https://www.postgresql.org/docs/current/release.html
- https://github.com/hydra-db/hydradb/commit/6a2fbb192f37f51a93690a2ae2d2f5e27e6e4219
- https://docs.github.com/en/rest/repos/contents
- https://docs.github.com/en/rest/commits/commits
- https://docs.github.com/en/rest/pulls/pulls
- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- https://google.github.io/osv.dev/post-v1-querybatch/
- https://ossf.github.io/osv-schema/
- https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
- https://www.first.org/epss/api
- https://github.com/npm/cli/tree/latest/workspaces/arborist
- https://github.com/google/osv-scanner/releases/tag/v2.5.1
- https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
- https://github.com/timgit/pg-boss
