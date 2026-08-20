# HydraCut powered by CampaignRadius: Product Requirements Document

**Hackathon:** Hack Hydra  
**Track:** Track 02-A, Repositories, Dependencies, and Code as Graphs  
**Deadline:** 2026-08-20 23:59 PT  
**Version:** Forge V1  
**Status:** Execution-ready product specification; no implementation has started

## Emergency Mode Notice: zero mocked product components

The timeline is under two calendar days. The P0 demo path is therefore narrow, but every visible result is real. No graph result, repository, vulnerability, proposed fix, count, proof receipt, or fallback state may be mocked. Features outside the real P0 path are deferred, not stubbed.

P0 includes the frozen three-repository corpus, one public exact-commit import, action-first incident command, native baseline traversal, authentic proposed-fix review, coverage-based plan selection, final native combined traversal, and proof receipt. Private GitHub, repository writes, automatic lockfile generation, multi-ecosystem scanning, multi-user tenancy, and function reachability are excluded.

---

## 1. Project overview

### 1.1 One-line description

HydraCut shows an AppSec responder exactly which applications depend on vulnerable package versions, then proves whether real proposed fixes remove that exposure from the fully resolved portfolio graph.

### 1.2 Problem statement

Security teams receive dependency alerts repository by repository, but a live incident is a portfolio decision: what needs action now, which applications are affected, which real pull requests cover them, and whether the combined plan actually removes the selected exposure. Generic blast-radius dashboards and advisory lists cannot prove the outcome of a proposed portfolio fix.

The frozen correctness corpus demonstrates why the distinction matters. It contains 3 authentic repositories, 1,742 package instances, 1,253 unique exact versions, 2,939 dependency edges, and 105 exact versions with current OSV matches. Three selected advisory-backed sources reach all three applications for 9 baseline source-to-application pairs. After the three authentic minimist updates, the selected minimist incident has zero residual pairs, while six pairs from two other known vulnerable versions remain.

### 1.3 Solution

CampaignRadius imports immutable npm lockfile snapshots, attaches authoritative vulnerability evidence, and uses self-hosted HydraDB `algo.MSpaths` to compute bounded source-to-application pairs. HydraCut discovers existing public dependency-update pull requests or accepts a real commit, branch resolved to a commit, or uploaded lockfile pair. It reconstructs each complete proposed dependency state, evaluates transparent application coverage, selects a bounded portfolio plan, and materializes one combined scenario. A second native `algo.MSpaths` traversal produces the final proof receipt.

The product never says an application is safe. It reports `VERIFIED_WITHIN_BOUNDS`, `PARTIAL`, `UNKNOWN`, or `ERROR`, preserves source freshness and traversal bounds, and refuses verified language when any required evidence or completeness gate fails.

### 1.4 Winning argument

Scanners identify vulnerable dependencies; HydraCut proves portfolio remediation outcomes. The judge sees one authentic baseline graph answer and one authentic final proposed-fix graph answer, both computed by native HydraDB traversal. Removing HydraDB removes the exposure result and the remediation proof.

### 1.5 Why this wins

| Judging criterion | How HydraCut excels | Judge-visible evidence |
|---|---|---|
| Technical execution | Deterministic lockfile extraction, typed graph ingestion, durable jobs, strict completeness checks, and reproducible receipts | Frozen corpus round trip and final receipt digest |
| HydraDB and graph-native approach | Native `algo.MSpaths` is required for baseline and final combined verification | Raw OpenCypher, read epoch, bookmark, timing, pair result |
| Product completeness and usability | Action-first AppSec queue, role projections, clear proposed-fix workflow, accessible evidence disclosure | Complete three-minute command flow |
| Quality of results | Exact package identity, OSV ranges and freshness, KEV, EPSS, CVSS, scope, depth, provenance, and fail-closed states | Evidence drawer and machine receipt |
| Originality | Proof-carrying portfolio remediation over real resolved proposed-fix states, not generic blast radius or graph cuts | Before/after native traversal and remaining-risk disclosure |

### 1.6 Product truth

HydraCut may claim:

- Exact `package@version` presence in a successfully reconstructed supported lockfile.
- OSV advisory match with retained record identity, affected ranges, aliases, severity vector, modified time, withdrawn state, and retrieval time.
- Dependency-level potential exposure for source-to-application pairs within displayed source, target, relationship-scope, depth, and result bounds.
- One shortest witness returned for a reachable pair.
- A selected incident is removed, persistent, introduced, or unknown in an authentic proposed-fix graph.
- A final combined plan is verified within bounds only after the second native query passes every completeness gate.

HydraCut must not claim:

- Function or runtime exploitability.
- Active compromise or production deployment.
- Build, API, behavioral, or deployment safety of a proposed fix.
- Every possible dependency path when `pathCount` is one.
- Universal vulnerability completeness.
- `SAFE`, `CLEAN`, `NOT_AFFECTED`, or unqualified `FIXED`.

### 1.7 Users and jobs

| Role | Default question | Primary actions | Information density |
|---|---|---|---|
| AppSec incident commander | What requires action now? | Prioritize incident, inspect portfolio impact, select proposed fixes, verify plan, export proof | High evidence and coordination density |
| Application developer | What changed in my application and what must I do? | Inspect one repository, dependency witness, proposed-fix diff, remaining findings | Repository-focused |
| Engineering leader | What is blocked, covered, and still exposed? | Review portfolio totals, ownership gaps, verification status, aging | Aggregated with drill-down |

All three views read the same normalized data. Switching views preserves portfolio, incident, dependency-scope filter, selected application, selected proposed fixes, and open evidence context in the URL.

---

## 2. System architecture overview

### 2.1 Critical-path diagram

```text
Public exact commit / uploaded manifest+lockfile
                    |
                    v
        [Input + provenance validator]
                    |
                    v
       [Arborist virtual-tree extractor]
                    |
       exact package instances + typed edges
                    |
         +----------+-----------+
         |                      |
         v                      v
[Vulnerability evidence]   [HydraDB graph writer]
 OSV + KEV + EPSS                 |
         |                        v
         +--------------> [Baseline MSpaths]
                                  |
                        bounded pair matrix
                                  |
                +-----------------+----------------+
                |                                  |
                v                                  v
      [Action-first web UI]            [Proposed-fix discovery]
                                           GitHub PR / commit / upload
                                                    |
                                                    v
                                      [Full proposed graph extraction]
                                                    |
                                      [Coverage matrix + plan solver]
                                                    |
                                                    v
                                      [Combined thin HydraDB scenario]
                                                    |
                                                    v
                                         [Final native MSpaths]
                                                    |
                                                    v
                                  [Immutable receipt + SARIF export]
```

### 2.2 Components

| ID | Component | Type | Purpose | Key dependencies |
|---|---|---|---|---|
| C01 | Web command surface | Next.js application | Role-aware screens, BFF validation, job polling, downloads | React, TanStack Query, Zod |
| C02 | Durable worker | Node process | Executes import, evidence, graph, traversal, comparison, and receipt phases | pg-boss, domain services |
| C03 | Input provenance service | Domain service | Resolves immutable identities, hashes bytes, rejects unsafe inputs | GitHub client, SHA-256 |
| C04 | Dependency extractor | Domain service | Reconstructs npm lockfile v2/v3 topology without executing code | npm Arborist |
| C05 | Vulnerability intelligence service | Domain service | OSV matching and record detail plus KEV, EPSS, CVSS, freshness | OSV, CISA, FIRST |
| C06 | HydraDB graph adapter | Integration service | Typed ingest, selector counts, native `MSpaths`, cleanup, receipt metadata | HydraDB HTTP OpenCypher |
| C07 | Proposed-fix service | Domain service | Discovers or accepts real proposed fixes and validates complete states | GitHub, input service, extractor |
| C08 | Coverage planner | Deterministic domain service | Builds per-fix coverage, solves bounded constraints, requests final combined proof | Pair sets, proposed-fix metadata |
| C09 | Receipt and SARIF service | Domain service | Canonicalizes evidence, computes digest, stores immutable receipt, exports SARIF | PostgreSQL, crypto |
| C10 | Product store | PostgreSQL | Portfolios, snapshots, findings, jobs, cache, receipts, audit events | Drizzle, pg |
| C11 | Job queue | PostgreSQL-backed service | Durable phase execution, retry limits, cancellation, recovery | pg-boss |
| C12 | Observability and health | Cross-cutting service | Correlation logs, phase metrics, source freshness, health and readiness | Pino, health routes |

