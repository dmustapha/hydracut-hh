# WINNER-BRIEF.md: Hack Hydra

## Thesis

**Scanners tell you which package is bad. CampaignRadius shows the entire incident as one graph query.** A modern supply-chain campaign can compromise dozens of versions in minutes, while security teams still correlate repository alerts one at a time. CampaignRadius loads real npm dependency data plus an owned application portfolio into self-hosted HydraDB, then uses one native `algo.MSpaths` traversal to map many compromised versions to every affected application, preserve the exact exposure witnesses, and reveal shared convergence points. The graph traversal is not a feature. It is the product result, which directly targets Track 02-A and the separate Best Use of HydraDB award.

## Idea

**Name:** CampaignRadius

**Problem:** Multi-package compromises arrive as separate alerts, forcing incident responders to manually merge affected repositories and dependency paths while the response clock is running.

**Mechanism:** `algo.MSpaths` evaluates many compromised `PackageVersion` sources against many `Application` targets in one pinned HydraDB snapshot and returns the bounded exposure paths.

**HydraDB-Native Angle:** HydraDB's many-source path procedure creates the campaign-to-application exposure matrix directly. Removing it collapses the product into repository-by-repository scans or client-side fan-out.

**Sponsor Fit:** Self-hosted HydraDB OSS stores the package-version graph, ingests batched OpenCypher writes, and performs the judge-visible `MSpaths` query over `DEPENDS_ON` relationships.

**Differentiation:** GUAC and commercial scanners already visualize dependency blast radius. CampaignRadius narrows the job to coordinated multi-package incidents and proves the result through one native many-to-many HydraDB query, convergence nodes, evidence paths, and query timing.

**Demo Hook:** Select the real 42-package TanStack incident set. One click runs `algo.MSpaths`; affected applications light up, and a convergence toggle reveals which internal service is exposed through several independent compromised paths.

**Competitor-Derived Insight:** Existing scanners prove teams value advisory matching, transitive paths, and repository workflows. Their repeated repository-local or single-incident-source model leaves campaign-wide correlation as the sharper outcome.

**Missing Outcome:** One incident-centered view that maps many compromised package versions to many owned applications without client fan-out.

**Multi-Track Architecture:** Single-track contract. Track 02-A uses package-version dependency topology plus `algo.MSpaths` to produce campaign-wide blast radius.

**Per-Track Load-Bearing Test:** Remove HydraDB or replace `MSpaths` with stored JSON and the application can no longer compute, reproduce, or explain the joint exposure matrix.

**Joined Proof Path:** deps.dev package graph plus OSV or TanStack compromised purls plus labeled application lockfile fixtures, batched OpenCypher ingest, live `MSpaths`, returned exposure paths, convergence aggregation, raw query and timing shown to judges.

**Adaptation Note:** Live operations provide the instant incident response. Honesty-labeled analytics attach provenance and distinguish real public package evidence from the labeled organization fixture. Multi-input consensus is remixed into multi-path corroboration, where independent exposure routes increase incident priority.

## Exact Load-Bearing Query

```cypher
CALL algo.MSpaths({
  sourceLabel: 'PackageVersion',
  sourceProperty: 'purl',
  sourceValues: $compromisedPurls,
  targetLabel: 'Application',
  targetProperty: 'id',
  targetValues: $applicationIds,
  pairwise: false,
  relTypes: ['DEPENDS_ON'],
  relDirection: 'incoming',
  maxLen: 8,
  pathCount: 3,
  resultLimit: 2000
})
YIELD path
RETURN path
```

The build must validate this exact form against the running Docker image before the UI depends on it. `fairRelationshipVariants` is intentionally excluded because the OSS parser supports it only for unweighted pairwise `MSpaths` queries.

## Scoring

| Criterion | Weight | Score | Justification |
|---|---:|---:|---|
| Technical execution | 20% | 8.0/10 | One native query, bounded npm corpus, and labeled application fixtures fit the sprint. |
| Use of HydraDB and graph-native approaches | 20% | 10.0/10 | `algo.MSpaths` directly produces the many-to-many incident result. |
| Product completeness and usability | 20% | 8.0/10 | The select, traverse, inspect, and converge flow is coherent within 90 seconds. |
| Quality of results | 20% | 8.0/10 | Every affected application includes path evidence, provenance, bounds, and timing. |
| Originality | 20% | 7.0/10 | Generic blast radius is established, but native campaign-wide correlation is a sharper mechanism. |

**Total Weighted:** 8.20/10

**Shadow: Catalog Novelty:** 7.0/10

**Shadow: Generative Competitor Leverage:** 8.67/10

## Track Depth

| Required Track | Primitive | Necessary Outcome | Removal Test | Proof Evidence | Score |
|---|---|---|---|---|---:|
| Track 02-A | Native `algo.MSpaths` over `DEPENDS_ON` | Many compromised versions mapped to affected applications and exact witnesses | Removing HydraDB leaves isolated scans or client fan-out | Live query, raw path JSON, graph animation, provenance, timing | 10/10 |

## Catalog Context

**Catalog Assessment:** CLEAR

**Primitives Adapted:** Graph-native many-to-many evaluation, live operations, honesty-labeled analytics, multi-input corroboration, and first-session visual consequence.

**Differentiation From Sources:** No catalog winner uses HydraDB's indexed many-source path procedure for coordinated software-supply-chain incident response.

**Catalog-Inspired, Not Catalog-Derived:** The brief borrows proven presentation and evidence patterns while its core computation comes from Hack Hydra's native graph primitive and Track 02-A problem.

## Risks

- **Collision:** GUAC already demonstrates graph-based supply-chain incident response. The pitch must lead with one `MSpaths` campaign query, not claim generic blast-radius novelty.
- **Fixture honesty:** Public package and advisory data are real. Application names, ownership, and private lockfiles are clearly labeled demo fixtures unless actual authorized inputs are provided.
- **Bounded truth:** Results are valid for the supplied source set, target set, `DEPENDS_ON` edges, `maxLen`, `pathCount`, and `resultLimit`. Show these bounds.
- **No native time travel:** HydraDB OSS path procedures use the current pinned snapshot. Do not claim built-in historical `asOf` traversal.
- **Runtime verification:** Docker was unavailable during warroom fact-checking. The first build gate is a round-tripped write followed by the exact `MSpaths` query.

## Build Order

1. Start HydraDB Docker and prove the exact `MSpaths` call against a six-node fixture.
2. Build the TanStack incident demo corpus and application fixture graph.
3. Render returned paths as the hero graph plus affected-application table.
4. Add convergence aggregation, provenance cards, raw Cypher, and query timing.
5. Add OSV or deps.dev ingestion only after the money-shot demo is stable.

## Hold Point

Warroom is complete. Do not begin forge until Dami approves this winner.
