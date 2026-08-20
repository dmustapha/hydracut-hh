# HydraCut powered by CampaignRadius: Architecture Document

**Version:** Forge V1  
**Date:** 2026-08-19  
**Stack:** TypeScript 7, Next.js 16, React 19, PostgreSQL 18, pg-boss 12, self-hosted HydraDB OSS  
**Status:** Single source of truth for Build. This document specifies code; no source implementation has started.

## Emergency Mode Notice: zero mocked product components

Only the authentic P0 path is represented as executable source. Deferred features are documented as interfaces and downstream tasks, not fake responses. A developer must never add a mock result route, JSON fallback, or hard-coded pair count to make the demo pass.

## 1. System overview

### 1.1 Purpose

HydraCut imports immutable npm dependency states, enriches exact versions with authoritative vulnerability evidence, computes portfolio exposure through native HydraDB `algo.MSpaths`, evaluates real proposed fixes, and verifies one final combined plan through a second native traversal.

### 1.2 Runtime diagram

<pre>
Internet
   |
   | HTTPS 443
   v
[Reverse proxy on VM]
   |
   v
[Next.js web/BFF :3000] ---- SQL ----> [PostgreSQL 18.6]
   |                                         ^
   | enqueue/read job                        | claim/write phases
   v                                         |
[pg-boss tables] <---------------------- [Node worker]
                                             |
            +---------------+----------------+---------------+
            |               |                |               |
            v               v                v               v
        GitHub REST       OSV API       CISA KEV/FIRST   Arborist
            |               |                |               |
            +---------------+----------------+---------------+
                                             |
                                     normalized topology
                                             |
                                             v
                              [HydraDB OSS private :8443]
                                  | baseline MSpaths
                                  | final combined MSpaths
                                  v
                              bounded pair evidence
                                             |
                                  immutable receipt row
                                             |
                                             v
                                    Web proof surface
</pre>

### 1.3 Technology stack

| Technology | Exact version/identity | Purpose | Alternative rejected | Operational consequence |
|---|---|---|---|---|
| Node.js | 24.10.0 | Web and worker runtime | separate Python worker | One dependency/runtime toolchain |
| pnpm | 11.22.0 | Frozen workspace install | npm workspaces | Deterministic lock and fast install |
| Next.js | 16.3.1 | UI, server rendering, BFF | Next + Fastify | One less public process |
| React | 19.2.8 | Interface | Vue/Svelte | Team familiarity and Next integration |
| TypeScript | 7.0.2 | Strict shared domain | JavaScript | Compatibility is a first build gate |
| Tailwind CSS | 4.3.3 | UI tokens and responsive styles | runtime CSS-in-JS | Small runtime; explicit CSS variables |
| TanStack Query | 5.101.4 | Job polling and server cache | custom fetch effects | Standard retry/invalidation ownership |
| Zod | 4.4.3 | Boundary validation | hand-written guards | One schema language for API/source data |
| @xyflow/react | 12.11.3 | Bounded witness visualization | Cytoscape 3.34.1 | React-native nodes; pair table stays canonical |
| PostgreSQL | 18.6 | Product state, cache, receipts, queue | Redis + SQL | One durable system to operate |
| Drizzle ORM | 0.45.2 | Typed schema/query composition | Prisma | Thin SQL mapping and migration control |
| pg-boss | 12.27.0 | Durable jobs | BullMQ | No Redis service |
| Arborist | 10.0.2 | Lockfile virtual tree | npm install | No package execution or resolution |
| undici | 8.10.0 | HTTP clients | framework fetch only | Explicit pools, timeouts, and headers |
| Pino | 10.3.1 | Structured logs | console | Stable correlation and redaction |
| Vitest | 4.1.11 | Unit/integration tests | Jest | ESM and TypeScript integration |
| Playwright | 1.62.1 | Browser tests | Cypress | Multi-browser and video path |
| Caddy | 2.11.4 | TLS termination and single-operator bearer boundary | public Next port | Only reverse proxy publishes host ports |
| OSV-Scanner | 2.5.1 | CI differential oracle | runtime shell call | Test only; no production fallback |
| HydraDB | digest `sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709` | Graph truth and native paths | hosted SDK | Private self-hosted critical path |

### 1.4 File structure

The following 53 authored product files are the Architecture quality-gate denominator. `docs/DOMAIN-GUIDE.md` is a required Build document outside this product-source denominator. `pnpm-lock.yaml`, Next build output, Drizzle generated migration metadata, downloads, and generated test artifacts are excluded.

<pre>
hydracut-app/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── Dockerfile
├── docker-compose.yml
├── Caddyfile
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── incidents/page.tsx
│   │   ├── incidents/[incidentId]/page.tsx
│   │   ├── incidents/[incidentId]/impact/page.tsx
│   │   ├── incidents/[incidentId]/proposed-fixes/page.tsx
│   │   ├── incidents/[incidentId]/plan/page.tsx
│   │   ├── plans/[planId]/verify/page.tsx
│   │   ├── proof/page.tsx
│   │   ├── proof/[digest]/page.tsx
│   │   ├── portfolio/page.tsx
│   │   ├── graph/page.tsx
│   │   ├── imports/page.tsx
│   │   ├── jobs/[jobId]/page.tsx
│   │   ├── system/page.tsx
│   │   └── api/[...path]/route.ts
│   ├── components/
│   │   ├── command-surface.tsx
│   │   ├── impact-matrix.tsx
│   │   ├── proposed-fix-panel.tsx
│   │   └── receipt-view.tsx
│   ├── domain/
│   │   ├── sarif.ts
│   │   ├── types.ts
│   │   ├── canonical.ts
│   │   ├── planner.ts
│   │   └── receipt.ts
│   ├── db/
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   └── repository.ts
│   ├── integrations/
│   │   ├── github.ts
│   │   ├── osv.ts
│   │   ├── enrichment.ts
│   │   ├── arborist.ts
│   │   └── hydradb.ts
│   ├── jobs/
│   │   ├── queue.ts
│   │   └── pipeline.ts
│   └── worker.ts
├── scripts/
│   ├── seed-demo.ts
│   └── proof.ts
└── tests/
    ├── domain.test.ts
    ├── hydradb.contract.test.ts
    ├── corpus.integration.test.ts
    ├── adversarial.integration.test.ts
    └── demo.e2e.spec.ts
</pre>

### 1.5 Dependency graph

<pre>
types -> canonical -> receipt
types -> planner
types -> schema -> repository
types -> github/osv/enrichment/arborist/hydradb
repository + integrations -> pipeline -> proof/corpus test
pipeline -> queue -> worker
repository -> API catch-all -> server pages -> UI components
seed-demo + proof -> pipeline + receipt
tests -> domain/integrations/pipeline/UI
</pre>

## 2. Component architecture

### 2.1 Component map

| PRD ID | Architecture section | Primary files | Owns |
|---|---|---|---|
| C01 | Section 9 | app pages, components, API route | UI/BFF and context preservation |
| C02 | Section 8 | worker, pipeline | Long-running deterministic phases |
| C03 | Section 7.1 | github | Immutable repository provenance |
| C04 | Section 7.4 | arborist | Exact resolved topology |
| C05 | Sections 7.2–7.3 | osv, enrichment | Advisory and exploitation evidence |
| C06 | Section 7.5 | hydradb | Graph writes, native paths, cleanup |
| C07 | Sections 7.1 and 8 | github, pipeline | Proposed-fix identity and evaluation |
| C08 | Section 5 | planner | Bounded coverage selection |
| C09 | Sections 4 and 6 | receipt, repository | Canonical receipt and SARIF contract |
| C10 | Section 6 | schema, client, repository | Durable product state |
| C11 | Section 8 | queue, worker | Durable jobs and retries |
| C12 | Sections 8, 12, 15 | pipeline, API, deployment | Logs, phase metrics, health |

### 2.2 State ownership

| State | System of record | Mutation owner | Immutability |
|---|---|---|---|
| Raw input bytes | Worker memory only | provenance service | Discard after extract/hash |
| Repository snapshot identity | PostgreSQL | repository | Insert once by digest |
| Canonical extraction artifact | PostgreSQL JSONB by digest | extractor/repository | Insert once; enables BFS and replay |
| Query graph topology | HydraDB | graph adapter | Snapshot nodes never updated |
| Advisory source payload | PostgreSQL cache | intelligence service | Versioned by payload digest |
| Job phase | PostgreSQL/pg-boss | worker | Append phase events |
| Incident and plan | PostgreSQL | API/planner | Plan versions append |
| Pair truth | HydraDB query result in receipt | graph adapter | Receipt freezes result digest |
| Receipt | PostgreSQL | receipt service | Insert-only by SHA-256 |
| UI analytical context | URL | user | Navigable, no truth ownership |

### 2.3 API ownership

The browser calls only the Next.js BFF. The BFF validates requests, queries product state, and enqueues work. It never performs Arborist extraction or HydraDB graph writes inside a request. The worker is the only process with outbound source access and HydraDB write permission. Both processes may read PostgreSQL; only the worker may create verified receipts.

## 3. Shared domain types

### 3.1 Purpose

One vocabulary prevents the web, worker, graph adapter, and receipt generator from inventing different meanings for exposure, fix, or verification.

#### File: `src/domain/types.ts`
[VERIFIED] — Derived from the approved product truth and frozen runtime receipt

```typescript
// File: src/domain/types.ts
export const resultStates = [
  "VERIFIED_WITHIN_BOUNDS",
  "PARTIAL",
  "UNKNOWN",
  "ERROR",
] as const;

export type ResultState = (typeof resultStates)[number];
export type Scope = "production" | "development" | "optional" | "peer";
export type JobPhase =
  | "VALIDATE"
  | "FETCH"
  | "HASH"
  | "EXTRACT"
  | "ADVISORY_QUERY"
  | "GRAPH_WRITE"
  | "VERIFY_COUNTS"
  | "TRAVERSE"
  | "COMPARE"
  | "RECEIPT";

export interface SourceStamp {
  source: "github" | "osv" | "cisa-kev" | "first-epss" | "hydradb";
  url: string;
  method: "GET" | "POST";
  apiVersion: string;
  requestTupleSha256: string;
  responseStatus: number;
  etag?: string;
  lastModified?: string;
  retrievedAt: string;
  modifiedAt?: string;
  payloadSha256: string;
  cacheState: "HIT" | "MISS" | "REVALIDATED";
  retryCount: number;
  rateLimitRemaining?: string;
  rateLimitReset?: string;
  errorCode?: string;
  stale: boolean;
}

export interface RepositoryIdentity {
  repository: string;
  commitSha: string;
  manifestBlobSha: string;
  lockfileBlobSha: string;
  manifestSha256: string;
  lockfileSha256: string;
  manifestBytes: number;
  lockfileBytes: number;
  apiVersion: "2026-03-10" | "local-upload-v1";
  source: "github" | "upload";
  sourceStamps: SourceStamp[];
  retrievedAt: string;
}

export interface PackageInstance {
  key: string;
  snapshotKey: string;
  location: string;
  name: string;
  version: string;
  purl: string;
}

export interface DependencyEdge {
  key: string;
  snapshotKey: string;
  fromKey: string;
  toKey: string;
  scope: Scope;
}

export interface ExtractedSnapshot {
  key: string;
  identity: RepositoryIdentity;
  lockfileVersion: 2 | 3;
  packages: PackageInstance[];
  applicationEdges: DependencyEdge[];
  edges: DependencyEdge[];
  rootPackageKeys: string[];
  maxDepth: number;
  extractionSha256: string;
}

export interface TopologyEvidence {
  snapshotKey: string;
  repository: string;
  packageCount: number;
  relationshipCount: number;
  rootCount: number;
  maxDepth: number;
  extractionSha256: string;
  readbackVerified: true;
  collisionRegistryVerified: true;
}

export interface AdvisoryRangeEvent {
  introduced?: string;
  fixed?: string;
  lastAffected?: string;
  limit?: string;
}

export interface AdvisoryEvidence {
  osvId: string;
  aliases: string[];
  packageName: string;
  ecosystem: "npm";
  exactVersion: string;
  purl: string;
  rangeEvents: AdvisoryRangeEvent[];
  publishedAt: string;
  modifiedAt: string;
  withdrawnAt?: string;
  cvssVector?: string;
  fixedVersions: string[];
  references: string[];
  source: SourceStamp;
}

export interface ExploitationEvidence {
  cve?: string;
  kev: "LISTED" | "NOT_LISTED" | "UNKNOWN";
  kevCatalogVersion?: string;
  epssProbability?: string;
  epssPercentile?: string;
  epssDate?: string;
  sources: SourceStamp[];
}

export interface ExposurePair {
  sourceKey: string;
  applicationKey: string;
  scopes: Scope[];
  witnessNodeKeys: string[];
  witnessRelationshipTypes: string[];
  depth: number;
}

export interface TraversalBounds {
  sourceSelectors: string[];
  targetSelector: string;
  relationshipTypes: string[];
  maxLen: number;
  pathCount: 1;
  resultLimit: number;
  matchedSourceCount: number;
  matchedTargetCount: number;
  expectedPairKeyDigest: string;
}

export interface TraversalReceipt {
  query: string;
  querySha256: string;
  bounds: TraversalBounds;
  pairs: ExposurePair[];
  pairDigest: string;
  pairKeyDigest: string;
  readEpoch: number;
  bookmark: string;
  elapsedMs: number;
  cursorPresent: boolean;
  duplicatePairCount: number;
  state: ResultState;
  refusalReasons: string[];
}

export interface ProposedFixDiscoveryEvidence {
  pullNumber: number;
  actorLogin: string;
  actorType: string;
  headRef: string;
  changedFiles: string[];
  fileListSha256: string;
  sourceStamps: SourceStamp[];
}

export interface ProposedFix {
  key: string;
  repository: string;
  origin: "github-pr" | "github-commit" | "github-branch" | "upload";
  sourceUrl?: string;
  headSha?: string;
  discoveryEvidence?: ProposedFixDiscoveryEvidence;
  manifestSha256: string;
  lockfileSha256: string;
  snapshotKey: string;
  changedPackageCount: number;
  state: ResultState;
}

export interface ProposedFixOutcome {
  proposedFixKey: string;
  removed: string[];
  persistent: string[];
  introduced: string[];
  unknown: string[];
  otherFindings: {
    removed: string[];
    persistent: string[];
    introduced: string[];
  };
  changedPackageCount: number;
}

export interface PlanConstraints {
  requiredFixKeys: string[];
  forbiddenFixKeys: string[];
  maxRepositoryChanges?: number;
}

export interface PortfolioPlan {
  key: string;
  incidentKey: string;
  proposedFixKeys: string[];
  baselinePairKeys: string[];
  baselineSnapshotKeys: string[];
  verificationSourceCoordinates: string[];
  verificationBaselinePairKeys: string[];
  scopes: Scope[];
  predictedResidualPairKeys: string[];
  constraints: PlanConstraints;
  exhaustiveWithinBounds: boolean;
  state: "DRAFT" | "VERIFYING" | "VERIFIED" | "FAILED";
}

export interface JobStatus {
  id: string;
  kind: string;
  phase: JobPhase;
  state: "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED" | "CANCELLED";
  attempt: number;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalReceipt {
  schemaVersion: "1.0.0";
  createdAt: string;
  resultState: ResultState;
  portfolioKey: string;
  incidentKey: string;
  selectedSourceKeys: string[];
  inputs: RepositoryIdentity[];
  topologies: TopologyEvidence[];
  sources: SourceStamp[];
  advisories: AdvisoryEvidence[];
  exploitation: ExploitationEvidence[];
  baseline: TraversalReceipt;
  verificationUniverse: {
    kind: "selected-incident" | "bounded-portfolio";
    sourceKeys: string[];
    baseline: TraversalReceipt;
  };
  final: TraversalReceipt;
  proposedFixes: ProposedFix[];
  outcomes: ProposedFixOutcome[];
  plan: PortfolioPlan;
  hydraDbImageDigest: string;
  graphSchemaVersion: string;
  limitations: string[];
  supersedes?: string;
}
```

### 3.2 Type invariants

- `ExposurePair` identity is `sourceKey + applicationKey`; witness arrays never define equality.
- `pathCount` is literally one in P0.
- Decimal EPSS values remain strings to prevent accidental binary rounding in canonical receipts.
- A proposed fix with non-verified extraction may be displayed but cannot enter a plan.
- A final receipt exists for partial/error evidence, but only a receipt whose final traversal state is verified may say the selected incident cleared.

## 4. Canonicalization and receipt logic

#### File: `src/domain/canonical.ts`
[VERIFIED] — Standard SHA-256 plus domain-specific stable ordering

```typescript
// File: src/domain/canonical.ts
import { createHash } from "node:crypto";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function normalize(value: unknown): Json {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (typeof value === "object") {
    return normalizeObject(value as Record<string, unknown>);
  }
  throw new TypeError(`Unsupported canonical value: ${typeof value}`);
}

function normalizeObject(value: Record<string, unknown>): Json {
  const entries = Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return Object.fromEntries(entries.map(([key, item]) => [key, normalize(item)]));
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalDigest(value: unknown): string {
  return sha256(canonicalJson(value));
}

export function deterministicId(key: string): number {
  return Number.parseInt(sha256(key).slice(0, 13), 16);
}
```

#### File: `src/domain/receipt.ts`
[VERIFIED] — Implements the approved receipt and refusal contract

```typescript
// File: src/domain/receipt.ts
import { canonicalDigest, canonicalJson } from "./canonical";
import type { CanonicalReceipt, TraversalReceipt } from "./types";

const mandatoryLimitations = [
  "Dependency-level potential exposure is not function reachability or exploitability.",
  "One shortest witness is retained per reachable source-to-application pair.",
  "A cleared selected incident does not certify application or portfolio safety.",
];

function assertTraversal(traversal: TraversalReceipt): void {
  if (canonicalDigest(traversal.pairs) !== traversal.pairDigest) {
    throw new Error("PAIR_DIGEST_MISMATCH");
  }
  if (traversal.state !== "VERIFIED_WITHIN_BOUNDS") return;
  const expectedLimit =
    traversal.bounds.matchedSourceCount * traversal.bounds.matchedTargetCount;
  if (traversal.bounds.resultLimit !== expectedLimit) {
    throw new Error("UNSAFE_RESULT_LIMIT");
  }
  if (traversal.cursorPresent || traversal.duplicatePairCount > 0) {
    throw new Error("INCOMPLETE_TRAVERSAL");
  }
}

export function finalizeReceipt(input: CanonicalReceipt): {
  digest: string;
  json: string;
  receipt: CanonicalReceipt;
} {
  assertTraversal(input.baseline);
  assertTraversal(input.verificationUniverse.baseline);
  assertTraversal(input.final);
  if (input.verificationUniverse.sourceKeys.length !== input.final.bounds.matchedSourceCount ||
    input.verificationUniverse.sourceKeys.length !== input.verificationUniverse.baseline.bounds.matchedSourceCount) {
    throw new Error("VERIFICATION_UNIVERSE_MISMATCH");
  }
  if (input.resultState !== input.final.state || input.plan.state !==
    (input.final.state === "VERIFIED_WITHIN_BOUNDS" ? "VERIFIED" : "FAILED")) {
    throw new Error("RECEIPT_RESULT_STATE_MISMATCH");
  }
  const receipt = {
    ...input,
    limitations: [...new Set([...input.limitations, ...mandatoryLimitations])].sort(),
  };
  const json = canonicalJson(receipt);
  return { digest: canonicalDigest(receipt), json, receipt };
}

export function allowedConclusion(receipt: CanonicalReceipt): string {
  if (receipt.final.state !== "VERIFIED_WITHIN_BOUNDS") {
    return `Verification ${receipt.final.state.toLowerCase()}: ${receipt.final.refusalReasons.join(", ")}`;
  }
  const residual = receipt.final.pairs.filter((pair) => receipt.selectedSourceKeys.includes(pair.sourceKey)).length;
  if (residual === 0) {
    return "Selected incident cleared in the verified proposed-fix graph within displayed bounds.";
  }
  return `${residual} selected-incident source-to-application pairs remain within displayed bounds.`;
}
```

#### File: `src/domain/sarif.ts`
[VERIFIED] — OASIS SARIF 2.1.0 core object shape; HydraCut properties are namespaced extensions

```typescript
// File: src/domain/sarif.ts
import type { CanonicalReceipt } from "./types";

export function toSarif(receipt: CanonicalReceipt, digest: string): object {
  const rules = receipt.advisories.map((advisory) => ({
    id: advisory.osvId,
    name: `${advisory.packageName}@${advisory.exactVersion}`,
    shortDescription: { text: `OSV advisory ${advisory.osvId}` },
    helpUri: `https://osv.dev/vulnerability/${advisory.osvId}`,
    properties: { aliases: advisory.aliases, cvssVector: advisory.cvssVector },
  }));
  const results = receipt.final.pairs.map((pair) => ({
    ruleId: pair.sourceKey.split(":")[0] ?? "OSV-UNKNOWN",
    level: "warning",
    message: { text: `Dependency-level potential exposure reaches ${pair.applicationKey}.` },
    locations: [{
      physicalLocation: { artifactLocation: { uri: pair.applicationKey } },
    }],
    properties: {
      "hydracut/receiptDigest": digest,
      "hydracut/resultState": receipt.resultState,
      "hydracut/pairKey": `${pair.sourceKey}:${pair.applicationKey}`,
      "hydracut/maxLen": receipt.final.bounds.maxLen,
      "hydracut/pathCount": 1,
    },
  }));
  return {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [{
      tool: { driver: { name: "HydraCut", version: "1.0.0", rules } },
      results,
      properties: { receiptDigest: digest },
    }],
  };
}
```

## 5. Coverage planner

### 5.1 Algorithm

The solver groups proposed fixes by repository, prunes dominated states, and explores a bounded branch-and-bound search. It uses individual verified outcomes for planning only. The returned plan remains `DRAFT` until one combined HydraDB scenario proves it.

#### File: `src/domain/planner.ts`
[VERIFIED] — Deterministic set coverage semantics; final proof remains external

```typescript
// File: src/domain/planner.ts
import type {
  PlanConstraints,
  PortfolioPlan,
  ProposedFix,
  ProposedFixOutcome,
} from "./types";
import { canonicalDigest } from "./canonical";

interface Choice {
  fix: ProposedFix;
  outcome: ProposedFixOutcome;
}

interface Score {
  residualProduction: number;
  residualAll: number;
  repositories: number;
  churn: number;
  stableKey: string;
}

interface SearchInput {
  incidentKey: string;
  baselinePairs: string[];
  baselineSnapshotKeys: string[];
  verificationSourceCoordinates: string[];
  verificationBaselinePairKeys: string[];
  scopes: Scope[];
  productionPairs: Set<string>;
  choices: Choice[];
  constraints: PlanConstraints;
  maxStates: number;
}

function groupChoices(choices: Choice[]): Choice[][] {
  const groups = new Map<string, Choice[]>();
  for (const choice of choices) {
    const group = groups.get(choice.fix.repository) ?? [];
    group.push(choice);
    groups.set(choice.fix.repository, group);
  }
  return [...groups.values()].map((group) =>
    group.sort((a, b) => a.fix.key.localeCompare(b.fix.key)),
  );
}

function residualPairs(baseline: string[], selected: Choice[]): string[] {
  const removed = new Set(selected.flatMap((choice) => choice.outcome.removed));
  const introduced = selected.flatMap((choice) => choice.outcome.introduced);
  return [...new Set([...baseline.filter((pair) => !removed.has(pair)), ...introduced])].sort();
}

function score(input: SearchInput, selected: Choice[]): Score {
  const residual = residualPairs(input.baselinePairs, selected);
  return {
    residualProduction: residual.filter((pair) => input.productionPairs.has(pair)).length,
    residualAll: residual.length,
    repositories: new Set(selected.map((choice) => choice.fix.repository)).size,
    churn: selected.reduce((sum, choice) => sum + choice.outcome.changedPackageCount, 0),
    stableKey: selected.map((choice) => choice.fix.key).sort().join("|"),
  };
}

function compare(left: Score, right: Score): number {
  return (
    left.residualProduction - right.residualProduction ||
    left.residualAll - right.residualAll ||
    left.repositories - right.repositories ||
    left.churn - right.churn ||
    left.stableKey.localeCompare(right.stableKey)
  );
}

function optimisticResidual(input: SearchInput, choices: Choice[]): { production: number; all: number } {
  const removable = new Set(choices.flatMap((choice) => choice.outcome.removed));
  const residual = input.baselinePairs.filter((pair) => !removable.has(pair));
  return { production: residual.filter((pair) => input.productionPairs.has(pair)).length, all: residual.length };
}

function allowed(input: SearchInput, selected: Choice[]): boolean {
  const keys = new Set(selected.map((choice) => choice.fix.key));
  if (input.constraints.requiredFixKeys.some((key) => !keys.has(key))) return false;
  if (input.constraints.forbiddenFixKeys.some((key) => keys.has(key))) return false;
  const limit = input.constraints.maxRepositoryChanges;
  return limit === undefined || selected.length <= limit;
}

export function solveCoveragePlan(input: SearchInput): PortfolioPlan {
  const forbidden = new Set(input.constraints.forbiddenFixKeys);
  const groups = groupChoices(input.choices.filter((choice) => !forbidden.has(choice.fix.key)));
  let explored = 0;
  let best: Choice[] | undefined;
  const dominance = new Map<string, Score>();
  const visit = (index: number, selected: Choice[]): void => {
    if (explored >= input.maxStates) return;
    if (index < groups.length) {
      const current = score(input, selected);
      const selectedKeys = new Set(selected.map((choice) => choice.fix.key));
      const requiredProgress = input.constraints.requiredFixKeys.filter((key) => selectedKeys.has(key)).sort().join("|");
      const stateKey = `${index}:${selected.length}:${requiredProgress}:${residualPairs(input.baselinePairs, selected).join("|")}`;
      const prior = dominance.get(stateKey);
      if (prior && compare(prior, current) <= 0) return;
      dominance.set(stateKey, current);
      if (best) {
        const possible = [...selected, ...groups.slice(index).flat()];
        const optimistic = optimisticResidual(input, possible);
        const incumbent = score(input, best);
        if (optimistic.production > incumbent.residualProduction ||
          (optimistic.production === incumbent.residualProduction && optimistic.all > incumbent.residualAll)) return;
      }
      visit(index + 1, selected);
      const group = groups[index];
      if (!group) throw new Error("PLANNER_GROUP_MISSING");
      for (const choice of group) visit(index + 1, [...selected, choice]);
      return;
    }
    explored += 1;
    if (!allowed(input, selected)) return;
    if (!best || compare(score(input, selected), score(input, best)) < 0) best = selected;
  };
  visit(0, []);
  if (!best) throw new Error("NO_FEASIBLE_PLAN_WITHIN_BOUNDS");
  const selected = best;
  const key = canonicalDigest({ incidentKey: input.incidentKey, baselinePairs: [...input.baselinePairs].sort(),
    baselineSnapshotKeys: [...input.baselineSnapshotKeys].sort(),
    verificationSourceCoordinates: [...input.verificationSourceCoordinates].sort(),
    verificationBaselinePairKeys: [...input.verificationBaselinePairKeys].sort(),
    scopes: [...input.scopes].sort(),
    fixes: selected.map((x) => x.fix.key).sort(), constraints: input.constraints,
    exhaustiveWithinBounds: explored < input.maxStates });
  return {
    key,
    incidentKey: input.incidentKey,
    proposedFixKeys: selected.map((choice) => choice.fix.key).sort(),
    baselinePairKeys: [...input.baselinePairs].sort(),
    baselineSnapshotKeys: [...input.baselineSnapshotKeys].sort(),
    verificationSourceCoordinates: [...input.verificationSourceCoordinates].sort(),
    verificationBaselinePairKeys: [...input.verificationBaselinePairKeys].sort(),
    scopes: [...input.scopes].sort(),
    predictedResidualPairKeys: residualPairs(input.baselinePairs, selected),
    constraints: input.constraints,
    exhaustiveWithinBounds: explored < input.maxStates,
    state: "DRAFT",
  };
}
```

### 5.2 Planner consequences

- Complexity is bounded by `maxStates` and mutually exclusive repository groups, not advertised repository capacity.
- A non-exhaustive search can recommend but cannot use exact-minimum wording.
- `predictedResidualPairKeys` drives the UI comparison only; verified residuals come exclusively from the combined HydraDB receipt.

## 6. Product database

### 6.1 Schema

PostgreSQL owns durable workflow and evidence metadata, not graph reachability. The schema stores no derived “safe” boolean and no mutable receipt payload.

#### File: `src/db/schema.ts`
[UNVERIFIED] — Drizzle 0.45.2 API must pass the first typecheck gate

```typescript
// File: src/db/schema.ts
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type {
  AdvisoryEvidence,
  CanonicalReceipt,
  ExtractedSnapshot,
  ExploitationEvidence,
  PlanConstraints,
  ProposedFix,
  ProposedFixOutcome,
  RepositoryIdentity,
  Scope,
  SourceStamp,
  TraversalReceipt,
} from "../domain/types";

export const resultState = pgEnum("result_state", [
  "VERIFIED_WITHIN_BOUNDS",
  "PARTIAL",
  "UNKNOWN",
  "ERROR",
]);