### 2.3 End-to-end data flow

1. The web process accepts only a GitHub owner/repository plus ref or an uploaded JSON manifest/lockfile pair.
2. The BFF validates size, media type, JSON shape, host allowlist, and intent, creates a portfolio/import record, and enqueues a durable job.
3. The worker resolves every mutable GitHub ref to a 40-character commit SHA before fetching bytes. It hashes both files and records response provenance.
4. Arborist `loadVirtual()` reconstructs the complete supported tree. Any malformed or partial tree ends the input with `ERROR`; no partial graph is written.
5. Exact package/version tuples are batch-queried against OSV. Detail records are normalized, enriched by CISA KEV and FIRST EPSS when a CVE alias exists, and stored with freshness metadata.
6. The graph adapter writes immutable snapshot nodes and exactly one typed relationship per dependency relation, verifies node/edge/root counts, then creates thin baseline scenario anchors.
7. `algo.MSpaths` computes one shortest witness per matched source-target pair under server-derived limits. The adapter validates selector cardinalities, cursor absence, duplicate-pair absence, and depth coverage.
8. The UI renders the pair matrix as truth and a bounded graph as explanation.
9. Proposed fixes are discovered from real public PRs or supplied as immutable commits or file pairs. Every full resolved state repeats steps 3 through 7.
10. The planner computes a transparent coverage matrix, applies constraints, and selects a plan. It never treats a fixed-version string or deleted graph node as a fix.
11. The graph adapter creates one combined thin scenario and reruns the same native query. Only this final result can set `VERIFIED_WITHIN_BOUNDS`.
12. The receipt service canonicalizes inputs, source snapshots, query, bounds, result pairs, classifications, runtime identity, epochs, bookmarks, timings, and limitations into an insert-only receipt.

### 2.4 Required removal test

The build must disable the HydraDB adapter and rerun the demo E2E test. Baseline impact and final plan verification must both fail with `HYDRADB_UNAVAILABLE`; neither may display cached, PostgreSQL-derived, or browser-derived exposure results. If either still renders as verified, the architecture fails the hackathon gate.

---

## 3. User flows

### Flow F01: Open incident command

1. A judge opens the product with the verified demo portfolio already imported by the idempotent seed process.
2. The first screen states “What requires action now?” and shows an incident queue ordered by visible factors: KEV membership, production exposure, EPSS, CVSS, affected applications, then verified-fix availability.
3. Every row shows evidence freshness and result state; no opaque composite score is displayed.
4. Selecting the minimist incident opens the incident workspace without losing role or scope filters.
5. If the demo portfolio is unavailable, the screen shows a blocking seed/health error rather than substitute data.

### Flow F02: Import authentic repository state

1. The operator chooses public GitHub and enters owner, repository, and ref, or uploads a manifest/lockfile pair.
2. The app previews allowed host, size cap, supported lockfile versions, and read-only behavior.
3. The job resolves the ref, records commit and hashes, reconstructs the dependency graph, obtains advisory evidence, writes HydraDB, and runs integrity checks.
4. The progress surface shows the current deterministic phase and per-repository result.
5. Any mutable identity, malformed input, partial extraction, source outage, or graph failure produces an explicit non-verified state and recovery action.

### Flow F03: Inspect baseline portfolio impact

1. The operator selects dependency scopes: production by default; development, optional, and peer are explicit additions.
2. CampaignRadius runs the baseline `MSpaths` traversal for the selected incident source set.
3. The screen shows source-to-application pairs, affected application count, direct/transitive status, minimum depth, and one shortest witness.
4. The evidence drawer exposes exact query, matched cardinalities, relationship types, `maxLen`, `pathCount`, `resultLimit`, epoch, bookmark, timing, and digest.
5. If depth or result completeness is unproven, the result changes to `PARTIAL` and verified language disappears.

### Flow F04: Discover or add a proposed fix

1. The operator opens Proposed Fixes from the active incident.
2. HydraCut lists only real public PRs whose bot/actor, branch, changed files, head SHA, and repository identity were observed.
3. The operator may instead add a branch, commit, or uploaded manifest/lockfile pair.
4. Mutable refs are resolved to immutable SHAs; the complete proposed dependency state is reconstructed and rescanned.
5. Each proposed fix shows applications covered, selected findings removed/persistent/introduced, changed package instances, evidence quality, and build-safety limitation.

### Flow F05: Build a portfolio fix plan

1. The operator reviews the coverage matrix: proposed fixes by application and selected exposure pair.
2. HydraCut filters mutually exclusive states and fixes with failed extraction or verification.
3. The deterministic planner minimizes residual selected-incident production pairs, then number of repositories changed, then package-instance churn, then stable proposed-fix key.
4. The operator may override the selection; every override is visible in the final receipt.
5. The product says “recommended plan within supplied proposed fixes and constraints,” never global optimum.

### Flow F06: Verify the final combined plan

1. The operator selects Verify plan.
2. The worker materializes one scenario application per portfolio repository, selecting the chosen proposed snapshot or unchanged baseline snapshot.
3. It creates scenario-specific incident anchors and match edges, verifies selector cardinality and isolation, then runs native `MSpaths`.
4. It compares baseline and final complete finding sets as removed, persistent, introduced, or unknown.
5. The UI may show “selected incident cleared within bounds” only when all refusal rules pass. It simultaneously shows other remaining exposure.

### Flow F07: Review and export proof

1. The operator opens the proof receipt from the verified plan.
2. Human Summary leads with scope, action, result state, and remaining risk.
3. Inputs, vulnerability sources, topology checks, baseline query, final query, proposed-fix evidence, result digest, and limitations are progressively disclosed.
4. The operator downloads canonical `receipt.json` or `results.sarif`.
5. A digest mismatch, missing object, or stale source does not silently regenerate the receipt; it reports integrity failure or creates a newly linked receipt.

### Flow F08: Switch role view without losing context

1. From any incident screen, the operator switches AppSec, Developer, or Leader view.
2. The URL retains portfolio, incident, scopes, selected application, plan, receipt, and drawer state.
3. Developer view focuses the current application; Leader view aggregates status and blockers; AppSec view restores the command queue and proof controls.
4. Switching views never reruns analysis or changes truth.
5. Browser Back and Forward restore the exact analytical context and focus target.

---

## 3.5 Frontend information architecture

### 3.5.1 Navigation model

The persistent shell has five destinations: Incidents, Portfolio, Imports, Proof, and System. The default destination is Incidents. Graph Explorer is not a top-level first click; it is reachable from an incident pair or Portfolio because topology without a decision context is secondary.

Global URL state:

| Parameter | Meaning | Preserved across role switch | Default |
|---|---|:---:|---|
| `portfolio` | Active portfolio ID | Yes | Verified demo portfolio |
| `incident` | Active incident ID | Yes | None until selected |
| `role` | `appsec`, `developer`, `leader` | n/a | `appsec` |
| `scopes` | Comma-separated dependency scopes | Yes | `prod` |
| `application` | Focused repository snapshot | Yes | First affected app in Developer view |
| `plan` | Active portfolio fix plan | Yes | Latest draft |
| `receipt` | Open proof receipt | Yes | None |
| `evidence` | Evidence drawer panel | Yes | Closed |

### 3.5.2 Screen inventory

#### S01: Incident queue, `/incidents`

**Decision:** What requires action now?

**Layout:** compact product header; role switcher; portfolio picker; freshness strip; queue filters; sortable incident table; right-side quick evidence panel on desktop; bottom sheet on narrow screens.

**Components:**

