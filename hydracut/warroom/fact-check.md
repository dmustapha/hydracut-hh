# Top-Three Fact Check

## Evidence base

- **HydraDB OSS:** Repository commit `6a2fbb192f37f51a93690a2ae2d2f5e27e6e4219`, dated 2026-08-13.
- **HydraDB README:** https://github.com/hydra-db/hydradb
- **HydraDB compatibility guide:** https://github.com/hydra-db/hydradb/blob/main/cypher-compat.md
- **deps.dev API v3:** https://docs.deps.dev/api/v3/
- **OSV API:** https://google.github.io/osv.dev/api/
- **GitHub Dependency Review:** https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-dependency-changes-in-a-pull-request
- **GUAC incident response:** https://docs.guac.sh/guac/supply-chain/
- **GUAC patch plan:** https://docs.guac.sh/guac/patch-plan/
- **TanStack postmortem:** https://tanstack.com/blog/npm-supply-chain-compromise-postmortem

## Cross-cutting correction

The OSS engine's path procedures are snapshot-scoped, not a historical time-travel API. The repository explicitly rejects historical graph epochs as storage snapshots. Any before/after or historical concept must create explicit scenario or observation nodes and query each current scenario. It must not claim native `asOf` traversal.

## Candidate 1: CampaignRadius

### Claim 1: HydraDB can evaluate many sources and targets together

**PASS.** The official README documents `algo.MSpaths` as resolving many indexed source and target values together, avoiding client fan-out. The parser accepts `sourceLabel`, `sourceProperty`, `sourceValues`, `targetLabel`, `targetProperty`, `targetValues`, `pairwise`, `relTypes`, `relDirection`, `maxLen`, `pathCount`, and `resultLimit`.

### Claim 2: One query can map compromised package versions to application roots

**PASS with exact modeling.** Model applications as nodes connected through `DEPENDS_ON` edges to package-version nodes. Use compromised `PackageVersion.purl` values as sources, `Application.id` values as targets, and `relDirection: 'incoming'`. `algo.MSpaths` yields `path`; source, target, hop count, and intermediates are derived from the returned path.

### Claim 3: Real package and advisory data are accessible in the sprint

**PASS.** deps.dev `GetDependencies` returns resolved npm dependency graphs. OSV supports single and batch vulnerability queries by ecosystem package plus version or package URL. A bounded npm seed can therefore be ingested without scraping the full registry.

### Claim 4: The outcome is uncrowded

**PARTIAL.** GUAC already demonstrates marking a package bad, querying dependent software, visualizing blast radius, and producing patch frontiers. CampaignRadius cannot claim to invent supply-chain graph incident response. Its defensible difference is a visible native `algo.MSpaths` campaign query across many compromised versions and many application targets, plus convergence evidence and query timing.

### Track removal test

**PASS.** Removing HydraDB or replacing `MSpaths` with a static answer destroys the multi-package-to-application exposure matrix and its proof paths.

### Risk

**MEDIUM.** Technically focused and credible, but the demo must emphasize HydraDB's many-to-many primitive rather than generic blast-radius visualization.

## Candidate 2: Patch Parallax

### Claim 1: Paired scenario reachability is supported

**PASS with explicit scenarios.** HydraDB can traverse two separately loaded scenario graphs. It does not provide native historical `asOf` path queries. Baseline and proposal must be distinguished through scenario-specific nodes, labels, namespaces, or relationship types.

### Claim 2: Exact before and after lockfiles are authoritative inputs

**PASS.** Lockfiles are user-owned resolved dependency snapshots, and the demo can ingest both without claiming external repository mutation.

### Claim 3: The concept is original

**PARTIAL.** GitHub Dependency Review already compares dependencies between revisions, reports added, changed, and removed dependencies, and blocks known vulnerable additions. Patch Parallax's path-set delta is deeper, but the PR comparison surface is crowded.

### Track removal test

**PASS.** Without two HydraDB traversals, the product can show a lockfile diff but cannot classify transitive exposure paths as removed, persistent, or introduced.

### Risk

**MEDIUM.** Highly buildable and usable, but originality is the weakest of the top three.

## Candidate 3: HydraCut

### Claim 1: HydraDB can produce the path universe needed for a cut plan

**PASS with bounds.** `algo.MSpaths` supports `pathCount` and `resultLimit`, so the product must state that optimization is over the enumerated bounded path set. It must not claim an unbounded global minimum.

### Claim 2: A proposed cut can be verified by a second HydraDB query

**PASS with explicit projected topology.** Build a separate projected scenario graph excluding the candidate cut, then rerun `MSpaths`. Zero returned paths proves no exposure within the chosen source set, target set, relationship types, and `maxLen` bound.

### Claim 3: The remediation result is new

**PARTIAL.** GUAC already documents patch frontiers and points of contact. HydraCut's stronger claim is portfolio-level cut optimization plus counterfactual zero-path verification, not patch planning in general.

### Track removal test

**PASS.** HydraDB path output is both the optimization input and the verification receipt.

### Risk

**MEDIUM-HIGH.** It has the strongest novel action but the highest build and truth-labeling burden. A graph cut is not proof of package compatibility or deployment safety.

## Fact-check verdict

| Candidate | Round-0 average | Failed load-bearing claims | Catalog | Collision risk | Build risk |
|---|---:|---:|---|---|---|
| CampaignRadius | 8.20 | 0 | CLEAR | Medium | Low |
| Patch Parallax | 8.13 | 0 | CATALOG-ADJACENT | High | Low |
| HydraCut | 7.93 | 0 | CATALOG-ADJACENT | Medium | Medium-high |

**Selection:** CampaignRadius. It is the highest-scoring zero-failure candidate, uses HydraDB's most distinctive verified primitive directly, and has the lowest chance of missing the deadline. HydraCut's counterfactual cut remains the strongest post-MVP extension, not part of the winning core.