export const portfolios = pgTable("portfolios", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const snapshots = pgTable(
  "snapshots",
  {
    key: text("key").primaryKey(),
    portfolioKey: text("portfolio_key").references(() => portfolios.key).notNull(),
    repository: text("repository").notNull(),
    role: text("role").$type<"current" | "proposed" | "historical">().notNull(),
    commitSha: text("commit_sha").notNull(),
    manifestSha256: text("manifest_sha256").notNull(),
    lockfileSha256: text("lockfile_sha256").notNull(),
    extractionSha256: text("extraction_sha256").notNull(),
    packageCount: integer("package_count").notNull(),
    edgeCount: integer("edge_count").notNull(),
    maxDepth: integer("max_depth").notNull(),
    topology: jsonb("topology").$type<ExtractedSnapshot>().notNull(),
    identity: jsonb("identity").$type<RepositoryIdentity>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("snapshot_content_identity").on(
      table.portfolioKey,
      table.repository,
      table.commitSha,
      table.manifestSha256,
      table.lockfileSha256,
    ),
    index("snapshot_portfolio").on(table.portfolioKey),
  ],
);

export const advisories = pgTable("advisories", {
  key: text("key").primaryKey(),
  osvId: text("osv_id").notNull(),
  payloadSha256: text("payload_sha256").notNull(),
  evidence: jsonb("evidence").$type<AdvisoryEvidence>().notNull(),
  exploitation: jsonb("exploitation").$type<ExploitationEvidence>().notNull(),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull(),
}, (table) => [uniqueIndex("advisory_version").on(table.osvId, table.payloadSha256)]);

export const findings = pgTable(
  "findings",
  {
    key: text("key").primaryKey(),
    snapshotKey: text("snapshot_key").references(() => snapshots.key).notNull(),
    packageKey: text("package_key").notNull(),
    advisoryKey: text("advisory_key").references(() => advisories.key).notNull(),
    state: resultState("state").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("finding_identity").on(table.snapshotKey, table.packageKey, table.advisoryKey),
  ],
);

export const incidents = pgTable("incidents", {
  key: text("key").primaryKey(),
  portfolioKey: text("portfolio_key").references(() => portfolios.key).notNull(),
  title: text("title").notNull(),
  sourceFindingKeys: jsonb("source_finding_keys").$type<string[]>().notNull(),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  baseline: jsonb("baseline").$type<TraversalReceipt>(),
  verificationSourceCoordinates: jsonb("verification_source_coordinates").$type<string[]>().notNull(),
  verificationBaseline: jsonb("verification_baseline").$type<TraversalReceipt>(),
  state: resultState("state").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const proposedFixes = pgTable(
  "proposed_fixes",
  {
    key: text("key").primaryKey(),
    incidentKey: text("incident_key").references(() => incidents.key).notNull(),
    repository: text("repository").notNull(),
    origin: text("origin").notNull(),
    sourceUrl: text("source_url"),
    headSha: text("head_sha"),
    discoveryEvidence: jsonb("discovery_evidence").$type<ProposedFix["discoveryEvidence"]>(),
    manifestSha256: text("manifest_sha256").notNull(),
    lockfileSha256: text("lockfile_sha256").notNull(),
    snapshotKey: text("snapshot_key").references(() => snapshots.key).notNull(),
    baselinePairDigest: text("baseline_pair_digest").notNull(),
    baselineSnapshotKeys: jsonb("baseline_snapshot_keys").$type<string[]>().notNull(),
    outcome: jsonb("outcome").$type<ProposedFixOutcome>().notNull(),
    state: resultState("state").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("proposed_fix_incident").on(table.incidentKey)],
);

export const plans = pgTable("plans", {
  key: text("key").primaryKey(),
  incidentKey: text("incident_key").references(() => incidents.key).notNull(),
  proposedFixKeys: jsonb("proposed_fix_keys").$type<string[]>().notNull(),
  baselinePairKeys: jsonb("baseline_pair_keys").$type<string[]>().notNull(),
  baselineSnapshotKeys: jsonb("baseline_snapshot_keys").$type<string[]>().notNull(),
  verificationSourceCoordinates: jsonb("verification_source_coordinates").$type<string[]>().notNull(),
  verificationBaselinePairKeys: jsonb("verification_baseline_pair_keys").$type<string[]>().notNull(),
  scopes: jsonb("scopes").$type<Scope[]>().notNull(),
  constraints: jsonb("constraints").$type<PlanConstraints>().notNull(),
  predictedResidual: jsonb("predicted_residual").$type<string[]>().notNull(),
  exhaustiveWithinBounds: boolean("exhaustive_within_bounds").notNull(),
  state: text("state").notNull(),
  manualOverride: boolean("manual_override").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const receipts = pgTable("receipts", {
  digest: text("digest").primaryKey(),
  schemaVersion: text("schema_version").notNull(),
  resultState: resultState("result_state").notNull(),
  receipt: jsonb("receipt").$type<CanonicalReceipt>().notNull(),
  canonicalJson: text("canonical_json").notNull(),
  supersedes: text("supersedes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sourceCache = pgTable(
  "source_cache",
  {
    source: text("source").notNull(),
    requestDigest: text("request_digest").notNull(),
    payloadSha256: text("payload_sha256").notNull(),
    payload: jsonb("payload").notNull(),
    stamps: jsonb("stamps").$type<SourceStamp[]>().notNull(),
    freshUntil: timestamp("fresh_until", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.source, table.requestDigest] })],
);

export const jobs = pgTable(
  "jobs",
  {
    key: text("key").primaryKey(),
    queue: text("queue").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    inputDigest: text("input_digest").notNull(),
    brokerId: text("broker_id"),
    state: text("state").$type<"CREATING" | "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED">().notNull(),
    errorCode: text("error_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("job_idempotency").on(table.queue, table.idempotencyKey)],
);

export const phaseEvents = pgTable(
  "phase_events",
  {
    jobId: text("job_id").notNull(),
    sequence: integer("sequence").notNull(),
    phase: text("phase").notNull(),
    state: text("state").notNull(),
    attempt: integer("attempt").notNull(),
    detail: jsonb("detail").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.jobId, table.sequence] })],
);

export const auditEvents = pgTable("audit_events", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  event: text("event").notNull(),
  actor: text("actor").default("single-operator").notNull(),
  subjectKey: text("subject_key").notNull(),
  detail: jsonb("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### 6.2 Database client

#### File: `src/db/client.ts`
[UNVERIFIED] — pg 8.23.0 and Drizzle 0.45.2 initialization must round-trip

```typescript
// File: src/db/client.ts
import { readFileSync } from "node:fs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL_FILE
  ? readFileSync(process.env.DATABASE_URL_FILE, "utf8").trim()
  : process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL_REQUIRED");

export const pool = new Pool({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 2_000,
  idleTimeoutMillis: 30_000,
  statement_timeout: 10_000,
  application_name: "hydracut",
});

export const db = drizzle(pool, { schema });

export async function databaseHealth(): Promise<boolean> {
  const result = await pool.query<{ ok: number }>("select 1 as ok");
  return result.rows[0]?.ok === 1;
}
```

### 6.3 Repository

#### File: `src/db/repository.ts`
[UNVERIFIED] — Drizzle insert/select methods require compile and integration proof

```typescript
// File: src/db/repository.ts
import { and, desc, eq, gt, inArray, ne } from "drizzle-orm";
import { db } from "./client";
import { canonicalDigest } from "../domain/canonical";
import { solveCoveragePlan } from "../domain/planner";
import {
  advisories,
  auditEvents,
  findings,
  incidents,
  jobs,
  phaseEvents,
  plans,
  portfolios,
  proposedFixes,
  receipts,
  snapshots,
  sourceCache,
} from "./schema";
import type {
  AdvisoryEvidence,
  CanonicalReceipt,
  PortfolioPlan,
  ProposedFix,
  ProposedFixOutcome,
  ResultState,
  Scope,
  TraversalReceipt,
  ExploitationEvidence,
} from "../domain/types";

export async function saveSnapshot(row: typeof snapshots.$inferInsert): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(snapshots).values(row).onConflictDoNothing();
    if (row.role !== "current") return;
    await tx.update(snapshots).set({ role: "historical" }).where(and(
      eq(snapshots.portfolioKey, row.portfolioKey),
      eq(snapshots.repository, row.repository),
      eq(snapshots.role, "current"),
      ne(snapshots.key, row.key),
    ));
    await tx.update(snapshots).set({ role: "current" }).where(eq(snapshots.key, row.key));
  });
  const stored = (await db.select().from(snapshots).where(eq(snapshots.key, row.key)).limit(1))[0];
  const immutable = (value: typeof snapshots.$inferInsert | typeof snapshots.$inferSelect) => ({
    key: value.key, portfolioKey: value.portfolioKey, repository: value.repository, commitSha: value.commitSha,
    manifestSha256: value.manifestSha256, lockfileSha256: value.lockfileSha256,
    extractionSha256: value.extractionSha256, packageCount: value.packageCount, edgeCount: value.edgeCount,
    maxDepth: value.maxDepth, topology: value.topology, identity: value.identity,
  });
  if (!stored || canonicalDigest(immutable(stored)) !== canonicalDigest(immutable(row))) {
    throw new Error("SNAPSHOT_INSERT_CONFLICT");
  }
}

export async function ensurePortfolio(key: string, name = key): Promise<void> {
  await db.insert(portfolios).values({ key, name }).onConflictDoNothing();
}

export async function findIncident(key: string) {
  const rows = await db.select().from(incidents).where(eq(incidents.key, key)).limit(1);
  return rows[0] ?? null;
}

export async function listIncidents() {
  return db.select().from(incidents).orderBy(incidents.createdAt);
}

export async function invalidatePortfolioIncidents(portfolioKey: string): Promise<void> {
  await db.transaction(async (tx) => {
    const rows = await tx.select({ key: incidents.key }).from(incidents).where(eq(incidents.portfolioKey, portfolioKey));
    const keys = rows.map((row) => row.key);
    await tx.update(incidents).set({ state: "UNKNOWN", baseline: null, verificationBaseline: null,
      verificationSourceCoordinates: [] }).where(eq(incidents.portfolioKey, portfolioKey));
    if (!keys.length) return;
    await tx.update(proposedFixes).set({ state: "UNKNOWN" }).where(inArray(proposedFixes.incidentKey, keys));
    await tx.update(plans).set({ state: "FAILED" }).where(inArray(plans.incidentKey, keys));
  });
}

export async function listPortfolioSnapshots(portfolioKey: string) {
  return db.select().from(snapshots).where(and(eq(snapshots.portfolioKey, portfolioKey), eq(snapshots.role, "current")))
    .orderBy(snapshots.repository, snapshots.key);
}

export async function findSnapshot(key: string) {
  return (await db.select().from(snapshots).where(eq(snapshots.key, key)).limit(1))[0] ?? null;
}

export async function saveAdvisoryVersion(key: string, evidence: AdvisoryEvidence, exploitation: ExploitationEvidence): Promise<void> {
  await db.insert(advisories).values({ key, osvId: evidence.osvId, payloadSha256: evidence.source.payloadSha256, evidence, exploitation, retrievedAt: new Date(evidence.source.retrievedAt) }).onConflictDoNothing();
}

export async function saveFinding(row: typeof findings.$inferInsert): Promise<void> {
  await db.insert(findings).values(row).onConflictDoNothing();
}

export async function loadFindings(keys: string[]) {
  return keys.length ? db.select().from(findings).where(inArray(findings.key, keys)) : [];
}

export async function loadIncidentBundle(key: string) {
  const incident = await findIncident(key);
  if (!incident) throw new Error("INCIDENT_NOT_FOUND");
  const findingRows = await loadFindings(incident.sourceFindingKeys);
  const advisoryKeys = [...new Set(findingRows.map((row) => row.advisoryKey))];
  const advisoryRows = advisoryKeys.length
    ? await db.select().from(advisories).where(inArray(advisories.key, advisoryKeys))
    : [];
  const snapshotRows = await listPortfolioSnapshots(incident.portfolioKey);
  return { incident, findings: findingRows, advisories: advisoryRows, snapshots: snapshotRows };
}

export async function loadPlanBundle(key: string) {
  const plan = await findPlan(key);
  if (!plan) throw new Error("PLAN_NOT_FOUND");
  const fixRows = plan.proposedFixKeys.length
    ? await db.select().from(proposedFixes).where(inArray(proposedFixes.key, plan.proposedFixKeys))
    : [];
  const incident = await loadIncidentBundle(plan.incidentKey);
  return { plan, fixes: fixRows, ...incident };
}

export async function saveIncident(row: typeof incidents.$inferInsert): Promise<void> {
  await db.insert(incidents).values(row).onConflictDoUpdate({ target: incidents.key, set: {
    title: row.title,
    sourceFindingKeys: row.sourceFindingKeys,
    scopes: row.scopes,
    state: "UNKNOWN",
    baseline: null,
    verificationSourceCoordinates: [],
    verificationBaseline: null,
  } });
}

export async function saveIncidentBaseline(key: string, baseline: TraversalReceipt, verificationBaseline: TraversalReceipt,
  scopes: Scope[], verificationSourceCoordinates: string[]): Promise<void> {
  const changed = await db.update(incidents).set({ baseline, verificationBaseline, scopes,
    verificationSourceCoordinates: [...verificationSourceCoordinates].sort(),
    state: baseline.state === "VERIFIED_WITHIN_BOUNDS" && verificationBaseline.state === "VERIFIED_WITHIN_BOUNDS"
      ? "VERIFIED_WITHIN_BOUNDS" : "PARTIAL" }).where(eq(incidents.key, key)).returning({ key: incidents.key });
  if (changed.length !== 1) throw new Error("INCIDENT_STATE_WRITE_MISMATCH");
}

export async function saveProposedFix(
  fix: ProposedFix,
  incidentKey: string,
  outcome: ProposedFixOutcome,
  baseline: { pairDigest: string; snapshotKeys: string[] },
): Promise<void> {
  await db.insert(proposedFixes).values({
    key: fix.key,
    incidentKey,
    repository: fix.repository,
    origin: fix.origin,
    outcome,
    sourceUrl: fix.sourceUrl,
    headSha: fix.headSha,
    discoveryEvidence: fix.discoveryEvidence,
    manifestSha256: fix.manifestSha256,
    lockfileSha256: fix.lockfileSha256,
    snapshotKey: fix.snapshotKey,
    baselinePairDigest: baseline.pairDigest,
    baselineSnapshotKeys: [...baseline.snapshotKeys].sort(),
    state: fix.state,
  });
}

export async function listProposedFixes(incidentKey: string) {
  return db.select().from(proposedFixes).where(eq(proposedFixes.incidentKey, incidentKey))
    .orderBy(proposedFixes.repository, proposedFixes.key);
}

export async function savePlan(plan: PortfolioPlan, manualOverride = false): Promise<void> {
  await db.insert(plans).values({
    key: plan.key,
    incidentKey: plan.incidentKey,
    proposedFixKeys: plan.proposedFixKeys,
    baselinePairKeys: plan.baselinePairKeys,
    baselineSnapshotKeys: plan.baselineSnapshotKeys,
    verificationSourceCoordinates: plan.verificationSourceCoordinates,
    verificationBaselinePairKeys: plan.verificationBaselinePairKeys,
    scopes: plan.scopes,
    constraints: plan.constraints,
    predictedResidual: plan.predictedResidualPairKeys,
    exhaustiveWithinBounds: plan.exhaustiveWithinBounds,
    state: plan.state,
    manualOverride,
  }).onConflictDoNothing();
}

export async function saveReceipt(
  digest: string,
  receipt: CanonicalReceipt,
  canonicalJson: string,
): Promise<void> {
  await db.insert(receipts).values({
    digest,
    schemaVersion: receipt.schemaVersion,
    resultState: receipt.resultState,
    receipt,
    canonicalJson,
    supersedes: receipt.supersedes,
  }).onConflictDoNothing();
  const stored = await findReceipt(digest);
  if (!stored || stored.canonicalJson !== canonicalJson) throw new Error("RECEIPT_INSERT_CONFLICT");
}

export async function findReceipt(digest: string) {
  const rows = await db.select().from(receipts).where(eq(receipts.digest, digest)).limit(1);
  return rows[0] ?? null;
}

export async function listReceipts() {
  return db.select().from(receipts).orderBy(desc(receipts.createdAt)).limit(100);
}

export async function findPlan(key: string) {
  return (await db.select().from(plans).where(eq(plans.key, key)).limit(1))[0] ?? null;
}

export async function findLatestPlanForIncident(incidentKey: string) {
  return (await db.select().from(plans).where(eq(plans.incidentKey, incidentKey)).orderBy(desc(plans.createdAt)).limit(1))[0] ?? null;
}

export async function findJob(jobId: string) {
  const request = (await db.select().from(jobs).where(eq(jobs.key, jobId)).limit(1))[0];
  if (!request) return null;
  const events = await db.select().from(phaseEvents)
    .where(eq(phaseEvents.jobId, jobId)).orderBy(desc(phaseEvents.sequence));
  return { ...request, latest: events[0] ?? null, events: [...events].reverse() };
}

export async function registerJob(input: typeof jobs.$inferInsert): Promise<boolean> {
  const inserted = await db.insert(jobs).values(input).onConflictDoNothing().returning({ key: jobs.key });
  if (inserted.length) return true;
  const existing = (await db.select().from(jobs).where(and(eq(jobs.queue, input.queue),
    eq(jobs.idempotencyKey, input.idempotencyKey))).limit(1))[0];
  if (!existing || existing.inputDigest !== input.inputDigest) throw new Error("IDEMPOTENCY_INPUT_DRIFT");
  return false;
}

export async function attachBrokerJob(key: string, brokerId: string): Promise<void> {
  const changed = await db.update(jobs).set({ brokerId, state: "QUEUED", updatedAt: new Date() })
    .where(and(eq(jobs.key, key), eq(jobs.state, "CREATING"))).returning({ key: jobs.key });
  if (changed.length !== 1) throw new Error("JOB_QUEUE_STATE_MISMATCH");
}

export async function markJobState(key: string, state: "RUNNING" | "COMPLETE" | "FAILED", errorCode?: string): Promise<void> {
  await db.update(jobs).set({ state, ...(errorCode ? { errorCode } : {}), updatedAt: new Date() })
    .where(eq(jobs.key, key));
}

export async function loadIncidentImpact(key: string) {
  const incident = await findIncident(key);
  return incident?.baseline ? { incidentKey: key, baseline: incident.baseline } : null;
}

export async function loadSystemFacts() {
  const [snapshotRows, advisoryRows, findingRows, cacheRows, jobRows, auditRows] = await Promise.all([
    db.select({ key: snapshots.key }).from(snapshots),
    db.select({ key: advisories.key }).from(advisories),
    db.select({ key: findings.key }).from(findings),
    db.select({ source: sourceCache.source, freshUntil: sourceCache.freshUntil, stamps: sourceCache.stamps }).from(sourceCache),
    db.select({ key: jobs.key, state: jobs.state }).from(jobs),
    db.select({ id: auditEvents.id }).from(auditEvents),
  ]);
  return {
    graphNamespace: process.env.HYDRADB_GRAPH_NAMESPACE ?? "default",
    graphImageDigest: "sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709",
    graphSchemaVersion: "1.0.0",
    snapshots: snapshotRows.length,
    advisoryVersions: advisoryRows.length,
    findings: findingRows.length,
    jobs: { total: jobRows.length, failed: jobRows.filter((row) => row.state === "FAILED").length },
    auditEvents: auditRows.length,
    sourceFreshness: cacheRows.map((row) => ({ source: row.source, freshUntil: row.freshUntil.toISOString(),
      stale: row.freshUntil.getTime() <= Date.now(), latest: row.stamps.at(-1) ?? null })),
    limits: { mutationPerMinute: 10, importConcurrency: 4, listRows: 100, uploadBytesPerFile: 10 * 1024 * 1024 },
    requiredSecretNames: ["DATABASE_URL_FILE", "HYDRADB_TOKEN_FILE", "APP_OPERATOR_TOKEN"],
    singleOperator: true,
  };
}

export async function listIncidentQueue() {
  const rows = await listIncidents();
  return Promise.all(rows.map(async (incident) => {
    const bundle = await loadIncidentBundle(incident.key);
    const evidence = bundle.advisories[0];
    const fixes = await listProposedFixes(incident.key);
    return { key: incident.key, portfolioKey: incident.portfolioKey, title: incident.title, packageVersion: evidence ? `${evidence.evidence.packageName}@${evidence.evidence.exactVersion}` : "UNKNOWN",
      kev: evidence?.exploitation.kev ?? "UNKNOWN", epss: evidence?.exploitation.epssProbability ?? "UNKNOWN",
      cvss: evidence?.evidence.cvssVector ?? "UNKNOWN",
      productionApplications: new Set(incident.baseline?.pairs.filter((pair) => pair.scopes.includes("production")).map((pair) => pair.applicationKey) ?? []).size,
      allApplications: new Set(incident.baseline?.pairs.map((pair) => pair.applicationKey) ?? []).size,
      proposedFixes: fixes.filter((fix) => fix.state === "VERIFIED_WITHIN_BOUNDS").length,
      state: incident.state, freshness: evidence?.evidence.source.retrievedAt ?? "UNKNOWN" };
  }));
}

export async function createPlanForIncident(
  incidentKey: string,
  input: { proposedFixKeys: string[]; requiredFixKeys: string[]; forbiddenFixKeys: string[]; maxRepositoryChanges?: number },
): Promise<PortfolioPlan> {
  const incident = await findIncident(incidentKey);
  if (!incident?.baseline || incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS" ||
    !incident.verificationBaseline || incident.verificationBaseline.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("BASELINE_NOT_VERIFIED");
  const rows = await listProposedFixes(incidentKey);
  const baselinePairKeys = incident.baseline.pairs.map((pair) => `${pair.sourceKey}:${pair.applicationKey}`).sort();
  const baselineSnapshotKeys = (await listPortfolioSnapshots(incident.portfolioKey)).map((row) => row.key).sort();
  const selected = rows.filter((row) => input.proposedFixKeys.includes(row.key));
  if (selected.length !== new Set(input.proposedFixKeys).size) throw new Error("UNKNOWN_PROPOSED_FIX");
  if (selected.some((row) => row.state !== "VERIFIED_WITHIN_BOUNDS")) throw new Error("PROPOSED_FIX_NOT_VERIFIED");
  if (selected.some((row) => row.baselinePairDigest !== canonicalDigest(baselinePairKeys) ||
    canonicalDigest(row.baselineSnapshotKeys) !== canonicalDigest(baselineSnapshotKeys))) throw new Error("PROPOSED_FIX_BASELINE_STALE");
  const plan = solveCoveragePlan({
    incidentKey,
    baselinePairs: baselinePairKeys,
    baselineSnapshotKeys,
    verificationSourceCoordinates: incident.verificationSourceCoordinates,
    verificationBaselinePairKeys: incident.verificationBaseline.pairs
      .map((pair) => `${pair.sourceKey}:${pair.applicationKey}`).sort(),
    scopes: incident.scopes as Scope[],
    productionPairs: new Set(incident.baseline.pairs.filter((pair) => pair.scopes.includes("production")).map((pair) => `${pair.sourceKey}:${pair.applicationKey}`)),
    choices: selected.map((row) => ({ fix: { key: row.key, repository: row.repository,
      origin: row.origin as ProposedFix["origin"], ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
      ...(row.headSha ? { headSha: row.headSha } : {}), manifestSha256: row.manifestSha256,
      ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}),
      lockfileSha256: row.lockfileSha256, snapshotKey: row.snapshotKey,
      changedPackageCount: row.outcome.changedPackageCount, state: row.state }, outcome: row.outcome })),
    constraints: { requiredFixKeys: input.requiredFixKeys, forbiddenFixKeys: input.forbiddenFixKeys,
      ...(input.maxRepositoryChanges === undefined ? {} : { maxRepositoryChanges: input.maxRepositoryChanges }) },
    maxStates: 10_000,
  });
  await savePlan(plan);
  await db.insert(auditEvents).values({ event: "PLAN_CREATED", subjectKey: plan.key, detail: { incidentKey, proposedFixKeys: plan.proposedFixKeys } });
  return plan;
}

export async function appendPhaseEvent(input: {
  jobId: string;
  sequence: number;
  phase: string;
  state: string;
  attempt: number;
  detail: Record<string, unknown>;
}): Promise<void> {
  await db.insert(phaseEvents).values(input);
}

export async function appendAuditEvent(event: string, subjectKey: string, detail: Record<string, unknown>): Promise<void> {
  await db.insert(auditEvents).values({ event, subjectKey, detail });
}

export async function findFreshSourceCache(source: string, requestDigest: string) {
  return (await db.select().from(sourceCache).where(and(eq(sourceCache.source, source),
    eq(sourceCache.requestDigest, requestDigest), gt(sourceCache.freshUntil, new Date()))).limit(1))[0] ?? null;
}

export async function saveSourceCache(row: typeof sourceCache.$inferInsert): Promise<void> {
  await db.insert(sourceCache).values(row).onConflictDoUpdate({ target: [sourceCache.source, sourceCache.requestDigest],
    set: { payloadSha256: row.payloadSha256, payload: row.payload, stamps: row.stamps, freshUntil: row.freshUntil } });
}

export function verifiedState(state: ResultState): boolean {
  return state === "VERIFIED_WITHIN_BOUNDS";
}
```

### 6.4 Migration and retention

Build generates SQL from this schema, reviews it, and applies it once. Receipt rows have no update repository function. Raw inputs never enter these tables. PostgreSQL backups contain normalized dependency identities and security evidence, so the VM volume is treated as sensitive even in single-operator mode.

## 7. External integrations

### 7.1 GitHub immutable input and proposed-fix discovery

#### File: `src/integrations/github.ts`
[UNVERIFIED] — Endpoint/version/pagination contracts are source-verified; this adapter still requires live contract and rate-limit tests

```typescript
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
    headersTimeout: 3_000,
    bodyTimeout: 15_000,
    maxRedirections: 0,
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
```

### 7.2 OSV exact-version client

#### File: `src/integrations/osv.ts`
[UNVERIFIED] — Official contracts/live record are verified; cache, continuation, and parser adapter require integration proof

```typescript
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
    body: body ? JSON.stringify(body) : undefined,
    headersTimeout: 3_000,
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
```

### 7.3 CISA KEV and FIRST EPSS enrichment

#### File: `src/integrations/enrichment.ts`
[VERIFIED] — Live feed/API shapes confirmed on 2026-08-19; quotas remain undocumented

```typescript
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
    headersTimeout: 3_000,
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
```

### 7.4 Arborist virtual-tree extraction

#### File: `src/integrations/arborist.ts`
[UNVERIFIED] — `loadVirtual()` round-tripped the frozen corpus; this exact TypeScript adapter needs compile proof

```typescript
// File: src/integrations/arborist.ts
import Arborist from "@npmcli/arborist";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonicalDigest } from "../domain/canonical";
import type { DependencyEdge, ExtractedSnapshot, PackageInstance, Scope } from "../domain/types";

interface ArboristNode {
  location: string;
  name: string;
  version: string;
  edgesOut: Map<string, ArboristEdge>;
}

interface ArboristEdge {
  from: ArboristNode;
  to: ArboristNode | null;
  dev: boolean;
  optional: boolean;
  peer: boolean;
}

function scopeOf(edge: ArboristEdge): Scope {
  if (edge.optional) return "optional";
  if (edge.peer) return "peer";
  if (edge.dev) return "development";
  return "production";
}

function packageKey(snapshotKey: string, node: ArboristNode): string {
  return `${snapshotKey}:${node.location}:${node.name}@${node.version}`;
}

function packageFrom(snapshotKey: string, node: ArboristNode): PackageInstance {
  return {
    key: packageKey(snapshotKey, node),
    snapshotKey,
    location: node.location,
    name: node.name,
    version: node.version,
    purl: `pkg:npm/${encodeURIComponent(node.name)}@${encodeURIComponent(node.version)}`,
  };
}

function edgeFrom(snapshotKey: string, edge: ArboristEdge): DependencyEdge | undefined {
  if (!edge.to) return undefined;
  const fromKey = packageKey(snapshotKey, edge.from);
  const toKey = packageKey(snapshotKey, edge.to);
  const scope = scopeOf(edge);
  return { key: `${snapshotKey}:${fromKey}->${toKey}:${scope}`, snapshotKey, fromKey, toKey, scope };
}

function maximumDepth(edges: DependencyEdge[], roots: string[]): number {
  const children = new Map<string, string[]>();
  for (const edge of edges) children.set(edge.fromKey, [...(children.get(edge.fromKey) ?? []), edge.toKey]);
  let max = 0;
  const queue = roots.map((key) => ({ key, depth: 0 }));
  const seen = new Set<string>();
  while (queue.length) {
    const item = queue.shift()!;
    if (seen.has(item.key)) continue;
    seen.add(item.key);
    max = Math.max(max, item.depth);
    for (const child of children.get(item.key) ?? []) queue.push({ key: child, depth: item.depth + 1 });
  }
  return max;
}

async function withDeadline<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("EXTRACTION_TIMEOUT")), milliseconds);
  });
  try {
    return await Promise.race([operation, deadline]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function extractSnapshot(input: {
  snapshotKey: string;
  manifest: Uint8Array;
  lockfile: Uint8Array;
  identity: ExtractedSnapshot["identity"];
}): Promise<ExtractedSnapshot> {
  const directory = await mkdtemp(join(tmpdir(), "hydracut-"));
  try {
    await writeFile(join(directory, "package.json"), input.manifest, { mode: 0o600 });
    await writeFile(join(directory, "package-lock.json"), input.lockfile, { mode: 0o600 });
    const arborist = new Arborist({ path: directory });
    const tree = (await withDeadline(arborist.loadVirtual(), 30_000)) as ArboristNode & { inventory: Map<string, ArboristNode> };
    const allNodes = [...tree.inventory.values()];
    const root = allNodes.find((node) => node.location === "");
    if (!root) throw new Error("APPLICATION_ROOT_MISSING");
    const nodes = allNodes.filter((node) => node !== root);
    if (nodes.length > 5_000) throw new Error("PACKAGE_INSTANCE_LIMIT");
    if (nodes.some((node) => !node.location || !node.name || !node.version)) throw new Error("PACKAGE_IDENTITY_MISSING");
    const packages = nodes.map((node) => packageFrom(input.snapshotKey, node)).sort((a, b) => a.key.localeCompare(b.key));
    if (new Set(packages.map((item) => item.key)).size !== packages.length) throw new Error("PACKAGE_IDENTITY_DUPLICATE");
    const edges = nodes.flatMap((node) =>
      [...node.edgesOut.values()].map((edge) => edgeFrom(input.snapshotKey, edge)).filter(Boolean),
    ).sort((a, b) => a!.key.localeCompare(b!.key)) as DependencyEdge[];
    const applicationEdges = [...root.edgesOut.values()]
      .filter((edge) => edge.to)
      .map((edge) => ({
        key: `${input.snapshotKey}:application->${packageKey(input.snapshotKey, edge.to!)}:${scopeOf(edge)}`,
        snapshotKey: input.snapshotKey,
        fromKey: `application:${input.snapshotKey}`,
        toKey: packageKey(input.snapshotKey, edge.to!),
        scope: scopeOf(edge),
      })).sort((a, b) => a.key.localeCompare(b.key));
    const rootPackageKeys = applicationEdges
      .map((edge) => edge.toKey)
      .filter(Boolean)
      .sort();
    const packageKeys = new Set(packages.map((item) => item.key));
    if (edges.some((edge) => !packageKeys.has(edge.fromKey) || !packageKeys.has(edge.toKey)) ||
      rootPackageKeys.some((key) => !packageKeys.has(key))) throw new Error("DEPENDENCY_ENDPOINT_MISSING");
    const parsed = JSON.parse(Buffer.from(input.lockfile).toString("utf8")) as { lockfileVersion?: number };
    if (parsed.lockfileVersion !== 2 && parsed.lockfileVersion !== 3) throw new Error("LOCKFILE_VERSION");
    const normalized = { packages, applicationEdges, edges, rootPackageKeys };
    return {
      key: input.snapshotKey,
      identity: input.identity,
      lockfileVersion: parsed.lockfileVersion,
      ...normalized,
      maxDepth: maximumDepth(edges, rootPackageKeys),
      extractionSha256: canonicalDigest(normalized),
    };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
```

### 7.5 HydraDB graph and native traversal

#### File: `src/integrations/hydradb.ts`
[VERIFIED] — Query, incoming traversal, strict literal boundary, strong consistency, IDs, typed edges, counts, and truncation behavior are frozen runtime evidence; response adapter must pass contract tests

```typescript
// File: src/integrations/hydradb.ts
import { readFileSync } from "node:fs";
import { request } from "undici";
import { canonicalDigest, deterministicId, sha256 } from "../domain/canonical";
import type {
  ExposurePair,
  ExtractedSnapshot,
  Scope,
  TraversalBounds,
  TraversalReceipt,
} from "../domain/types";

const selectorPattern = /^[a-z0-9-]+$/;
const relationshipByScope: Record<Scope, string> = {
  production: "PROD_DEPENDS_ON",
  development: "DEV_DEPENDS_ON",
  optional: "OPTIONAL_DEPENDS_ON",
  peer: "PEER_DEPENDS_ON",
};

interface QueryMeta {
  read_epoch?: number;
  bookmark?: string;
  next_cursor?: string;
  elapsed_ms?: number;
}

interface QueryResponse {
  records?: Array<Record<string, unknown>>;
  data?: Array<Record<string, unknown>>;
  metadata?: QueryMeta;
  read_epoch?: number;
  bookmark?: string;
  next_cursor?: string;
}

function config() {
  const url = process.env.HYDRADB_HTTP_URL;
  const token = process.env.HYDRADB_TOKEN_FILE
    ? readFileSync(process.env.HYDRADB_TOKEN_FILE, "utf8").trim()
    : process.env.HYDRADB_TOKEN;
  const namespace = process.env.HYDRADB_GRAPH_NAMESPACE ?? "default";
  if (!url || !token) throw new Error("HYDRADB_CONFIGURATION_REQUIRED");
  return { url, token, namespace };
}

async function query(
  cypher: string,
  parameters: Record<string, unknown> = {},
  retryRead = false,
): Promise<QueryResponse> {
  const { url, token, namespace } = config();
  const started = performance.now();
  const execute = () => request(`${url}/v1/graphs/${namespace}/query`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-graph-namespace": namespace,
      "x-consistency": "strong",
    },
    body: JSON.stringify({
      cell_id: "cell-0",
      query: cypher,
      parameters,
      consistency: "strong",
    }),
    headersTimeout: 3_000,
    bodyTimeout: 30_000,
  });
  let retried = false;
  const response = await execute().catch(async (error) => {
    if (!retryRead) throw error;
    retried = true;
    return execute();
  });
  if (response.statusCode >= 500 && retryRead && !retried) {
    await response.body.dump();
    return query(cypher, parameters, false);
  }
  if (response.statusCode !== 200) throw new Error(`HYDRADB_HTTP_${response.statusCode}`);
  const value = (await response.body.json()) as QueryResponse;
  value.metadata = { ...value.metadata, elapsed_ms: performance.now() - started };
  return value;
}

export async function waitForHydraDBReady(attempts = 30): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await query("RETURN 1 AS ready", {}, true);
      return;
    } catch (error) {
      if (attempt === attempts) throw new Error("HYDRADB_READINESS_TIMEOUT", { cause: error });
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
}

function literal(value: string): string {
  if (!selectorPattern.test(value)) throw new Error("UNSAFE_SELECTOR");
  return `'${value}'`;
}

function relationshipTypes(scopes: Scope[]): string[] {
  return ["MATCHES_INCIDENT", ...scopes.map((scope) => relationshipByScope[scope]), "USES_SNAPSHOT"];
}

function assertBatchIds(rows: Array<{ id: number; key: string }>): void {
  const registry = new Map<number, string>();
  for (const row of rows) {
    const prior = registry.get(row.id);
    if (prior && prior !== row.key) throw new Error("DETERMINISTIC_ID_COLLISION");
    registry.set(row.id, row.key);
  }
}

async function assertNodeIdRegistry(rows: Array<{ id: number; key: string }>): Promise<void> {
  assertBatchIds(rows);
  const existing = rowsOf(await query(
    "UNWIND $rows AS row MATCH (n {id: row.id}) RETURN row.key AS requested, n.key AS existing",
    { rows },
    true,
  ));
  if (existing.some((row) => row.requested !== row.existing)) throw new Error("GRAPH_ID_COLLISION");
}

async function assertRelationshipIdRegistry(rows: Array<{ id: number; key: string }>): Promise<void> {
  assertBatchIds(rows);
  const existing = rowsOf(await query(
    "UNWIND $rows AS row MATCH ()-[r {id: row.id}]->() RETURN row.key AS requested, r.key AS existing",
    { rows }, true,
  ));
  if (existing.some((row) => row.requested !== row.existing)) throw new Error("GRAPH_RELATIONSHIP_ID_COLLISION");
}

function rowsOf(response: QueryResponse): Array<Record<string, unknown>> {
  return response.records ?? response.data ?? [];
}

async function selectorCounts(bounds: TraversalBounds): Promise<{ sources: number; targets: number }> {
  const sources = bounds.sourceSelectors.map(literal).join(", ");
  const target = literal(bounds.targetSelector);
  const sourceRows = rowsOf(await query(
    `MATCH (n:IncidentSource) WHERE n.source_selector IN [${sources}] RETURN n.source_selector AS selector`,
    {}, true,
  ));
  const targetRows = rowsOf(await query(
    `MATCH (n:ScenarioApplication) WHERE n.portfolio_key = ${target} RETURN n.application_key AS application`,
    {}, true,
  ));
  return { sources: sourceRows.length, targets: targetRows.length };
}

export function renderTraversal(bounds: TraversalBounds): string {
  const sources = bounds.sourceSelectors.map(literal).join(", ");
  const targets = [bounds.targetSelector].map(literal).join(", ");
  const relTypes = bounds.relationshipTypes.map(literal).join(", ");
  return `CALL algo.MSpaths({
  sourceLabel: 'IncidentSource',
  sourceProperty: 'source_selector',
  sourceValues: [${sources}],
  targetLabel: 'ScenarioApplication',
  targetProperty: 'portfolio_key',
  targetValues: [${targets}],
  pairwise: false,
  relTypes: [${relTypes}],
  relDirection: 'incoming',
  maxLen: ${bounds.maxLen},
  pathCount: 1,
  resultLimit: ${bounds.resultLimit}
}) YIELD path RETURN path`;
}

export function traversalBounds(input: {
  sourceSelectors: string[];
  targetSelector: string;
  scopes: Scope[];
  maxImportedDepth: number;
  targetCount: number;
  expectedPairKeyDigest: string;
}): TraversalBounds {
  const maxLen = input.maxImportedDepth + 3;
  const sourceCount = input.sourceSelectors.length;
  if (!sourceCount || new Set(input.sourceSelectors).size !== sourceCount) throw new Error("SOURCE_SELECTOR_SET_INVALID");
  if (!input.scopes.length || new Set(input.scopes).size !== input.scopes.length) throw new Error("SCOPE_SET_INVALID");
  if (!Number.isInteger(input.targetCount) || input.targetCount < 1) throw new Error("TARGET_COUNT_INVALID");
  if (!Number.isInteger(input.maxImportedDepth) || input.maxImportedDepth < 0) throw new Error("IMPORTED_DEPTH_INVALID");
  if (maxLen > 16) throw new Error("DEPTH_BOUND_EXCEEDED");
  return {
    sourceSelectors: input.sourceSelectors,
    targetSelector: input.targetSelector,
    relationshipTypes: relationshipTypes(input.scopes),
    maxLen,
    pathCount: 1,
    resultLimit: sourceCount * input.targetCount,
    matchedSourceCount: sourceCount,
    matchedTargetCount: input.targetCount,
    expectedPairKeyDigest: input.expectedPairKeyDigest,
  };
}

function decodePair(path: unknown, bounds: TraversalBounds): ExposurePair {
  const value = path as {
    nodes: Array<{ properties: Record<string, unknown> }>;
    relationships: Array<{ type: string }>;
  };
  const nodes = value.nodes ?? [];
  const source = nodes[0]?.properties.source_key;
  const target = nodes.at(-1)?.properties.application_key;
  if (typeof source !== "string" || typeof target !== "string") throw new Error("PATH_ENDPOINT_SHAPE");
  if (!bounds.sourceSelectors.includes(String(nodes[0]?.properties.source_selector))) throw new Error("UNEXPECTED_SOURCE_ENDPOINT");
  if (nodes.at(-1)?.properties.portfolio_key !== bounds.targetSelector) throw new Error("UNEXPECTED_TARGET_ENDPOINT");
  const relationshipTypes = value.relationships.map((rel) => rel.type);
  if (relationshipTypes.some((type) => !bounds.relationshipTypes.includes(type))) throw new Error("UNEXPECTED_RELATIONSHIP_TYPE");
  if (relationshipTypes.length > bounds.maxLen) throw new Error("PATH_DEPTH_EXCEEDED");
  return {
    sourceKey: source,
    applicationKey: target,
    scopes: relationshipTypes.flatMap((type) => ({ PROD_DEPENDS_ON: ["production"], DEV_DEPENDS_ON: ["development"], OPTIONAL_DEPENDS_ON: ["optional"], PEER_DEPENDS_ON: ["peer"] }[type] ?? [])) as Scope[],
    witnessNodeKeys: nodes.map((node) => String(node.properties.key)),
    witnessRelationshipTypes: relationshipTypes,
    depth: value.relationships.length,
  };
}

export function validateTraversalResponse(
  bounds: TraversalBounds,
  counts: { sources: number; targets: number },
  response: QueryResponse,
): TraversalReceipt {
  const cypher = renderTraversal(bounds);
  const rows = rowsOf(response);
  const pairs = rows.map((row) => decodePair(row.path, bounds)).sort((a, b) =>
    `${a.sourceKey}:${a.applicationKey}`.localeCompare(`${b.sourceKey}:${b.applicationKey}`),
  );
  const keys = pairs.map((pair) => `${pair.sourceKey}:${pair.applicationKey}`);
  const duplicatePairCount = keys.length - new Set(keys).size;
  const cursorPresent = Boolean(response.next_cursor ?? response.metadata?.next_cursor);
  const readEpoch = response.read_epoch ?? response.metadata?.read_epoch;
  const bookmark = response.bookmark ?? response.metadata?.bookmark;
  const refusalReasons = [
    ...(counts.sources !== bounds.matchedSourceCount ? ["SOURCE_CARDINALITY_MISMATCH"] : []),
    ...(counts.targets !== bounds.matchedTargetCount ? ["TARGET_CARDINALITY_MISMATCH"] : []),
    ...(duplicatePairCount ? ["DUPLICATE_PAIR_ROWS"] : []),
    ...(cursorPresent ? ["CURSOR_PRESENT"] : []),
    ...(pairs.length > bounds.resultLimit ? ["RESULT_BOUND_EXCEEDED"] : []),
    ...(typeof readEpoch !== "number" ? ["READ_EPOCH_MISSING"] : []),
    ...(typeof bookmark !== "string" || !bookmark ? ["BOOKMARK_MISSING"] : []),
    ...(canonicalDigest(keys.slice().sort()) !== bounds.expectedPairKeyDigest ? ["BFS_PAIR_SET_MISMATCH"] : []),
  ];
  return {
    query: cypher,
    querySha256: sha256(cypher),
    bounds,
    pairs,
    pairDigest: canonicalDigest(pairs),
    pairKeyDigest: canonicalDigest(keys.slice().sort()),
    readEpoch: readEpoch ?? -1,
    bookmark: bookmark ?? "",
    elapsedMs: response.metadata?.elapsed_ms ?? 0,
    cursorPresent,
    duplicatePairCount,
    state: refusalReasons.length ? "PARTIAL" : "VERIFIED_WITHIN_BOUNDS",
    refusalReasons,
  };
}

export async function runTraversal(bounds: TraversalBounds): Promise<TraversalReceipt> {
  const counts = await selectorCounts(bounds);
  const response = await query(renderTraversal(bounds), {}, true);
  return validateTraversalResponse(bounds, counts, response);
}

export async function writeSnapshot(snapshot: ExtractedSnapshot): Promise<void> {
  const nodes = snapshot.packages.map((item) => ({ ...item, id: deterministicId(item.key) }));
  await assertNodeIdRegistry(nodes);
  const nodeQuery = `UNWIND $rows AS row
MERGE (n {id: row.id}) SET n:PackageInstance, n.key = row.key,
n.snapshot_key = row.snapshotKey, n.name = row.name, n.version = row.version,
n.purl = row.purl, n.location = row.location`;
  await query(nodeQuery, { rows: nodes });
  for (const scope of ["production", "development", "optional", "peer"] as Scope[]) {
    const type = relationshipByScope[scope];
    const edges = snapshot.edges.filter((edge) => edge.scope === scope).map((edge) => ({
      id: deterministicId(edge.key),
      from: deterministicId(edge.fromKey),
      to: deterministicId(edge.toKey),
      key: edge.key,
    }));
    if (!edges.length) continue;
    await assertRelationshipIdRegistry(edges);
    await query(`UNWIND $rows AS row
MATCH (a:PackageInstance {id: row.from}), (b:PackageInstance {id: row.to})
MERGE (a)-[r:${type} {id: row.id}]->(b) SET r.key = row.key`, { rows: edges });
  }
}

export async function writeApplicationRoot(snapshot: ExtractedSnapshot): Promise<void> {
  const appKey = `application:${snapshot.key}`;
  const appId = deterministicId(appKey);
  await assertNodeIdRegistry([{ id: appId, key: appKey }]);
  await query(`UNWIND $rows AS row
MERGE (n {id: row.id}) SET n:ApplicationSnapshot, n.key = row.key,
n.application_key = row.applicationKey, n.snapshot_key = row.snapshotKey`, {
    rows: [{ id: appId, key: appKey, applicationKey: snapshot.identity.repository, snapshotKey: snapshot.key }],
  });
  for (const scope of ["production", "development", "optional", "peer"] as Scope[]) {
    const type = relationshipByScope[scope];
    const rows = snapshot.applicationEdges.filter((edge) => edge.scope === scope).map((edge) => ({
      id: deterministicId(edge.key),
      key: edge.key,
      from: appId,
      to: deterministicId(edge.toKey),
    }));
    if (!rows.length) continue;
    await assertRelationshipIdRegistry(rows);
    await query(`UNWIND $rows AS row
MATCH (a:ApplicationSnapshot {id: row.from}), (b:PackageInstance {id: row.to})
MERGE (a)-[r:${type} {id: row.id}]->(b) SET r.key = row.key`, { rows });
  }
}

export async function verifySnapshotReadback(snapshot: ExtractedSnapshot): Promise<void> {
  if (!selectorPattern.test(snapshot.key)) throw new Error("UNSAFE_SNAPSHOT_KEY");
  const nodes = rowsOf(await query(
    `MATCH (n:PackageInstance) WHERE n.snapshot_key = '${snapshot.key}' RETURN n.key AS key`,
    {}, true,
  ));
  const roots = rowsOf(await query(
    `MATCH (n:ApplicationSnapshot) WHERE n.snapshot_key = '${snapshot.key}' RETURN n.key AS key`,
    {}, true,
  ));
  const edges = rowsOf(await query(
    `MATCH ()-[r]->() WHERE r.key STARTS WITH '${snapshot.key}:' RETURN r.key AS key`,
    {}, true,
  ));
  const expectedKeys = [...snapshot.edges, ...snapshot.applicationEdges].map(({ key }) => key).sort();
  const actualKeys = edges.map(({ key }) => String(key)).sort();
  if (nodes.length !== snapshot.packages.length) throw new Error("PACKAGE_READBACK_MISMATCH");
  if (roots.length !== 1) throw new Error("APPLICATION_ROOT_READBACK_MISMATCH");
  if (canonicalDigest(actualKeys) !== canonicalDigest(expectedKeys)) throw new Error("EDGE_READBACK_MISMATCH");
}

export async function writeScenario(input: {
  scenarioKey: string;
  portfolioKey: string;
  applications: Array<{ applicationKey: string; snapshotKey: string }>;
  sources: Array<{ sourceKey: string; selector: string; packageKeys: string[] }>;
}): Promise<void> {
  literal(input.scenarioKey);
  input.sources.forEach((source) => literal(source.selector));
  const apps = input.applications.map((item) => ({
    id: deterministicId(`${input.scenarioKey}:app:${item.applicationKey}`),
    key: `${input.scenarioKey}:app:${item.applicationKey}`,
    applicationKey: item.applicationKey,
    portfolioKey: input.portfolioKey,
    snapshotId: deterministicId(`application:${item.snapshotKey}`),
    relKey: `${input.scenarioKey}:uses:${item.applicationKey}`,
  }));
  await assertNodeIdRegistry(apps);
  await query(`UNWIND $rows AS row
MERGE (n {id: row.id}) SET n:ScenarioApplication, n.key = row.key,
n.application_key = row.applicationKey, n.portfolio_key = row.portfolioKey`, { rows: apps });
  const uses = apps.map((item) => ({ ...item, relId: deterministicId(item.relKey) }));
  await assertRelationshipIdRegistry(uses.map((item) => ({ id: item.relId, key: item.relKey })));
  await query(`UNWIND $rows AS row
MATCH (a:ScenarioApplication {id: row.id}), (s:ApplicationSnapshot {id: row.snapshotId})
MERGE (a)-[r:USES_SNAPSHOT {id: row.relId}]->(s) SET r.key = row.relKey`, {
    rows: uses,
  });
  const sources = input.sources.map((item) => ({
    id: deterministicId(`${input.scenarioKey}:source:${item.sourceKey}`),
    key: `${input.scenarioKey}:source:${item.sourceKey}`,
    sourceKey: item.sourceKey,
    selector: item.selector,
  }));
  await assertNodeIdRegistry(sources);
  await query(`UNWIND $rows AS row
MERGE (n {id: row.id}) SET n:IncidentSource, n.key = row.key,
n.source_key = row.sourceKey, n.source_selector = row.selector`, { rows: sources });
  const matches = input.sources.flatMap((source) => source.packageKeys.map((packageKey) => ({
    packageId: deterministicId(packageKey),
    sourceId: deterministicId(`${input.scenarioKey}:source:${source.sourceKey}`),
    key: `${input.scenarioKey}:matches:${packageKey}:${source.sourceKey}`,
    relId: deterministicId(`${input.scenarioKey}:matches:${packageKey}:${source.sourceKey}`),
  })));
  await assertRelationshipIdRegistry(matches.map((item) => ({ id: item.relId, key: item.key })));
  await query(`UNWIND $rows AS row
MATCH (p:PackageInstance {id: row.packageId}), (s:IncidentSource {id: row.sourceId})
MERGE (p)-[r:MATCHES_INCIDENT {id: row.relId}]->(s) SET r.key = row.key`, {
    rows: matches,
  });
  const nodeRows = rowsOf(await query(
    `MATCH (n) WHERE n.key STARTS WITH '${input.scenarioKey}:' RETURN n.key AS key`,
    {}, true,
  ));
  const edgeRows = rowsOf(await query(
    `MATCH ()-[r]->() WHERE r.key STARTS WITH '${input.scenarioKey}:' RETURN r.key AS key`,
    {}, true,
  ));
  const expectedNodes = [...apps.map(({ key }) => key), ...sources.map(({ key }) => key)].sort();
  const expectedEdges = [...apps.map(({ relKey }) => relKey), ...matches.map(({ key }) => key)].sort();
  if (canonicalDigest(nodeRows.map(({ key }) => String(key)).sort()) !== canonicalDigest(expectedNodes)) {
    throw new Error("SCENARIO_NODE_READBACK_MISMATCH");
  }
  if (canonicalDigest(edgeRows.map(({ key }) => String(key)).sort()) !== canonicalDigest(expectedEdges)) {
    throw new Error("SCENARIO_EDGE_READBACK_MISMATCH");
  }
}

export async function cleanupScenario(scenarioKey: string): Promise<void> {
  if (!selectorPattern.test(scenarioKey)) throw new Error("UNSAFE_SCENARIO_KEY");
  await query(`MATCH (n) WHERE n.key STARTS WITH '${scenarioKey}:' DETACH DELETE n`);
  const rows = rowsOf(await query(
    `MATCH (n) WHERE n.key STARTS WITH '${scenarioKey}:' RETURN count(n) AS remaining`, {}, true,
  ));
  if (Number(rows[0]?.remaining ?? -1) !== 0) throw new Error("SCENARIO_CLEANUP_INCOMPLETE");
}

export async function hydraHealth(): Promise<boolean> {
  const response = await query("MATCH (n) RETURN n.id LIMIT 1", {}, true);
  return Array.isArray(response.records ?? response.data ?? []);
}
```

### 7.6 HydraDB ontology and isolation

`ApplicationSnapshot` and root dependency edges are added during graph-write orchestration around `writeSnapshot`; the file above shows package ingestion and the exact relationship pattern. Build must not add a generic duplicate `DEPENDS_ON`. Scenario construction creates one `ScenarioApplication` per application, one scenario-specific `IncidentSource` per selected exact version, `USES_SNAPSHOT` edges, and `MATCHES_INCIDENT` edges only to matching package instances in chosen snapshots.

All batched writes pass data through `$rows` parameters under `UNWIND`; user strings never enter query text. Procedure selectors still use the stricter generated grammar because the runtime rejected array parameters inside procedure arguments.

## 8. Durable jobs and processing pipeline

### 8.1 Queue ownership

#### File: `src/jobs/queue.ts`
[UNVERIFIED] — pg-boss 12.27.0 exact ESM API is a first build contract gate

```typescript
// File: src/jobs/queue.ts
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { PgBoss } from "pg-boss";
import { canonicalDigest } from "../domain/canonical";
import { attachBrokerJob, markJobState, registerJob } from "../db/repository";

export const queueNames = [
  "import-snapshot",
  "refresh-evidence",
  "evaluate-proposed-fix",
  "verify-plan",
  "cleanup-scenario",
] as const;

export type QueueName = (typeof queueNames)[number];

const connectionString = process.env.DATABASE_URL_FILE
  ? readFileSync(process.env.DATABASE_URL_FILE, "utf8").trim()
  : process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL_REQUIRED");

export const boss = new PgBoss({ connectionString, application_name: "hydracut-worker" });
boss.on("error", (error) => process.stderr.write(`${JSON.stringify({ level: "error", error })}\n`));

export async function startQueue(): Promise<void> {
  await boss.start();
  for (const name of queueNames) await boss.createQueue(name);
}

export async function enqueue<T extends object>(name: QueueName, data: T, idempotencyKey?: string): Promise<string> {
  const stableKey = idempotencyKey ?? randomUUID();
  const jobId = canonicalDigest({ name, stableKey });
  const inputDigest = canonicalDigest(data);
  const created = await registerJob({ key: jobId, queue: name, idempotencyKey: stableKey,
    inputDigest, state: "CREATING" });
  if (!created) return jobId;
  try {
    const brokerId = await boss.send(name, { ...data, productJobId: jobId }, {
      retryLimit: 2, retryDelay: 5, retryBackoff: true, expireInSeconds: 900,
      singletonKey: jobId,
    });
    if (!brokerId) throw new Error("QUEUE_ENQUEUE_FAILED");
    await attachBrokerJob(jobId, brokerId);
    return jobId;
  } catch (error) {
    await markJobState(jobId, "FAILED", "QUEUE_ENQUEUE_FAILED");
    throw error;
  }
}
```

### 8.2 Pipeline handlers

#### File: `src/jobs/pipeline.ts`
[UNVERIFIED] — Composition of individually verified integration contracts; requires frozen-corpus E2E proof

```typescript
// File: src/jobs/pipeline.ts
import { canonicalDigest, sha256 } from "../domain/canonical";
import { finalizeReceipt } from "../domain/receipt";
import type {
  AdvisoryEvidence,
  CanonicalReceipt,
  ExposurePair,
  ExtractedSnapshot,
  PortfolioPlan,
  ProposedFix,
  ProposedFixDiscoveryEvidence,
  ProposedFixOutcome,
  RepositoryIdentity,
  Scope,
  SourceStamp,
} from "../domain/types";
import {
  appendAuditEvent,
  appendPhaseEvent,
  createPlanForIncident,
  findIncident,
  findReceipt,
  findSnapshot,
  ensurePortfolio,
  invalidatePortfolioIncidents,
  listPortfolioSnapshots,
  listIncidents,
  loadIncidentBundle,
  loadPlanBundle,
  saveAdvisoryVersion,
  saveFinding,
  saveIncident,
  saveIncidentBaseline,
  saveProposedFix,
  saveReceipt,
  saveSnapshot,
} from "../db/repository";
import { extractSnapshot } from "../integrations/arborist";
import { discoverProposedFixes, fetchRepositoryFile, resolveCommit } from "../integrations/github";
import { enrichCve } from "../integrations/enrichment";
import { assertAdvisoryActive, fetchAdvisory, queryExactCoordinate, queryExactPackages, refreshSelectedAdvisory } from "../integrations/osv";
import {
  cleanupScenario,
  runTraversal,
  traversalBounds,
  writeApplicationRoot,
  writeScenario,
  writeSnapshot,
  verifySnapshotReadback,
} from "../integrations/hydradb";

type ImportPayload = {
  jobId: string;
  portfolioKey: string;
  role?: "current" | "proposed";
  expectedLockfileSha256?: string;
} & (
  | { kind: "github"; repository: string; ref: string }
  | { kind: "upload"; repository: string; manifestBase64: string; lockfileBase64: string }
);

interface VerifyPayload {
  jobId: string;
  receipt: Omit<CanonicalReceipt, "final">;
  plan: PortfolioPlan;
  scenarioKey: string;
  portfolioSelector: string;
  scopes: Scope[];
  applications: Array<{ applicationKey: string; snapshotKey: string }>;
  sources: Array<{ sourceKey: string; selector: string; packageKeys: string[] }>;
  maxImportedDepth: number;
  expectedPairKeyDigest: string;
}

type VerifyRequest = { planKey: string; expectedPlanDigest: string };

async function phase(
  jobId: string,
  sequence: number,
  name: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  await appendPhaseEvent({ jobId, sequence, phase: name, state: "COMPLETE", attempt: 1, detail });
}

function snapshotIdentity(
  repository: string,
  commitSha: string,
  manifest: { blobSha: string; sha256: string; bytes: Uint8Array; sourceStamp?: SourceStamp },
  lockfile: { blobSha: string; sha256: string; bytes: Uint8Array; sourceStamp?: SourceStamp },
  source: "github" | "upload",
  resolutionStamp?: SourceStamp,
): RepositoryIdentity {
  return {
    repository,
    commitSha,
    manifestBlobSha: manifest.blobSha,
    lockfileBlobSha: lockfile.blobSha,
    manifestSha256: manifest.sha256,
    lockfileSha256: lockfile.sha256,
    manifestBytes: manifest.bytes.length,
    lockfileBytes: lockfile.bytes.length,
    apiVersion: source === "github" ? "2026-03-10" : "local-upload-v1",
    source,
    sourceStamps: [resolutionStamp, manifest.sourceStamp, lockfile.sourceStamp]
      .filter((stamp): stamp is SourceStamp => Boolean(stamp)),
    retrievedAt: new Date().toISOString(),
  };
}

function decodeUpload(value: string): { bytes: Uint8Array; sha256: string; blobSha: "upload" } {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) throw new Error("UPLOAD_BASE64_INVALID");
  const bytes = Uint8Array.from(Buffer.from(value, "base64"));
  if (Buffer.from(bytes).toString("base64") !== value) throw new Error("UPLOAD_BASE64_INVALID");
  if (bytes.length > 10 * 1024 * 1024) throw new Error("UPLOAD_TOO_LARGE");
  return { bytes, sha256: sha256(bytes), blobSha: "upload" };
}

export async function handleImport(payload: ImportPayload): Promise<{ snapshotKey: string; lockfileSha256: string; sourceUrl?: string }> {
  await ensurePortfolio(payload.portfolioKey);
  const resolved = payload.kind === "github" ? await resolveCommit(payload.repository, payload.ref) : undefined;
  const commitSha = resolved?.sha ?? `upload-${sha256(payload.kind === "upload" ? payload.lockfileBase64 : "").slice(0, 32)}`;
  await phase(payload.jobId, 1, "VALIDATE", { commitSha, kind: payload.kind });
  const files = payload.kind === "github"
    ? await Promise.all([
      fetchRepositoryFile(payload.repository, commitSha, "package.json"),
      fetchRepositoryFile(payload.repository, commitSha, "package-lock.json"),
    ])
    : [decodeUpload(payload.manifestBase64), decodeUpload(payload.lockfileBase64)] as const;
  const [manifest, lockfile] = files;
  if (payload.expectedLockfileSha256 && lockfile.sha256 !== payload.expectedLockfileSha256) {
    throw new Error("EXPECTED_LOCKFILE_HASH_MISMATCH");
  }
  await phase(payload.jobId, 2, "FETCH", { manifestBytes: manifest.bytes.length, lockfileBytes: lockfile.bytes.length });
  const identity = snapshotIdentity(payload.repository, commitSha, manifest, lockfile, payload.kind, resolved?.sourceStamp);
  const snapshotKey = canonicalDigest({ portfolioKey: payload.portfolioKey, repository: identity.repository, commitSha: identity.commitSha,
    manifestSha256: identity.manifestSha256, lockfileSha256: identity.lockfileSha256, source: identity.source });
  await phase(payload.jobId, 3, "HASH", { snapshotKey });
  const snapshot = await extractSnapshot({
    snapshotKey,
    manifest: manifest.bytes,
    lockfile: lockfile.bytes,
    identity,
  });
  await phase(payload.jobId, 4, "EXTRACT", {
    packages: snapshot.packages.length,
    edges: snapshot.edges.length + snapshot.applicationEdges.length,
    maxDepth: snapshot.maxDepth,
  });
  await writeSnapshot(snapshot);
  await writeApplicationRoot(snapshot);
  await verifySnapshotReadback(snapshot);
  await phase(payload.jobId, 5, "GRAPH_WRITE", { extractionSha256: snapshot.extractionSha256 });
  await saveSnapshot({
    key: snapshot.key,
    portfolioKey: payload.portfolioKey,
    repository: identity.repository,
    role: payload.role ?? "current",
    commitSha: identity.commitSha,
    manifestSha256: identity.manifestSha256,
    lockfileSha256: identity.lockfileSha256,
    extractionSha256: snapshot.extractionSha256,
    packageCount: snapshot.packages.length,
    edgeCount: snapshot.edges.length + snapshot.applicationEdges.length,
    maxDepth: snapshot.maxDepth,
    topology: snapshot,
    identity,
  });
  if ((payload.role ?? "current") === "current") await scanPortfolio(payload.portfolioKey);
  return { snapshotKey, lockfileSha256: identity.lockfileSha256,
    ...(resolved?.html_url ? { sourceUrl: resolved.html_url } : {}) };
}

interface ScenarioSource {
  sourceKey: string;
  selector: string;
  name: string;
  version: string;
  packageKeys: string[];
}

function sourceDefinitions(bundle: Awaited<ReturnType<typeof loadIncidentBundle>>): ScenarioSource[] {
  const groups = new Map<string, ScenarioSource>();
  for (const finding of bundle.findings) {
    const owner = bundle.snapshots.find((row) => row.key === finding.snapshotKey);
    const pkg = owner?.topology.packages.find((item) => item.key === finding.packageKey);
    const advisory = bundle.advisories.find((row) => row.key === finding.advisoryKey);
    if (!pkg || !advisory) throw new Error("FINDING_EVIDENCE_MISSING");
    const sourceKey = `${advisory.evidence.osvId}:${pkg.name}@${pkg.version}`;
    groups.set(sourceKey, { sourceKey, selector: `src-${sha256(sourceKey).slice(0, 16)}`, name: pkg.name, version: pkg.version, packageKeys: [] });
  }
  return [...groups.values()].sort((a, b) => a.sourceKey.localeCompare(b.sourceKey));
}

function bindSources(sources: ScenarioSource[], snapshots: Array<{ topology: ExtractedSnapshot }>): ScenarioSource[] {
  return sources.map((source) => ({
    ...source,
    packageKeys: snapshots.flatMap(({ topology }) => topology.packages
      .filter((pkg) => pkg.name === source.name && pkg.version === source.version)
      .map((pkg) => pkg.key)),
  }));
}

function reachableKeys(snapshot: ExtractedSnapshot, scopes: Scope[]): Set<string> {
  const children = new Map<string, string[]>();
  for (const edge of snapshot.edges.filter((item) => scopes.includes(item.scope))) {
    children.set(edge.fromKey, [...(children.get(edge.fromKey) ?? []), edge.toKey]);
  }
  const seen = new Set<string>();
  const queue = snapshot.applicationEdges.filter((item) => scopes.includes(item.scope)).map((item) => item.toKey);
  while (queue.length) {
    const key = queue.shift()!;
    if (seen.has(key)) continue;
    seen.add(key);
    queue.push(...(children.get(key) ?? []));
  }
  return seen;
}

function bfsPairKeys(snapshots: Array<{ repository: string; topology: ExtractedSnapshot }>, sources: ScenarioSource[], scopes: Scope[]): string[] {
  return snapshots.flatMap((snapshot) => {
    const reachable = reachableKeys(snapshot.topology, scopes);
    return sources.filter((source) => source.packageKeys.some((key) => reachable.has(key)))
      .map((source) => `${source.sourceKey}:${snapshot.repository}`);
  }).sort();
}

async function traverseSnapshotSet(input: {
  scenarioKey: string;
  portfolioSelector: string;
  snapshots: Array<{ key: string; repository: string; topology: ExtractedSnapshot }>;
  sources: ScenarioSource[];
  scopes: Scope[];
}): Promise<CanonicalReceipt["baseline"]> {
  const boundSources = bindSources(input.sources, input.snapshots);
  const pairKeys = bfsPairKeys(input.snapshots, boundSources, input.scopes);
  await writeScenario({ scenarioKey: input.scenarioKey, portfolioKey: input.portfolioSelector,
    applications: input.snapshots.map((row) => ({ applicationKey: row.repository, snapshotKey: row.key })), sources: boundSources });
  try {
    return await runTraversal(traversalBounds({ sourceSelectors: boundSources.map(({ selector }) => selector), targetSelector: input.portfolioSelector,
      scopes: input.scopes, maxImportedDepth: Math.max(...input.snapshots.map(({ topology }) => topology.maxDepth)),
      targetCount: input.snapshots.length, expectedPairKeyDigest: canonicalDigest(pairKeys) }));
  } finally {
    await cleanupScenario(input.scenarioKey);
  }
}

async function scanSnapshot(row: Awaited<ReturnType<typeof listPortfolioSnapshots>>[number]) {
  const matches = await queryExactPackages(row.topology.packages);
  const results: Array<{ findingKey: string; advisory: AdvisoryEvidence;
    exploitation: Awaited<ReturnType<typeof enrichCve>>; packageKey: string }> = [];
  for (const pkg of row.topology.packages) {
    for (const id of matches.get(pkg.key) ?? []) {
      const advisory = await fetchAdvisory(id, pkg.name, pkg.version);
      const advisoryKey = canonicalDigest({ id, payload: advisory.source.payloadSha256 });
      const findingKey = canonicalDigest({ snapshot: row.key, package: pkg.key, advisory: advisoryKey });
      const exploitation = await enrichCve(advisory.aliases.find((alias) => alias.startsWith("CVE-")));
      await saveAdvisoryVersion(advisoryKey, advisory, exploitation);
      await saveFinding({ key: findingKey, snapshotKey: row.key, packageKey: pkg.key, advisoryKey, state: advisory.withdrawnAt ? "PARTIAL" : "VERIFIED_WITHIN_BOUNDS" });
      results.push({ findingKey, advisory, exploitation, packageKey: pkg.key });
    }
  }
  return results;
}

async function finalScenarioEvidence(
  snapshots: Array<NonNullable<Awaited<ReturnType<typeof findSnapshot>>>>,
  selectedSources: ScenarioSource[],
) {
  const scanned = (await Promise.all(snapshots.map(scanSnapshot))).flat();
  const sources = new Map(selectedSources.map((source) => [source.sourceKey, source]));
  const advisories = new Map<string, AdvisoryEvidence>();
  const exploitation = new Map<string, Awaited<ReturnType<typeof enrichCve>>>();
  const withdrawnSourceKeys = new Set<string>();
  for (const item of scanned) {
    const sourceKey = `${item.advisory.osvId}:${item.advisory.packageName}@${item.advisory.exactVersion}`;
    if (item.advisory.withdrawnAt) {
      if (sources.has(sourceKey)) withdrawnSourceKeys.add(sourceKey);
      continue;
    }
    advisories.set(`${item.advisory.osvId}:${item.advisory.packageName}@${item.advisory.exactVersion}`, item.advisory);
    exploitation.set(item.exploitation.cve ?? item.advisory.osvId, item.exploitation);
  }
  return { sources: [...sources.values()].sort((a, b) => a.sourceKey.localeCompare(b.sourceKey)),
    advisories: [...advisories.values()].sort((a, b) => `${a.osvId}:${a.packageName}@${a.exactVersion}`.localeCompare(`${b.osvId}:${b.packageName}@${b.exactVersion}`)),
    exploitation: [...exploitation.values()].sort((a, b) => (a.cve ?? "").localeCompare(b.cve ?? "")),
    queryStamps: [] as SourceStamp[], withdrawnSourceKeys };
}

async function boundedProofEvidence(
  snapshots: Array<NonNullable<Awaited<ReturnType<typeof findSnapshot>>>>,
  coordinates: string[],
  requireGraphPresence = false,
) {
  const sources: ScenarioSource[] = [];
  const advisories: AdvisoryEvidence[] = [];
  const exploitation: CanonicalReceipt["exploitation"] = [];
  const queryStamps: SourceStamp[] = [];
  for (const coordinate of coordinates) {
    const split = coordinate.lastIndexOf("@");
    if (split < 1) throw new Error("PROOF_SOURCE_COORDINATE_INVALID");
    const name = coordinate.slice(0, split);
    const version = coordinate.slice(split + 1);
    const present = snapshots.some((row) => row.topology.packages.some((item) => item.name === name && item.version === version));
    if (requireGraphPresence && !present) throw new Error("PROOF_SOURCE_PACKAGE_MISSING");
    const coordinateEvidence = await queryExactCoordinate(name, version);
    const ids = coordinateEvidence.ids;
    if (!ids.length) throw new Error("PROOF_SOURCE_OSV_EVIDENCE_MISSING");
    const refreshed = await Promise.all(ids.map((id) => refreshSelectedAdvisory(id, name, version)));
    refreshed.forEach((row) => assertAdvisoryActive(row.advisory));
    advisories.push(...refreshed.map((row) => row.advisory));
    queryStamps.push(...coordinateEvidence.queryStamps, ...refreshed.flatMap((row) => row.queryStamps));
    exploitation.push(...await Promise.all(refreshed.map((row) =>
      enrichCve(row.advisory.aliases.find((alias) => alias.startsWith("CVE-"))))));
    sources.push({ sourceKey: `OSV-SET:${coordinate}`, selector: `src-${sha256(coordinate).slice(0, 16)}`,
      name, version, packageKeys: [] });
  }
  return { sources: sources.sort((a, b) => a.sourceKey.localeCompare(b.sourceKey)), advisories,
    exploitation, queryStamps, withdrawnSourceKeys: new Set<string>() };
}

async function refreshIncidentEvidence(bundle: Awaited<ReturnType<typeof loadIncidentBundle>>) {
  const rows = await Promise.all(bundle.advisories.map(async (row) => {
    const refreshed = await refreshSelectedAdvisory(row.evidence.osvId, row.evidence.packageName, row.evidence.exactVersion);
    assertAdvisoryActive(refreshed.advisory);
    const exploitation = await enrichCve(refreshed.advisory.aliases.find((alias) => alias.startsWith("CVE-")));
    return { ...refreshed, exploitation };
  }));
  return { advisories: rows.map((row) => row.advisory), exploitation: rows.map((row) => row.exploitation),
    queryStamps: rows.flatMap((row) => row.queryStamps) };
}

function enrichmentLimitations(rows: CanonicalReceipt["exploitation"]): string[] {
  return rows.flatMap((row) => [
    ...(row.kev === "UNKNOWN" ? [`CISA KEV status is UNKNOWN for ${row.cve ?? "an advisory without a CVE alias"}.`] : []),
    ...(row.epssProbability === undefined ? [`FIRST EPSS is UNKNOWN for ${row.cve ?? "an advisory without a CVE alias"}.`] : []),
  ]).sort();
}

export async function scanPortfolio(portfolioKey: string): Promise<string[]> {
  await invalidatePortfolioIncidents(portfolioKey);
  const snapshots = await listPortfolioSnapshots(portfolioKey);
  const scanned = (await Promise.all(snapshots.map(scanSnapshot))).flat();
  const groups = new Map<string, typeof scanned>();
  for (const item of scanned.filter(({ advisory }) => !advisory.withdrawnAt)) {
    const key = `${item.advisory.osvId}:${item.advisory.packageName}@${item.advisory.exactVersion}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const incidentKeys: string[] = [];
  for (const [group, items] of groups) {
    const key = canonicalDigest({ portfolioKey, group });
    await saveIncident({ key, portfolioKey, title: group, sourceFindingKeys: items.map(({ findingKey }) => findingKey).sort(),
      scopes: ["production", "development", "optional", "peer"], verificationSourceCoordinates: [],
      verificationBaseline: null, state: "UNKNOWN" });
    incidentKeys.push(key);
  }
  return incidentKeys.sort();
}

export async function handleRefreshEvidence(payload: { jobId: string; incidentKey: string; scopes: Scope[];
  sourceFindingIds: string[]; verificationSourceCoordinates: string[] }) {
  const bundle = await loadIncidentBundle(payload.incidentKey);
  if (canonicalDigest(payload.sourceFindingIds.slice().sort()) !== canonicalDigest(bundle.incident.sourceFindingKeys.slice().sort())) throw new Error("SOURCE_FINDING_SET_MISMATCH");
  await refreshIncidentEvidence(bundle);
  const selectedEvidence = bundle.advisories[0]?.evidence;
  if (!selectedEvidence) throw new Error("SELECTED_INCIDENT_EVIDENCE_MISSING");
  const selectedCoordinate = `${selectedEvidence.packageName}@${selectedEvidence.exactVersion}`;
  if (!payload.verificationSourceCoordinates.includes(selectedCoordinate)) throw new Error("SELECTED_INCIDENT_SOURCE_REQUIRED");
  const baseline = await traverseSnapshotSet({ scenarioKey: `baseline-${payload.jobId}`, portfolioSelector: `portfolio-${sha256(bundle.incident.portfolioKey).slice(0, 16)}`,
    snapshots: bundle.snapshots, sources: sourceDefinitions(bundle), scopes: payload.scopes });
  const verificationEvidence = await boundedProofEvidence(bundle.snapshots, payload.verificationSourceCoordinates, true);
  const verificationBaseline = await traverseSnapshotSet({ scenarioKey: `verification-baseline-${payload.jobId}`,
    portfolioSelector: `verification-${sha256(bundle.incident.portfolioKey).slice(0, 16)}`,
    snapshots: bundle.snapshots, sources: verificationEvidence.sources, scopes: payload.scopes });
  await saveIncidentBaseline(payload.incidentKey, baseline, verificationBaseline, payload.scopes,
    payload.verificationSourceCoordinates);
  return baseline;
}

function pairKeys(pairs: ExposurePair[]): string[] {
  return pairs.map((pair) => `${pair.sourceKey}:${pair.applicationKey}`).sort();
}

function changedPackages(left: ExtractedSnapshot, right: ExtractedSnapshot): number {
  const identity = (item: ExtractedSnapshot["packages"][number]) => `${item.location}:${item.name}@${item.version}`;
  const a = new Set(left.packages.map(identity));
  const b = new Set(right.packages.map(identity));
  return [...a].filter((key) => !b.has(key)).length + [...b].filter((key) => !a.has(key)).length;
}

type EvaluatePayload = ImportPayload & { incidentKey: string; origin: ProposedFix["origin"];
  sourceUrl?: string; discoveryEvidence?: ProposedFixDiscoveryEvidence };

export async function handleEvaluateProposedFix(payload: EvaluatePayload): Promise<ProposedFixOutcome> {
  const bundle = await loadIncidentBundle(payload.incidentKey);
  if (!bundle.incident.baseline || bundle.incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("BASELINE_NOT_VERIFIED");
  await refreshIncidentEvidence(bundle);
  const baselineRow = bundle.snapshots.find((row) => row.repository === payload.repository);
  if (!baselineRow) throw new Error("PROPOSED_FIX_REPOSITORY_MISMATCH");
  const imported = await handleImport({ ...payload, role: "proposed" });
  const { snapshotKey } = imported;
  const proposedRow = await findSnapshot(snapshotKey);
  if (!proposedRow) throw new Error("PROPOSED_SNAPSHOT_MISSING");
  const [baselineFindings, proposedFindings] = await Promise.all([
    scanSnapshot(baselineRow),
    scanSnapshot(proposedRow),
  ]);
  const findingIdentity = (item: Awaited<ReturnType<typeof scanSnapshot>>[number]) =>
    `${item.advisory.osvId}:${item.advisory.packageName}@${item.advisory.exactVersion}`;
  const beforeFindings = new Set(baselineFindings.map(findingIdentity));
  const afterFindings = new Set(proposedFindings.map(findingIdentity));
  const snapshots = bundle.snapshots.map((row) => row.repository === payload.repository ? proposedRow : row);
  const result = await traverseSnapshotSet({ scenarioKey: `fix-${payload.jobId}`, portfolioSelector: `fix-${sha256(payload.jobId).slice(0, 16)}`,
    snapshots, sources: sourceDefinitions(bundle), scopes: bundle.incident.scopes as Scope[] });
  const baseline = new Set(pairKeys(bundle.incident.baseline.pairs));
  const proposed = new Set(pairKeys(result.pairs));
  const baselinePairKeys = [...baseline].sort();
  const baselineSnapshotKeys = bundle.snapshots.map((row) => row.key).sort();
  const baselinePairDigest = canonicalDigest(baselinePairKeys);
  const fixKey = canonicalDigest({ incident: payload.incidentKey, repository: payload.repository, snapshotKey,
    baselinePairDigest, baselineSnapshotKeys });
  const outcome = { proposedFixKey: fixKey, removed: [...baseline].filter((key) => !proposed.has(key)),
    persistent: [...baseline].filter((key) => proposed.has(key)), introduced: [...proposed].filter((key) => !baseline.has(key)),
    unknown: result.state === "VERIFIED_WITHIN_BOUNDS" ? [] : [...baseline],
    otherFindings: { removed: [...beforeFindings].filter((key) => !afterFindings.has(key)),
      persistent: [...beforeFindings].filter((key) => afterFindings.has(key)),
      introduced: [...afterFindings].filter((key) => !beforeFindings.has(key)) },
    changedPackageCount: changedPackages(baselineRow.topology, proposedRow.topology) };
  await saveProposedFix({ key: fixKey, repository: payload.repository, origin: payload.origin,
    ...(payload.sourceUrl || imported.sourceUrl ? { sourceUrl: payload.sourceUrl ?? imported.sourceUrl } : {}),
    ...(payload.kind === "github" ? { headSha: proposedRow.commitSha } : {}),
    ...(payload.discoveryEvidence ? { discoveryEvidence: payload.discoveryEvidence } : {}),
    manifestSha256: proposedRow.manifestSha256, lockfileSha256: proposedRow.lockfileSha256,
    snapshotKey, changedPackageCount: outcome.changedPackageCount, state: result.state }, payload.incidentKey, outcome,
    { pairDigest: baselinePairDigest, snapshotKeys: baselineSnapshotKeys });
  return outcome;
}

export async function handleDiscoverProposedFixes(incidentKey: string) {
  const bundle = await loadIncidentBundle(incidentKey);
  const entries = await Promise.all(bundle.snapshots.map(async (row) => ({ repository: row.repository, pulls: await discoverProposedFixes(row.repository) })));
  return entries.flatMap(({ repository, pulls }) => pulls.map((pull) => ({ incidentKey,
    portfolioKey: bundle.incident.portfolioKey, kind: "github" as const, repository,
    ref: pull.head.sha, origin: "github-pr" as const, sourceUrl: pull.html_url,
    discoveryEvidence: pull.evidence })));
}

export async function handleVerifyPlan(payload: VerifyPayload): Promise<{ digest: string }> {
  await writeScenario({
    scenarioKey: payload.scenarioKey,
    portfolioKey: payload.portfolioSelector,
    applications: payload.applications,
    sources: payload.sources,
  });
  try {
    await phase(payload.jobId, 1, "GRAPH_WRITE", { scenarioKey: payload.scenarioKey });
    const bounds = traversalBounds({ sourceSelectors: payload.sources.map((source) => source.selector),
      targetSelector: payload.portfolioSelector, scopes: payload.scopes,
      maxImportedDepth: payload.maxImportedDepth, targetCount: payload.applications.length,
      expectedPairKeyDigest: payload.expectedPairKeyDigest });
    await phase(payload.jobId, 2, "VERIFY_COUNTS", { resultLimit: bounds.resultLimit });
    const final = await runTraversal(bounds);
    await phase(payload.jobId, 3, "TRAVERSE", { pairDigest: final.pairDigest, state: final.state });
    const receipt: CanonicalReceipt = { ...payload.receipt, resultState: final.state, final,
      plan: { ...payload.plan, state: final.state === "VERIFIED_WITHIN_BOUNDS" ? "VERIFIED" : "FAILED" } };
    const material = finalizeReceipt(receipt);
    await saveReceipt(material.digest, material.receipt, material.json);
    await phase(payload.jobId, 4, "RECEIPT", { digest: material.digest });
    return { digest: material.digest };
  } finally {
    try {
      await cleanupScenario(payload.scenarioKey);
    } catch (error) {
      await appendAuditEvent("scenario.cleanup_failed", payload.scenarioKey, {
        jobId: payload.jobId,
        message: error instanceof Error ? error.message : "unknown cleanup error",
      });
    }
  }
}

function planFromRow(row: Awaited<ReturnType<typeof loadPlanBundle>>["plan"]): PortfolioPlan {
  return { key: row.key, incidentKey: row.incidentKey, proposedFixKeys: row.proposedFixKeys,
    baselinePairKeys: row.baselinePairKeys, baselineSnapshotKeys: row.baselineSnapshotKeys,
    verificationSourceCoordinates: row.verificationSourceCoordinates,
    verificationBaselinePairKeys: row.verificationBaselinePairKeys,
    scopes: row.scopes,
    predictedResidualPairKeys: row.predictedResidual, constraints: row.constraints,
    exhaustiveWithinBounds: row.exhaustiveWithinBounds, state: row.state as PortfolioPlan["state"] };
}

function fixFromRow(row: Awaited<ReturnType<typeof loadPlanBundle>>["fixes"][number]): ProposedFix {
  return { key: row.key, repository: row.repository, origin: row.origin as ProposedFix["origin"],
    ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}), ...(row.headSha ? { headSha: row.headSha } : {}),
    ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}),
    manifestSha256: row.manifestSha256, lockfileSha256: row.lockfileSha256,
    snapshotKey: row.snapshotKey, changedPackageCount: row.outcome.changedPackageCount, state: row.state };
}

export function assertProposedFixBytes(
  expected: { manifestSha256: string; lockfileSha256: string },
  observed: { manifestSha256: string; lockfileSha256: string },
): void {
  if (expected.manifestSha256 !== observed.manifestSha256 ||
    expected.lockfileSha256 !== observed.lockfileSha256) throw new Error("PROPOSED_FIX_BYTES_DRIFT");
}

export async function handleVerifyPlanRequest(input: VerifyRequest) {
  if (input.planKey !== input.expectedPlanDigest) throw new Error("PLAN_DIGEST_DRIFT");
  const bundle = await loadPlanBundle(input.planKey);
  if (!bundle.incident.baseline || bundle.incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS" ||
    !bundle.incident.verificationBaseline || bundle.incident.verificationBaseline.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("BASELINE_NOT_VERIFIED");
  const plan = planFromRow(bundle.plan);
  const currentBaselinePairKeys = pairKeys(bundle.incident.baseline.pairs);
  const currentBaselineSnapshotKeys = bundle.snapshots.map((row) => row.key).sort();
  if (canonicalDigest(plan.baselinePairKeys) !== canonicalDigest(currentBaselinePairKeys) ||
    canonicalDigest(plan.baselineSnapshotKeys) !== canonicalDigest(currentBaselineSnapshotKeys)) throw new Error("PLAN_BASELINE_STALE");
  if (canonicalDigest(plan.verificationSourceCoordinates) !== canonicalDigest(bundle.incident.verificationSourceCoordinates) ||
    canonicalDigest(plan.verificationBaselinePairKeys) !== canonicalDigest(pairKeys(bundle.incident.verificationBaseline.pairs))) {
    throw new Error("PLAN_VERIFICATION_UNIVERSE_STALE");
  }
  if (canonicalDigest(plan.scopes) !== canonicalDigest([...(bundle.incident.scopes as Scope[])].sort())) {
    throw new Error("PLAN_SCOPE_STALE");
  }
  const recomputedPlanKey = canonicalDigest({ incidentKey: plan.incidentKey, baselinePairs: [...plan.baselinePairKeys].sort(),
    baselineSnapshotKeys: [...plan.baselineSnapshotKeys].sort(), fixes: [...plan.proposedFixKeys].sort(),
    verificationSourceCoordinates: [...plan.verificationSourceCoordinates].sort(),
    verificationBaselinePairKeys: [...plan.verificationBaselinePairKeys].sort(),
    scopes: [...plan.scopes].sort(),
    constraints: plan.constraints, exhaustiveWithinBounds: plan.exhaustiveWithinBounds });
  if (recomputedPlanKey !== plan.key) throw new Error("PLAN_STORED_DIGEST_MISMATCH");
  const orderedFixes = bundle.plan.proposedFixKeys.map((key) => bundle.fixes.find((fix) => fix.key === key));
  if (orderedFixes.some((fix) => !fix) || orderedFixes.length !== bundle.fixes.length) throw new Error("PLAN_FIX_SET_DRIFT");
  if (orderedFixes.some((fix) => fix?.baselinePairDigest !== canonicalDigest(plan.baselinePairKeys) ||
    canonicalDigest(fix?.baselineSnapshotKeys ?? []) !== canonicalDigest(plan.baselineSnapshotKeys))) throw new Error("PLAN_FIX_BASELINE_STALE");
  const proposedRows = await Promise.all(orderedFixes.map(async (fix) => {
    if (!fix) throw new Error("PLAN_FIX_SET_DRIFT");
    const snapshot = await findSnapshot(fix.snapshotKey);
    if (!snapshot) throw new Error("PROPOSED_FIX_SNAPSHOT_MISSING");
    if (fix.origin !== "upload" && snapshot.commitSha !== fix.headSha) throw new Error("PROPOSED_FIX_DRIFT");
    if (snapshot.manifestSha256 !== fix.manifestSha256 || snapshot.lockfileSha256 !== fix.lockfileSha256) {
      throw new Error("PROPOSED_FIX_STORED_HASH_DRIFT");
    }
    if (fix.origin !== "upload" && fix.headSha) {
      const [manifest, lockfile] = await Promise.all([
        fetchRepositoryFile(fix.repository, fix.headSha, "package.json"),
        fetchRepositoryFile(fix.repository, fix.headSha, "package-lock.json"),
      ]);
      assertProposedFixBytes(fix, { manifestSha256: manifest.sha256, lockfileSha256: lockfile.sha256 });
    }
    return { fix, snapshot };
  }));
  const replacements = new Map(proposedRows.map(({ fix, snapshot }) => [fix.repository, snapshot]));
  const snapshots = bundle.snapshots.map((row) => replacements.get(row.repository) ?? row)
    .sort((a, b) => a.repository.localeCompare(b.repository));
  const selectedSources = sourceDefinitions(bundle);
  const refreshedSelected = await refreshIncidentEvidence(bundle);
  const [boundedEvidence, fullEvidence] = await Promise.all([
    boundedProofEvidence(snapshots, plan.verificationSourceCoordinates),
    finalScenarioEvidence(snapshots, []),
  ]);
  const evidence = { ...boundedEvidence, advisories: [...boundedEvidence.advisories, ...fullEvidence.advisories],
    exploitation: [...boundedEvidence.exploitation, ...fullEvidence.exploitation],
    queryStamps: [...boundedEvidence.queryStamps, ...fullEvidence.queryStamps] };
  if (selectedSources.some((source) => evidence.withdrawnSourceKeys.has(source.sourceKey))) {
    throw new Error("WITHDRAWN_ADVISORY_REVIEW_REQUIRED");
  }
  const sources = evidence.sources;
  const boundSources = bindSources(sources, snapshots);
  const pairKeysExpected = bfsPairKeys(snapshots, boundSources, bundle.incident.scopes as Scope[]);
  const advisories = [...new Map([...refreshedSelected.advisories, ...evidence.advisories]
    .map((item) => [`${item.osvId}:${item.packageName}@${item.exactVersion}`, item])).values()]
    .sort((a, b) => `${a.osvId}:${a.packageName}@${a.exactVersion}`.localeCompare(`${b.osvId}:${b.packageName}@${b.exactVersion}`));
  const exploitation = [...new Map([...refreshedSelected.exploitation, ...evidence.exploitation]
    .map((item) => [item.cve ?? canonicalDigest(item.sources), item])).values()]
    .sort((a, b) => (a.cve ?? "").localeCompare(b.cve ?? ""));
  const sourceStamps = [...new Map([...refreshedSelected.queryStamps, ...evidence.queryStamps, ...advisories.map((item) => item.source), ...exploitation.flatMap((item) => item.sources)]
    .map((item) => [`${item.source}:${item.url}:${item.payloadSha256}`, item])).values()]
    .sort((a, b) => `${a.source}:${a.url}:${a.payloadSha256}`.localeCompare(`${b.source}:${b.url}:${b.payloadSha256}`));
  const verificationBaseline = bundle.incident.verificationBaseline;
  if (verificationBaseline.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("VERIFICATION_UNIVERSE_BASELINE_NOT_VERIFIED");
  const selectedVerificationSourceKeys = [...new Set(selectedSources.map((source) => `OSV-SET:${source.name}@${source.version}`))].sort();
  return handleVerifyPlan({ jobId: input.jobId, plan, scenarioKey: `plan-${input.jobId}`,
    portfolioSelector: `plan-${sha256(input.planKey).slice(0, 16)}`, scopes: plan.scopes,
    applications: snapshots.map((row) => ({ applicationKey: row.repository, snapshotKey: row.key })),
    sources: boundSources, maxImportedDepth: Math.max(...snapshots.map((row) => row.maxDepth)),
    expectedPairKeyDigest: canonicalDigest(pairKeysExpected), receipt: {
      schemaVersion: "1.0.0", createdAt: new Date().toISOString(), resultState: "UNKNOWN",
      portfolioKey: bundle.incident.portfolioKey, incidentKey: bundle.incident.key,
      selectedSourceKeys: selectedVerificationSourceKeys,
      inputs: snapshots.map((row) => row.identity),
      topologies: snapshots.map((row) => ({ snapshotKey: row.key, repository: row.repository,
        packageCount: row.packageCount, relationshipCount: row.edgeCount, rootCount: row.topology.applicationEdges.length,
        maxDepth: row.maxDepth, extractionSha256: row.extractionSha256,
        readbackVerified: true as const, collisionRegistryVerified: true as const })),
      sources: sourceStamps,
      advisories, exploitation, baseline: bundle.incident.baseline,
      verificationUniverse: { kind: plan.verificationSourceCoordinates.length > 1 ? "bounded-portfolio" : "selected-incident",
        sourceKeys: boundSources.map((source) => source.sourceKey).sort(), baseline: verificationBaseline },
      proposedFixes: orderedFixes.map((row) => fixFromRow(row!)),
      outcomes: orderedFixes.map((row) => row!.outcome), plan, hydraDbImageDigest: "sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709",
      graphSchemaVersion: "1.0.0", limitations: enrichmentLimitations(exploitation),
    } });
}

export async function reproduceFrozenCorpus() {
  const evidence = JSON.parse(await (await import("node:fs/promises")).readFile("docs/evidence/2026-08-19-pre-forge-runtime.json", "utf8"));
  const portfolioKey = "verified-public-corpus";
  const observedLockfileSha256: string[] = [];
  for (const [index, row] of evidence.corpus.repositories.entries()) {
    const imported = await handleImport({ jobId: `proof-base-${index}`, portfolioKey, role: "current",
      kind: "github", repository: row.repository, ref: row.baseline_commit,
      expectedLockfileSha256: row.baseline_lock_sha256 });
    observedLockfileSha256.push(imported.lockfileSha256);
  }
  await scanPortfolio(portfolioKey);
  const incident = (await listIncidents()).find((row) => row.title === `${evidence.selected_incident.advisory}:${evidence.selected_incident.package}@${evidence.selected_incident.affected_version}`);
  if (!incident) throw new Error("FROZEN_INCIDENT_NOT_FOUND");
  await handleRefreshEvidence({ jobId: "proof-baseline", incidentKey: incident.key,
    scopes: ["production", "development", "optional", "peer"], sourceFindingIds: incident.sourceFindingKeys,
    verificationSourceCoordinates: evidence.many_source_proof.sources });
  const baselineBundle = await loadIncidentBundle(incident.key);
  const portfolioBaseline = baselineBundle.incident.verificationBaseline;
  if (!portfolioBaseline) throw new Error("PROOF_VERIFICATION_BASELINE_MISSING");
  const outcomes: ProposedFixOutcome[] = [];
  for (const [index, row] of evidence.corpus.repositories.entries()) {
    const proposedCommit = row["candidate_commit"]; // Historical evidence schema; never user-facing terminology.
    outcomes.push(await handleEvaluateProposedFix({ jobId: `proof-fix-${index}`, portfolioKey,
      incidentKey: incident.key, role: "proposed", kind: "github", repository: row.repository,
      ref: proposedCommit, expectedLockfileSha256: row["candidate_lock_sha256"], origin: "github-commit" }));
  }
  const plan = await createPlanForIncident(incident.key, { proposedFixKeys: outcomes.map((item) => item.proposedFixKey), requiredFixKeys: [], forbiddenFixKeys: [], maxRepositoryChanges: outcomes.length });
  const { digest } = await handleVerifyPlanRequest({ jobId: "proof-final", planKey: plan.key,
    expectedPlanDigest: plan.key });
  const stored = await findReceipt(digest);
  if (!stored) throw new Error("PROOF_RECEIPT_MISSING");
  const snapshots = await listPortfolioSnapshots(portfolioKey);
  return { receipt: stored.receipt, observed: { applications: snapshots.length,
    packageInstances: snapshots.reduce((sum, row) => sum + row.packageCount, 0),
    packageEdges: snapshots.reduce((sum, row) => sum + row.topology.edges.length, 0),
    bfsPairDigest: canonicalDigest(pairKeys(stored.receipt.baseline.pairs)),
    selectedFinalPairs: stored.receipt.final.pairs.filter((pair) => stored.receipt.selectedSourceKeys.includes(pair.sourceKey)).length,
    portfolioBaselinePairs: portfolioBaseline.pairs.length,
    portfolioFinalPairs: stored.receipt.final.pairs.length,
    lockfileSha256: [...observedLockfileSha256, ...stored.receipt.inputs.map((item) => item.lockfileSha256)].sort(),
    applicationOsvIds: stored.receipt.advisories.map((row) => row.osvId).sort() } };
}

export function frozenInputDigest(snapshot: ExtractedSnapshot): string {
  return sha256(`${snapshot.identity.lockfileSha256}:${snapshot.extractionSha256}`);
}

export type { EvaluatePayload, ImportPayload, VerifyPayload, VerifyRequest };
```

### 8.3 Worker process

#### File: `src/worker.ts`
[UNVERIFIED] — pg-boss worker callback shape requires contract test

```typescript
// File: src/worker.ts
import type { Job } from "pg-boss";
import { canonicalDigest } from "./domain/canonical";
import { markJobState } from "./db/repository";
import { boss, enqueue, startQueue } from "./jobs/queue";
import {
  handleDiscoverProposedFixes,
  handleEvaluateProposedFix,
  handleImport,
  handleRefreshEvidence,
  handleVerifyPlanRequest,
  type EvaluatePayload,
  type ImportPayload,
  type VerifyRequest,
} from "./jobs/pipeline";
import { cleanupScenario } from "./integrations/hydradb";

type RefreshPayload = { incidentKey: string; scopes: Array<"production" | "development" | "optional" | "peer">;
  sourceFindingIds: string[]; verificationSourceCoordinates: string[] };
type EvaluateJob = EvaluatePayload | { mode: "discover"; incidentKey: string };
type CleanupPayload = { scenarioKey: string };
type ProductJob<T> = T & { productJobId: string };

async function executeJob(productJobId: string, action: () => Promise<void>): Promise<void> {
  await markJobState(productJobId, "RUNNING");
  try {
    await action();
    await markJobState(productJobId, "COMPLETE");
  } catch (error) {
    const match = error instanceof Error ? error.message.match(/^[A-Z][A-Z0-9_]{2,63}/) : null;
    await markJobState(productJobId, "FAILED", match?.[0] ?? "UNKNOWN_ERROR");
    throw error;
  }
}

async function run(): Promise<void> {
  await startQueue();
  await boss.work("import-snapshot", { teamSize: 1 }, async ([job]: Job<ProductJob<ImportPayload>>[]) => {
    const { productJobId, ...payload } = job.data;
    await executeJob(productJobId, async () => { await handleImport({ ...payload, jobId: productJobId }); });
  });
  await boss.work("refresh-evidence", { teamSize: 1 }, async ([job]: Job<ProductJob<RefreshPayload>>[]) => {
    const { productJobId, ...payload } = job.data;
    await executeJob(productJobId, async () => { await handleRefreshEvidence({ ...payload, jobId: productJobId }); });
  });
  await boss.work("evaluate-proposed-fix", { teamSize: 2 }, async ([job]: Job<ProductJob<EvaluateJob>>[]) => {
    const { productJobId, ...payload } = job.data;
    await executeJob(productJobId, async () => {
      if ("mode" in payload) {
        const inputs = await handleDiscoverProposedFixes(payload.incidentKey);
        for (const input of inputs) await enqueue("evaluate-proposed-fix", input,
          canonicalDigest({ incidentKey: input.incidentKey, repository: input.repository, ref: input.ref }));
        return;
      }
      await handleEvaluateProposedFix({ ...payload, jobId: productJobId });
    });
  });
  await boss.work("verify-plan", { teamSize: 1 }, async ([job]: Job<ProductJob<VerifyRequest>>[]) => {
    const { productJobId, ...payload } = job.data;
    await executeJob(productJobId, async () => { await handleVerifyPlanRequest({ ...payload, jobId: productJobId }); });
  });
  await boss.work("cleanup-scenario", { teamSize: 1 }, async ([job]: Job<ProductJob<CleanupPayload>>[]) => {
    const { productJobId, ...payload } = job.data;
    await executeJob(productJobId, async () => { await cleanupScenario(payload.scenarioKey); });
  });
  process.stdout.write(`${JSON.stringify({ level: "info", event: "worker-ready" })}\n`);
}

async function shutdown(signal: string): Promise<void> {
  process.stdout.write(`${JSON.stringify({ level: "info", event: "worker-stop", signal })}\n`);
  await boss.stop({ graceful: true, timeout: 30_000 });
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
run().catch((error) => {
  process.stderr.write(`${JSON.stringify({ level: "fatal", error: String(error) })}\n`);
  process.exit(1);
});
```

### 8.4 Failure and retry boundary

The queue retries only jobs whose handlers are idempotent by input digest. A verification job that has already inserted a receipt returns the existing digest rather than creating a new result. `cleanupScenario` runs after receipt commit; a cleanup failure is operational debt and never invalidates the already captured query result, but it blocks creation of another scenario with the same key.

## 9. Web command surface

### 9.1 Global layout and design tokens

#### File: `src/app/globals.css`
[ASSUMED] — Product-specific visual system; accessibility requires browser verification

```css
/* // File: src/app/globals.css */
@import "tailwindcss";

:root {
  color-scheme: dark;
  --canvas: #08100f;
  --panel: #101b19;
  --panel-raised: #172522;
  --line: #2b3b37;
  --text: #eff8f5;
  --muted: #9eb1ab;
  --accent: #4ce0b3;
  --warning: #f8c15c;
  --danger: #ff7d7d;
  --unknown: #b89cff;
}

* { box-sizing: border-box; }
html { background: var(--canvas); }
body { margin: 0; color: var(--text); background: var(--canvas); font-family: Inter, ui-sans-serif, system-ui; }
a { color: inherit; }
button, input, select { font: inherit; }
button, a, input, select { min-height: 44px; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.skip-link { position: fixed; left: 1rem; top: -5rem; z-index: 100; background: var(--text); color: var(--canvas); padding: .75rem; }
.skip-link:focus { top: 1rem; }
.shell { min-height: 100vh; display: grid; grid-template-columns: 15rem 1fr; }
.rail { border-right: 1px solid var(--line); padding: 1.25rem; position: sticky; top: 0; height: 100vh; }
.main { min-width: 0; padding: 1.5rem clamp(1rem, 3vw, 3rem); }
.stack { display: grid; gap: 1rem; }
.row { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 1rem; padding: 1rem; }
.raised { background: var(--panel-raised); }
.muted { color: var(--muted); }
.accent { color: var(--accent); }
.danger { color: var(--danger); }
.warning { color: var(--warning); }
.badge { display: inline-flex; align-items: center; gap: .35rem; border: 1px solid var(--line); border-radius: 999px; padding: .25rem .6rem; font-size: .82rem; }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: .8rem; }
table { border-collapse: collapse; width: 100%; }
caption { text-align: left; padding: 1rem; font-weight: 700; }
th, td { padding: .8rem; border-top: 1px solid var(--line); text-align: left; vertical-align: top; }
th { color: var(--muted); font-size: .78rem; text-transform: uppercase; letter-spacing: .05em; }
.button { border: 1px solid var(--line); color: var(--text); background: var(--panel-raised); border-radius: .7rem; padding: .55rem .8rem; cursor: pointer; }
.button.primary { background: var(--accent); color: #052019; border-color: var(--accent); font-weight: 750; }
.button:disabled { opacity: .5; cursor: not-allowed; }
.metric { font-size: clamp(1.7rem, 4vw, 3.2rem); line-height: 1; font-weight: 800; }
.grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
.tabs { display: flex; gap: .5rem; overflow-x: auto; border-bottom: 1px solid var(--line); }
.tabs a { padding: .75rem; text-decoration: none; white-space: nowrap; }
.mobile-nav, .mobile-cards { display: none; }
@media (max-width: 960px) { .shell { grid-template-columns: 1fr; } .rail { position: static; width: auto; height: auto; border-right: 0; border-bottom: 1px solid var(--line); } .grid-4 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 767px) { .rail nav, .desktop-table { display: none; } .main { padding: 1rem 1rem 5rem; } .mobile-nav { display: flex; position: fixed; z-index: 20; inset: auto 0 0; justify-content: space-around; padding: .7rem; background: var(--panel); border-top: 1px solid var(--line); } .mobile-cards { display: grid; gap: .75rem; } .grid-4 { grid-template-columns: 1fr; } th.optional, td.optional { display: none; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
```

#### File: `src/app/layout.tsx`
[VERIFIED] — Next.js App Router root-layout pattern

```tsx
// File: src/app/layout.tsx
import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { ClientProviders, ContextLink, RoleProjection, RoleSwitcher } from "../components/command-surface";
import "./globals.css";

export const metadata: Metadata = {
  title: "HydraCut Incident Command",
  description: "Proof-carrying portfolio dependency remediation verification.",
};

const destinations = [
  ["Incidents", "/incidents"],
  ["Portfolio", "/portfolio"],
  ["Imports", "/imports"],
  ["Proof", "/proof"],
  ["System", "/system"],
] as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<p className="panel">Loading incident context…</p>}>
        <ClientProviders>
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="shell">
          <aside className="rail" aria-label="Product navigation">
            <p className="accent">HydraDB native proof</p>
            <h2>HydraCut</h2>
            <p className="muted">powered by CampaignRadius</p>
            <nav className="stack">
              {destinations.map(([label, href]) => <ContextLink key={href} href={href}>{label}</ContextLink>)}
            </nav>
            <RoleSwitcher />
          </aside>
          <main className="main" id="main" tabIndex={-1}><RoleProjection />{children}</main>
        </div>
        <nav className="mobile-nav" aria-label="Mobile product navigation">{destinations.slice(0, 4).map(([label, href]) => <ContextLink key={href} href={href}>{label}</ContextLink>)}</nav>
        </ClientProviders>
        </Suspense>
      </body>
    </html>
  );
}
```

#### File: `src/app/page.tsx`
[VERIFIED] — Next.js server redirect

```tsx
// File: src/app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage(): never {
  redirect("/incidents?role=appsec");
}
```

### 9.2 Incident queue

#### File: `src/components/command-surface.tsx`
[ASSUMED] — Product-specific component; must pass keyboard, responsive, and screen-reader tests

```tsx
// File: src/components/command-surface.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export interface IncidentRow {
  key: string;
  title: string;
  packageVersion: string;
  kev: string;
  epss: string;
  cvss: string;
  productionApplications: number;
  allApplications: number;
  proposedFixes: number;
  state: string;
  freshness: string;
}

export function ContextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const search = useSearchParams();
  const suffix = search.toString();
  return <Link className={className} href={`${href}${suffix ? `?${suffix}` : ""}`}>{children}</Link>;
}

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const active = search.get("role") ?? "appsec";
  const change = (role: string) => {
    const next = new URLSearchParams(search);
    next.set("role", role);
    router.push(`${pathname}?${next.toString()}`);
  };
  return (
    <div className="row" aria-label="Role view">
      {["appsec", "developer", "leader"].map((role) => (
        <button className="button" aria-pressed={active === role} key={role} onClick={() => change(role)}>
          {role === "appsec" ? "AppSec" : role.charAt(0).toUpperCase() + role.slice(1)}
        </button>
      ))}
    </div>
  );
}

export function RoleProjection() {
  const search = useSearchParams();
  const role = search.get("role") ?? "appsec";
  const application = search.get("application");
  const copy = role === "developer"
    ? `Developer view${application ? ` · ${application}` : " · select an affected application"}`
    : role === "leader" ? "Leader view · portfolio status and blockers" : "AppSec view · incident command and proof controls";
  return <p className="badge" aria-live="polite">{copy}</p>;
}

export function CommandSurface({ incidents }: { incidents: IncidentRow[] }) {
  const role = useSearchParams().get("role") ?? "appsec";
  const verified = incidents.filter((incident) => incident.state === "VERIFIED_WITHIN_BOUNDS").length;
  return (
    <div className="stack">
      <div className="row"><RoleSwitcher /><span className="badge">OSV, KEV, EPSS freshness visible</span></div>
      <header><p className="accent">{role === "leader" ? "Portfolio posture" : role === "developer" ? "Repository action" : "Incident command"}</p><h1>{role === "leader" ? `${incidents.length} incidents · ${verified} verified analyses` : role === "developer" ? "What must this repository change?" : "What requires action now?"}</h1></header>
      <p className="muted">Ordered by KEV, production exposure, EPSS, CVSS, portfolio impact, and verified fix availability.</p>
      <div className="table-wrap desktop-table">
        <table>
          <caption>{incidents.length} authentic advisory-backed incidents</caption>
          <thead><tr><th>Incident</th><th>Evidence</th><th>Production</th><th>All scopes</th><th className="optional">Proposed fixes</th><th>State</th></tr></thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.key}>
                <td><ContextLink href={`/incidents/${incident.key}`}><strong>{incident.title}</strong></ContextLink><br /><span className="muted">{incident.packageVersion}</span></td>
                <td>KEV {incident.kev}<br />EPSS {incident.epss}<br />CVSS {incident.cvss}</td>
                <td>{incident.productionApplications}</td><td>{incident.allApplications}</td>
                <td className="optional">{incident.proposedFixes}</td>
                <td><span className="badge">{incident.state}</span><br /><small>{incident.freshness}</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-cards">{incidents.map((incident) => <article className="panel" key={incident.key}><ContextLink href={`/incidents/${incident.key}`}><strong>{incident.title}</strong></ContextLink><p>{incident.packageVersion}</p><p>KEV {incident.kev} · EPSS {incident.epss} · CVSS {incident.cvss}</p><p>{incident.productionApplications} production / {incident.allApplications} all applications</p><span className="badge">{incident.state}</span><small>{incident.freshness}</small></article>)}</div>
    </div>
  );
}
```

#### File: `src/app/incidents/page.tsx`
[UNVERIFIED] — Server data projection must be backed by normalized evidence queries

```tsx
// File: src/app/incidents/page.tsx
import { CommandSurface } from "../../components/command-surface";
import { listIncidentQueue } from "../../db/repository";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  return <CommandSurface incidents={await listIncidentQueue()} />;
}
```

### 9.3 Impact and proposed-fix workspace

#### File: `src/components/impact-matrix.tsx`
[ASSUMED] — Accessible table-first product presentation

```tsx
// File: src/components/impact-matrix.tsx
"use client";