- `ProductHeader`: HydraCut name, portfolio identity, system health, proof shortcut.
- `RoleSwitcher`: AppSec default, Developer, Leader; includes visible selected-context summary.
- `PortfolioPicker`: prepared demo and successfully imported portfolios only.
- `FreshnessStrip`: OSV, KEV, EPSS, GitHub, graph snapshot timestamps and degraded source badges.
- `IncidentFilterBar`: scope, state, KEV, severity, proposed-fix availability, repository, search.
- `IncidentQueueTable`: advisory, package/version, KEV, EPSS, CVSS, production applications, all-scope applications, proposed fixes, verification state, freshness.
- `PriorityFactorsPopover`: explains deterministic ordering field by field.
- `QuickEvidencePanel`: selected advisory identity, range proof, one affected application, and primary action.

**Interactions:** keyboard arrow navigation within the table; Enter opens incident; Space selects for batch comparison only; sort announces new order; filters write to URL; clicking a factor opens evidence rather than changing score.

**States:** loading skeleton preserving column widths; verified data; mixed freshness; no findings; filters yield no rows; source `UNKNOWN`; portfolio import `ERROR`; HydraDB unavailable. “No findings” is worded “No current OSV matches in successfully analyzed supported inputs,” with scope and retrieval time.

#### S02: Incident command, `/incidents/[incidentId]`

**Decision:** What is affected, why, and what action is next?

**Layout:** incident header; evidence stack; four summary measures; tab rail for Impact, Proposed Fixes, Plan, and Proof; active application drawer.

**Components:**

- `IncidentHeader`: OSV ID, aliases, package/version, state, withdrawn flag, timestamps.
- `EvidenceStack`: CVSS vector/source, KEV membership/catalog version, EPSS probability/percentile/date, affected ranges, fixed versions, upstream references.
- `ImpactSummary`: production applications, all selected-scope applications, source-target pairs, deepest observed witness.
- `LimitationsBanner`: package-level exposure, not exploitability; visibility escalates for partial/unknown.
- `IncidentTabs`: preserves selected incident and scope.
- `VerificationUniverseSelector`: requires the selected incident exact version and optionally adds other current advisory-backed package/version coordinates; the chosen bounded set is persisted into the baseline and plan digest.
- `PrimaryAction`: View impact, review proposed fixes, or resolve blocked evidence depending on state.

**States:** withdrawn advisory blocks priority and verification; missing CVE alias yields KEV/EPSS unknown; no reachable pair distinguishes advisory match from selected-scope path absence; depth-clipped result is partial; baseline query error blocks all fix-proof language.

#### S03: Impact matrix, `/incidents/[incidentId]/impact`

**Decision:** Which applications are dependency-exposed within the selected bounds?

**Layout:** scope controls; pair matrix; application table; bounded witness graph; evidence drawer.

**Components:**

- `ScopeSelector`: production default, explicit development/optional/peer switches with consequence copy.
- `PairMatrix`: package-version sources as rows, applications as columns; cell states reachable, no path within bounds, unknown, error.
- `ApplicationImpactTable`: repository, immutable commit, scope, direct/transitive, minimum depth, witness, owner unavailable indicator.
- `WitnessGraph`: only the selected bounded path; relationship type, package version, and scope labels; no hidden aggregation.
- `WitnessBreadcrumb`: accessible text equivalent to the visual graph.
- `QueryEvidenceDrawer`: raw OpenCypher, sanitized selector summary, cardinalities, bounds, runtime identity, epoch/bookmark, elapsed time, pair digest.
- `CopyEvidenceButton`: copies a plain-text evidence summary, not an unsupported safety conclusion.

**Interactions:** selecting a matrix cell synchronizes table row and graph; scope change triggers a new job, never local filtering of prior truth; graph nodes open package detail but cannot be dragged into a false topology; raw query copy includes receipt ID.

**States:** query queued/running; verified; zero pairs; partial due depth; error due count mismatch; stale due newer advisory; graph rendering failure falls back to breadcrumb and table without changing result.

#### S04: Proposed fixes, `/incidents/[incidentId]/proposed-fixes`

**Decision:** Which real resolved changes are available, and what do they cover?

**Layout:** discovery status; source tabs for Discovered PRs and Added manually; proposed-fix cards; compare drawer.

**Components:**

- `DiscoveryStatus`: GitHub pages scanned, rate-limit remaining/reset, actor allowlist version, last refresh.
- `ProposedFixCard`: repository, PR/commit/upload identity, head SHA or file hashes, author evidence, changed files, lockfile change count, extraction state.
- `OutcomeChips`: selected exposure removed/persistent/introduced/unknown; other advisory deltas displayed separately.
- `CoverageBar`: affected applications or pairs covered; exact numerator/denominator and scope.
- `DiffSummary`: added/removed/changed package instances; never implies build compatibility.
- `AddProposedFixDialog`: exact commit/branch or two-file upload with explicit immutable-resolution preview.
- `CompareDrawer`: baseline and proposed identities, package/advisory deltas, query evidence links.

**Interactions:** refresh discovery honors GitHub rate state; adding branch first previews resolved SHA and requires confirmation; cards can be selected for plan; incompatible states for one repository are mutually exclusive; failed fixes remain visible with reason but cannot enter plan.

**States:** discovery running; no public PRs found; GitHub rate-limited; proposed fix extracting; invalid repository identity; lockfile unchanged; selected incident persists; selected incident clears but other findings remain; introduced advisory; verification unknown.

#### S05: Portfolio fix plan, `/incidents/[incidentId]/plan`

**Decision:** Which supplied proposed fixes should the portfolio apply and verify together?

**Layout:** transparent objective summary; coverage matrix; constraints; selected-plan rail; verify action.

**Components:**

- `PlannerObjective`: ordered objectives and current selected scopes.
- `CoverageMatrix`: proposed fix by application and baseline pair, with removed/persistent/introduced cells.
- `ConstraintPanel`: one state per repository, required/forbidden fix, maximum repository changes, production-first policy.
- `PlanSelection`: recommended set, manual overrides, uncovered pairs, package churn.
- `WhyThisPlan`: deterministic comparison against alternatives that were actually evaluated.
- `VerifyCombinedPlanButton`: disabled until every selected snapshot is immutable and independently extracted.

**Planner rule:** no unbounded `2^N` enumeration. Proposed fixes are evaluated individually or within mutually exclusive repository groups to build coverage. The solver selects within explicit bounded constraints. The chosen combined topology is then the only plan-level scenario that must be materialized and queried. The historic eight-scenario exercise is shown only in proof history.

**States:** insufficient proposed fixes; full coverage possible; residual coverage; conflicting states; solver time budget reached; manual override; one proposed fix unknown; final verification required.

#### S06: Combined verification, `/plans/[planId]/verify`

**Decision:** Did the chosen real portfolio plan remove the selected exposure within bounds?

**Layout:** immutable plan manifest; phase timeline; baseline-versus-final comparison; remaining-risk panel; receipt action.

**Components:**

- `PlanManifest`: every application and chosen baseline/proposed snapshot hash.
- `VerificationTimeline`: validate, graph projection, selector checks, native query, compare, receipt.
- `BeforeAfterPairs`: removed, persistent, introduced, unknown pair tabs.
- `SelectedIncidentConclusion`: exact allowed language tied to result state.
- `RemainingExposurePanel`: other advisory-backed source-target pairs that persist.
- `RefusalReasonPanel`: every failed predicate, owner, and retry action.
- `OpenReceiptButton`: available only after immutable receipt commit.

**States:** queued; graph writing; count verification; traversal; verified with residual; selected incident cleared with other risks; partial; unknown enrichment; error; cancelled. The zero-pair state does not render until the query and all completeness checks finish.

#### S07: Proof receipt, `/proof/[receiptDigest]`

**Decision:** Can another person reproduce and audit the conclusion?

**Layout:** digest header; human summary; expandable evidence sections; download actions.

**Components:**

- `ReceiptHeader`: state, digest, created time, schema version, supersedes link.
- `HumanConclusion`: selected incident, portfolio, result, residual other exposure, limitations.
- `InputEvidence`: repository URLs, immutable SHAs, manifest and lockfile hashes.
- `SourceEvidence`: OSV record IDs/times/withdrawn, KEV catalog digest/version, EPSS score date.
- `TopologyEvidence`: extractor version, graph schema, node/edge/root counts, maximum depth, collision registry status.
- `TraversalEvidence`: baseline and final query text/hash, bounds, cardinalities, epoch/bookmark, timing, sorted pair digests.
- `ProposedFixEvidence`: PR/commit/upload origin, changed file hashes, removed/persistent/introduced finding sets.
- `Limitations`: precise non-guarantees.
- `DownloadReceipt` and `DownloadSarif`.

