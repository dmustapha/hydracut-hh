# Hack Hydra Warroom Transcript

## Phase 1: Setup

- **Track contract:** `single-track`, Track 02-A only.
- **Required primitive:** Self-hosted HydraDB OSS plus visible OpenCypher or `algo.*paths` traversal on the critical path.
- **Scope:** One builder, roughly 2.5 days, one decisive 90-second demo inside a 3-minute video.
- **Judging weights:** The event publishes five criteria but no weights. Round 0 uses an explicit equal-weight assumption of 20 percent each.
- **Upstream blockers:** None.
- **Downstream item accepted:** User-supplied Discord evidence is integrated into the market and competitor maps.
- **In-flight collision check:** Targeted search of sibling active and candidate project briefs found no dependency-graph, typosquat, or remediation-cut duplicate owned by Dami.

## Phase 2: Generate

- **Recovered generators:** Defender/IR, shift-left/CI, forensics/provenance, graph-primitive maximalist.
- **Rerun generator:** Orthogonal wildcard/whitespace lens, after the original fifth agent returned only a session-limit message.
- **Raw pool:** 17 ideas.
- **Schema verification:** All 17 include the 17 required fields from the warroom generator format.
- **Mechanism diversity:** Reachability, many-to-many campaign analysis, counterfactual cuts, temporal replay, publisher provenance, typosquat lineage, CI state comparison, and remediation routing.
- **Cross-pollination:** Simulation-to-real routing, honesty labels, pre/post audit, consensus as multi-path corroboration, and first-session interaction.
- **Prompt hygiene:** Four recovered prompts and the fifth rerun were created before gate-only named collision material was applied.

Raw artifacts:

- `warroom/recovered-pool.md`: Ideas 1 to 12.
- `warroom/wildcard-pool.md`: Ideas 13 to 17.

## Phase 3: Synthesis

### Candidate A: CampaignRadius `[EXPANDED]`

**Merged from:** Zero, Fleet BlastRadius, Campaign Lens, and PathWitness.

**Core:** `algo.MSpaths` maps a multi-package compromise to many owned services in one database operation. Each affected service carries a shortest exposure witness and evidence provenance.

**Differentiation:** Incident-centered many-to-many campaign correlation, not a generic dependency graph or repository-local alert list.

**Catalog assessment:** `CLEAR`. It adapts live operations and honesty-labeled analytics but shares no three-primitives-plus-domain surface with one catalog winner.

### Candidate B: HydraCut `[EXPANDED]` `[CATALOG-ADJACENT]`

**Merged from:** Patient Zero, ChokePoint, and HydraCut.

**Core:** Enumerate compromise-to-application paths with `algo.MSpaths`, compute a small hitting set of dependency changes, then rerun reachability against a projected graph to prove the reduction.

**Differentiation:** Existing scanners enumerate findings and may recommend fixes. HydraCut optimizes across the whole incident and proves the portfolio-level consequence of a coordinated remediation plan.

**Catalog assessment:** `CATALOG-ADJACENT`. It shares simulation and computed recommendations with LPlens, but the domain, data model, and load-bearing mechanism differ.

### Candidate C: Patch Parallax `[EXPANDED]` `[CATALOG-ADJACENT]`

**Merged from:** BlastGate, DiffRadius, and Patch Parallax.

**Core:** Compare two exact lockfile scenarios using paired reachability queries and classify exposure paths as removed, persistent, or introduced.

**Differentiation:** Path-level portfolio proof before merge, not merely a dependency diff or CVE check.

**Catalog assessment:** `CATALOG-ADJACENT`. It adapts Aegis402's before-and-after guard pattern plus LPlens evidence labels.

### Candidate D: Maintainer Fuse `[EXPANDED]`

**Merged from:** MaintainerReach and Serial Publisher.

**Core:** Detect a time-bounded cross-package publish burst for one maintainer, then traverse affected versions to their downstream consumers and show ownership concentration.

**Differentiation:** Maintainer-behavior trigger before an advisory, joined to graph impact.

**Catalog assessment:** `CLEAR`. No catalog winner uses publisher behavior plus dependency reachability.

### Candidate E: Lineage Tripwire `[EXPANDED]`

**Merged from:** Typo Tripwire, Typosquat Lineage, and TypoTrace.

**Core:** Use deterministic name-similarity edges, maintainer lineage, and dependency paths to prioritize look-alike package risk.

**Differentiation:** Provenance overlap and organizational consequence, rather than edit distance alone.

**Catalog assessment:** `CLEAR`.

### Candidate F: Blast Replay

**Source:** Blast Replay.

**Core:** Traverse lockfile or SBOM snapshots constrained to a malicious publication window to prove assets that were exposed then even if clean now.

**Differentiation:** Historical incident exposure backed by graph snapshots and timestamps, not a cinematic animation fabricated from current state.

**Catalog assessment:** `CLEAR`.

### Candidate G: Escape Routes

**Source:** Escape Routes.

**Core:** Search version-upgrade relationships for several bounded remediation paths, then reject any candidate that still reaches the compromise.