import { useState } from "react";
import type { ExposurePair, Scope, TraversalReceipt } from "../domain/types";

export function BaselineControls({ incidentKey, sourceFindingIds, selectedCoordinate, availableCoordinates,
}: { incidentKey: string; sourceFindingIds: string[]; selectedCoordinate: string; availableCoordinates: string[] }) {
  const allScopes: Scope[] = ["production", "development", "optional", "peer"];
  const [scopes, setScopes] = useState<Scope[]>(["production"]);
  const [verificationSourceCoordinates, setVerificationSources] = useState<string[]>([selectedCoordinate]);
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const run = async () => {
    setError(undefined);
    const response = await fetch(`/api/incidents/${incidentKey}/traversals`, { method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ scopes, sourceFindingIds, verificationSourceCoordinates }) });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Baseline analysis failed closed.");
    setJobId(body.jobId);
  };
  return <section className="panel stack"><h2>Baseline and verification universe</h2><div className="row">{allScopes.map((scope) => <label key={scope}><input type="checkbox" checked={scopes.includes(scope)} disabled={scope === "production"} onChange={(event) => setScopes(event.target.checked ? [...scopes, scope] : scopes.filter((item) => item !== scope))} />{scope}</label>)}</div><fieldset><legend>Advisory-backed exact versions for before/after proof</legend>{availableCoordinates.map((coordinate) => <label key={coordinate}><input type="checkbox" checked={verificationSourceCoordinates.includes(coordinate)} disabled={coordinate === selectedCoordinate} onChange={(event) => setVerificationSources(event.target.checked ? [...verificationSourceCoordinates, coordinate] : verificationSourceCoordinates.filter((item) => item !== coordinate))} />{coordinate}</label>)}</fieldset><button className="button primary" onClick={() => void run()}>Run native baselines</button>{jobId && <a href={`/jobs/${jobId}`}>Open baseline job</a>}{error && <p role="alert" className="danger">{error}</p>}</section>;
}