**States:** verified; partial receipt; superseded receipt; digest mismatch; missing export; source record later modified. Existing receipts remain immutable and show their historical source snapshots.

#### S08: Portfolio, `/portfolio`

**Decision:** What authentic application states and evidence are currently available?

**Components:** portfolio summary; application inventory; import status; package and edge counts; current findings; snapshot identity; freshness; selected incident link. Leader view starts here only when explicitly chosen.

**States:** empty portfolio; partial import; mixed supported/unsupported; healthy supported inputs with no current matches; stale evidence; graph receipt mismatch.

#### S09: Graph explorer, `/graph`

**Decision:** How does a selected proven pair traverse the normalized topology?

The explorer requires a selected incident and application. It cannot load an unbounded portfolio graph. Controls are relationship scope, maximum displayed nodes, witness selection when available, fit, zoom, and text outline. The pair matrix and receipt remain canonical.

**States:** no context; bounded witness; equal-length witness variation; render limit; no path within current bounds; graph unavailable with text evidence intact.

#### S10: Imports and jobs, `/imports` and `/jobs/[jobId]`

**Decision:** What is being analyzed, and where did it fail?

**Components:** new import form; input provenance preview; upload dropzone; job list; phase timeline; per-repository outcome; retry action; immutable error detail; cancellation before graph commit.

**States:** validating; fetching; hashing; extracting; advisory query; graph write; integrity check; traversal; receipt; complete; partial; error; cancelled; recovered after worker restart.

#### S11: System and settings, `/system`

**Decision:** Are critical dependencies ready and are quality bounds configured?

**Components:** web/worker/PostgreSQL/HydraDB health; GitHub budget; OSV/KEV/EPSS freshness; HydraDB image digest; graph schema version; allowed scopes; path-depth policy; file limits; bot allowlist; receipt schema; single-operator disclosure.

No secret values are rendered. A secret row shows configured/missing, last successful use, and rotation instructions.

### 3.5.3 Cross-screen components

| Component | Purpose | Key state | Accessibility behavior |
|---|---|---|---|
| `ResultStateBadge` | Displays verified, partial, unknown, error | state + reason count | Text and icon; color never sole signal |
| `EvidenceDrawer` | Progressive provenance disclosure | open panel and focused item in URL | Focus trap, Esc close, return focus |
| `FreshnessStamp` | Shows source modified/retrieved/score date | fresh, stale, unavailable | Exact timestamps in accessible name |
| `ScopePills` | Displays active dependency scopes | prod/dev/optional/peer | Buttons with pressed state |
| `LimitationCallout` | Prevents overclaiming | standard or escalated | `role=status`; critical uses alert |
| `JobPhaseTimeline` | Makes async work inspectable | phase, attempt, timestamps | Ordered list with current step |
| `PairCount` | Stable result measure | unique pair count | Includes source/target denominator |
| `WitnessPath` | One shortest graph explanation | ordered nodes/edges | Semantic ordered text equivalent |
| `CopyProof` | Copies bounded conclusion | receipt-backed only | Announces copy result without stealing focus |
| `EmptyState` | Explains valid absence | reason-coded | Never substitutes optimistic clean copy |

### 3.5.4 Responsive behavior

| Breakpoint | Navigation | Tables | Evidence | Graph |
|---|---|---|---|---|
| ≥1280px | Persistent left rail and top context bar | Full columns, sticky header | 420px right drawer | Side-by-side with pair table |
| 768–1279px | Collapsible rail | Priority columns visible; details in row expansion | Overlay drawer | Full-width below summary |
| <768px | Bottom navigation for four primary destinations; role menu in header | Card list with canonical labels; no horizontal dependence | Full-screen sheet | Text breadcrumb first, graph opt-in |

No critical action requires hover. Touch targets are at least 44 by 44 CSS pixels. On small screens, verification conclusions precede visualization.

### 3.5.5 Accessibility contract

- Target WCAG 2.2 AA for the P0 flow.
- Every page has one `h1`, consistent landmarks, skip link, and logical heading order.
- Tables retain captions, row/column headers, and sortable-button state.
- Graph content has an equivalent ordered path and pair table; the canvas is never the only evidence.
- Focus is restored after drawers/dialogs and after route transitions to the destination heading.
- Live regions announce job phase changes at polite cadence; terminal error is assertive once.
- Motion honors `prefers-reduced-motion`; graph traversal animation becomes instant state change.
- Status colors meet contrast and include icon plus text.
- All filters, role switches, tabs, matrices, and downloads are keyboard reachable.
- Axe automated checks have zero serious/critical violations; keyboard and VoiceOver/NVDA smoke tests remain manual gates.

### 3.5.6 Copy contract

Approved conclusion patterns:

- “3 applications are dependency-exposed within production and development scopes.”
- “One shortest witness is shown for this source-to-application pair.”
- “The selected minimist incident is cleared in the verified proposed-fix graph. Six pairs from other selected vulnerable versions remain.”
- “Verification is partial because imported depth exceeds the query bound.”
- “CVE-2021-44906 is not listed in CISA KEV catalog 2026.08.19.”

Forbidden patterns:

- “Your app is safe.”
- “No vulnerabilities.”
- “Not exploited.”
- “All paths are removed.”
- “This fix will not break the app.”
- “HydraCut found the global minimum.”

---

## 4. Technical specifications

### 4.1 C01 Web command surface

- **Purpose:** Render the complete role-aware workflow and own the internal HTTP boundary.
- **Interfaces:** documented routes in Section 5; server-rendered initial view; client polling for jobs.
- **State:** URL for analytical selection, TanStack Query for server state, local component state only for uncommitted form values.
- **Constraints:** no direct browser access to GitHub tokens, PostgreSQL, HydraDB, or source APIs; no cached verified graph result after health failure.
- **Signals:** request correlation ID, route latency, client error event with no secret or raw lockfile content.
- **Performance:** initial shell under 2.5 seconds on demo host; selection feedback under 100ms; job state visible within 1 second.

### 4.2 C02 Durable worker

- **Purpose:** Execute every long-running phase outside request lifetime.
- **Interfaces:** consumes typed pg-boss jobs and writes immutable phase events.
- **Concurrency:** one import/graph job at a time for P0; two source-enrichment calls per external service.
- **Idempotency:** each phase key is `jobId:phase:inputDigest`; completed phases are not duplicated.
- **Retry:** only idempotent fetch/read phases retry automatically. Graph write retries require an idempotent snapshot key. Receipt commit never retries with changed payload.
- **Cancellation:** accepted before graph write; after graph write the job completes cleanup and records cancelled outcome.

### 4.3 C03 Input provenance service

- **Purpose:** Convert every input into immutable bytes and identity evidence.
- **GitHub input:** exact `https://github.com/{owner}/{repo}` only; resolve ref to SHA; fetch `package.json` and `package-lock.json` at that SHA.
- **Upload input:** exactly two JSON files; compute SHA-256 before parse; reject duplicate paths, non-JSON, and size above 10 MiB each.
- **Redirects:** disabled or followed only when every hop remains `api.github.com`/`github.com` according to the specific client.
- **Output:** source kind, repository, commit, manifest hash, lock hash, byte size, retrieval time, response ETag, API version.
- **Failure:** no partial provenance object.

### 4.4 C04 Dependency extractor

- **Purpose:** Produce deterministic package-instance and relationship records from supported lockfiles.
- **Input:** validated manifest/lockfile bytes plus immutable snapshot key.
- **Output:** application root; package instances keyed by lockfile location/name/version; typed edges; root dependency counts; maximum observed depth; extraction digest.
- **Scopes:** production, development, optional, peer, or other; exactly one type per edge.
- **Limits:** lockfile v2/v3, maximum 10 MiB, declared safety cap 5,000 instances per snapshot until benchmark changes it.
- **Security:** `loadVirtual()` only; no install, registry resolution, lifecycle scripts, builds, tests, or repository binaries.
- **Failure:** malformed, missing version, impossible parent, duplicate internal ID, or cap excess ends extraction.