**Differentiation:** Alternative upgrade routes under constraints rather than one latest-version recommendation.

**Catalog assessment:** `CLEAR`.

### Pool health

- Seven candidates remain after synthesis.
- Six distinct mechanism families are present.
- Two candidates use explicit cross-pollination.
- No single mechanism family exceeds 50 percent of the pool.
- Repeated reachability ideas were merged because they shared the same surface and graph primitive.

## Phase 4: Hard Gates

| Candidate | Gate 0 Market | Gate 0b Operability | Gate 1 Relevance | Gate 2 Build | Gate 3 HydraDB | Gate 3b Provenance | Gate 3c Track | Gate 4a Prior | Gate 4b Catalog | Gate 5 Demo | Gate 6 Native | Result |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CampaignRadius | Pass | Pass with labeled demo portfolio | Pass | Pass | Pass | Pass | Pass | Pass | Clear | Pass | Pass | SURVIVE |
| HydraCut | Pass | Pass with projected graph boundary | Pass | Pass if hitting set is bounded | Pass | Pass | Pass | Pass | Adjacent | Pass | Pass | SURVIVE |
| Patch Parallax | Pass | Pass with uploaded before/after lockfiles | Pass | Pass | Pass | Pass | Pass | Pass | Adjacent | Pass | Pass | SURVIVE |
| Maintainer Fuse | Pass | Pass if detection remains advisory | Pass | Pass with one incident window | Pass | Pass | Pass | Pass | Clear | Pass | Pass | SURVIVE |
| Lineage Tripwire | Fail | Fail reachable-first-users test | Marginal | Pass | Pass | Pass | Pass | Pass | Clear | Pass | Pass | KILL |
| Blast Replay | Pass | Pass with Git-backed snapshots and labeled deployment fixtures | Pass | Pass if reduced to two to four snapshots | Pass | Pass | Pass | Pass | Clear | Pass | Pass | SURVIVE |
| Escape Routes | Pass | Fail candidate-version compatibility authority | Pass | Fail in sprint | Pass | Pass | Pass | Pass | Clear | Pass | Pass | KILL |

### Causes of death

**Lineage Tripwire:** Killed by Gate 0. The most natural buyer is a registry security team that one builder cannot reach as a first-five-user channel. Retargeting it to ordinary application security collapses the novelty into a feature already covered by package-risk tools.

**Escape Routes:** Killed by Gates 0b and 2. Registry release metadata cannot prove application compatibility, and building a trustworthy version solver plus safety verifier in 2.5 days is not credible.

### Surviving authority boundaries

- Public package, advisory, and registry evidence may be live.
- Private organization topology is a clearly labeled local fixture or user-provided lockfile set.
- Proposed remediations are simulations. The app does not claim to merge, publish, deploy, or rotate credentials.
- Every result must show the exact HydraDB query, path response, input provenance, and query timing.

## Phase 5: Round-0 Scoring

Three independent scorers received randomized candidate order. Equal 20 percent weights were used because Hack Hydra publishes criteria without weights.

| Rank | Candidate | Scorer 1 | Scorer 2 | Scorer 3 | Average | Health |
|---:|---|---:|---:|---:|---:|---|
| 1 | CampaignRadius | 8.20 | 8.20 | 8.20 | **8.20** | Highest Track depth, stable consensus |
| 2 | Patch Parallax | 8.40 | 8.00 | 8.00 | **8.13** | Strongest usability, originality risk |
| 3 | HydraCut | 8.00 | 7.40 | 8.40 | **7.93** | Highest variance, strongest novel action |
| 4 | Blast Replay | 7.20 | 7.60 | 7.80 | **7.53** | Temporal API correction applies |
| 5 | Maintainer Fuse | 6.40 | 6.60 | 7.00 | **6.67** | Weak trigger precision |

`[TIGHT]`: The top three are separated by 0.27 points, so all advance to fact-check.

## Phase 6: Fact Check

Fact-check artifact: `warroom/fact-check.md`.

- **CampaignRadius:** Zero failed load-bearing claims. `MSpaths`, deps.dev, and OSV capabilities verified. Generic blast-radius novelty downgraded because GUAC already covers that surface.
- **Patch Parallax:** Zero failed load-bearing claims after replacing native time-travel assumptions with explicit scenario graphs. High collision risk with GitHub Dependency Review.
- **HydraCut:** Zero failed load-bearing claims when optimization is explicitly bounded and remediation remains a simulation. GUAC already offers patch frontiers, so novelty must be optimization plus second-query verification.
- **Global correction:** HydraDB OSS supports current pinned snapshots, not historical `asOf` path traversal.

## Phase 7: Winner Selection

**Winner: CampaignRadius, 8.20/10, CLEAR, MEDIUM risk.**

It is the highest-scoring candidate with no failed fact checks, the simplest credible sprint build, and the deepest direct use of HydraDB's distinctive verified primitive. HydraCut becomes the strongest post-MVP extension, not part of the warroom winner.