function Witness({ pair }: { pair: ExposurePair }) {
  return (
    <ol aria-label="One shortest dependency witness">
      {pair.witnessNodeKeys.map((node, index) => (
        <li key={`${node}:${index}`}>{node}{index < pair.witnessRelationshipTypes.length ? ` via ${pair.witnessRelationshipTypes[index]}` : ""}</li>
      ))}
    </ol>
  );
}

export function ImpactMatrix({ traversal }: { traversal: TraversalReceipt }) {
  return (
    <section className="stack" aria-labelledby="impact-title">
      <div className="row"><h2 id="impact-title">Portfolio impact</h2><span className="badge">{traversal.state}</span></div>
      {traversal.refusalReasons.length > 0 && <div className="panel danger" role="alert">Verification refused: {traversal.refusalReasons.join(", ")}</div>}
      <div className="grid-4">
        <div className="panel"><span className="metric">{traversal.pairs.length}</span><p>source-to-application pairs</p></div>
        <div className="panel"><span className="metric">{traversal.bounds.matchedSourceCount}</span><p>matched sources</p></div>
        <div className="panel"><span className="metric">{traversal.bounds.matchedTargetCount}</span><p>matched applications</p></div>
        <div className="panel"><span className="metric">{traversal.elapsedMs.toFixed(0)}ms</span><p>native traversal</p></div>
      </div>
      <div className="table-wrap"><table><caption>Reachable pairs within displayed bounds</caption><thead><tr><th>Source</th><th>Application</th><th>Depth</th><th>One witness</th></tr></thead><tbody>
        {traversal.pairs.map((pair) => <tr key={`${pair.sourceKey}:${pair.applicationKey}`}><td>{pair.sourceKey}</td><td>{pair.applicationKey}</td><td>{pair.depth}</td><td><Witness pair={pair} /></td></tr>)}
      </tbody></table></div>
      <details className="panel"><summary>Raw HydraDB proof</summary><pre>{traversal.query}</pre><p>Epoch {traversal.readEpoch} · bookmark {traversal.bookmark}</p><p>Result limit {traversal.bounds.resultLimit} · digest {traversal.pairDigest}</p></details>
    </section>
  );
}
```

#### File: `src/components/proposed-fix-panel.tsx`
[ASSUMED] — Product-specific proposed-fix and coverage presentation

```tsx
// File: src/components/proposed-fix-panel.tsx
"use client";