### 4.5 C05 Vulnerability intelligence service

- **Purpose:** Match exact versions and enrich findings without obscuring source quality.
- **OSV identity:** ecosystem, normalized name, exact version, purl; result maps to canonical OSV ID and aliases.
- **Range proof:** preserve all introduced/fixed/last-affected/limit events and exact matched range.
- **Advisory state:** published, modified, withdrawn, retrieval time, payload digest.
- **Severity:** show source CVSS vector; do not calculate a replacement score unless a standards library is later verified.
- **Exploitation:** KEV membership with catalog version/digest; EPSS probability, percentile, score date.
- **Fix evidence:** fixed versions and upstream references as evidence only, never as a resolved application fix.
- **Priority order:** KEV, production reachability, EPSS, CVSS, affected applications, verified proposed-fix availability.
- **Failure:** OSV incomplete blocks verified vulnerability coverage; KEV/EPSS failure creates unknown enrichment but does not erase OSV graph exposure.

### 4.6 C06 HydraDB graph adapter

- **Purpose:** Own every graph write and graph truth query.
- **Transport:** private HTTP OpenCypher endpoint; bearer token server-side; strong consistency.
- **Identity:** deterministic non-negative 52-bit IDs from first 13 SHA-256 hexadecimal digits plus ingestion collision registry.
- **Topology:** immutable `ApplicationSnapshot`, `PackageInstance`, `ScenarioApplication`, and `IncidentSource` nodes; typed dependency, `USES_SNAPSHOT`, and `MATCHES_INCIDENT` edges.
- **Writes:** supported batched `UNWIND ... MERGE (n {id: row.id}) SET n:Label` form; separate readback; labeled endpoints for relationships.
- **Query:** strict renderer admits only generated selectors, relationship allowlist, and computed integers.
- **Completeness:** expected selector counts before query; `resultLimit = sources * targets`; cursor absent; no duplicate pairs; imported maximum depth covered; path endpoints match scenario.
- **Cleanup:** scenario nodes and owned edges only; immutable snapshots remain. Cleanup never deletes a receipt before its graph evidence is retained.

Canonical critical path:

```text
IncidentSource
  <- MATCHES_INCIDENT - PackageInstance
  <- PROD_DEPENDS_ON / DEV_DEPENDS_ON / OPTIONAL_DEPENDS_ON / PEER_DEPENDS_ON
  <- ApplicationSnapshot
  <- USES_SNAPSHOT - ScenarioApplication
```

### 4.7 C07 Proposed-fix service

- **Purpose:** Establish real proposed dependency states.
- **Accepted origin:** public PR head SHA, public commit, branch resolved to SHA, or uploaded manifest/lockfile pair.
- **Discovery:** public open PRs, explicit bot/actor and branch evidence, changed file confirmation, pagination complete.
- **Validation:** same repository; immutable identity; complete extraction; full advisory scan; independent traversal status.
- **Outcome:** selected pairs removed/persistent/introduced/unknown; all finding deltas kept separate; package-instance churn.
- **Non-guarantee:** no build, test, API compatibility, or deployment claim.

### 4.8 C08 Coverage planner

- **Purpose:** Choose a defensible plan without exponential product semantics.
- **Input:** verified baseline pair set; independently evaluated proposed-fix pair sets; mutually exclusive repository groups; user constraints.
- **Matrix:** for each proposed fix, record baseline selected pairs removed, persistent, introduced, and unknown.
- **Objective:** minimize residual production pairs; then all selected-scope pairs; then repository changes; then package-instance churn; then stable key.
- **Algorithm:** deterministic branch-and-bound over application groups with dominance pruning and explicit time/state caps. If cap is reached, label recommendation bounded/non-exhaustive.
- **Final proof:** planner output has no verified status until the combined topology is materialized and re-queried through HydraDB.

### 4.9 C09 Receipt and SARIF service

- **Purpose:** Make conclusions reproducible and portable.
- **Canonicalization:** UTF-8 JSON, lexicographically sorted object keys, normalized arrays by domain key, integer milliseconds, no environment-specific paths.
- **Digest:** SHA-256 of canonical bytes.
- **Immutability:** insert-only by digest; correction links `supersedes` and creates a new digest.
- **Human report:** result, action, evidence, limitations, remaining risk.
- **SARIF:** OASIS 2.1.0 export with OSV rule IDs, lockfile locations, result state, graph bounds, and receipt digest.

### 4.10 C10 Product store

- **Purpose:** Durable non-graph state and source cache.
- **Entities:** portfolios, repository inputs, snapshots, advisories, findings, incidents, proposed fixes, plans, jobs, phase events, receipts, source cache, audit events.
- **Constraints:** immutable commit/hash identities; unique snapshot digest; insert-only receipt; foreign-key plan membership; no secret or raw token columns.
- **Retention:** raw fetched bytes discarded after successful extraction; normalized evidence and hashes retained; failed upload bytes discarded immediately.

### 4.11 C11 Job queue

- **Purpose:** Survive process restart and make retries visible.
- **Queues:** `import-snapshot`, `refresh-evidence`, `evaluate-proposed-fix`, `verify-plan`, `cleanup-scenario`.
- **Policy:** per-portfolio singleton for graph-writing jobs; external fetches have source-specific concurrency.
- **Dead letter:** terminal job remains visible with phase, attempt, code, safe detail, and retry eligibility.
- **Recovery:** worker restart resumes unacknowledged work; idempotency keys prevent duplicate snapshot/receipt state.

### 4.12 C12 Observability and health

- **Purpose:** Prove what ran and expose degraded dependencies before demo.
- **Logs:** JSON with `requestId`, `jobId`, `portfolioId`, `scenarioKey`, `receiptDigest`, `source`, phase, duration, state; package names allowed, raw lockfile bytes and tokens forbidden.
- **Metrics:** job duration/failure by phase, external request count/status/latency, cache freshness, HydraDB query duration/pair count, selector mismatch, receipt digest mismatch.
- **Health:** liveness for process; readiness requires PostgreSQL and, for proof routes, HydraDB. External intelligence health is separate and may be degraded.
- **Audit:** every plan selection, manual override, verification request, receipt creation, and download.

### 4.13 Result-state schema

| State | Entry condition | User copy | Actions enabled |
|---|---|---|---|
| `VERIFIED_WITHIN_BOUNDS` | All input, source, extraction, graph, bounds, and receipt gates pass | Exact bounded conclusion | Export, share, compare |
| `PARTIAL` | Valid evidence exists but portfolio/source/depth/pagination coverage is incomplete | Names incomplete dimension | Resolve evidence, rerun |
| `UNKNOWN` | Required external/context evidence unavailable or conflicting | Names unknown source | Refresh, inspect source |
| `ERROR` | Validation, extraction, graph, query, integrity, or receipt failure | Names failed phase and safe code | Retry eligible phase or replace input |

### 4.14 Mandatory refusal predicates

A receipt cannot be `VERIFIED_WITHIN_BOUNDS` if any predicate is false:

1. Every GitHub state is an immutable SHA or upload has both hashes.
2. Every supported lockfile fully extracted with deterministic digest.
3. OSV batch pagination and detail retrieval completed for every emitted finding.
4. No selected advisory is withdrawn or conflicting without explicit disposition.
5. Graph node/edge/root counts match extractor output and IDs are collision-free.
6. Every scenario source selector matches exactly one source anchor.
7. Target selector count equals intended applications.
8. Imported maximum depth is within query depth.
9. `resultLimit` equals theoretical source-target pair bound for `pathCount: 1`.
10. No cursor, duplicate pair, unexpected endpoint, or scenario-crossing edge exists.
11. Every selected proposed fix fully extracted and matched the baseline repository.
12. Final selected plan was materialized as one combined scenario and re-queried natively.
13. Canonical receipt recomputes to its stored digest.

---

## 5. API contracts

### 5.1 Internal route inventory

