# FOR Dami: How HydraCut Actually Works

## The product in one sentence

HydraCut takes real npm dependency snapshots, finds exact package versions with real OSV advisories, uses HydraDB to prove which applications are reachable from those versions, and then evaluates real proposed fixes by querying their resolved dependency states again.

## The two product halves

### CampaignRadius is the evidence engine

It answers:

> For these selected affected package versions and these applications, which source-to-application pairs are connected through the resolved dependency graph?

HydraDB answers with native `algo.MSpaths`. The stable result is the source-to-application pair. A displayed dependency chain is one shortest witness for that pair.

### HydraCut is the action and proof engine

It answers:

> Among the real proposed-fix commits or lockfiles supplied, which bounded plan leaves the fewest selected-incident exposure pairs?

HydraCut never invents an upgrade. It reconstructs every proposed-fix lockfile, creates a thin proposed scenario in HydraDB, reruns `MSpaths`, and compares the residual pair set.

## The graph walk

```text
IncidentSource
  <- MATCHES_INCIDENT - PackageInstance
  <- PROD_DEPENDS_ON / DEV_DEPENDS_ON - ...
  <- dependency edges - ApplicationSnapshot
  <- USES_SNAPSHOT - ScenarioApplication
```

The walk runs backward because the stored dependency edge points from a consumer to what it depends on. Starting at the affected package and traversing incoming edges reveals downstream applications.

## Why thin scenarios matter

Each authentic repository commit graph is stored once. A proposed plan creates only:

- One target node per application.
- One source anchor per selected affected package version.
- Edges selecting the baseline or proposed snapshot.
- Edges matching affected package instances to the selected incident.

The verified three-application runtime evidence needed only 4 scenario nodes and 3 to 6 scenario edges per tested historical combination. That exhaustive eight-state check is regression evidence, not the scalable product algorithm: the product uses coverage-based planning and one final combined proof.

## What the verified demo proves

- Three authentic baseline repositories contain `minimist@1.2.5`.
- A real OSV advisory identifies that exact version as affected.
- HydraDB returns three selected-incident application pairs.
- Only one pair is production-scope; two are development-scope.
- Three authentic later commits contain `minimist@1.2.6` instead.
- Historical pre-Forge verification queried all eight small-corpus combinations as a regression oracle.
- The scalable product chooses from verified coverage and then sends the chosen combined state through one fresh native traversal.
- The all-three proposed plan returns zero selected minimist pairs while other real advisory-backed sources still return six pairs.

The honest conclusion is:

> The selected minimist incident is cleared in this verified proposed-fix graph within displayed bounds. The portfolio is not certified safe.

## Why HydraDB is load-bearing

HydraDB performs the baseline reachability calculation and the final combined proposed-fix calculation. It also stores the authentic resolved graph and returns query receipts with a read epoch and bookmark.

The frontend cannot replace this with stored JSON without losing the actual product computation. There is no hosted SDK shortcut, embedding search, cosine similarity, or LLM in the MVP.

## How the Forge design protects truth

- Baseline and final results both require self-hosted HydraDB OSS, explicit OpenCypher, and native `algo.MSpaths`.
- Every selected advisory is refreshed by exact package/version before proof; withdrawn or unavailable evidence blocks a fresh receipt.
- Native results are compared to independent BFS pair sets, selector counts, bounds, cursor state, duplicate counts, epoch, bookmark, and graph readback.
- Plans bind immutable snapshot keys, source coordinates, baseline pair sets, and scopes. Drift produces `UNKNOWN`, never silent reuse.
- KEV and EPSS enrich prioritization but cannot manufacture a clean result; unavailable enrichment is visibly unknown and recorded as a limitation.
- The canonical unit is a source-to-application pair. A displayed dependency path is one shortest witness, not proof of exploitability.

## What Forge produced

The current source of truth is now:

- `hydracut/PRD.md` — what the product promises and refuses to claim.
- `hydracut/ARCHITECTURE.md` — exact authored files, contracts, deployment, UI, integration, and test design.
- `hydracut/PLAN.md` — risk-first Build order with hard gates and decision trees.
- `FEATURE-OBSERVABLES.md` — behavioral proof required for every P0/P1 feature.
- `TRACEABILITY.md` — feature-to-code-to-test lineage.

Forge specifies the system; it does not claim that the unbuilt application already passes these gates. Build begins with pinned dependency compatibility and the native HydraDB contract. UI work starts only after baseline truth and external-source composition are executable.

## Forge result

Forge is complete at **94/100**, with **92/100 winner readiness** and no critical gate failure. The independent audit passed Architecture 10/10, Plan 7/7, and cross-document consistency 9/9.

The important distinction is that this is a blueprint victory, not a runtime victory. The design now closes the ways HydraCut could accidentally look successful—stale evidence, incomplete paths, hidden proof fixtures, removed packages, mismatched scopes, mutated lockfiles, or an unavailable graph. Build must now make each authored contract executable in order, beginning with pinned compatibility and the native HydraDB round trip.

## What the local gate repair proved

Browser tests now reuse a verified receipt instead of rerunning live GitHub/OSV acquisition for every browser project. That separates evidence acquisition from UI verification: the corpus gate proves the data, while Playwright proves that the product presents and acts on it correctly.

The API dispatcher now awaits route handlers inside its error boundary, so asynchronous Zod failures become explicit fail-closed response envelopes. The queue producer starts pg-boss before sending a job, and scenario writes clean their exact retry key both before and after execution. Together these changes make retries deterministic without weakening any proof requirement.

The remaining `DEP-001` item is infrastructure, not a local test failure: the final stack still needs a persistent zero-cost VM before Deploy and formal live rehearsal.