import { useState } from "react";
import type { ProposedFix, ProposedFixOutcome } from "../domain/types";

export function DiscoveryButton({ incidentKey }: { incidentKey: string }) {
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const discover = async () => {
    const response = await fetch(`/api/incidents/${incidentKey}/proposed-fixes/discover`, {
      method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: "{}",
    });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Discovery failed closed.");
    setJobId(body.jobId);
  };
  return <div className="row"><button className="button" onClick={() => void discover()}>Discover public proposed fixes</button>
    {jobId && <a href={`/jobs/${jobId}`}>Open discovery job</a>}{error && <span role="alert">{error}</span>}</div>;
}

export function AddProposedFixForm({ incidentKey }: { incidentKey: string }) {
  const [repository, setRepository] = useState("");
  const [ref, setRef] = useState("");
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const submit = async () => {
    setError(undefined);
    const response = await fetch(`/api/incidents/${incidentKey}/proposed-fixes`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ kind: "github", repository, ref }),
    });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Proposed-fix evaluation failed closed.");
    setJobId(body.jobId);
  };
  return <form className="panel stack" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
    <h2>Add an exact public ref</h2>
    <label>Owner/repository<input required value={repository} onChange={(event) => setRepository(event.target.value)} /></label>
    <label>Commit, branch, or tag<input required value={ref} onChange={(event) => setRef(event.target.value)} /></label>
    <button className="button" type="submit">Evaluate complete resolved graph</button>
    {jobId && <a href={`/jobs/${jobId}`}>Open evaluation job</a>}
    {error && <span role="alert" className="danger">{error}</span>}
  </form>;
}

export function ProposedFixPanel({ entries }: { entries: Array<{ fix: ProposedFix; outcome: ProposedFixOutcome }> }) {
  return (
    <section className="stack" aria-labelledby="fix-title">
      <header><p className="accent">Real resolved states only</p><h2 id="fix-title">Proposed fixes</h2><p className="muted">HydraCut verifies dependency outcomes. It does not certify builds or API compatibility.</p></header>
      {entries.length === 0 && <div className="panel">No public proposed fix was found. Add an exact commit or hashed lockfile pair.</div>}
      {entries.map(({ fix, outcome }) => (
        <article className="panel raised stack" key={fix.key}>
          <div className="row"><h3>{fix.repository}</h3><span className="badge">{fix.state}</span></div>
          <p>{fix.origin} · {fix.headSha ?? fix.lockfileSha256}</p>
          <div className="row"><span className="badge">{outcome.removed.length} removed</span><span className="badge">{outcome.persistent.length} persistent</span><span className="badge">{outcome.introduced.length} introduced</span><span className="badge">{outcome.unknown.length} unknown</span></div>
          <p>{outcome.changedPackageCount} package instances changed in the complete resolved lockfile.</p>
          <p>Other advisory-backed findings: {outcome.otherFindings.removed.length} removed, {outcome.otherFindings.persistent.length} persistent, {outcome.otherFindings.introduced.length} introduced.</p>
          {fix.discoveryEvidence && <details><summary>Discovery evidence</summary><p>PR #{fix.discoveryEvidence.pullNumber} by {fix.discoveryEvidence.actorLogin} ({fix.discoveryEvidence.actorType}) on {fix.discoveryEvidence.headRef}</p><code>{fix.discoveryEvidence.fileListSha256}</code><ul>{fix.discoveryEvidence.changedFiles.map((file) => <li key={file}>{file}</li>)}</ul><pre>{JSON.stringify(fix.discoveryEvidence.sourceStamps, null, 2)}</pre></details>}
          {fix.sourceUrl && <a href={fix.sourceUrl} rel="noreferrer">Open immutable source evidence</a>}
        </article>
      ))}
    </section>
  );
}
```

#### File: `src/app/incidents/[incidentId]/page.tsx`
[UNVERIFIED] — Server composition requires product-store projection tests

```tsx
// File: src/app/incidents/[incidentId]/page.tsx
import { notFound } from "next/navigation";
import { ContextLink } from "../../../components/command-surface";
import { BaselineControls, ImpactMatrix } from "../../../components/impact-matrix";
import { ProposedFixPanel } from "../../../components/proposed-fix-panel";
import { listIncidents, listProposedFixes, loadIncidentBundle } from "../../../db/repository";

export const dynamic = "force-dynamic";

export default async function IncidentPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const bundle = await loadIncidentBundle(incidentId).catch(() => null);
  if (!bundle) notFound();
  const incident = bundle.incident;
  const fixes = await listProposedFixes(incidentId);
  const selectedEvidence = bundle.advisories[0]?.evidence;
  if (!selectedEvidence) notFound();
  const selectedCoordinate = `${selectedEvidence.packageName}@${selectedEvidence.exactVersion}`;
  const availableCoordinates = [...new Set((await listIncidents()).filter((row) => row.portfolioKey === incident.portfolioKey)
    .map((row) => row.title.slice(row.title.indexOf(":") + 1)))].sort();
  return (
    <div className="stack">
      <header><p className="accent">Incident command</p><h1>{incident.title}</h1><p>Dependency-level potential exposure, not exploitability.</p></header>
      <nav className="tabs" aria-label="Incident sections"><ContextLink href={`/incidents/${incidentId}/impact`}>Impact</ContextLink><ContextLink href={`/incidents/${incidentId}/proposed-fixes`}>Proposed fixes</ContextLink><ContextLink href={`/incidents/${incidentId}/plan`}>Plan</ContextLink></nav>
      <BaselineControls incidentKey={incidentId} sourceFindingIds={incident.sourceFindingKeys}
        selectedCoordinate={selectedCoordinate} availableCoordinates={availableCoordinates} />
      <section className="panel stack"><h2>Vulnerability evidence</h2>{bundle.advisories.map((row) => <article key={row.key}><h3>{row.evidence.osvId} · {row.evidence.packageName}@{row.evidence.exactVersion}</h3><p>Aliases {row.evidence.aliases.join(", ") || "none"} · CVSS {row.evidence.cvssVector ?? "UNKNOWN"} · KEV {row.exploitation.kev} · EPSS {row.exploitation.epssProbability ?? "UNKNOWN"}</p><p>Published {row.evidence.publishedAt} · modified {row.evidence.modifiedAt} · withdrawn {row.evidence.withdrawnAt ?? "no"}</p><details><summary>Ranges, fixes, references, and source provenance</summary><pre>{JSON.stringify({ ranges: row.evidence.rangeEvents, fixedVersions: row.evidence.fixedVersions, references: row.evidence.references, sources: [row.evidence.source, ...row.exploitation.sources] }, null, 2)}</pre></details></article>)}</section>
      <div id="impact">{incident.baseline ? <ImpactMatrix traversal={incident.baseline} /> : <div className="panel">Baseline traversal is not verified.</div>}</div>
      <div id="fixes"><ProposedFixPanel entries={fixes.map((row) => ({ fix: {
        key: row.key, repository: row.repository, origin: row.origin,
        ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}), ...(row.headSha ? { headSha: row.headSha } : {}),
        ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}),
        manifestSha256: row.manifestSha256, lockfileSha256: row.lockfileSha256,
        snapshotKey: row.snapshotKey, changedPackageCount: row.outcome.changedPackageCount,
        state: row.state,
      }, outcome: row.outcome }))} /></div>
      <section className="panel" id="plan"><h2>Portfolio fix plan</h2><p>Review transparent coverage before requesting the final combined HydraDB proof.</p><ContextLink className="button primary" href={`/incidents/${incidentId}/plan`}>Review plan</ContextLink></section>
      <section className="panel" id="proof"><h2>Proof</h2><p>A receipt appears only after the final native traversal and all refusal checks.</p></section>
    </div>
  );
}
```

### 9.4 Receipt page

#### File: `src/components/receipt-view.tsx`
[ASSUMED] — Product-specific progressive disclosure; content is receipt-backed

```tsx
// File: src/components/receipt-view.tsx
import { allowedConclusion } from "../domain/receipt";
import type { CanonicalReceipt } from "../domain/types";

export function ReceiptView({ digest, receipt }: { digest: string; receipt: CanonicalReceipt }) {
  const selectedResidual = receipt.final.pairs.filter((pair) => receipt.selectedSourceKeys.includes(pair.sourceKey)).length;
  return (
    <article className="stack">
      <header><p className="accent">Immutable proof receipt</p><h1>{receipt.incidentKey}</h1><p className="badge">{receipt.resultState}</p><p>{allowedConclusion(receipt)}</p><code>{digest}</code></header>
      <section className="panel"><h2>Inputs</h2>{receipt.inputs.map((input) => <p key={input.lockfileSha256}>{input.repository} · {input.commitSha}<br /><small>{input.lockfileSha256} · {input.lockfileBytes} bytes · API {input.apiVersion}</small></p>)}</section>
      <section className="panel"><h2>Remaining exposure</h2><p>{selectedResidual} selected-incident pairs and {receipt.final.pairs.length} bounded verification-universe pairs remain in the final graph.</p></section>
      <details className="panel"><summary>Topology readback evidence</summary>{receipt.topologies.map((item) => <p key={item.snapshotKey}>{item.repository}: {item.packageCount} packages, {item.relationshipCount} relationships, {item.rootCount} roots, depth {item.maxDepth}<br /><code>{item.extractionSha256}</code></p>)}</details>
      <details className="panel"><summary>Vulnerability and source evidence</summary>{receipt.advisories.map((item) => <article key={`${item.osvId}:${item.packageName}@${item.exactVersion}`}><h3>{item.osvId} · {item.packageName}@{item.exactVersion}</h3><p>Aliases {item.aliases.join(", ") || "none"} · CVSS {item.cvssVector ?? "UNKNOWN"} · withdrawn {item.withdrawnAt ?? "no"}</p><p>Fixed versions {item.fixedVersions.join(", ") || "none recorded"}</p></article>)}<pre>{JSON.stringify({ exploitation: receipt.exploitation, sources: receipt.sources }, null, 2)}</pre></details>
      <details className="panel"><summary>Proposed-fix outcomes</summary>{receipt.proposedFixes.map((fix, index) => <article key={fix.key}><h3>{fix.repository}</h3><p>{fix.origin} · {fix.headSha ?? fix.lockfileSha256}</p><pre>{JSON.stringify(receipt.outcomes[index] ?? { unknown: ["OUTCOME_MISSING"] }, null, 2)}</pre></article>)}</details>
      <details className="panel"><summary>Selected-incident baseline traversal</summary><pre>{receipt.baseline.query}</pre><p>{receipt.baseline.pairDigest}</p></details>
      <details className="panel"><summary>Matched verification-universe baseline</summary><pre>{receipt.verificationUniverse.baseline.query}</pre><p>{receipt.verificationUniverse.baseline.pairDigest}</p></details>
      <details className="panel"><summary>Final combined traversal</summary><pre>{receipt.final.query}</pre><p>{receipt.final.pairDigest}</p></details>
      <section className="panel warning"><h2>Limitations</h2><ul>{receipt.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <div className="row"><a className="button primary" href={`/api/receipts/${digest}`} download>Download receipt.json</a><a className="button" href={`/api/receipts/${digest}/sarif`} download>Download results.sarif</a></div>
    </article>
  );
}
```

#### File: `src/app/proof/[digest]/page.tsx`
[VERIFIED] — Server page verifies canonical digest before rendering

```tsx
// File: src/app/proof/[digest]/page.tsx
import { notFound } from "next/navigation";
import { canonicalDigest } from "../../../domain/canonical";
import { ReceiptView } from "../../../components/receipt-view";
import { findReceipt } from "../../../db/repository";

export const dynamic = "force-dynamic";

export default async function ProofPage({ params }: { params: Promise<{ digest: string }> }) {
  const { digest } = await params;
  const row = await findReceipt(digest);
  if (!row) notFound();
  const recomputed = canonicalDigest(row.receipt);
  if (recomputed !== digest) throw new Error("RECEIPT_DIGEST_MISMATCH");
  return <ReceiptView digest={digest} receipt={row.receipt} />;
}
```

### 9.5 Route-complete analytical surfaces

#### File: `src/app/incidents/[incidentId]/impact/page.tsx`
[UNVERIFIED] — Receipt-backed route composition requires browser verification

```tsx
// File: src/app/incidents/[incidentId]/impact/page.tsx
import { notFound } from "next/navigation";
import { ImpactMatrix } from "../../../../components/impact-matrix";
import { loadIncidentImpact } from "../../../../db/repository";

export default async function ImpactPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const impact = await loadIncidentImpact(incidentId);
  if (!impact) notFound();
  return <main className="stack"><header><p className="accent">CampaignRadius</p><h1>Portfolio impact</h1><p>Dependency-level potential exposure within displayed bounds.</p></header><ImpactMatrix traversal={impact.baseline} /></main>;
}
```

#### File: `src/app/incidents/[incidentId]/proposed-fixes/page.tsx`
[UNVERIFIED] — Real proposed-fix outcomes require integration verification

```tsx
// File: src/app/incidents/[incidentId]/proposed-fixes/page.tsx
import { AddProposedFixForm, DiscoveryButton, ProposedFixPanel } from "../../../../components/proposed-fix-panel";
import { listProposedFixes } from "../../../../db/repository";

export default async function ProposedFixesPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const rows = await listProposedFixes(incidentId);
  const entries = rows.map((row) => ({ fix: { key: row.key, repository: row.repository,
    origin: row.origin as "github-pr" | "github-commit" | "github-branch" | "upload",
    ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}), ...(row.headSha ? { headSha: row.headSha } : {}),
    ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}),
    manifestSha256: row.manifestSha256, lockfileSha256: row.lockfileSha256,
    snapshotKey: row.snapshotKey, changedPackageCount: row.outcome.changedPackageCount, state: row.state }, outcome: row.outcome }));
  return <main className="stack"><header><p className="accent">Complete resolved states</p><h1>Proposed fixes</h1><p>Each outcome comes from a full graph reconstruction and native traversal.</p></header><div className="grid-4"><DiscoveryButton incidentKey={incidentId} /><AddProposedFixForm incidentKey={incidentId} /></div><ProposedFixPanel entries={entries} /></main>;
}
```

#### File: `src/app/incidents/[incidentId]/plan/page.tsx`
[UNVERIFIED] — Client workflow requires API and browser contract proof

```tsx
// File: src/app/incidents/[incidentId]/plan/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface FixRow { key: string; repository: string; state: string; outcome: { removed: string[]; persistent: string[]; introduced: string[]; changedPackageCount: number } }

export default function PlanPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = use(params);
  const search = useSearchParams();
  const [fixes, setFixes] = useState<FixRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [required, setRequired] = useState<string[]>([]);
  const [forbidden, setForbidden] = useState<string[]>([]);
  const [maxRepositories, setMaxRepositories] = useState(3);
  const [planKey, setPlanKey] = useState<string>();
  const [error, setError] = useState<string>();
  useEffect(() => { void fetch(`/api/incidents/${incidentId}/proposed-fixes`).then((r) => r.json()).then((body) => setFixes(body.items)); }, [incidentId]);
  const createPlan = async () => {
    setError(undefined);
    const response = await fetch(`/api/incidents/${incidentId}/plans`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ proposedFixKeys: selected, requiredFixKeys: required, forbiddenFixKeys: forbidden, maxRepositoryChanges: maxRepositories }) });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Plan creation failed closed.");
    setPlanKey(body.key);
  };
  const suffix = search.toString();
  return <main className="stack"><header><p className="accent">Coverage-based planning</p><h1>Portfolio fix plan</h1><p>Objective order: selected production residual, all-scope residual, repositories changed, package churn, stable key. Selection predicts coverage; only the combined HydraDB traversal proves the outcome.</p></header>
    <div className="table-wrap"><table><caption>Verified proposed-fix coverage matrix</caption><thead><tr><th>Repository</th><th>Removed pairs</th><th>Persistent</th><th>Introduced</th><th>Selection constraint</th></tr></thead><tbody>{fixes.map((fix) => <tr key={fix.key}><td><label><input type="checkbox" disabled={fix.state !== "VERIFIED_WITHIN_BOUNDS" || forbidden.includes(fix.key)} checked={selected.includes(fix.key)} onChange={(event) => setSelected(event.target.checked ? [...selected, fix.key] : selected.filter((key) => key !== fix.key))} />{fix.repository}</label></td><td>{fix.outcome.removed.join(", ") || "none"}</td><td>{fix.outcome.persistent.join(", ") || "none"}</td><td>{fix.outcome.introduced.join(", ") || "none"}</td><td><select aria-label={`Constraint for ${fix.repository}`} value={required.includes(fix.key) ? "required" : forbidden.includes(fix.key) ? "forbidden" : "optional"} onChange={(event) => { const value = event.target.value; setRequired(value === "required" ? [...new Set([...required, fix.key])] : required.filter((key) => key !== fix.key)); setForbidden(value === "forbidden" ? [...new Set([...forbidden, fix.key])] : forbidden.filter((key) => key !== fix.key)); if (value === "required") setSelected([...new Set([...selected, fix.key])]); if (value === "forbidden") setSelected(selected.filter((key) => key !== fix.key)); }}><option value="optional">Optional</option><option value="required">Required</option><option value="forbidden">Forbidden</option></select></td></tr>)}</tbody></table></div>
    <label>Maximum repositories changed<input type="number" min={1} max={Math.max(1, fixes.length)} value={maxRepositories} onChange={(event) => setMaxRepositories(Number(event.target.value))} /></label>
    <button className="button primary" disabled={!selected.length} onClick={() => void createPlan()}>Create bounded plan</button>{error && <p role="alert" className="danger">{error}</p>}
    {planKey && <section className="panel"><h2>Why this plan</h2><p>The deterministic solver compared only the displayed verified proposed fixes under these constraints. It does not claim a global optimum; the final combined graph remains unverified until the next action.</p><a className="button primary" href={`/plans/${planKey}/verify${suffix ? `?${suffix}` : ""}`}>Verify combined plan</a></section>}</main>;
}
```

#### File: `src/app/plans/[planId]/verify/page.tsx`
[UNVERIFIED] — Durable job polling and final receipt transition require E2E proof

```tsx
// File: src/app/plans/[planId]/verify/page.tsx
"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface JobBody { state?: string; events?: Array<{ phase: string; state: string; detail: { digest?: string } }> }
interface ReceiptSummary { verificationUniverse: { baseline: { pairs: unknown[] } };
  final: { pairs: unknown[]; refusalReasons: string[]; state: string }; selectedSourceKeys: string[] }

export default function VerifyPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const { data: job } = useQuery<JobBody>({ queryKey: ["job", jobId], enabled: Boolean(jobId),
    queryFn: async () => { const response = await fetch(`/api/jobs/${jobId}`); if (!response.ok) throw new Error("JOB_POLL_FAILED"); return response.json(); },
    refetchInterval: (query) => ["COMPLETE", "FAILED"].includes(query.state.data?.state ?? "") ? false : 1_000 });
  const verify = async () => {
    const response = await fetch(`/api/plans/${planId}/verify`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ expectedPlanDigest: planId }) });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Verification failed closed.");
    setJobId(body.jobId);
  };
  const digest = job?.events?.findLast((event) => event.phase === "RECEIPT")?.detail.digest;
  const receipt = useQuery<ReceiptSummary>({ queryKey: ["receipt", digest], enabled: Boolean(digest),
    queryFn: async () => { const response = await fetch(`/api/receipts/${digest}`); if (!response.ok) throw new Error("RECEIPT_UNAVAILABLE"); return response.json(); } });
  return <main className="stack"><header><p className="accent">Second native traversal</p><h1>Verify combined plan</h1><p>No individual outcome is unioned into proof.</p></header>
    <button className="button primary" disabled={Boolean(jobId)} onClick={() => void verify()}>Run final HydraDB proof</button>
    {error && <p role="alert" className="danger">{error}</p>}<ol>{job?.events?.map((event) => <li key={event.phase}>{event.phase}: {event.state}</li>)}</ol>
    {job?.state === "FAILED" && <p role="alert" className="danger">Final verification failed closed. Inspect the job evidence.</p>}
    {receipt.data && <section className="panel"><h2>Combined before and after</h2><p>{receipt.data.verificationUniverse.baseline.pairs.length} baseline pairs → {receipt.data.final.pairs.length} bounded-universe final pairs.</p><p>Final state {receipt.data.final.state}</p>{receipt.data.final.refusalReasons.length > 0 && <div role="alert" className="danger">Refused: {receipt.data.final.refusalReasons.join(", ")}</div>}</section>}
    {digest && <a className="button primary" href={`/proof/${digest}`}>Open immutable receipt</a>}</main>;
}
```

#### File: `src/app/proof/page.tsx`
[UNVERIFIED] — Receipt index projection requires database integration proof

```tsx
// File: src/app/proof/page.tsx
import { ContextLink } from "../../components/command-surface";
import { listReceipts } from "../../db/repository";

export default async function ProofIndexPage() {
  const rows = await listReceipts();
  return <main className="stack"><header><p className="accent">Immutable evidence</p><h1>Proof receipts</h1></header>{rows.length
    ? rows.map((row) => <article className="panel" key={row.digest}><span className="badge">{row.resultState}</span><h2>{row.receipt.incidentKey}</h2><code>{row.digest}</code><br /><ContextLink href={`/proof/${row.digest}`}>Open receipt</ContextLink></article>)
    : <p className="panel">No receipt has completed all proof gates.</p>}</main>;
}
```

#### File: `src/app/portfolio/page.tsx`
[UNVERIFIED] — Current-snapshot projection requires database integration proof

```tsx
// File: src/app/portfolio/page.tsx
import { listPortfolioSnapshots } from "../../db/repository";

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ portfolio?: string }> }) {
  const portfolioKey = (await searchParams).portfolio ?? "default";
  const rows = await listPortfolioSnapshots(portfolioKey);
  return <main className="stack"><header><p className="accent">Authentic inputs</p><h1>Portfolio</h1><p>{portfolioKey}</p></header>{rows.map((row) => <article className="panel" key={row.key}><h2>{row.repository}</h2><p>{row.commitSha}</p><code>{row.lockfileSha256}</code><p>{row.packageCount} package instances · {row.edgeCount} typed edges · depth {row.maxDepth}</p></article>)}</main>;
}
```

#### File: `src/app/graph/page.tsx`
[UNVERIFIED] — Bounded witness projection requires browser verification

```tsx
// File: src/app/graph/page.tsx
import { loadIncidentImpact } from "../../db/repository";

export default async function GraphPage({ searchParams }: { searchParams: Promise<{ incident?: string; pair?: string }> }) {
  const query = await searchParams;
  const impact = query.incident ? await loadIncidentImpact(query.incident) : null;
  const pair = impact?.baseline.pairs.find((item) => `${item.sourceKey}:${item.applicationKey}` === query.pair);
  return <main className="stack"><header><p className="accent">Bounded witness</p><h1>Graph explorer</h1><p>The pair table remains canonical.</p></header>{pair
    ? <article className="panel"><h2>{pair.sourceKey} → {pair.applicationKey}</h2><ol>{pair.witnessNodeKeys.map((key) => <li key={key}><code>{key}</code></li>)}</ol><p>{pair.witnessRelationshipTypes.join(" → ")}</p></article>
    : <p className="panel">Select a verified source-to-application pair from an incident impact matrix. No topology is inferred without that context.</p>}</main>;
}
```

#### File: `src/app/imports/page.tsx`
[UNVERIFIED] — Public exact-commit import requires API and browser proof

```tsx
// File: src/app/imports/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ImportsPage() {
  const portfolioKey = useSearchParams().get("portfolio") ?? "default";
  const [kind, setKind] = useState<"github" | "upload">("github");
  const [repository, setRepository] = useState("");
  const [ref, setRef] = useState("");
  const [manifestBase64, setManifestBase64] = useState("");
  const [lockfileBase64, setLockfileBase64] = useState("");
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const encode = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
  const submit = async () => {
    setError(undefined);
    const body = kind === "github" ? { kind, repository, ref } : { kind, repository, manifestBase64, lockfileBase64 };
    const response = await fetch(`/api/imports?portfolio=${encodeURIComponent(portfolioKey)}`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) return setError(result.message ?? "Import failed closed.");
    setJobId(result.jobId);
  };
  return <main className="stack"><header><p className="accent">No repository execution</p><h1>Imports</h1><p>Portfolio {portfolioKey}</p></header>
    <fieldset className="row"><legend>Input source</legend><label><input type="radio" checked={kind === "github"} onChange={() => setKind("github")} />Public GitHub ref</label><label><input type="radio" checked={kind === "upload"} onChange={() => setKind("upload")} />Local manifest + lockfile</label></fieldset>
    <label>Owner/repository<input required value={repository} onChange={(event) => setRepository(event.target.value)} /></label>
    {kind === "github" ? <label>Commit, branch, or tag<input required value={ref} onChange={(event) => setRef(event.target.value)} /></label> : <><label>package.json<input required type="file" accept="application/json,.json" onChange={(event) => event.target.files?.[0] && void encode(event.target.files[0]).then(setManifestBase64)} /></label><label>package-lock.json<input required type="file" accept="application/json,.json" onChange={(event) => event.target.files?.[0] && void encode(event.target.files[0]).then(setLockfileBase64)} /></label></>}
    <button className="button primary" disabled={kind === "upload" && (!manifestBase64 || !lockfileBase64)} onClick={() => void submit()}>Resolve immutable input and import</button>{error && <p role="alert">{error}</p>}{jobId && <a href={`/jobs/${jobId}`}>Open import job</a>}</main>;
}
```

#### File: `src/app/jobs/[jobId]/page.tsx`
[UNVERIFIED] — Job timeline requires pg-boss/repository integration proof

```tsx
// File: src/app/jobs/[jobId]/page.tsx
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