| ID | Method and route | Purpose | Success | Critical errors |
|---|---|---|---|---|
| A01 | `GET /api/health` | Liveness/readiness and dependency status | `200` state map | `503` critical dependency unavailable |
| A02 | `GET /api/incidents` | Action queue with filters and freshness | `200` paged incidents | `409` portfolio not analyzable |
| A03 | `GET /api/incidents/:id` | Incident evidence and summary | `200` incident | `404`, `409` withdrawn/conflict |
| A04 | `POST /api/imports` | Validate input and enqueue import | `202` job link | `400`, `413`, `422`, `429` |
| A05 | `GET /api/jobs/:id` | Phase, attempts, result, errors | `200` job | `404` |
| A06 | `POST /api/incidents/:id/traversals` | Enqueue selected-incident and bounded verification-universe baselines | `202` job link | `409` refusal precondition |
| A07 | `GET /api/incidents/:id/impact` | Pair matrix and witness evidence | `200` bounded result | `409` not verified/partial detail |
| A08 | `POST /api/incidents/:id/proposed-fixes/discover` | Discover public PRs | `202` job | `429` GitHub limited |
| A09 | `POST /api/incidents/:id/proposed-fixes` | Add commit/ref/upload | `202` job | `400`, `409`, `413`, `422` |
| A10 | `GET /api/incidents/:id/proposed-fixes` | List outcomes and provenance | `200` list | `409` baseline unavailable |
| A11 | `POST /api/incidents/:id/plans` | Solve bounded coverage plan | `201` draft plan | `409` unknown proposed fix |
| A12 | `POST /api/plans/:id/verify` | Enqueue final combined native proof | `202` job | `409` immutable/completeness failure |
| A13 | `GET /api/plans/:id` | Plan, matrix, verification state | `200` plan | `404` |
| A14 | `GET /api/receipts/:digest` | Immutable canonical receipt | `200` JSON | `409` digest mismatch |
| A15 | `GET /api/receipts/:digest/sarif` | SARIF 2.1.0 projection | `200` SARIF | `422` non-exportable partial receipt |
| A16 | `GET /api/system` | Non-secret runtime/config evidence | `200` system facts | `503` product store unavailable |