interface JobView { state: string; errorCode?: string; events: Array<{ sequence: number; phase: string; state: string; detail: Record<string, unknown> }> }

export default function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const query = useQuery<JobView>({ queryKey: ["job", jobId], queryFn: async () => {
    const response = await fetch(`/api/jobs/${jobId}`);
    if (!response.ok) throw new Error("JOB_UNAVAILABLE");
    return response.json();
  }, refetchInterval: ({ state }) => ["COMPLETE", "FAILED", "CANCELLED"].includes(state.data?.state ?? "") ? false : 1_000 });
  return <main className="stack"><header><p className="accent">Durable work</p><h1>Job {jobId}</h1><span className="badge" aria-live="polite">{query.data?.state ?? "LOADING"}</span></header>{query.error && <p role="alert" className="danger">Job status is unavailable.</p>}{query.data?.errorCode && <p role="alert" className="danger">{query.data.errorCode}</p>}<ol className="panel">{query.data?.events.map((event) => <li key={event.sequence}><strong>{event.phase}</strong> · {event.state}<pre>{JSON.stringify(event.detail, null, 2)}</pre></li>)}</ol></main>;
}
```

#### File: `src/app/system/page.tsx`
[UNVERIFIED] — Health and non-secret runtime identity require deployment proof

```tsx
// File: src/app/system/page.tsx
import { databaseHealth } from "../../db/client";
import { loadSystemFacts } from "../../db/repository";
import { hydraHealth } from "../../integrations/hydradb";

export default async function SystemPage() {
  const [database, hydradb, facts] = await Promise.all([databaseHealth(), hydraHealth(), loadSystemFacts()]);
  return <main className="stack"><header><p className="accent">Runtime evidence</p><h1>System</h1></header><section className="grid-4"><article className="panel"><h2>PostgreSQL</h2><p>{database ? "Ready" : "Unavailable"}</p></article><article className="panel"><h2>HydraDB OSS</h2><p>{hydradb ? "Ready" : "Unavailable"}</p></article><article className="panel"><h2>Graph image</h2><code>{facts.graphImageDigest}</code></article><article className="panel"><h2>Boundary</h2><p>Single operator; graph ports private</p></article></section><pre className="panel">{JSON.stringify(facts, null, 2)}</pre></main>;
}
```

These route files cover PRD S01–S11. S09 renders only a selected receipt-backed witness; without `incident` and `pair` it provides an honest instruction state rather than a synthetic graph. Role and analytical query parameters are preserved through `ContextLink`; browser Back/Forward restores them without rerunning analysis.

## 10. BFF API and contracts

### 10.1 Route matrix

Every response includes `x-request-id`; every mutation accepts an `Idempotency-Key`. Zod rejects unknown keys. Jobs return `202` with a durable job identifier; proof downloads are the only cacheable dynamic responses and use an immutable digest URL.

| Method and route | Input | Success | Failure / fail-closed behavior | Owner |
|---|---|---|---|---|
| `GET /api/health` | none | `200 {web,database,hydradb}` | `503`; never reports healthy if HydraDB probe fails | web |
| `POST /api/imports` | GitHub repository/ref or two base64 JSON files | `202 {jobId}` | 400/401/413/422/429/503 | worker job |
| `GET /api/jobs/:id` | UUID | phase log and terminal state | 404 | repository |
| `GET /api/incidents` | bounded filters | action queue | 400/503 | repository |
| `GET /api/incidents/:id` | incident key | baseline/evidence summary | 404/503 | repository |
| `POST /api/incidents/:id/traversals` | scopes and source finding IDs | `202 {jobId}` | 409 if refused, 503 | worker job |
| `GET /api/incidents/:id/impact` | scope filters | receipt-backed pair matrix | 409 unless baseline verified | repository |
| `GET /api/incidents/:id/proposed-fixes` | none | proposed fixes and outcomes | 404/503 | repository |
| `POST /api/incidents/:id/proposed-fixes/discover` | optional allowlisted bot | `202 {jobId}` | 422 if no real fix | worker job |
| `POST /api/incidents/:id/proposed-fixes` | repository, immutable ref/PR | `202 {jobId}` | 422 if head/lockfile unavailable | worker job |
| `POST /api/incidents/:id/plans` | constraints and eligible fix keys | deterministic plan | 409 unless outcomes verified | planner |
| `GET /api/plans/:id` | plan key | plan and transparent coverage | 404 | repository |
| `POST /api/plans/:id/verify` | expected plan digest | `202 {jobId}` | 409 drift; 422 unsafe bounds | worker job |
| `GET /api/receipts/:digest` | SHA-256 | canonical JSON bytes | 404/409 digest mismatch | repository |
| `GET /api/receipts/:digest/sarif` | SHA-256 | SARIF 2.1.0 JSON | 404/409 digest mismatch | receipt service |
| `GET /api/system` | none | runtime identity, health, freshness, non-secret limits | 503 if store unavailable | repository/health |

Rate policy: mutations are limited to 10/minute/operator and imports to 4 concurrent jobs. Lists cap at 100 rows. A `Retry-After` header accompanies `429` and source-driven `503`. Error bodies are `{code,state,message,requestId,retryable,details?}`; details contain no token, source body, or filesystem path.

### 10.2 API schemas

#### File: `src/app/api/[...path]/route.ts` (boundary schemas)
[VERIFIED] — Strict schema contract derived from PRD Section 5

```typescript
// File: src/app/api/[...path]/route.ts
const RepositoryName = z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
const UploadInput = z.object({ kind: z.literal("upload"), repository: RepositoryName, manifestBase64: z.string().max(14_000_000), lockfileBase64: z.string().max(14_000_000) }).strict();
const GitHubInput = z.object({ kind: z.literal("github"), repository: RepositoryName, ref: z.string().min(1).max(255) }).strict();
const ImportBody = z.discriminatedUnion("kind", [GitHubInput, UploadInput]);
const ProposedFixBody = ImportBody;
const TraversalBody = z.object({
  scopes: z.array(z.enum(["production", "development", "optional", "peer"])).min(1).refine((items) => new Set(items).size === items.length),
  sourceFindingIds: z.array(z.string()).min(1).refine((items) => new Set(items).size === items.length),
  verificationSourceCoordinates: z.array(z.string().regex(/^.+@[^@]+$/)).min(1).max(100)
    .refine((items) => new Set(items).size === items.length),
}).strict();
const UniqueKeys = z.array(z.string()).max(100).refine((items) => new Set(items).size === items.length);
const PlanBody = z.object({ proposedFixKeys: UniqueKeys, requiredFixKeys: UniqueKeys,
  forbiddenFixKeys: UniqueKeys, maxRepositoryChanges: z.number().int().positive().optional() }).strict();
const VerifyBody = z.object({ expectedPlanDigest: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
```

### 10.3 BFF route dispatcher

#### File: `src/app/api/[...path]/route.ts`
[UNVERIFIED] — Exact Next.js request types, pg-boss enqueue path, and repository projections require compile and contract tests

```typescript
// File: src/app/api/[...path]/route.ts
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { canonicalDigest } from "../../../domain/canonical";
import { toSarif } from "../../../domain/sarif";
import { databaseHealth } from "../../../db/client";
import {
  createPlanForIncident,
  findIncident,
  findJob,
  findPlan,
  findReceipt,
  listIncidentQueue,
  listProposedFixes,
  loadIncidentBundle,
  loadIncidentImpact,
  loadPlanBundle,
  loadSystemFacts,
} from "../../../db/repository";
import { hydraHealth } from "../../../integrations/hydradb";
import { enqueue } from "../../../jobs/queue";

const sha = z.string().regex(/^[a-f0-9]{64}$/);
const portfolioKey = z.string().regex(/^[A-Za-z0-9_.-]{1,80}$/);
const repository = z.string().regex(/^[\w.-]+\/[\w.-]+$/);
const upload = z.object({ kind: z.literal("upload"), repository, manifestBase64: z.string().max(14_000_000), lockfileBase64: z.string().max(14_000_000) }).strict();
const github = z.object({ kind: z.literal("github"), repository, ref: z.string().min(1).max(255) }).strict();
const importBody = z.discriminatedUnion("kind", [github, upload]);
const fixBody = importBody;
const discoverBody = z.object({ bot: z.enum(["dependabot", "renovate"]).optional() }).strict();
const incidentQuery = z.object({ portfolio: portfolioKey.optional(), state: z.enum(["VERIFIED_WITHIN_BOUNDS", "PARTIAL", "UNKNOWN", "ERROR"]).optional(),
  cursor: z.coerce.number().int().min(0).default(0), limit: z.coerce.number().int().min(1).max(100).default(50) }).strict();
const traversalBody = z.object({
  scopes: z.array(z.enum(["production", "development", "optional", "peer"])).min(1).refine((items) => new Set(items).size === items.length),
  sourceFindingIds: z.array(z.string()).min(1).refine((items) => new Set(items).size === items.length),
  verificationSourceCoordinates: z.array(z.string().regex(/^.+@[^@]+$/)).min(1).max(100)
    .refine((items) => new Set(items).size === items.length),
}).strict();
const uniqueKeys = z.array(z.string()).max(100).refine((items) => new Set(items).size === items.length);
const planBody = z.object({ proposedFixKeys: uniqueKeys, requiredFixKeys: uniqueKeys,
  forbiddenFixKeys: uniqueKeys, maxRepositoryChanges: z.number().int().positive().optional() }).strict();
const verifyBody = z.object({ expectedPlanDigest: sha }).strict();

type Context = { params: Promise<{ path: string[] }> };
type Handler = (request: Request, segments: string[], requestId: string) => Promise<Response>;

function segment(segments: string[], index: number): string {
  const value = segments[index];
  if (!value) throw new Error("INVALID_ROUTE_SEGMENT");
  return value;
}

function validateUploadedJson(body: z.infer<typeof upload>): void {
  for (const [name, value] of [["manifest", body.manifestBase64], ["lockfile", body.lockfileBase64]] as const) {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) throw new Error("UPLOAD_BASE64_INVALID");
    const bytes = Buffer.from(value, "base64");
    if (bytes.length > 10 * 1024 * 1024) throw new Error("UPLOAD_TOO_LARGE");
    try { JSON.parse(bytes.toString("utf8")); } catch { throw new Error(`${name.toUpperCase()}_JSON_INVALID`); }
  }
}

function json(value: unknown, status: number, requestId: string, headers = {}): Response {
  return Response.json(value, { status, headers: { "x-request-id": requestId, ...headers } });
}

function failure(code: string, state: "PARTIAL" | "UNKNOWN" | "ERROR", message: string, status: number,
  requestId: string, retryable = false, details?: Record<string, unknown>, headers = {}): Response {
  return json({ code, state, message, requestId, retryable, ...(details ? { details } : {}) }, status, requestId, headers);
}

function idempotency(request: Request, body: unknown): string {
  const value = request.headers.get("idempotency-key");
  if (!value || !/^[A-Za-z0-9_-]{8,128}$/.test(value)) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  const operator = canonicalDigest(request.headers.get("authorization") ?? "proxy-authenticated-operator");
  return canonicalDigest({ route: new URL(request.url).pathname, operator, body, suppliedKey: value });
}

const rateWindows = new Map<string, { minute: number; count: number }>();

function allowMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new Error("CROSS_ORIGIN_MUTATION");
  const operator = canonicalDigest(request.headers.get("authorization") ?? "proxy-authenticated-operator");
  const minute = Math.floor(Date.now() / 60_000);
  const row = rateWindows.get(operator);
  const next = row?.minute === minute ? { minute, count: row.count + 1 } : { minute, count: 1 };
  rateWindows.set(operator, next);
  return next.count <= 10;
}

async function health(_request: Request, _segments: string[], id: string): Promise<Response> {
  const [database, hydradb] = await Promise.allSettled([databaseHealth(), hydraHealth()]);
  const value = { web: true, database: database.status === "fulfilled" && database.value, hydradb: hydradb.status === "fulfilled" && hydradb.value };
  return Object.values(value).every(Boolean) ? json(value, 200, id)
    : failure("DEPENDENCY_UNAVAILABLE", "ERROR", "A critical dependency is unavailable.", 503, id, true, value);
}

async function importRepository(request: Request, _segments: string[], id: string): Promise<Response> {
  const body = importBody.parse(await request.json());
  if (body.kind === "upload") validateUploadedJson(body);
  const selectedPortfolio = portfolioKey.parse(new URL(request.url).searchParams.get("portfolio") ?? "default");
  const jobId = await enqueue("import-snapshot", { ...body, portfolioKey: selectedPortfolio, role: "current" }, idempotency(request, { selectedPortfolio, body }));
  return json({ jobId }, 202, id);
}

async function incidentsIndex(request: Request, _segments: string[], id: string): Promise<Response> {
  const url = new URL(request.url);
  const query = incidentQuery.parse(Object.fromEntries(url.searchParams));
  const filtered = (await listIncidentQueue()).filter((row) => (!query.portfolio || row.portfolioKey === query.portfolio) &&
    (!query.state || row.state === query.state));
  if (query.portfolio && filtered.length === 0) return failure("PORTFOLIO_NOT_ANALYZABLE", "UNKNOWN", "Portfolio has no analyzable incidents.", 409, id);
  const items = filtered.slice(query.cursor, query.cursor + query.limit);
  const nextCursor = query.cursor + items.length < filtered.length ? query.cursor + items.length : null;
  return json({ items, nextCursor, total: filtered.length }, 200, id);
}

async function incidentDetail(_request: Request, segments: string[], id: string): Promise<Response> {
  const incident = await findIncident(segment(segments, 1));
  if (!incident) return failure("NOT_FOUND", "ERROR", "Incident not found.", 404, id);
  const bundle = await loadIncidentBundle(incident.key);
  if (bundle.advisories.some((row) => row.evidence.withdrawnAt)) return failure("ADVISORY_WITHDRAWN", "UNKNOWN", "Incident advisory is withdrawn and requires review.", 409, id);
  return json(bundle, 200, id);
}

async function jobDetail(_request: Request, segments: string[], id: string): Promise<Response> {
  const job = await findJob(segment(segments, 1));
  return job ? json(job, 200, id) : failure("NOT_FOUND", "ERROR", "Job not found.", 404, id);
}

async function traverseIncident(request: Request, segments: string[], id: string): Promise<Response> {
  const body = traversalBody.parse(await request.json());
  const incidentKey = segment(segments, 1);
  const bundle = await loadIncidentBundle(incidentKey);
  const selectedCoordinate = bundle.advisories[0]
    ? `${bundle.advisories[0].evidence.packageName}@${bundle.advisories[0].evidence.exactVersion}` : "";
  if (canonicalDigest(body.sourceFindingIds.slice().sort()) !== canonicalDigest(bundle.incident.sourceFindingKeys.slice().sort()) || !bundle.snapshots.length) {
    return failure("TRAVERSAL_PRECONDITION_FAILED", "UNKNOWN", "Current inputs or finding set are incomplete.", 409, id);
  }
  if (!body.verificationSourceCoordinates.includes(selectedCoordinate)) {
    return failure("SELECTED_INCIDENT_SOURCE_REQUIRED", "UNKNOWN", "Verification sources must include the selected incident coordinate.", 409, id);
  }
  const jobId = await enqueue("refresh-evidence", { incidentKey, ...body }, idempotency(request, body));
  return json({ jobId }, 202, id);
}

async function impact(_request: Request, segments: string[], id: string): Promise<Response> {
  const value = await loadIncidentImpact(segment(segments, 1));
  if (!value) return failure("NOT_FOUND", "ERROR", "Impact not found.", 404, id);
  return value.baseline.state === "VERIFIED_WITHIN_BOUNDS" ? json(value, 200, id)
    : failure("IMPACT_NOT_VERIFIED", "PARTIAL", "Impact is not verified within bounds.", 409, id, false, value);
}

async function fixes(request: Request, segments: string[], id: string): Promise<Response> {
  const incidentKey = segment(segments, 1);
  const incident = await findIncident(incidentKey);
  if (!incident) return failure("NOT_FOUND", "ERROR", "Incident not found.", 404, id);
  if (!incident.baseline || incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS") return failure("BASELINE_NOT_VERIFIED", "UNKNOWN", "A verified baseline is required.", 409, id);
  if (request.method === "GET") return json({ items: await listProposedFixes(incidentKey) }, 200, id);
  const body = fixBody.parse(await request.json());
  if (body.kind === "upload") validateUploadedJson(body);
  const origin = body.kind === "upload" ? "upload" : /^[a-f0-9]{40}$/.test(body.ref) ? "github-commit" : "github-branch";
  const jobId = await enqueue("evaluate-proposed-fix", {
    incidentKey: incident.key,
    portfolioKey: incident.portfolioKey,
    origin,
    ...body,
  }, idempotency(request, body));
  return json({ jobId }, 202, id);
}

async function discoverFixes(request: Request, segments: string[], id: string): Promise<Response> {
  const body = discoverBody.parse(await request.json().catch(() => ({})));
  const incidentKey = segment(segments, 1);
  const incident = await findIncident(incidentKey);
  if (!incident?.baseline || incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS") return failure("BASELINE_NOT_VERIFIED", "UNKNOWN", "A verified baseline is required.", 409, id);
  const jobId = await enqueue("evaluate-proposed-fix", { incidentKey, mode: "discover", ...body }, idempotency(request, body));
  return json({ jobId }, 202, id);
}

async function plans(request: Request, segments: string[], id: string): Promise<Response> {
  const body = planBody.parse(await request.json());
  const value = await createPlanForIncident(segment(segments, 1), body);
  return json(value, 201, id);
}

async function planDetail(_request: Request, segments: string[], id: string): Promise<Response> {
  const value = await findPlan(segment(segments, 1));
  return value ? json(value, 200, id) : failure("NOT_FOUND", "ERROR", "Plan not found.", 404, id);
}

async function verifyPlan(request: Request, segments: string[], id: string): Promise<Response> {
  const body = verifyBody.parse(await request.json());
  const planKey = segment(segments, 1);
  if (body.expectedPlanDigest !== planKey) return failure("PLAN_DIGEST_DRIFT", "ERROR", "Plan digest does not match the route.", 409, id);
  const bundle = await loadPlanBundle(planKey);
  if (!bundle.incident.baseline || bundle.incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS" ||
    bundle.fixes.length !== bundle.plan.proposedFixKeys.length || bundle.fixes.some((row) => row.state !== "VERIFIED_WITHIN_BOUNDS")) {
    return failure("PLAN_NOT_COMPLETE", "UNKNOWN", "Plan inputs are not complete and immutable.", 409, id);
  }
  const jobId = await enqueue("verify-plan", { planKey, ...body }, idempotency(request, body));
  return json({ jobId }, 202, id);
}

async function system(_request: Request, _segments: string[], id: string): Promise<Response> {
  return json(await loadSystemFacts(), 200, id);
}

async function receipt(request: Request, segments: string[], id: string): Promise<Response> {
  const digest = sha.parse(segment(segments, 1));
  const row = await findReceipt(digest);
  if (!row || canonicalDigest(row.receipt) !== digest) return failure("RECEIPT_UNAVAILABLE", "ERROR", "Receipt is missing or failed integrity verification.", row ? 409 : 404, id);
  if (segments[2] === "sarif" && row.receipt.resultState !== "VERIFIED_WITHIN_BOUNDS") return failure("SARIF_NOT_EXPORTABLE", "PARTIAL", "Only a verified receipt can be exported as SARIF.", 422, id);
  const value = segments[2] === "sarif" ? toSarif(row.receipt, digest) : row.receipt;
  return new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json", "cache-control": "public,max-age=31536000,immutable", "x-request-id": id } });
}

const routes: Array<{ method: string; pattern: RegExp; handle: Handler }> = [
  { method: "GET", pattern: /^health$/, handle: health },
  { method: "POST", pattern: /^imports$/, handle: importRepository },
  { method: "GET", pattern: /^jobs\/[^/]+$/, handle: jobDetail },
  { method: "GET", pattern: /^incidents$/, handle: incidentsIndex },
  { method: "GET", pattern: /^incidents\/[^/]+$/, handle: incidentDetail },
  { method: "POST", pattern: /^incidents\/[^/]+\/traversals$/, handle: traverseIncident },
  { method: "GET", pattern: /^incidents\/[^/]+\/impact$/, handle: impact },
  { method: "GET", pattern: /^incidents\/[^/]+\/proposed-fixes$/, handle: fixes },
  { method: "POST", pattern: /^incidents\/[^/]+\/proposed-fixes$/, handle: fixes },
  { method: "POST", pattern: /^incidents\/[^/]+\/proposed-fixes\/discover$/, handle: discoverFixes },
  { method: "POST", pattern: /^incidents\/[^/]+\/plans$/, handle: plans },
  { method: "GET", pattern: /^plans\/[^/]+$/, handle: planDetail },
  { method: "POST", pattern: /^plans\/[^/]+\/verify$/, handle: verifyPlan },
  { method: "GET", pattern: /^receipts\/[a-f0-9]{64}(\/sarif)?$/, handle: receipt },
  { method: "GET", pattern: /^system$/, handle: system },
];

async function dispatch(request: Request, context: Context): Promise<Response> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const segments = (await context.params).path;
    const key = segments.join("/");
    if (request.method === "POST" && !allowMutation(request)) {
      return failure("RATE_LIMITED", "ERROR", "Mutation rate limit exceeded.", 429, requestId, true,
        { limit: 10, windowSeconds: 60 }, { "retry-after": "60" });
    }
    const route = routes.find((item) => item.method === request.method && item.pattern.test(key));
    return route ? route.handle(request, segments, requestId) : failure("NOT_FOUND", "ERROR", "Route not found.", 404, requestId);
  } catch (error) {
    const invalid = error instanceof z.ZodError;
    const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
    if (error instanceof SyntaxError) return failure("INVALID_JSON", "ERROR", "Request body is not valid JSON.", 400, requestId);
    if (invalid) {
      const tooLarge = error.issues.some((issue) => issue.code === "too_big");
      return failure(tooLarge ? "PAYLOAD_TOO_LARGE" : "INVALID_INPUT", "ERROR", "Request validation failed.", tooLarge ? 413 : 400, requestId);
    }
    if (code === "IDEMPOTENCY_KEY_REQUIRED") return failure(code, "ERROR", "A valid idempotency key is required.", 400, requestId);
    if (code === "CROSS_ORIGIN_MUTATION") return failure(code, "ERROR", "Cross-origin mutation refused.", 403, requestId);
    if (code === "IDEMPOTENCY_INPUT_DRIFT") return failure(code, "ERROR", "Idempotency key was reused with different input.", 409, requestId);
    if (["UPLOAD_TOO_LARGE"].includes(code)) return failure(code, "ERROR", "Uploaded input exceeds the bounded size.", 413, requestId);
    if (["UPLOAD_BASE64_INVALID", "MANIFEST_JSON_INVALID", "LOCKFILE_JSON_INVALID", "LOCKFILE_VERSION"].includes(code)) return failure(code, "ERROR", "Uploaded input is unsupported or malformed.", 422, requestId);
    if (["INCIDENT_NOT_FOUND", "PLAN_NOT_FOUND"].includes(code)) return failure("NOT_FOUND", "ERROR", "Requested resource was not found.", 404, requestId);
    if (["BASELINE_NOT_VERIFIED", "UNKNOWN_PROPOSED_FIX", "PROPOSED_FIX_NOT_VERIFIED", "NO_FEASIBLE_PLAN_WITHIN_BOUNDS",
      "PLAN_DIGEST_DRIFT", "PLAN_FIX_SET_DRIFT", "SOURCE_FINDING_SET_MISMATCH"].includes(code)) {
      return failure(code, "UNKNOWN", "A verification precondition was not satisfied.", 409, requestId);
    }
    if (/^(GITHUB|OSV|ENRICHMENT|HYDRADB)_/.test(code)) return failure(code.split(":")[0] ?? "SOURCE_UNAVAILABLE", "UNKNOWN", "An external evidence source is unavailable.", 503, requestId, true, undefined, { "retry-after": "60" });
    return failure("INTERNAL_ERROR", "ERROR", "Request failed closed.", 503, requestId, true);
  }
}

export const GET = dispatch;
export const POST = dispatch;
```

The dispatcher covers all 16 contract rows; the receipt regex owns both JSON and SARIF variants. The repository methods named here have exact state and persistence requirements in Sections 6.3 and 17.5. No unlisted route may be exposed. `DELETE`, `PUT`, and `PATCH` return `405` at the proxy. Authentication is single-operator bearer authentication at the reverse proxy in the demo deployment; an untrusted multi-tenant deployment is explicitly unsupported.

## 11. Project and deployment configuration

### 11.1 Package manifest

#### File: `package.json`
[UNVERIFIED] — First build gate confirms all package identities and exact versions resolve together

```jsonc
// File: package.json
{
  "name": "hydracut-app",
  "version": "1.0.0",
  "private": true,
  "engines": { "node": "24.10.0", "pnpm": "11.22.0" },
  "packageManager": "pnpm@11.22.0",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "worker": "tsx src/worker.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run tests/domain.test.ts",
    "test:contract": "vitest run tests/hydradb.contract.test.ts",
    "test:corpus": "vitest run tests/corpus.integration.test.ts",
    "test:adversarial": "vitest run tests/adversarial.integration.test.ts",
    "test:e2e": "playwright test",
    "proof": "tsx scripts/proof.ts",
    "seed:demo": "tsx scripts/seed-demo.ts",
    "db:push": "drizzle-kit push --dialect postgresql --schema ./src/db/schema.ts --url \"$DATABASE_URL\""
  },
  "dependencies": {
    "@npmcli/arborist": "10.0.2",
    "@tanstack/react-query": "5.101.4",
    "@xyflow/react": "12.11.3",
    "drizzle-orm": "0.45.2",
    "next": "16.3.1",
    "pg": "8.23.0",
    "pg-boss": "12.27.0",
    "pino": "10.3.1",
    "radix-ui": "1.6.7",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "undici": "8.10.0",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@axe-core/playwright": "4.13.0",
    "@playwright/test": "1.62.1",
    "@tailwindcss/postcss": "4.3.3",
    "@types/node": "24.10.0",
    "@types/pg": "8.15.6",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "drizzle-kit": "0.31.8",
    "tailwindcss": "4.3.3",
    "tsx": "4.21.0",
    "typescript": "7.0.2",
    "vitest": "4.1.11"
  }
}
```

#### File: `pnpm-workspace.yaml`
[VERIFIED] — Standard pnpm single-package workspace syntax

```yaml
# File: pnpm-workspace.yaml
packages:
  - .
onlyBuiltDependencies:
  - '@npmcli/arborist'
```

### 11.2 TypeScript and Next

#### File: `tsconfig.json`
[UNVERIFIED] — TypeScript 7 compiler compatibility is a first build gate

```jsonc
// File: tsconfig.json
{
  "compilerOptions": {
    "target": "ES2024",
    "lib": ["DOM", "DOM.Iterable", "ES2024"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", "scripts/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### File: `next.config.ts`
[VERIFIED] — No remote image or server-action capability is required

```typescript
// File: next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
};

export default nextConfig;
```

### 11.3 Test runners

#### File: `vitest.config.ts`
[UNVERIFIED] — Requires install proof

```typescript
// File: vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
```

#### File: `playwright.config.ts`
[UNVERIFIED] — Requires browser install and running stack

```typescript
// File: playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.e2e.spec.ts",
  retries: 1,
  use: { baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000", trace: "retain-on-failure" },
  webServer: { command: "pnpm start", url: process.env.BASE_URL ?? "http://127.0.0.1:3000",
    reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"]! } },
    { name: "mobile", use: { ...devices["Pixel 7"]! } },
  ],
});
```

### 11.4 Container image

#### File: `Dockerfile`
[UNVERIFIED] — Linux x86_64 build and non-root runtime are explicit Build gates

```dockerfile
# File: Dockerfile
FROM node:24.10.0-bookworm-slim AS dependencies
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY . .
RUN pnpm typecheck && pnpm test && pnpm build

FROM dependencies AS tooling
COPY --chown=node:node . .

FROM tooling AS worker
RUN pnpm typecheck && pnpm test
USER node
CMD ["pnpm", "worker"]

FROM worker AS test-runner
ARG OSV_SCANNER_VERSION=2.5.1
ARG OSV_SCANNER_SHA256=f9f25499a2c8cc367b3af45df2ea7eeca7fbccceab9c35079968f4b3652194be
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && curl -fsSLo /usr/local/bin/osv-scanner "https://github.com/google/osv-scanner/releases/download/v${OSV_SCANNER_VERSION}/osv-scanner_linux_amd64" \
 && echo "${OSV_SCANNER_SHA256}  /usr/local/bin/osv-scanner" | sha256sum -c - \
 && chmod 0755 /usr/local/bin/osv-scanner \
 && pnpm exec playwright install --with-deps chromium \
 && chmod -R a+rX /ms-playwright \
 && rm -rf /var/lib/apt/lists/*
USER node
CMD ["/bin/sh", "-c", "pnpm build && pnpm test:e2e"]

FROM node:24.10.0-bookworm-slim AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

The worker uses its source target, not the standalone Next image, because it needs TypeScript worker sources and production dependencies. The test-only `test-runner` inherits that source image, installs the digest-verified OSV-Scanner 2.5.1 Linux binary and Chromium runtime, and builds Next only in its default E2E command; a corpus command override therefore works before frontend files exist. It is never deployed as a long-running service. The web and worker always remain separate processes.

### 11.5 Docker Compose

#### File: `docker-compose.yml`
[UNVERIFIED] — HydraDB environment names/digest match the frozen local runtime; the seven-service Linux deployment plus isolated test-profile runner remain gates

```yaml
# File: docker-compose.yml
services:
  postgres:
    image: postgres:18.6-bookworm
    environment:
      POSTGRES_DB: hydracut
      POSTGRES_USER: hydracut
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets: [postgres_password]
    volumes: [postgres_data:/var/lib/postgresql]
    healthcheck:
      test: [CMD-SHELL, pg_isready -U hydracut -d hydracut]
      interval: 5s
      timeout: 3s
      retries: 20
    restart: unless-stopped

  hydradb:
    image: ghcr.io/hydra-db/hydradb@sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709
    environment:
      CLOUD_PROVIDER: local
      LOCAL_PATH: /data/store
      GRAPH_NAMESPACE: default
      GRAPH_ID: default
      GRAPH_CELL_ID: cell-0
      GRAPH_CELLS: cell-0
      GRAPH_NODE_ID: node-0
      GRAPH_BOLT_NODE_ADDRESSES: node-0=127.0.0.1:7687
      GRAPH_ADVERTISED_BOLT_ADDR: hydradb:7687
      GRAPH_DATA_CACHE_DIR: /data/cache
      GRAPH_AUTH_TOKEN_FILE: /run/secrets/hydradb_token
      GRAPH_ALLOW_PLAINTEXT: 'true'
      RUST_MIN_STACK: '33554432'
      RUST_LOG: info
    secrets: [hydradb_token]
    volumes: [hydradb_data:/data]
    expose: ['7687', '8443', '9090']
    restart: unless-stopped

  migrate:
    build: { context: ., target: tooling }
    command: [/bin/sh, -c, 'export DATABASE_URL="$$(cat /run/secrets/database_url)"; exec pnpm db:push']
    secrets: [database_url]
    depends_on:
      postgres: { condition: service_healthy }
    restart: 'no'

  graph-contract:
    build: { context: ., target: worker }
    command: [pnpm, test:contract]
    environment:
      HYDRADB_HTTP_URL: http://hydradb:8443
      HYDRADB_GRAPH_NAMESPACE: default
      HYDRADB_TOKEN_FILE: /run/secrets/hydradb_token
    secrets: [hydradb_token]
    depends_on:
      hydradb: { condition: service_started }
    restart: 'no'

  worker:
    build: { context: ., target: worker }
    command: [pnpm, worker]
    env_file: [.env]
    environment:
      DATABASE_URL_FILE: /run/secrets/database_url
      HYDRADB_HTTP_URL: http://hydradb:8443
      HYDRADB_GRAPH_NAMESPACE: default
      HYDRADB_TOKEN_FILE: /run/secrets/hydradb_token
      GITHUB_TOKEN_FILE: /run/secrets/github_token
    secrets: [database_url, hydradb_token, github_token]
    depends_on:
      postgres: { condition: service_healthy }
      migrate: { condition: service_completed_successfully }
      graph-contract: { condition: service_completed_successfully }
    healthcheck:
      test: [CMD, node, -e, "process.kill(1, 0)"]
      interval: 15s
      timeout: 3s
      retries: 3
    restart: unless-stopped

  test-runner:
    profiles: [test]
    build: { context: ., target: test-runner }
    command: [/bin/sh, -c, 'mkdir -p docs/evidence/screenshots && pnpm build && exec pnpm test:e2e']
    env_file: [.env]
    environment:
      BASE_URL: http://127.0.0.1:3000
      DATABASE_URL_FILE: /run/secrets/database_url
      HYDRADB_HTTP_URL: http://hydradb:8443
      HYDRADB_GRAPH_NAMESPACE: default
      HYDRADB_TOKEN_FILE: /run/secrets/hydradb_token
      GITHUB_TOKEN_FILE: /run/secrets/github_token
    secrets: [database_url, hydradb_token, github_token]
    volumes: [./docs/evidence/screenshots:/app/docs/evidence/screenshots]
    depends_on:
      postgres: { condition: service_healthy }
      migrate: { condition: service_completed_successfully }
      graph-contract: { condition: service_completed_successfully }
    restart: 'no'

  web:
    build: { context: ., target: runtime }
    env_file: [.env]
    environment:
      DATABASE_URL_FILE: /run/secrets/database_url
      HYDRADB_HTTP_URL: http://hydradb:8443
      HYDRADB_GRAPH_NAMESPACE: default
      HYDRADB_TOKEN_FILE: /run/secrets/hydradb_token
    secrets: [database_url, hydradb_token]
    depends_on:
      postgres: { condition: service_healthy }
      migrate: { condition: service_completed_successfully }
      graph-contract: { condition: service_completed_successfully }
    expose: ['3000']
    healthcheck:
      test: [CMD, node, -e, "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(r.status!==200)process.exit(1)})"]
      interval: 10s
      timeout: 5s
      retries: 12
    restart: unless-stopped

  proxy:
    image: caddy:2.11.4-alpine
    command: [/bin/sh, -c, 'export APP_OPERATOR_TOKEN="$$(cat /run/secrets/app_operator_token)"; exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile']
    environment:
      APP_DOMAIN: ${APP_DOMAIN}
      ACME_EMAIL: ${ACME_EMAIL}
    secrets: [app_operator_token]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      web: { condition: service_healthy }
    ports: ['80:80', '443:443']
    healthcheck:
      test: [CMD-SHELL, 'TOKEN="$$(cat /run/secrets/app_operator_token)"; wget -qO- --header="Host: $${APP_DOMAIN}" --header="Authorization: Bearer $${TOKEN}" http://127.0.0.1/api/health']
      interval: 15s
      timeout: 5s
      retries: 12
    restart: unless-stopped

secrets:
  postgres_password: { file: ./secrets/postgres_password }
  database_url: { file: ./secrets/database_url }
  hydradb_token: { file: ./secrets/hydradb_token }
  github_token: { file: ./secrets/github_token }
  app_operator_token: { file: ./secrets/app_operator_token }
volumes:
  postgres_data:
  hydradb_data:
  caddy_data:
  caddy_config:
```

The operator creates `secrets/database_url` as `postgres://hydracut:<percent-encoded-password>@postgres:5432/hydracut`; application processes read it through `DATABASE_URL_FILE`. Tokens and database credentials are never copied into images, Compose environment values, or logs.

#### File: `Caddyfile`
[UNVERIFIED] — Caddy 2.11.4 syntax and ACME issuance require the target DNS/TLS deployment gate

```caddyfile
# File: Caddyfile
{
  email {$ACME_EMAIL}
}

{$APP_DOMAIN} {
  request_body {
    max_size 32MB
  }
  @unauthorized not header Authorization "Bearer {$APP_OPERATOR_TOKEN}"
  respond @unauthorized 401
  @unsupported method DELETE PUT PATCH
  respond @unsupported 405
  reverse_proxy web:3000
}
```

### 11.6 Environment reference and credentials needed

| Variable / secret | Process | Required | Source | Rotation / failure |
|---|---|---:|---|---|
| `DATABASE_URL_FILE` | web, worker, migrate | yes | `database_url` Docker secret | rotate with Postgres role; startup fails |
| `POSTGRES_PASSWORD_FILE` | PostgreSQL | yes | `postgres_password` Docker secret | rotate with database URL secret |
| `HYDRADB_HTTP_URL` | web health, worker | yes | internal service name | startup fails |
| `HYDRADB_GRAPH_NAMESPACE` | worker | yes | fixed `default` for demo | refuse mismatch |
| `HYDRADB_TOKEN_FILE` | worker/web | yes | Docker secret | startup fails; never use default token |
| `GITHUB_TOKEN_FILE` | worker | recommended | fine-grained read-only GitHub token | unauthenticated low-rate mode may import public corpus only |
| `APP_OPERATOR_TOKEN` | Caddy process only | yes | exported from `app_operator_token` Docker secret | reject every request if absent |
| `APP_DOMAIN` | Caddy | yes | deployment operator | ACME/route fails if incorrect |
| `ACME_EMAIL` | Caddy | yes | deployment operator | certificate notices unavailable |
| `BASE_URL` | E2E only | no | test environment | defaults localhost |
| `LOG_LEVEL` | web, worker | no | deployment | defaults `info` |
| `SOURCE_CACHE_TTL_SECONDS` | worker | no | deployment | defaults 3600; stale labels mandatory |

Credentials needed before Build integration tests: one fine-grained GitHub token with public-repository Contents, Metadata, Pull Requests, and Commit Status read access; a 32-byte HydraDB token; local Postgres password; and VM/DNS access only when deploying. OSV, CISA KEV, and FIRST EPSS require no credential. No credential is requested for a hosted HydraDB SDK because it is prohibited.

### 11.7 Deployment sequence

| Service | Startup command | Health gate | Depends on | Environment/secrets |
|---|---|---|---|---|
| PostgreSQL | image entrypoint `postgres` | `pg_isready -U hydracut -d hydracut` | none | database/user; password file |
| HydraDB | image entrypoint `/usr/local/bin/graph-node` | authenticated `MATCH (n) RETURN n.id LIMIT 1` plus frozen `MSpaths` contract | none | all 14 `GRAPH_*`/local/Rust variables in Compose; token file |
| migrate | `pnpm db:push` | exit code 0 and schema-version query | PostgreSQL healthy | database-URL secret exported only for the command |
| graph-contract | `pnpm test:contract` | exit 0 after write/read, baseline/final `MSpaths`, failure guards, cleanup | HydraDB started | HydraDB URL/namespace/token file |
| worker | `pnpm worker` | all five queue registrations, DB query, PID health, `worker-ready` | PostgreSQL healthy; migrate complete; graph-contract complete | database URL file, HydraDB URL/namespace/token file, GitHub token file, cache TTL, log level |
| test-runner (Compose `test` profile only) | command override: `pnpm test:corpus` or default `pnpm test:e2e` | command exit 0; screenshots written through the evidence bind mount | PostgreSQL healthy; migrate complete; graph-contract complete; worker started before E2E | database URL, HydraDB and GitHub token files, private service URLs, localhost `BASE_URL` inside container |
| web | `node server.js` | authenticated `GET /api/health` returns all true | PostgreSQL healthy; migrate complete; graph-contract complete | database URL file, HydraDB URL/namespace/token file, log level |
| proxy | Caddy image command from Compose | bearer-authenticated `/api/health` through public route | web healthy | domain, ACME email, operator-token secret, Caddy volumes |

1. Provision one Linux x86_64 VM with Docker Engine, Compose v2, 4 vCPU, 16 GB RAM, 80 GB encrypted disk, inbound 443 only, and outbound 443.
2. Verify image digests, create `secrets/` mode `0700`, create five secret files mode `0600`, and create `.env` mode `0600` from `.env.example`.
3. Run `docker compose pull` and `docker compose build --pull`; capture image IDs in deployment evidence.
4. Start `postgres` and wait for `pg_isready`; run the one-shot `migrate` service and require exit 0.
5. Start HydraDB, then require the one-shot `graph-contract` service to exit 0 after authenticated HTTP health, write/read, baseline fixture `MSpaths`, final fixture `MSpaths`, failure guards, and cleanup. Worker and web have an executable `service_completed_successfully` dependency on this gate.
6. Start the worker and require queue creation plus Postgres readiness and PID health. Startup retries use capped exponential delays for 120 seconds; then the container exits non-zero.
7. Start web on the private Compose network, then start Caddy. Caddy alone publishes ports 80/443, obtains TLS, enforces the single-operator bearer token, applies the 32 MB request limit (enough for two bounded 10 MiB files after base64 expansion), and forwards to `web:3000`.
8. Run proof and browser gates through `docker compose --profile test run --rm test-runner ...`; require receipt digest stability, no cursor, count equality, oracle parity, and UI proof-page response. No host process is allowed to resolve private Compose service names.
9. Back up Postgres and HydraDB volumes independently. Restore is tested into a new namespace; a restored graph never reuses a receipt until its pair digest is recomputed.

Startup order is availability, not truth. A running container is not a healthy dependency. `/api/health` remains `503` until both Postgres and an authenticated HydraDB query pass. The worker does not claim active readiness until its frozen contract probe passes.

## 12. Integration and operational matrix

| Integration | Auth / transport | Cache / rate | Retry / timeout | Failure state | Provenance captured | Required tests |
|---|---|---|---|---|---|---|
| HydraDB OSS | private HTTP, bearer file, OpenCypher, strong consistency | no result cache; immutable snapshots dedupe by digest | connection 3s, body 30s; two job retries only | `ERROR`/`PARTIAL`; never infer empty | image digest, query text/hash, namespace, epoch, bookmark, elapsed, bounds, pair digest | pinned-container contract, selector counts, incoming direction, scope, truncation, duplicate, cleanup, restart |
| GitHub Contents | fine-grained token file; REST `2026-03-10` | no raw-byte product cache; frozen demo may use hash-verified vendored public fixtures | 3s/15s; honor reset, two retries with jitter | import/fix `UNKNOWN`, no stale substitution | repo, requested ref, resolved SHA, blob SHA, byte SHA, URL, retrieval time | live public fixture, 403/404, changed content, >10 MB, raw-byte disposal |
| GitHub Commits | same | immutable SHA cached indefinitely | same | reject unresolved/mutable identity | requested ref and resolved 40-hex SHA | branch movement and invalid SHA |
| GitHub Pulls/files | same | 5-minute discovery cache only | paginate Link; stop at 1,000 open PRs | discovery unavailable; manual proposed fix remains | PR URL, bot login/type, head SHA, file list hash | bot allowlist, human rejection, missing lockfile, pagination |
| OSV querybatch | public HTTPS exact npm name+version | 1h source cache by request digest; batches ≤1,000 | 3s/10s, two retries, continuation per result | advisory status `UNKNOWN`, never clean | request digest, payload digest, retrieval time | alignment, continuation, withdrawal, aliases, exact version |
| OSV detail | public HTTPS by OSV ID | cache until `modified` changes; refresh 1h | 3s/10s | evidence incomplete and incident unverified | full range events, refs, timestamps, payload digest | semver boundary corpus, withdrawn record, multiple ranges |
| CISA KEV | public HTTPS JSON feed | 6h whole-feed cache | 3s/15s, one retry | `kev=UNKNOWN`; OSV remains usable | catalog version/date, payload digest, retrieval time | listed/not-listed/timeout/malformed feed |
| FIRST EPSS | public HTTPS `?cve=` | 24h by CVE+score date | 3s/10s, one retry | score/percentile absent, visibly unknown | API date, payload digest, retrieval time | exact decimal preservation, empty data, timeout |
| npm Arborist | no network; temp directory | normalized extraction cached by lock SHA | hard 30s worker deadline | reject unsupported lockfile/tree | manifest SHA, lock SHA, lockfile version, extraction SHA, counts/depth | v2/v3, dev/optional/peer, duplicates, missing target, size/depth caps |
| OSV-Scanner | isolated CI binary v2.5.1 | frozen fixtures only | 120s process timeout | CI gate failed, never production fallback | binary version, fixture hashes, normalized finding digest | differential matches for exact-version fixture |
| SARIF export | local receipt transform | immutable by receipt digest | none | 409 if receipt digest differs | receipt digest in run/result properties | SARIF schema validation and field snapshot |
| PostgreSQL | private TLS/local network | source cache and projections | pool 2s, statement 10s | health 503; job remains durable | row timestamps, phase/audit events | migration, insert-only receipt, restore, queue restart |
| pg-boss jobs | PostgreSQL | dedupe by idempotency key/input digest | retry 2, backoff, expire 900s | explicit failed job; no partial success promotion | job ID, attempt, phase sequence/details | crash recovery, retry exhaustion, duplicate submission |

Caching never changes truth state: an expired source payload is shown as stale and triggers refresh; it cannot silently become `NOT_LISTED`, `no vulnerabilities`, or `verified`. GitHub immutable bytes and canonical receipts may be cached indefinitely because their identity contains a content digest. HTTP response bodies are capped before parsing: 10 MB lockfiles, 2 MB metadata, 50 MB KEV feed, 25 MB OSV batch.

### 12.1 Source freshness policy

`SourceStamp.stale` is computed at read time from `freshUntil`, not trusted from stored JSON. OSV and GitHub evidence needed to create a new receipt must be fresh; CISA and EPSS may be unavailable only if their fields are visibly `UNKNOWN` and the limitation is embedded in the receipt. A withdrawn OSV advisory is retained, labeled withdrawn, excluded from an active remediation plan by default, and never deleted from historical receipts.

### 12.2 Job state machine and idempotency

<pre>
QUEUED -> VALIDATE -> FETCH -> HASH -> EXTRACT -> ADVISORY_QUERY
       -> GRAPH_WRITE -> VERIFY_COUNTS -> TRAVERSE -> COMPARE -> RECEIPT -> SUCCEEDED
       \-> RETRY_WAIT -> previous phase (same immutable input)
       \-> FAILED (terminal, explicit code, no verified receipt)
</pre>

The idempotency key is `sha256(route + operator + canonical request)`. A duplicate returns the existing job. Each phase writes an append-only event before the next phase. Graph writes are digest-keyed `MERGE`s; scenario nodes are namespaced by job/plan digest and removed in a `finally` cleanup job. Receipt insertion is the sole success commit point for verification.

### 12.3 Logging and observability

All logs are structured JSON with `requestId`, `jobId`, `incidentKey`, `snapshotKey`, `planKey`, `phase`, `attempt`, `durationMs`, and `resultState` where applicable. Tokens, authorization headers, raw file bytes, repository content, source payloads, and environment variables are redacted. Metrics: phase latency/error, source HTTP status/rate remaining, imported package/edge/depth counts, selector cardinality, MSpaths elapsed/rows/cursor, pair digest, cleanup result, and receipt digest. Alerts fire on any false-clean guard, repeated HydraDB GC warning, cleanup failure, receipt mismatch, or source-cache freshness breach.

## 13. Security and fail-closed architecture

### 13.1 Four-layer validation

1. **Browser:** usability only—field hints and disabled actions; never authoritative.
2. **BFF:** Zod strict schemas, route allowlist, body limits, bearer identity, mutation rate limits, CSRF same-origin check, idempotency.
3. **Worker/domain:** immutable commit resolution, content hashes, lockfile caps/version, advisory range match, exact package identity, plan eligibility, canonical receipt checks.
4. **HydraDB adapter:** allowlisted relationship types, regex-only literal selectors, parameterized `UNWIND` rows, exact cardinality probes, safe result bound, cursor/duplicate checks, epoch/bookmark requirement, pair digest.

Any lower-layer failure overrides upper-layer confidence. The UI may show a prior verified receipt but must label it historical and never attach it to a changed plan/input.

### 13.2 Threat model

| Threat | Boundary | Control | Residual consequence |
|---|---|---|---|
| Malicious repo/ref/path | GitHub client | repository regex, fixed filenames, immutable commit, no redirects, byte cap | public GitHub metadata still untrusted until parsed |
| Lockfile resource bomb | extractor | byte, 5k-node, depth 16, 30s, temp dir, no install/scripts | very wide graphs may be rejected |
| OpenCypher injection | graph adapter | parameterized writes; strict selector grammar; relationship allowlist | query templates remain reviewed code |
| SSRF | source clients | fixed API origins; owner/repo only, no arbitrary URL fetch | GitHub source URL displayed but never fetched |
| Secret disclosure | runtime/logging | Docker secret files, redaction, non-root, no env dump | host administrator remains trusted |
| Replay/stale proof | receipt/UI | immutable input SHA, result digest, supersedes, visible retrieval dates | historical receipt is still valid only for historical inputs |
| False clean by truncation | HydraDB response | exact bound, cursor absence, duplicate check, selector counts | undocumented server truncation is covered by BFS/oracle parity |
| Cross-scenario contamination | graph model | job-prefixed scenario keys, selector count, cleanup and isolation tests | failed cleanup consumes storage and alerts |
| Job duplication/crash | queue | idempotency, phase log, digest MERGE, receipt insert-only | redundant work, never multiple truths |
| Supply-chain compromise | build | exact dependencies, frozen lock, image digest, SBOM/provenance in CI | upstream artifact trust still exists |

### 13.3 Unsupported security claims

HydraCut does not claim exploitability analysis, source-code reachability, malware detection, comprehensive vulnerability coverage, tenant isolation, production HA, or whole-portfolio safety. The demo is a single-operator incident-response tool. Expanding to untrusted tenants requires separate database roles/namespaces, per-tenant encryption and rate limits, authorization tests, and a new threat model.

### 13.4 No LLM decision path

No agent or LLM selects vulnerabilities, computes exposure, recommends a proposed fix, chooses a portfolio plan, generates a receipt, or decides whether a graph is clean. Optional narrative assistance is deferred beyond P1 and, if ever added, may summarize receipt-backed fields only. It cannot mutate or gate any result.

### 13.5 Critical/high risk-to-verification-tag map

This table is the arithmetic audit surface for all 21 PRD CRITICAL/HIGH risks. A risk remains open through Build until its tagged file's named test/gate passes; `[VERIFIED]` design logic never substitutes for runtime proof.

| Risk | Architecture evidence carrying an open verification tag | Required closing proof |
|---|---|---|
| R01 | `tests/hydradb.contract.test.ts` `[UNVERIFIED]` | removal test breaks baseline and final proof |
| R02 | `src/integrations/hydradb.ts` response adapter plus contract test `[UNVERIFIED]` | bound/cursor/duplicate/BFS mutations |
| R03 | `scripts/seed-demo.ts`, `scripts/proof.ts` `[UNVERIFIED]` | immutable hashes and rerun assertions |
| R04 | `src/integrations/arborist.ts` `[UNVERIFIED]` | no process/install/registry activity |
| R05 | `docker-compose.yml` target runtime `[UNVERIFIED]` consequence and contract suite | restart/soak/pair parity |
| R06 | `src/integrations/github.ts` target rate behavior `[UNVERIFIED]` in integration matrix | 403/429/cache provenance cases |
| R07 | `tests/corpus.integration.test.ts` `[UNVERIFIED]` | OSV alignment/continuation/outage cases |
| R10 | `src/integrations/arborist.ts`, corpus test `[UNVERIFIED]` | frozen counts, BFS, OSV-Scanner parity |
| R11 | proposed-fix pipeline composition `[UNVERIFIED]` in `src/jobs/pipeline.ts` | SHA/repository/byte drift mutations |
| R12 | `src/jobs/pipeline.ts`, final verify page `[UNVERIFIED]` | combined topology removal test |
| R13 | route-complete frontend and E2E `[UNVERIFIED]` | 60-second proposed-fix/sponsor comprehension |
| R14 | `tests/demo.e2e.spec.ts` `[UNVERIFIED]` | two 2:52 rehearsals |
| R15 | all S01–S11 route files `[UNVERIFIED]` | P0 flows green before P1/P2 work |
| R16 | plan page/pipeline `[UNVERIFIED]` | bounded-language and no-combination-story tests |
| R17 | `ImpactMatrix`, graph route `[ASSUMED]/[UNVERIFIED]` | table/text works with visual disabled |
| R18 | worker/API/deployment `[UNVERIFIED]` | secret and raw-byte log scan |
| R19 | `Caddyfile` `[UNVERIFIED]` | external port scan; only 80/443 reachable |
| R20 | receipt/proof scripts `[UNVERIFIED]` | canonical reorder and tamper tests |
| R21 | package/TypeScript configuration `[UNVERIFIED]` | frozen install, typecheck, build |
| R22 | frontend/E2E copy `[ASSUMED]/[UNVERIFIED]` | forbidden-claim scan plus limitation visibility |
| R23 | HydraDB adapter, health, Compose `[UNVERIFIED]` | outage/timeout yields error and no receipt |

## 14. Frontend implementation contract

| Screen / state | Server data | Primary action | Responsive behavior | Accessibility proof |
|---|---|---|---|---|
| `/` command surface | service health, demo availability | import or load verified demo | form stacks below 720px | labeled fields, error summary, keyboard submit |
| `/incidents` queue | bounded incidents and result states | open highest-priority row | table becomes cards; filters horizontal scroll | sortable headers announce state; badges include text |
| `/incidents/:id?tab=impact` | baseline receipt/evidence | inspect pair | graph hidden behind table on narrow screens | table canonical; graph `aria-hidden`; visible focus |
| `tab=evidence` | OSV/CVSS/KEV/EPSS stamps | inspect sources | two-column becomes stack | timestamps in `<time>`; unknown is text, not color |
| `tab=fixes` | real proposed-fix identities/outcomes | include/exclude eligible fix | cards stack | control label contains repository and outcome |
| `tab=plan` | constraints, coverage, residual prediction | verify selected plan | drawer becomes full-width block | deterministic explanation and validation summary |
| `tab=proof` | final receipt | download JSON/SARIF | actions stack | digest selectable; details keyboard-operable |
| `/proof/:digest` | immutable receipt | share/download | single reading column | heading hierarchy, no auto-refresh |
| `/jobs/:id` | phase event stream | retry eligible failure | timeline stacks | live region polite; no focus theft |
| `/system` | graph identity, source freshness, jobs, append-only audit events | diagnose/export | columns progressively disclose | row labels preserved |
| global error/offline | last historical receipt if any | retry | full-width banner | role alert; result state never color-only |

URL owns `incidentId`, `tab`, filters, scope, selected pair, and receipt digest. Navigating AppSec → developer → leader changes projection, not truth or selection. Back/forward restores context. Loading uses skeletons only for layout, never fabricated values. Empty distinguishes “no imported repositories,” “no active advisory,” and “verified zero selected pairs.” Unknown and partial states disable verification-dependent actions.

The eight PRD demo scenes use only these production screens. No demo-only page or hidden success query exists. The “verified demo” button starts an authentic re-import/replay of the frozen public corpus; if GitHub or HydraDB is unavailable it shows the last historical receipt as historical and does not claim a fresh run.

## 15. Testing strategy and proof ladder

### 15.1 Test layers

| Layer | Gate | Exact assertion |
|---|---|---|
| Unit | every commit | canonical JSON/digest, planner tie-break, bounds, conclusion wording, SARIF mapping |
| Parser fixtures | Arborist task | v2/v3 topology, four scopes, repeated versions, caps, deterministic extraction digest |
| Source contracts | integration milestone | GitHub immutable bytes/pagination; OSV alignment/continuation/ranges; CISA/EPSS unknown semantics |
| HydraDB pinned container | before UI integration | parameter writes, scenario isolation, incoming `MSpaths`, counts, limit/cursor refusal, epoch/bookmark, cleanup |
| Independent BFS | every corpus verification | source-target set equals HydraDB pair set on extracted topology |
| OSV-Scanner oracle | corpus milestone | independent scanner and application query both contain the selected frozen advisory; source contracts separately prove full exact-version alignment |
| Differential proposed fix | fix milestone | complete baseline and fix extraction, changed package count, pair delta, no partial graph |
| Final combined proof | plan milestone | second scenario/write/count/`MSpaths`; recomputation equals receipt digest |
| Failure/mutation | pre-deploy | every source offline/malformed/stale, DB restart, HydraDB restart/GC warning, tampered receipt, changed ref |
| Browser/a11y | UI milestone | eight flows desktop/mobile, keyboard, axe, reduced motion, context preservation |

### 15.2 Authentic golden corpus

The only P0 golden corpus is `docs/evidence/2026-08-19-pre-forge-runtime.json` plus lockfiles fetched from its six immutable commit SHAs. Expected historical facts are exactly: 3 applications, 1,742 package instances, 43 application dependency edges, 2,896 package dependency edges; selected `minimist@1.2.5` / `GHSA-xvch-5gv4-984h` baseline 3 pairs, runtime-only 1 pair, proposed-fix 0 pairs; many-source baseline 9 and proposed-fix 6. These values are assertions for those hashes only, not defaults or UI constants. A new live run may differ only if input hashes differ, in which case the test fails until evidence is deliberately re-frozen.

The historical 8-combination experiment remains one regression fixture proving the old corpus. The production planner is tested on synthetic *topology generated in test code* only for algorithmic properties, clearly labeled a unit fixture; product/demo evidence never uses those values. Scale tests use bounded generated sets without representing them as real repositories or vulnerabilities.

### 15.3 Mandatory failure matrix

The gate is partitioned so each failure is asserted at the boundary that owns it; no single test falsely claims API, job, UI, receipt, and log coverage for every low-level mutation.

| Boundary | Exact authored carrier | Mandatory cases |
|---|---|---|
| GitHub/OSV/CISA/FIRST | `tests/corpus.integration.test.ts` | GitHub 429 and OSV 503 refusal, OSV misalignment/continuation/withdrawal, independently failed KEV/EPSS unknown semantics, complete PR pagination/bot evidence, six-state exact normalized OSV-Scanner parity |
| Input/extractor | corpus suite plus API validation rows in `tests/adversarial.integration.test.ts` | malformed upload refusal, immutable six-lock hash equality, complete no-install `loadVirtual()` extraction and deterministic topology hashes |
| HydraDB response | `tests/hydradb.contract.test.ts` | unavailable service, selected-source removal to zero, source/target cardinality, BFS digest, cursor, duplicate rows, result bound, epoch/bookmark, endpoint isolation, cleanup readback |
| Store/plan/receipt | `tests/adversarial.integration.test.ts` | snapshot and receipt insert conflicts, distinct source-universe, scope/baseline, and current-snapshot staleness, pair tamper, result-state invariant, partial SARIF refusal |
| API | `tests/adversarial.integration.test.ts` | all 16 route shapes, authentic GET successes, malformed upload and mutation precondition errors, standard error envelope |
| Worker durability | Plan Tasks 3.2 and 5.1 | SIGTERM during disposable work, restart, phase-event continuity, no duplicate snapshot or receipt |
| Browser | `tests/demo.e2e.spec.ts` | F01–F08, serious/critical axe scan after every scene, mobile context/history/focus, offline job refusal, missing receipt refusal |
| Deployment/security | Plan Task 5.1 and DT-18/19/23 | secret/raw-byte scan, private graph port, HydraDB outage produces no fresh receipt |

Build may extend this matrix, but it cannot delete or weaken an authored assertion. A newly discovered failure mode is added to the owning existing file and to the phase gate before the affected claim can pass.

### 15.4 Build gates

1. `corepack pnpm install --frozen-lockfile` resolves every exact version; no semver ranges.
2. `pnpm typecheck` passes TypeScript 7 strict mode. If a direct package is incompatible, downgrade TypeScript to the newest mutually supported exact release and record evidence—never patch around types with `any`.
3. `pnpm test` passes unit/parser/source fixtures.
4. `pnpm test:contract` passes against the digest-pinned HydraDB image on the target architecture.
5. `pnpm test:corpus` reproduces frozen hashes and counts with independent BFS and OSV-Scanner.
6. `pnpm build` succeeds in the production container.
7. `pnpm test:e2e` passes eight scenes at desktop/mobile plus axe.
8. `pnpm proof` emits a fresh receipt and verifies its digest; no warning is waived.

## 16. Component build order and ownership

| Order | Components / gate | Why this must precede the next row |
|---:|---|---|
| 0 | Dependency compatibility and pinned HydraDB target-architecture contract | An incompatible compiler, library, or graph runtime invalidates every later source contract. |
| 1A | **Parallel:** C08 planner + C09 receipt/SARIF domain | Pure domain contracts need no database or network and define downstream types. |
| 1B | **Parallel:** C03 GitHub + C05 OSV/enrichment + C04 Arborist | Independent source adapters can be proven concurrently once domain identities exist. |
| 1C | **Parallel:** C10 schema/repository + C11 queue | Persistence and jobs can be proven concurrently because both consume the domain types. |
| 2 | Source/parser fixtures and database contracts | HydraDB ingestion must receive already-validated topology and durable identities. |
| 3 | C06 HydraDB adapter plus independent BFS | Baseline product work is forbidden until graph direction, bounds, readback, and parity pass. |
| 4 | Frozen-corpus baseline gate | C07 proposed-fix deltas require a verified baseline pair universe. |
| 5 | C07 complete proposed-fix reconstruction | C08 coverage planning may consume only independently verified outcomes. |
| 6 | C08 coverage plan plus final combined C06 traversal | C09 can publish a final receipt only after one combined graph is natively queried. |
| 7 | C09 combined-proof and tamper gate | C01/C02 must not render or orchestrate an unverified proof contract. |
| 8 | C02 worker pipeline + C01 BFF/UI + C12 observability | The browser needs working jobs, health, and receipt-backed projections. |
| 9 | Eight-flow, accessibility, responsive gate | Deployment should expose only a browser path already proven locally. |
| 10 | Container deployment and failure rehearsal | The final proof must be produced by the same pinned target runtime. |
| 11 | Fresh end-to-end proof and post-build verification | Submission evidence is valid only after every preceding gate. |

Primary ownership: domain engineer owns canonical types/planner/receipt; data engineer owns extraction/Postgres; integration engineer owns source clients and HydraDB; product engineer owns BFF/UI; verification owner owns oracles, receipts, and proof script. One person may fill several roles, but the verification owner reviews graph bounds and receipt code independently before release.

No frontend task starts before the frozen-corpus graph gate. UI work may proceed in parallel only from receipt-backed fixture interfaces whose bytes come from the verified runtime JSON and are visibly labeled historical. No fake network layer or fabricated success state is permitted.

PRD P1 alignment is 4/4: role-preserving projections use the URL-owned web layer; public exact-commit import uses the already-required GitHub/Arborist pipeline; public proposed-fix discovery uses the GitHub Pulls/files adapter and registered worker handler; portfolio/system views use existing repository, phase-event, and health projections. None requires the P2 bounded graph explorer or another service, and all four have authored route files below.

## 17. Complete analysis and proposed-fix lifecycle

### 17.1 Baseline incident construction

`refresh-evidence` executes this exact sequence for the current immutable snapshot of every portfolio repository:

1. Load every `PackageInstance` from the extractor result and deduplicate OSV requests by exact `(ecosystem,name,version)` while retaining all instance keys.
2. Call OSV querybatch and complete each result's independent continuation chain. Fetch every unique detail record. If any request needed for an incident is missing, its finding is `UNKNOWN` and no baseline receipt is verified.
3. Persist the source payload digest and advisory evidence. Preserve aliases, range events, withdrawn state, published/modified/retrieved dates, CVSS vector, fix events, and references. Query CISA/EPSS for the CVE alias independently.
4. Group active findings by advisory ID and exact affected version. A user selects one group as an incident; no cross-advisory aggregation is implied.
5. Create one scenario-specific `IncidentSource` per distinct advisory+package+exact-version tuple and connect every matching instance from all current snapshots.
6. Create one `ScenarioApplication` per current snapshot, count both selector sets, and run baseline `MSpaths` with `pathCount:1`, incoming typed edges, `maxLen=maxImportedDepth+3` (dependency depth plus application-root, scenario-use, and incident-match edges), and `resultLimit=sourceCount*applicationCount`.
7. Compare the returned source/application pair set to independent BFS on the same normalized edges. A mismatch sets `ERROR`, records both digests, and prevents plan creation.
8. Persist the baseline traversal on the incident only after all guards pass; clean up the scenario in `finally` and alert if cleanup fails.

No application with an `UNKNOWN` extraction/advisory state is omitted from the target selector. It makes the incident result `UNKNOWN`; exclusion requires an explicit new portfolio version and is visible in the receipt.

### 17.2 Proposed-fix evaluation

`evaluate-proposed-fix` accepts a discovered PR head SHA or a user-supplied repository ref. It resolves the ref once, records the immutable commit, fetches both files, and performs a complete independent Arborist extraction. It never applies a lockfile diff to the baseline graph.

For repository `R`, the evaluation scenario uses the proposed-fix snapshot for `R` and the current baseline snapshots for every other application. It recreates every selected incident source against exact matching instances across that complete scenario, verifies counts, and invokes native `MSpaths`. The outcome is set algebra over pair keys:

<pre>
removed    = baseline_pairs - proposed_fix_pairs
persistent = baseline_pairs ∩ proposed_fix_pairs
introduced = proposed_fix_pairs - baseline_pairs
unknown    = baseline or proposed-fix state is not VERIFIED_WITHIN_BOUNDS
</pre>

`changedPackageCount` is the symmetric difference of canonical `(location,name,version)` instance triples between the two complete snapshots. A proposed fix is eligible for planning only when its immutable identity, full extraction, exact incident-source mapping, selector cardinalities, and traversal are verified. Missing lockfile, inaccessible head, deleted PR, scope drift, or a new unknown source produces `UNKNOWN` and disables selection.

### 17.3 Coverage planner and final proof

The planner's universe is the verified baseline pair set. Each eligible proposed fix covers only its verified `removed` pairs. Mutually exclusive changes to the same repository are alternatives; the planner explores a bounded branch-and-bound state space ordered by uncovered-pair coverage, changed-package count, repository count, then stable key. If the bound is hit, `exhaustiveWithinBounds=false` and the UI says “best plan found within displayed search bounds,” never “minimum.”

Every proposed-fix outcome stores the selected-incident baseline pair digest and ordered current-snapshot keys it was evaluated against. A baseline job also authenticates and persists the operator's bounded advisory-backed package/version verification universe and its native baseline pair set. Every plan commits the selected baseline, verification universe, verification baseline, and snapshot keys into its canonical key. A current import atomically marks prior incidents unknown, proposed fixes unknown, and plans failed; verification recomputes the plan key and rejects any baseline, verification-universe, or proposed-fix binding mismatch. Historical rows remain auditable but cannot be promoted into a new receipt.

Prediction is not proof. On Verify, the worker re-resolves every selected immutable head (a different SHA is drift and fails), constructs a new combined scenario using all selected full snapshots plus unchanged baselines, rebuilds every incident source, validates selectors, and invokes one final native HydraDB `MSpaths`. It does not union individual outcomes. The final pair set and result state replace the prediction in the immutable receipt.

Before baseline, proposed-fix evaluation, or final receipt issuance, the worker performs a new exact-version OSV query for every selected advisory—even when the proposed graph no longer contains the affected package—follows bounded continuation, refetches a fresh detail record, and rejects unavailable, withdrawn, or no-longer-matching evidence. CISA KEV and FIRST EPSS may remain unavailable only as explicit `UNKNOWN` values with source-specific receipt limitations.

### 17.4 Required worker registrations

| Queue | Concurrency | Handler input | Terminal artifact |
|---|---:|---|---|
| `import-snapshot` | 2 | portfolio, repository, ref | immutable snapshot |
| `refresh-evidence` | 1 | portfolio version | advisories, findings, baseline incidents |
| `evaluate-proposed-fix` | 2 | incident, repository, immutable ref/origin | full snapshot and outcome |
| `verify-plan` | 1 | plan digest and expected input digests | canonical receipt |
| `cleanup-scenario` | 1 | strict scenario key | audit event |

Worker startup must register all five queues. Any missing registration fails readiness. `refresh-evidence` and `verify-plan` take advisory locks per portfolio/incident so two jobs cannot publish competing current results. Manual overrides affect which eligible proposed fixes enter a plan; they never waive a proof guard.

### 17.5 Repository methods required by lifecycle

`src/db/repository.ts` above contains the typed lifecycle, plan, job, audit, and source-cache methods used by the API and worker. Every write receives an exact Drizzle insert type; no domain object is spread into a database row. Updates to mutable workflow rows use an expected prior state in `WHERE` and assert one affected row. Receipt rows and snapshot identity/hash columns are insert-only; only the portfolio-membership `role` projection may move from current to historical.

## 18. Demo and proof scripts

### 18.1 Authentic seed script

#### File: `scripts/seed-demo.ts`
[UNVERIFIED] — Requires source availability and the complete lifecycle handlers described above

```typescript
// File: scripts/seed-demo.ts
import { readFile } from "node:fs/promises";

interface FrozenRepository {
  repository: string;
  baseline_commit: string;
  baseline_lock_sha256: string;
}

type SeedImport = (input: {
  jobId: string;
  portfolioKey: string;
  kind: "github";
  repository: string;
  ref: string;
  expectedLockfileSha256: string;
}) => Promise<{ lockfileSha256: string; snapshotKey: string }>;

async function loadImportHandler(): Promise<SeedImport> {
  const modulePath = ["..", "src", "jobs", "pipeline"].join("/");
  const moduleValue = await import(modulePath) as Record<string, unknown>;
  if (typeof moduleValue.handleImport !== "function") throw new Error("SEED_PIPELINE_UNAVAILABLE");
  return moduleValue.handleImport as SeedImport;
}

async function run(): Promise<void> {
  const handleImport = await loadImportHandler();
  const evidence = JSON.parse(await readFile("docs/evidence/2026-08-19-pre-forge-runtime.json", "utf8")) as {
    corpus: { repositories: FrozenRepository[] };
  };
  for (const [index, item] of evidence.corpus.repositories.entries()) {
    const result = await handleImport({
      jobId: `seed-baseline-${index}`,
      portfolioKey: "verified-public-corpus",
      kind: "github",
      repository: item.repository,
      ref: item.baseline_commit,
      expectedLockfileSha256: item.baseline_lock_sha256,
    });
    if (result.lockfileSha256 !== item.baseline_lock_sha256) throw new Error(`FROZEN_LOCKFILE_DRIFT:${item.repository}`);
    process.stdout.write(`${JSON.stringify({ repository: item.repository, snapshotKey: result.snapshotKey })}\n`);
  }
  process.stdout.write(`${JSON.stringify({ event: "seed-import-complete", next: "pnpm proof" })}\n`);
}

run().catch((error) => {
  process.stderr.write(`${JSON.stringify({ event: "seed-failed", error: String(error) })}\n`);
  process.exit(1);
});
```

The seed script only imports immutable baselines and rejects any returned lockfile hash that differs from the frozen evidence. `pnpm proof` performs evidence refresh, baseline traversal, three historical proposed-fix imports, planning, and final verification. The seed script never inserts expected counts or a receipt directly.

### 18.2 Reproducible proof runner

#### File: `scripts/proof.ts`
[UNVERIFIED] — Uses the complete production lifecycle handlers; frozen-corpus assertions are mandatory

```typescript
// File: scripts/proof.ts
import { readFile, writeFile } from "node:fs/promises";
import { canonicalDigest } from "../src/domain/canonical";
import type { CanonicalReceipt } from "../src/domain/types";

interface ProofClient {
  reproduceFrozenCorpus(): Promise<{ receipt: CanonicalReceipt; observed: {
    applications: number;
    packageInstances: number;
    packageEdges: number;
    bfsPairDigest: string;
    selectedFinalPairs: number;
    portfolioBaselinePairs: number;
    portfolioFinalPairs: number;
    lockfileSha256: string[];
    applicationOsvIds: string[];
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
  await writeFile(`artifacts/receipt-${digest}.json`, JSON.stringify(result.receipt, null, 2));
  process.stdout.write(`${JSON.stringify({ status: "PASS", digest, observed: result.observed })}\n`);
}

run().catch((error) => {
  process.stderr.write(`${JSON.stringify({ status: "FAIL", error: String(error) })}\n`);
  process.exit(1);
});
```

The frozen JSON's historical field name is read as-is because changing evidence would invalidate its digest; it is never rendered to users. `reproduceFrozenCorpus` is the pipeline's typed orchestration export and calls the same production handlers as the API.

## 19. Test file specifications

#### File: `tests/domain.test.ts`
[VERIFIED] — Assertions map directly to pure domain contracts

```typescript
// File: tests/domain.test.ts
import { describe, expect, it } from "vitest";
import { canonicalDigest, canonicalJson } from "../src/domain/canonical";
import { solveCoveragePlan } from "../src/domain/planner";

describe("canonical truth", () => {
  it("sorts keys and preserves array order", () => {
    expect(canonicalJson({ z: 1, a: [2, 1] })).toBe('{"a":[2,1],"z":1}');
    expect(canonicalDigest({ a: 1 })).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("coverage planner", () => {
  it("uses deterministic tie-breaking and reports bounded exhaustiveness", () => {
    const makeChoice = (key: string, repository: string, removed: string[]) => ({
      fix: { key, repository, origin: "github-commit" as const, manifestSha256: "a".repeat(64), lockfileSha256: "b".repeat(64), snapshotKey: key, changedPackageCount: 1, state: "VERIFIED_WITHIN_BOUNDS" as const },
      outcome: { proposedFixKey: key, removed, persistent: [], introduced: [], unknown: [],
        otherFindings: { removed: [], persistent: [], introduced: [] }, changedPackageCount: 1 },
    });
    const plan = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a", "b"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["pkg@1"], verificationBaselinePairKeys: ["a", "b"], scopes: ["production"], productionPairs: new Set(["a", "b"]), choices: [
      makeChoice("fix-b", "r2", ["b"]), makeChoice("fix-a", "r1", ["a"]),
    ], constraints: { requiredFixKeys: [], forbiddenFixKeys: [] }, maxStates: 100 });
    expect(plan.proposedFixKeys).toEqual(["fix-a", "fix-b"]);
    expect(plan.predictedResidualPairKeys).toEqual([]);
    expect(plan.exhaustiveWithinBounds).toBe(true);
    const rebound = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a", "b"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["other@2"], verificationBaselinePairKeys: ["a", "b"], scopes: ["production"], productionPairs: new Set(["a", "b"]),
      choices: [makeChoice("fix-b", "r2", ["b"]), makeChoice("fix-a", "r1", ["a"])],
      constraints: { requiredFixKeys: [], forbiddenFixKeys: [] }, maxStates: 100 });
    expect(rebound.key).not.toBe(plan.key);
    const scopeRebound = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a", "b"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["pkg@1"], verificationBaselinePairKeys: ["a", "b"], scopes: ["development"],
      productionPairs: new Set(["a", "b"]), choices: [makeChoice("fix-b", "r2", ["b"]), makeChoice("fix-a", "r1", ["a"])],
      constraints: { requiredFixKeys: [], forbiddenFixKeys: [] }, maxStates: 100 });
    expect(scopeRebound.key).not.toBe(plan.key);
  });

  it("never lets a cheaper constraint-ineligible state dominate a required fix", () => {
    const choice = { fix: { key: "required-fix", repository: "r1", origin: "github-commit" as const,
      manifestSha256: "a".repeat(64), lockfileSha256: "b".repeat(64), snapshotKey: "required-fix",
      changedPackageCount: 4, state: "VERIFIED_WITHIN_BOUNDS" as const }, outcome: {
      proposedFixKey: "required-fix", removed: [], persistent: ["a"], introduced: [], unknown: [],
      otherFindings: { removed: [], persistent: [], introduced: [] }, changedPackageCount: 4 } };
    const plan = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["pkg@1"], verificationBaselinePairKeys: ["a"], scopes: ["production"], productionPairs: new Set(["a"]),
      choices: [choice], constraints: { requiredFixKeys: ["required-fix"], forbiddenFixKeys: [] }, maxStates: 10 });
    expect(plan.proposedFixKeys).toEqual(["required-fix"]);
  });

  it("removes forbidden proposed fixes before dominance pruning", () => {
    const choice = (key: string) => ({ fix: { key, repository: "r1", origin: "github-commit" as const,
      manifestSha256: "a".repeat(64), lockfileSha256: "b".repeat(64), snapshotKey: key,
      changedPackageCount: 1, state: "VERIFIED_WITHIN_BOUNDS" as const }, outcome: {
      proposedFixKey: key, removed: ["a"], persistent: [], introduced: [], unknown: [],
      otherFindings: { removed: [], persistent: [], introduced: [] }, changedPackageCount: 1 } });
    const plan = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["pkg@1"], verificationBaselinePairKeys: ["a"], scopes: ["production"], productionPairs: new Set(["a"]),
      choices: [choice("a-forbidden"), choice("z-valid")],
      constraints: { requiredFixKeys: [], forbiddenFixKeys: ["a-forbidden"] }, maxStates: 10 });
    expect(plan.proposedFixKeys).toEqual(["z-valid"]);
  });
});
```

#### File: `tests/hydradb.contract.test.ts`
[UNVERIFIED] — Must run against the pinned real container; never mocked

```typescript
// File: tests/hydradb.contract.test.ts
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
  identity: { repository: "fixture/native-direction", commitSha: "a".repeat(40), manifestBlobSha: "upload", lockfileBlobSha: "upload",
    manifestSha256: "b".repeat(64), lockfileSha256: "c".repeat(64), manifestBytes: 128, lockfileBytes: 512,
    apiVersion: "local-upload-v1", source: "upload", sourceStamps: [], retrievedAt: "2026-08-19T00:00:00.000Z" },
  packages: [{ key: packageKey, snapshotKey, location: "node_modules/minimist", name: "minimist", version: "1.2.5", purl: "pkg:npm/minimist@1.2.5" }],
  applicationEdges: [{ key: `${snapshotKey}:application->${packageKey}:production`, snapshotKey, fromKey: `application:${snapshotKey}`, toKey: packageKey, scope: "production" }],
  edges: [], rootPackageKeys: [packageKey], extractionSha256: canonicalDigest({ packageKey }),
};
const fixedSnapshotKey = canonicalDigest({ fixture: finalScenarioKey });
const fixedPackageKey = `${fixedSnapshotKey}:node_modules/minimist:minimist@1.2.6`;
const fixedSnapshot: ExtractedSnapshot = {
  ...snapshot,
  key: fixedSnapshotKey,
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
    await writeSnapshot(snapshot);
    await writeApplicationRoot(snapshot);
    await writeScenario({ scenarioKey, portfolioKey: scenarioKey,
      applications: [{ applicationKey: snapshot.identity.repository, snapshotKey }],
      sources: [{ sourceKey: "GHSA-fixture:minimist@1.2.5", selector: "source-fixture", packageKeys: [packageKey] }] });
    const expected = canonicalDigest([`GHSA-fixture:minimist@1.2.5:${snapshot.identity.repository}`]);
    const bounds = traversalBounds({ sourceSelectors: ["source-fixture"], targetSelector: scenarioKey,
      scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest: expected });
    const result = await runTraversal(bounds);
    expect(result.query).toContain("CALL algo.MSpaths");
    expect(result.state).toBe("VERIFIED_WITHIN_BOUNDS");
    expect(result.pairs).toHaveLength(1);
    expect(result.cursorPresent).toBe(false);
    expect(result.readEpoch).toBeGreaterThanOrEqual(0);
    expect(result.bookmark).not.toBe("");
    const mismatched = await runTraversal({ ...bounds, expectedPairKeyDigest: canonicalDigest([]) });
    expect(mismatched.state).toBe("PARTIAL");
    expect(mismatched.refusalReasons).toContain("BFS_PAIR_SET_MISMATCH");
    const wrongCardinality = await runTraversal({ ...bounds, matchedTargetCount: 2, resultLimit: 2 });
    expect(wrongCardinality.state).toBe("PARTIAL");
    expect(wrongCardinality.refusalReasons).toContain("TARGET_CARDINALITY_MISMATCH");
    expect(() => traversalBounds({ sourceSelectors: ["source-fixture", "source-fixture"], targetSelector: scenarioKey,
      scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest: expected })).toThrow("SOURCE_SELECTOR_SET_INVALID");
  });
  it("proves a combined fixed snapshot with scenario-edge readback and zero selected pairs", async () => {
    await writeSnapshot(fixedSnapshot);
    await writeApplicationRoot(fixedSnapshot);
    await writeScenario({ scenarioKey: finalScenarioKey, portfolioKey: finalScenarioKey,
      applications: [{ applicationKey: fixedSnapshot.identity.repository, snapshotKey: fixedSnapshotKey }],
      sources: [{ sourceKey: "GHSA-fixture:minimist@1.2.5", selector: "source-fixture-final", packageKeys: [] }] });
    const bounds = traversalBounds({ sourceSelectors: ["source-fixture-final"], targetSelector: finalScenarioKey,
      scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest: canonicalDigest([]) });
    const result = await runTraversal(bounds);
    expect(result.query).toContain("CALL algo.MSpaths");
    expect(result.state).toBe("VERIFIED_WITHIN_BOUNDS");
    expect(result.pairs).toEqual([]);
  });
  it("fails closed when the native service is unavailable", async () => {
    const original = process.env.HYDRADB_HTTP_URL;
    process.env.HYDRADB_HTTP_URL = "http://127.0.0.1:1";
    try {
      const bounds = traversalBounds({ sourceSelectors: ["source-outage"], targetSelector: "outage-target",
        scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest: canonicalDigest([]) });
      await expect(runTraversal(bounds)).rejects.toThrow();
    } finally {
      process.env.HYDRADB_HTTP_URL = original;
    }
  });
  it("refuses cursor, duplicate, cardinality, metadata, and endpoint mutations", () => {
    const sourceKey = "GHSA-fixture:minimist@1.2.5";
    const applicationKey = "fixture/application";
    const expectedPairKeyDigest = canonicalDigest([`${sourceKey}:${applicationKey}`]);
    const bounds = traversalBounds({ sourceSelectors: ["mutation-source"], targetSelector: "mutation-target",
      scopes: ["production"], maxImportedDepth: 1, targetCount: 1, expectedPairKeyDigest });
    const path = { nodes: [
      { properties: { source_key: sourceKey, source_selector: "mutation-source", key: "source" } },
      { properties: { application_key: applicationKey, portfolio_key: "mutation-target", key: "target" } },
    ], relationships: [{ type: "PROD_DEPENDS_ON" }] };
    const complete = { records: [{ path }], read_epoch: 9, bookmark: "fixture-bookmark" };
    expect(validateTraversalResponse(bounds, { sources: 1, targets: 1 }, complete).state).toBe("VERIFIED_WITHIN_BOUNDS");
    expect(validateTraversalResponse(bounds, { sources: 1, targets: 1 }, { ...complete, next_cursor: "cursor" }).refusalReasons).toContain("CURSOR_PRESENT");
    const duplicated = validateTraversalResponse(bounds, { sources: 1, targets: 1 },
      { ...complete, records: [{ path }, { path }] }).refusalReasons;
    expect(duplicated).toEqual(expect.arrayContaining(["DUPLICATE_PAIR_ROWS", "RESULT_BOUND_EXCEEDED"]));
    expect(validateTraversalResponse(bounds, { sources: 0, targets: 1 }, complete).refusalReasons).toContain("SOURCE_CARDINALITY_MISMATCH");
    expect(validateTraversalResponse(bounds, { sources: 1, targets: 0 }, complete).refusalReasons).toContain("TARGET_CARDINALITY_MISMATCH");
    expect(validateTraversalResponse(bounds, { sources: 1, targets: 1 }, { records: [{ path }] }).refusalReasons)
      .toEqual(expect.arrayContaining(["READ_EPOCH_MISSING", "BOOKMARK_MISSING"]));
    const wrong = structuredClone(path);
    wrong.nodes[1]!.properties.portfolio_key = "cross-scenario";
    expect(() => validateTraversalResponse(bounds, { sources: 1, targets: 1 },
      { ...complete, records: [{ path: wrong }] })).toThrow("UNEXPECTED_TARGET_ENDPOINT");
  });
});
```

The suite cannot skip: missing HydraDB configuration throws before the native query. The contract job runs in an isolated namespace so its immutable fixture snapshot can be discarded with the container.

#### File: `tests/corpus.integration.test.ts`
[UNVERIFIED] — Requires GitHub, HydraDB, OSV-Scanner, and frozen evidence

```typescript
// File: tests/corpus.integration.test.ts
import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Agent, MockAgent, setGlobalDispatcher } from "undici";
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "../src/domain/canonical";
import { extractSnapshot } from "../src/integrations/arborist";
import { enrichCve } from "../src/integrations/enrichment";
import { discoverProposedFixes, fetchRepositoryFile } from "../src/integrations/github";
import { assertAdvisoryActive, fetchAdvisory, queryExactCoordinate, queryExactPackages, refreshSelectedAdvisory } from "../src/integrations/osv";

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
        manifestBytes: manifest.length, lockfileBytes: lockfile.length, apiVersion: "fixture", source: "upload",
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
```

#### File: `tests/adversarial.integration.test.ts`
[UNVERIFIED] — Runs the authentic lifecycle, API boundary, immutable store, drift, receipt, and SARIF refusal gates

```typescript
// File: tests/adversarial.integration.test.ts
import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";
import { canonicalDigest, canonicalJson } from "../src/domain/canonical";
import { finalizeReceipt } from "../src/domain/receipt";
import type { CanonicalReceipt } from "../src/domain/types";
import { listPortfolioSnapshots, loadIncidentBundle, saveReceipt, saveSnapshot } from "../src/db/repository";
import { assertProposedFixBytes, handleImport, handleRefreshEvidence, handleVerifyPlanRequest, reproduceFrozenCorpus } from "../src/jobs/pipeline";
import { GET, POST } from "../src/app/api/[...path]/route";

type Proof = Awaited<ReturnType<typeof reproduceFrozenCorpus>>;
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
    method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const handler = (method === "GET" ? GET : POST) as Handler;
  return handler(request, {
    params: Promise.resolve({ path: path.split("/") }),
  });
}

async function expectEnvelope(response: Response, statuses: number[]): Promise<void> {
  expect(statuses).toContain(response.status);
  if (response.ok) return;
  const value = await response.json() as Record<string, unknown>;
  expect(value).toMatchObject({ code: expect.any(String), state: expect.stringMatching(/PARTIAL|UNKNOWN|ERROR/),
    message: expect.any(String), requestId: expect.any(String), retryable: expect.any(Boolean) });
}

beforeAll(async () => { proof = await reproduceFrozenCorpus(); }, 300_000);

describe("mandatory false-clean gates", () => {
  it("exercises all sixteen route contracts with authentic identities and failure envelopes", async () => {
    const planKey = proof.receipt.plan.key;
    const receiptDigest = canonicalDigest(proof.receipt);
    const cases: Array<["GET" | "POST", string, unknown?, number[]?]> = [
      ["GET", "health", undefined, [200]], ["GET", "incidents", undefined, [200]],
      ["GET", `incidents/${proof.receipt.incidentKey}`, undefined, [200]],
      ["POST", "imports", {}, [400]], ["GET", "jobs/missing-job", undefined, [404]],
      ["POST", "imports", { kind: "upload", repository: "fixture/repo",
        manifestBase64: "***", lockfileBase64: "***" }, [422]],
      ["POST", `incidents/${proof.receipt.incidentKey}/traversals`, {}, [400]],
      ["GET", `incidents/${proof.receipt.incidentKey}/impact`, undefined, [200]],
      ["POST", "incidents/missing-incident/proposed-fixes/discover", {}, [409]],
      ["POST", `incidents/${proof.receipt.incidentKey}/proposed-fixes`, {}, [400]],
      ["GET", `incidents/${proof.receipt.incidentKey}/proposed-fixes`, undefined, [200]],
      ["POST", `incidents/${proof.receipt.incidentKey}/plans`, { proposedFixKeys: proof.receipt.plan.proposedFixKeys,
        requiredFixKeys: [], forbiddenFixKeys: [] }, [201]],
      ["POST", `plans/${planKey}/verify`, { expectedPlanDigest: "0".repeat(64) }, [409]],
      ["GET", `plans/${planKey}`, undefined, [200]],
      ["GET", `receipts/${receiptDigest}`, undefined, [200]],
      ["GET", `receipts/${receiptDigest}/sarif`, undefined, [200]], ["GET", "system", undefined, [200]],
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
    expect(() => assertProposedFixBytes({ manifestSha256: "a", lockfileSha256: "b" },
      { manifestSha256: "a", lockfileSha256: "changed" })).toThrow("PROPOSED_FIX_BYTES_DRIFT");
  });

  it("rejects pair tampering and blocks SARIF for a partial receipt", async () => {
    const tampered = { ...proof.receipt, final: { ...proof.receipt.final,
      pairs: proof.receipt.final.pairs.slice(1) } };
    expect(() => finalizeReceipt(tampered)).toThrow("PAIR_DIGEST_MISMATCH");
    const partialInput: CanonicalReceipt = { ...proof.receipt, resultState: "PARTIAL",
      plan: { ...proof.receipt.plan, state: "FAILED" },
      final: { ...proof.receipt.final, state: "PARTIAL", refusalReasons: ["ADVERSARIAL_PARTIAL"] } };
    const partial = finalizeReceipt(partialInput);
    await saveReceipt(partial.digest, partial.receipt, partial.json);
    await expectEnvelope(await api("GET", `receipts/${partial.digest}/sarif`), [422]);
  });

  it("rejects source-universe, scope, and current-snapshot drift", async () => {
    const bundle = await loadIncidentBundle(proof.receipt.incidentKey);
    const selectedCoordinate = `${proof.receipt.advisories[0]!.packageName}@${proof.receipt.advisories[0]!.exactVersion}`;
    await handleRefreshEvidence({ jobId: "adversarial-source-drift", incidentKey: proof.receipt.incidentKey,
      scopes: bundle.incident.scopes, sourceFindingIds: bundle.incident.sourceFindingKeys,
      verificationSourceCoordinates: [selectedCoordinate] });
    await expect(handleVerifyPlanRequest({ jobId: "adversarial-stale-source", planKey: proof.receipt.plan.key,
      expectedPlanDigest: proof.receipt.plan.key })).rejects.toThrow("PLAN_VERIFICATION_UNIVERSE_STALE");
    await handleRefreshEvidence({ jobId: "adversarial-source-restore", incidentKey: proof.receipt.incidentKey,
      scopes: proof.receipt.plan.scopes, sourceFindingIds: bundle.incident.sourceFindingKeys,
      verificationSourceCoordinates: proof.receipt.plan.verificationSourceCoordinates });
    await handleRefreshEvidence({ jobId: "adversarial-scope-drift", incidentKey: proof.receipt.incidentKey,
      scopes: ["production"], sourceFindingIds: bundle.incident.sourceFindingKeys,
      verificationSourceCoordinates: bundle.incident.verificationSourceCoordinates });
    await expect(handleVerifyPlanRequest({ jobId: "adversarial-stale-plan", planKey: proof.receipt.plan.key,
      expectedPlanDigest: proof.receipt.plan.key })).rejects.toThrow(/PLAN_(BASELINE|SCOPE|VERIFICATION_UNIVERSE)_STALE/);
    const evidence = JSON.parse(await readFile("docs/evidence/2026-08-19-pre-forge-runtime.json", "utf8"));
    const row = evidence.corpus.repositories[0];
    await handleImport({ jobId: "adversarial-current-snapshot", portfolioKey: proof.receipt.portfolioKey, role: "current",
      kind: "github", repository: row.repository, ref: row["candidate_commit"],
      expectedLockfileSha256: row["candidate_lock_sha256"] });
    await expect(handleVerifyPlanRequest({ jobId: "adversarial-stale-snapshot", planKey: proof.receipt.plan.key,
      expectedPlanDigest: proof.receipt.plan.key })).rejects.toThrow("BASELINE_NOT_VERIFIED");
  }, 300_000);
});
```

#### File: `tests/demo.e2e.spec.ts`
[UNVERIFIED] — Requires the running authentic stack and receipt fixture

```typescript
// File: tests/demo.e2e.spec.ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { canonicalDigest } from "../src/domain/canonical";
import { reproduceFrozenCorpus } from "../src/jobs/pipeline";

interface DemoFixture {
  incidentKey: string;
  planKey: string;
  portfolioKey: string;
  receiptDigest: string;
  repositories: string[];
}

let fixture: DemoFixture;

test.beforeAll(async () => {
  const result = await reproduceFrozenCorpus();
  fixture = {
    incidentKey: result.receipt.incidentKey,
    planKey: result.receipt.plan.key,
    portfolioKey: result.receipt.portfolioKey,
    receiptDigest: canonicalDigest(result.receipt),
    repositories: result.receipt.inputs.map((input) => input.repository),
  };
});

test.afterEach(async ({ page }) => {
  const violations = (await new AxeBuilder({ page }).analyze()).violations
    .filter((item) => item.impact === "serious" || item.impact === "critical");
  expect(violations).toEqual([]);
});

test("F01 opens the action-first incident queue", async ({ page }) => {
  await page.goto("/incidents?role=appsec");
  await expect(page.getByRole("heading", { name: "What requires action now?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /GHSA-xvch-5gv4-984h/ })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "docs/evidence/screenshots/incidents-desktop.png", fullPage: true });
});

test("F02 shows immutable repository identities", async ({ page }) => {
  await page.goto(`/portfolio?portfolio=${fixture.portfolioKey}&role=appsec`);
  for (const repository of fixture.repositories) await expect(page.getByRole("heading", { name: repository })).toBeVisible();
  await expect(page.getByText(fixture.receiptDigest)).toHaveCount(0);
  await page.goto("/system?role=appsec");
  await expect(page.getByRole("heading", { name: "System" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "HydraDB OSS" })).toBeVisible();
  await expect(page.getByText("Single operator; graph ports private")).toBeVisible();
});

test("F03 shows the CampaignRadius baseline and native evidence", async ({ page }) => {
  await page.goto(`/incidents/${fixture.incidentKey}/impact?role=appsec`);
  await expect(page.getByRole("heading", { name: "Portfolio impact" })).toBeVisible();
  await expect(page.getByText("3", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/CALL algo.MSpaths/)).toBeAttached();
});

test("F04 shows only real proposed-fix outcomes", async ({ page }) => {
  await page.goto(`/incidents/${fixture.incidentKey}/proposed-fixes?role=appsec`);
  await expect(page.getByRole("heading", { name: "Proposed fixes" })).toBeVisible();
  for (const repository of fixture.repositories) await expect(page.getByRole("heading", { name: repository })).toBeVisible();
});

test("F05 creates a bounded coverage plan", async ({ page }) => {
  await page.goto(`/incidents/${fixture.incidentKey}/plan?role=appsec`);
  await expect(page.getByRole("checkbox").first()).toBeVisible();
  for (const checkbox of await page.getByRole("checkbox").all()) if (await checkbox.isEnabled()) await checkbox.check();
  await page.getByRole("button", { name: "Create bounded plan" }).click();
  await expect(page.getByRole("link", { name: "Verify combined plan" })).toBeVisible();
});

test("F06 runs one fresh combined HydraDB proof", async ({ page }) => {
  await page.goto(`/plans/${fixture.planKey}/verify?role=appsec`);
  await page.getByRole("button", { name: "Run final HydraDB proof" }).click();
  await expect(page.getByRole("link", { name: "Open immutable receipt" })).toBeVisible({ timeout: 180_000 });
});

test("F07 renders and exports the canonical receipt", async ({ page }) => {
  await page.goto(`/proof/${fixture.receiptDigest}?role=appsec`);
  await expect(page.getByText(fixture.receiptDigest)).toBeVisible();
  await expect(page.getByRole("link", { name: "Download receipt.json" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download results.sarif" })).toBeVisible();
});

test("F08 changes role projection without losing context", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const url = `/incidents/${fixture.incidentKey}/impact?role=appsec&application=nodekb`;
  await page.goto(url);
  const appsecUrl = page.url();
  await page.getByRole("button", { name: "Leader" }).click();
  await expect(page.getByText(/Leader view/)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`incidents/${fixture.incidentKey}/impact.*application=nodekb.*role=leader|incidents/${fixture.incidentKey}/impact.*role=leader.*application=nodekb`));
  const leaderUrl = page.url();
  await page.goBack();
  await expect(page).toHaveURL(appsecUrl);
  await page.goForward();
  await expect(page).toHaveURL(leaderUrl);
  await page.keyboard.press("Shift+Tab");
  await page.getByRole("button", { name: "Developer" }).click();
  await expect(page.getByText(/Developer view · nodekb/)).toBeVisible();
  await page.goto(`/proof/${fixture.receiptDigest}?role=developer`);
  await page.screenshot({ path: "docs/evidence/screenshots/proof-mobile.png", fullPage: true });
});

test("refuses offline job data and a missing receipt", async ({ page }) => {
  await page.route("**/api/jobs/**", async (route) => route.abort("internetdisconnected"));
  await page.goto("/jobs/offline-fixture?role=appsec");
  await expect(page.getByRole("alert")).toContainText("Job status is unavailable.");
  await page.unroute("**/api/jobs/**");
  await page.goto(`/proof/${"0".repeat(64)}?role=appsec`);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
```

These eight tests map one-to-one to PRD F01–F08 and bootstrap only through the authentic production proof pipeline. Failure-state, mutation, keyboard-depth, and responsive matrix cases remain separate mandatory Build gates in Section 15.3; no action claiming a fresh graph result uses intercepted or fabricated network data.

## 20. Domain guide and submission artifact plan

### 20.1 `docs/DOMAIN-GUIDE.md`

Build creates this before domain implementation. It defines: npm package instance versus package/version; resolved graph and four scope edges; advisory range/alias/withdrawn/CVSS; KEV and EPSS semantics; dependency-level potential exposure; source/application pair; shortest witness; CampaignRadius baseline; proposed-fix complete snapshot; coverage prediction versus combined proof; `VERIFIED_WITHIN_BOUNDS`/`PARTIAL`/`UNKNOWN`/`ERROR`; receipt provenance; and every forbidden overclaim. It includes the exact baseline and final OpenCypher templates plus a glossary mapping “proposed fix” as the only user-facing term.

### 20.2 Submission tree

<!-- [CRITIQUE E-1] Separate mandatory repository-root compliance files from supplemental submission evidence. -->
<pre>
README.md                       # setup plus explicit “How HydraDB is used”
LICENSE                         # open-source project license
THIRD_PARTY_NOTICES.md          # third-party attribution
submission/
├── README.md                 # setup, authentic proof command, limitations
├── SUBMISSION-CHECKLIST.md   # repo/video/form fields and measured duration
├── DEMO-SCRIPT.md            # eight timed scenes and fallback rules
├── PROOF.md                  # receipt digest, corpus hashes, HydraDB query evidence
├── ARCHITECTURE.md           # concise diagram and load-bearing integration
├── SARIF-SAMPLE.json         # generated from final receipt
├── receipt.json              # generated, canonical, digest-named
├── screenshots/              # desktop/mobile actual app only
└── video/                    # final demo link and captions
</pre>

Generated submission artifacts are never authored into product truth. Each records the git SHA, container digests, source hashes, run timestamp, and receipt digest. Any historical fallback is watermarked “historical verified run” in video and screenshots.

### 20.3 Track strategy

<!-- [CRITIQUE E-2] Correct the competition classification without changing product scope. -->
HydraCut enters **Track 02-A — Supply Chain Blast Radius** as its single project track and separately targets the **Best Use of HydraDB** award. No secondary project track is claimed. The judge path demonstrates that self-hosted HydraDB, explicit OpenCypher, and native `MSpaths` are irreplaceable at both baseline and final combined verification; PostgreSQL only owns workflow/provenance and cannot substitute for graph truth.