### 5.2 Standard error envelope

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["code", "state", "message", "requestId", "retryable"],
  "properties": {
    "code": { "type": "string", "pattern": "^[A-Z0-9_]+$" },
    "state": { "enum": ["PARTIAL", "UNKNOWN", "ERROR"] },
    "message": { "type": "string" },
    "requestId": { "type": "string" },
    "retryable": { "type": "boolean" },
    "details": { "type": "object" }
  },
  "additionalProperties": false
}
```

### 5.3 Import request specification

```json
{
  "oneOf": [
    {
      "type": "object",
      "required": ["kind", "repository", "ref"],
      "properties": {
        "kind": { "const": "github" },
        "repository": { "type": "string", "pattern": "^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$" },
        "ref": { "type": "string", "minLength": 1, "maxLength": 255 }
      }
    },
    {
      "type": "object",
      "required": ["kind", "repository", "manifestBase64", "lockfileBase64"],
      "properties": {
        "kind": { "const": "upload" },
        "repository": { "type": "string", "pattern": "^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$" },
        "manifestBase64": { "type": "string", "contentEncoding": "base64" },
        "lockfileBase64": { "type": "string", "contentEncoding": "base64" }
      }
    }
  ]
}
```

### 5.4 Traversal request specification

```json
{
  "type": "object",
  "required": ["scopes", "sourceFindingIds", "verificationSourceCoordinates"],
  "properties": {
    "scopes": {
      "type": "array",
      "items": { "enum": ["production", "development", "optional", "peer"] },
      "minItems": 1,
      "uniqueItems": true
    },
    "sourceFindingIds": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1,
      "uniqueItems": true
    },
    "verificationSourceCoordinates": {
      "type": "array",
      "items": { "type": "string", "pattern": "^.+@[^@]+$" },
      "minItems": 1,
      "maxItems": 100,
      "uniqueItems": true
    }
  },
  "additionalProperties": false
}
```

### 5.5 External API contract matrix

| External API | Endpoint and auth | Pagination / rate | Cache and freshness | Retry / timeout | Failure semantics |
|---|---|---|---|---|---|
| HydraDB | Private `POST /v1/graphs/default/query`; bearer token; strong consistency | Server result cursor checked; theoretical limit computed | No final proof result cache | one idempotent read retry; 30s | Baseline/final proof `ERROR`; cached result forbidden |
| GitHub Contents | `GET /repos/{owner}/{repo}/contents/{path}?ref={sha}`; optional token; API version `2026-03-10` | File endpoint; 60/hour anonymous, 5,000/hour authenticated | Immutable SHA bytes indefinitely by digest | 2 on `5xx`; 15s; rate headers control | Input `ERROR`; no mutable fallback |
| GitHub Commits | `GET /repos/{owner}/{repo}/commits/{ref}` | one ref; rate headers | SHA mapping 60s for mutable refs | same as GitHub | unresolved ref blocks import |
| GitHub Pulls | `GET /repos/{owner}/{repo}/pulls?state=open&per_page=100`; optional token | follow `Link` until complete | 60s | rate-aware; 15s/page | discovery `UNKNOWN`; manual add remains available |
| OSV querybatch | `POST /v1/querybatch`; no auth | ordered results and per-result page token | 6h; retain retrieved time | 3 on `429`/`5xx`; 10s | coverage `UNKNOWN`; verified clean forbidden |
| OSV detail | `GET /v1/vulns/{id}`; no auth | one record | by ID + modified timestamp; 6h refresh | 3 on `429`/`5xx`; 10s | finding incomplete/unknown |
| CISA KEV | official JSON feed; no auth | whole catalog | 6h by catalog version/digest | 2 on `5xx`; 15s | KEV unknown; OSV exposure may remain verified |
| FIRST EPSS | `/data/v1/epss?cve={csv}`; no auth | batch and response metadata | score date + 24h | 2 on `429`/`5xx`; 10s | EPSS unknown; never zero default |

### 5.6 Integration provenance fields

Every external fetch stores: source name, canonical URL without secret, request method, API version, request tuple digest, response status, ETag/Last-Modified where present, retrieval timestamp, source-modified or score date, payload SHA-256, cache state, retry count, rate-limit remaining/reset when supplied, and error code. Tokens and response authorization headers are never stored.

---

## 6. Three-minute demo script

**Format:** recorded browser and terminal capture  
**Hard maximum:** 3:00  
**Target:** 2:52, leaving 8 seconds encode margin

### Scene 1, F01: Action-first incident command, 0:00–0:20

**Screen:** Incident queue. The verified demo portfolio, freshness strip, and minimist row are visible.  
**Voiceover:** “Dependency alerts arrive one repository at a time. HydraCut starts with the portfolio decision: what requires action now? This queue uses visible evidence, not a hidden score.”  
**Action:** Open the minimist incident and point to OSV, CVSS, KEV absence, EPSS, and three affected applications.

### Scene 2, F02: Authentic input, 0:20–0:39

**Screen:** Portfolio provenance panel with three public repositories, immutable commits, lockfile hashes, and extractor version.  
**Voiceover:** “These are real public repository states and real later commits. HydraCut reads committed files, hashes them, and reconstructs lockfiles without installing or running repository code.”  
**Action:** Expand one baseline/proposed pair and show matching hashes from the frozen evidence.

### Scene 3, F03: CampaignRadius baseline proof, 0:39–1:11

**Screen:** Impact matrix, three minimist pairs, one production pair, selected witness, query drawer.  
**Voiceover:** “CampaignRadius asks self-hosted HydraDB which applications are reachable from the affected version. Native MSpaths returns three source-to-application pairs. One is production scope. This path is one shortest witness, not an exploitability claim.”  
**Action:** Toggle production scope, select nodekb, open raw OpenCypher and computed result limit.

### Scene 4, F04: Real proposed fixes, 1:11–1:34

**Screen:** Proposed Fixes with the three genuine commit links and complete-state outcomes.  
**Voiceover:** “A fixed version string is not an application fix. HydraCut accepts real commits or lockfiles, rebuilds each complete resolved graph, and shows selected exposure removed, persistent, or introduced.”  
**Action:** Open nodekb comparison and show the proposed commit SHA and changed package count.

### Scene 5, F05: Transparent portfolio plan, 1:34–1:54

**Screen:** Coverage matrix and selected plan.  
**Voiceover:** “The planner uses verified pair coverage and explicit constraints. It does not sell exponential combinations as product scale, and it never selects an imaginary graph cut.”  
**Action:** Point to the three selected proposed fixes and uncovered-pair count before final verification.

### Scene 6, F06: Final combined HydraDB proof, 1:54–2:24

**Screen:** Verification timeline completes, comparison shows zero minimist pairs and six other pairs.  
**Voiceover:** “Now HydraCut materializes the chosen portfolio state and runs a second native HydraDB traversal. The selected minimist incident has zero residual pairs within these bounds. Six pairs from two other known vulnerable versions remain. The portfolio is not certified safe.”  
**Action:** Reveal final query timing, epoch, bookmark, and remaining-exposure panel.

### Scene 7, F07: Reproducible receipt, 2:24–2:43

**Screen:** Receipt page with digest, inputs, source snapshots, baseline/final query, limitations, JSON and SARIF buttons.  
**Voiceover:** “Every conclusion carries its inputs, source freshness, graph checks, query bounds, runtime identity, result digest, and limitations. The receipt is evidence another engineer can audit.”  
**Action:** Copy digest and briefly open JSON download menu.

### Scene 8, F08: Role projection and sponsor close, 2:43–2:52

**Screen:** Switch AppSec to Developer and Leader while incident context remains. Then show the private HydraDB service health.  
**Voiceover:** “AppSec coordinates the incident, developers get repository context, and leaders see coverage without changing the truth. Remove HydraDB and both the baseline answer and final proof disappear.”  
**Action:** Switch roles, then end on HydraDB image digest and two native-query checks.

### 6.1 Demo prerequisites and seed state

The seed process may prepare product-generated state, but it may not fabricate analysis. It must import the same frozen bytes and rerun the product pipeline against the pinned HydraDB image. If live rerun fails, recording stops. A prior receipt may be shown only as historical proof and must remain labeled with its creation time.

| Item | Exact value | Source | Seed responsibility |
|---|---|---|---|
| Portfolio | `hydracut-historical-minimist` | Local deterministic identifier | Create if absent |
| Baseline repositories | nodekb, spaces-cli, crcmaker at frozen SHAs | Runtime evidence JSON | Fetch or use hash-verified vendored public fixture bytes |
| Proposed fixes | Three frozen later SHAs | Runtime evidence JSON | Import and verify complete graphs |
| Selected advisory | `GHSA-xvch-5gv4-984h` / `CVE-2021-44906` | OSV | Refresh and retain source snapshot |
| Expected baseline | 3 minimist pairs; 1 production pair | Frozen runtime evidence | Assert, never insert as result |
| Expected many-source | 9 baseline pairs | Frozen runtime evidence | Assert, never insert as result |
| Expected final | 0 minimist pairs; 6 other selected-source pairs | Frozen runtime evidence | Assert after native final query |
| Receipt | Newly computed digest | Product pipeline | Commit only after every gate |

Idempotence means repeated seeding detects existing identical input digests and produces the same normalized topology and pair digests. It does not mean copying stored pair rows into a fresh run.

### 6.2 Demo failure policy

- If HydraDB baseline or final query fails, do not record a success take.
- If OSV changed, show the new authentic state and do not force old expected results.
- If GitHub is unavailable, vendored fixture bytes are allowed only when their SHA-256 values equal the frozen public inputs and provenance states this source.
- If KEV or EPSS is unavailable, display `UNKNOWN`; do not delay graph truth or substitute cached zero.
- If the current source snapshot no longer reproduces the frozen evidence, preserve the historical receipt and explain the divergence; do not rewrite history.

---

## 7. Risk register

| # | Category | Risk | Severity | Likelihood | Impact | Mitigation | Plan tree |
|---:|---|---|:---:|:---:|---|---|---|
| R01 | Technical | HydraDB is decorative or bypassed | CRITICAL | LOW | Automatic hackathon failure | Removal test plus native baseline/final query observables | DT-01 |
| R02 | Quality | Silent `resultLimit` truncation creates false clean | CRITICAL | MED | Incorrect security conclusion | Cardinality-derived bound, cursor/duplicate/depth gates | DT-02 |
| R03 | Authenticity | Demo state or counts are fabricated | CRITICAL | LOW | Trust and submission failure | Hash-verified corpus; rerun assertions; no mock fallback | DT-03 |
| R04 | Security | Untrusted repository code executes | CRITICAL | LOW | Host compromise | File-only fetch, Arborist `loadVirtual`, banned command tests | DT-04 |
| R05 | Technical | HydraDB local storage GC warning causes loss | HIGH | MED | Demo failure or corrupted graph | Pinned image, isolated volume, soak/restart proof, receipt parity | DT-05 |
| R06 | Integration | GitHub unavailable or rate-limited | HIGH | MED | Import/discovery blocked | immutable-byte cache, rate headers, manual commit/upload path | DT-06 |
| R07 | Integration | OSV unavailable or pagination incomplete | CRITICAL | MED | False clean | retry, cache with freshness, `UNKNOWN`, verified conclusion blocked | DT-07 |
| R08 | Integration | CISA KEV unavailable/stale | MED | MED | Prioritization incomplete | source digest and `UNKNOWN`; never infer not exploited | DT-08 |
| R09 | Integration | FIRST EPSS unavailable/no CVE | MED | MED | Prioritization incomplete | batch/cache by date; `UNKNOWN`, never zero | DT-09 |
| R10 | Technical | Arborist extraction differs from lockfile truth | CRITICAL | LOW | Incorrect graph | frozen counts, OSV-Scanner parity, independent normalized checks | DT-10 |
| R11 | Technical | Proposed fix is mutable or wrong repository | CRITICAL | MED | False remediation proof | resolve SHA, repository identity, file hashes, fail closed | DT-11 |
| R12 | Technical | Combined plan is inferred from individual coverage | CRITICAL | MED | Interaction effects missed | mandatory final combined topology and native requery | DT-12 |
| R13 | Competitive | Judges see generic blast radius | HIGH | MED | Originality score loss | lead with authentic proposed-fix proof and remaining-risk honesty | DT-13 |
| R14 | Demo | Three-minute flow overruns | HIGH | MED | Key sponsor proof omitted | 2:52 script, rehearsed transitions, proof drawer prepositioned | DT-14 |
| R15 | Time | Too many screens dilute P0 | HIGH | HIGH | Core incomplete | build only S01–S07 P0 path; S08–S11 minimal but real | DT-15 |
| R16 | Scope | `2^N` returns as product story | HIGH | LOW | Confusing/non-scalable pitch | coverage matrix and one combined proof; history only | DT-16 |
| R17 | UX | Graph visualization becomes canonical truth | HIGH | MED | Inaccessible or misleading evidence | pair table canonical, text witness, bounded visual fallback | DT-17 |
| R18 | Privacy | Tokens or raw lockfiles leak into logs | HIGH | LOW | Credential/topology exposure | structured allowlisted logging and secret scan | DT-18 |
| R19 | Deployment | Public host exposes HydraDB ports | CRITICAL | LOW | Unauthorized graph access | private Docker network, firewall, external port test | DT-19 |
| R20 | Reproducibility | Receipt digest changes across identical inputs | HIGH | MED | Proof not reproducible | canonical JSON golden test and tool-version capture | DT-20 |
| R21 | Compatibility | TypeScript 7 or current package versions conflict | HIGH | MED | Build failure | install/typecheck first; pin verified compatible versions if needed | DT-21 |
| R22 | Judging | Strong claims exceed package-level evidence | CRITICAL | LOW | Credibility failure | copy allowlist, forbidden-language tests, visible limitation | DT-22 |
| R23 | Integration | HydraDB service is unavailable or times out | CRITICAL | MED | Baseline and final proof cannot run | private health gate, one idempotent read retry, explicit `ERROR`, no cached result fallback | DT-23 |

All six required risk categories are covered: technical, competitive, time, demo, judging, and scope. Security, integration, quality, privacy, authenticity, deployment, and reproducibility are added because the product is security-sensitive.

### 7.5 Judge experience

**10-second test:** the incident queue says “What requires action now?” and exposes one real selected incident, three affected applications, visible evidence factors, and verification status.

**30-second test:** opening the incident shows the source-to-application matrix, one shortest witness, and the native query drawer.

**60-second test:** the judge can open real proposed fixes, view coverage, and start the final combined verification.

There is no login wall. The first visit uses an authentically seeded public corpus. Every precomputed database row was produced by the product from frozen public inputs; no result JSON is inserted as seed data.

### 7.6 Judge proof artifacts

| Artifact | Location | Generated by | Judge claim supported |
|---|---|---|---|
| Baseline raw query and result | `/proof/[digest]` | HydraDB adapter | Native graph computation |
| Final raw query and result | `/proof/[digest]` | HydraDB adapter | Proposed-fix proof |
| Frozen corpus manifest | `submission/proof.md` | proof script | Authentic inputs and hashes |
| Receipt JSON | download and `submission/receipt.json` | receipt service | Reproducibility |
| SARIF | download and `submission/results.sarif` | SARIF exporter | Interoperability |
| HydraDB image/health | `/system` and `submission/proof.md` | health/proof script | Self-hosted OSS usage |
| Test report | `submission/test-report.md` | verification script | Pair and oracle parity |
| Repository submission manifest | root `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, and `submission/SUBMISSION-CHECKLIST.md` | Build/package task | Public-repo compliance, Track 02-A declaration, separate Best Use eligibility, demo URL/duration, and Google Form readiness |

<!-- [CRITIQUE E-1] Make the mandatory public-repository submission bundle explicit. -->
The public repository root, not only the `submission/` directory, must contain setup instructions, an explicit “How HydraDB is used” section, an open-source license, and third-party attribution. `submission/SUBMISSION-CHECKLIST.md` must record the public repository URL, demo URL, measured demo duration no greater than 3:00, and every required Google Form field before submission.

<!-- [CRITIQUE E-2] Declare the exact competition track and separate HydraDB award eligibility. -->
All submission surfaces must name **Track 02-A — Supply Chain Blast Radius** as the sole project track and may separately claim eligibility for **Best Use of HydraDB**; they must never describe Best Use as a second project track.

---

## 8. Build schedule and feature priority

### 8.1 Feature priority

| Feature ID | Feature | Priority | Acceptance observable |
|---|---|:---:|---|
| F-001 | Frozen corpus import and provenance | P0 | Six snapshots match exact hashes and extractor digests |
| F-002 | Native baseline exposure | P0 | HydraDB returns exact baseline pair digest under computed bounds |
| F-003 | Action-first incident command | P0 | Judge reaches selected impact and evidence within 30 seconds |
| F-004 | Authentic proposed-fix evaluation | P0 | Three real proposed commits fully reconstruct and classify outcomes |
| F-005 | Coverage plan and final combined proof | P0 | Final native query returns expected selected and remaining pair sets |
| F-006 | Immutable receipt and SARIF | P0 | Digest verifies and both downloads validate |
| F-007 | Fail-closed result states | P0 | Every injected refusal condition prevents verified copy |
| F-008 | Role-preserving projections | P1 | Context survives AppSec/developer/leader switch and browser history |
| F-009 | Public exact-commit import | P1 | New public repo imports without executing code |
| F-010 | Public proposed-fix discovery | P1 | Paginated PR discovery shows actor/head/file evidence |
| F-011 | Portfolio and system views | P1 | Health, freshness, counts, and single-operator boundary visible |
| F-012 | Bounded graph explorer | P2 | Selected pair has accessible visual and text witness |

### 8.2 Calendar plan

| Window | Primary objective | Secondary objective | Deliverable |
|---|---|---|---|
| Aug 19 evening | Risk-first infrastructure and frozen corpus | Domain types, store, jobs | HydraDB/Postgres round trip and removal test |
| Aug 20 morning | P0 baseline and proposed-fix domain pipeline | Oracle/BFS tests | Deterministic receipt from CLI/test harness |
| Aug 20 afternoon | S01–S07 product flow | Responsive/accessibility | Complete browser demo path |
| Aug 20 early evening | Debug, wire, restart, proof capture | README and submission files | Green test/proof report |
| Aug 20 final hours | Record ≤3-minute demo and submit | Buffer only | Public repo, video, form |

No new product feature starts after the browser demo path becomes green. The final four hours are reserved for restart verification, recording, repository checks, and submission.

---

## 9. Dependencies and prerequisites

### 9.1 Runtime services

| Service | Exact version/identity | Network exposure | Credential | P0 status |
|---|---|---|---|---|
| Web | Next.js 16.3.1 on Node 24.10.0 | Public HTTPS through reverse proxy | none, single operator | Planned |
| Worker | Node 24.10.0 | Private only | source tokens, DB, HydraDB | Planned |
| PostgreSQL | 18.6 | Private Docker network | generated password | Planned |
| HydraDB | frozen image digest | Private Docker network; no host public ports | generated bearer token | Runtime-proven locally |

### 9.2 Direct application dependencies

The authoritative exact table is `DEEP-RESEARCH.md` Section 2. Build must create a frozen pnpm lockfile and record any compatibility downgrade as a new evidence-backed decision. Floating ranges are prohibited.

### 9.3 Credentials

| Variable | Required | Purpose | Obtain |
|---|:---:|---|---|
| `DATABASE_URL` | Yes | Product state and jobs | Docker Compose generated local secret |
| `HYDRADB_HTTP_URL` | Yes | Private graph query endpoint | Compose service URL |
| `HYDRADB_TOKEN` | Yes | Graph bearer auth | Generate 32+ random bytes at deploy |
| `HYDRADB_GRAPH_NAMESPACE` | Yes | Graph namespace | Fixed `default` for P0 |
| `GITHUB_TOKEN` | No for frozen public demo; recommended | Higher read-only rate limit | Fine-grained read-only token |
| `PUBLIC_BASE_URL` | Yes for live demo | Receipt and canonical links | Deployment URL |

No OSV, CISA, or FIRST secret is required. No client bundle receives any server credential.

### 9.4 Deployment

Primary: one Linux x86_64 VM running Docker Compose on a private bridge network, with persistent volumes for PostgreSQL and HydraDB. Only reverse-proxy ports 80/443 are public. Web, worker, PostgreSQL, HydraDB HTTP, Bolt, and admin ports remain private. A Vercel-only deployment is forbidden because it cannot host the required graph engine and durable worker.

The target host is not considered ready until the frozen baseline and final receipt pair digests match the local evidence after a clean boot and after one full restart.

---

## 10. Concerns compliance

| # | Severity | Concern | PRD response |
|---:|:---:|---|---|
| 1 | C | No fabricated evidence | Frozen hashes, product-generated seed, authenticity tests, no mock path |
| 2 | C | HydraDB irreplaceability | Native baseline and final queries plus removal test |
| 3 | C | False-clean prevention | Thirteen refusal predicates and explicit states |
| 4 | C | Proposed-fix authenticity | Immutable commit/upload identity and complete reconstruction |
| 5 | C | Demo integrity | Exact corpus assertions, raw bounds, remaining-risk close |
| 6 | I | HydraDB GC warning | Pinned image, soak/restart gate, no production claim |
| 7 | I | External dependency failure | Per-source timeout, retry, cache, freshness, and failure policy |
| 8 | I | Exponential planning story | Coverage matrix, bounded solver, one final combined proof |
| 9 | I | Role-aware UX | AppSec default with context-preserving developer/leader projections |
| 10 | A | Graph is explanation, not truth | Pair matrix and receipt canonical; accessible graph fallback |

---

## 11. Definition of done

Forge hands Build a product contract only when:

- Every P0 feature maps to an architecture component, plan task, observable, and evidence artifact.
- Every screen and result state has specified copy, interaction, responsive, and accessibility behavior.
- Every integration has endpoint, auth, request/response ownership, pagination/rate behavior, cache, timeout, retry, provenance, failure UI, and test.
- Baseline and final `MSpaths` remain on the critical path and no stored-result fallback exists.
- The frozen runtime evidence is unchanged and separated from unverified capacity targets.
- The final three-minute script contains all eight flows and fits under the hard maximum.
- All PRD arithmetic gates and the mandatory 100-point phase scorecard pass.
