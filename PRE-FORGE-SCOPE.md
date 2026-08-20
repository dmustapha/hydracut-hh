# HydraCut + CampaignRadius: Pre-Forge Product Contract

Status: **Ready for user scope review, not authorized for Forge**  
Verified through: 2026-08-19  
Track: Hack Hydra 02-A, Repositories, Dependencies, and Code as Graphs  
Core database: self-hosted HydraDB OSS only

## 1. Decision

Build **HydraCut**, powered by the **CampaignRadius** evidence engine.

> Given authentic npm lockfiles, real advisory records, and authentic candidate commits or lockfiles, HydraCut uses self-hosted HydraDB to prove which applications are dependency-exposed, find the exact minimum candidate combination within declared bounds, and rerun the graph traversal to prove which selected-incident exposure pairs remain.

This is not a vulnerability scanner with a graph screen. HydraDB performs both decisive computations:

1. Baseline many-source-to-many-application exposure discovery.
2. Candidate-scenario residual exposure verification.

If HydraDB or its native path procedures are removed, the product cannot compute its main result or its remediation receipt.

## 2. Why this version survives the originality test

CampaignRadius alone is not original enough. Public Hack Hydra competitors already perform HydraDB-backed dependency blast radius.

| Project | Verified public capability | What it does not prove in the inspected code | HydraCut distinction |
|---|---|---|---|
| [Reachable](https://github.com/yashksaini-coder/Reachable) | Historical lockfiles, OSV, `MSpaths`, exposure timing, maintainers, typosquats, import reachability, tests, and benchmarks | No authentic candidate resolved graph followed by a second traversal | Candidate commits become separately materialized graphs and are re-queried |
| [HyperDefense](https://github.com/Techkeyy/hyperdefense) | Dependency, maintainer, and temporal graphs, `MSpaths`, TanStack fixture, remediation artifacts, CI gate | Its inspected remediation path creates a blocklist/override plan and scans a lockfile; it does not query a candidate projected graph | A candidate is accepted only as a real resolved lockfile or commit, then HydraDB proves residual pairs |
| [radius](https://github.com/phllp-tanstic/radius) | Graph-native blast radius and greedy set cover over returned witness chains | Selects graph nodes from witness paths, not real version changes; no candidate lockfile projection or second-query proof | Optimization is restricted to authentic supplied changes, not arbitrary nodes |
| [GUAC](https://guac.sh/) and existing SCA tools | Mature software-supply-chain metadata, advisory matching, and graph analysis | These already invalidate generic “graph blast radius is new” claims | The narrow job is bounded proof-carrying candidate selection for a selected incident |

The defensible novelty is therefore:

**Proof-carrying remediation over authentic candidate dependency states.**

We must never pitch “blast radius” or “minimal graph cut” alone as the innovation.

## 3. Utility and market

### User

- Primary operator: AppSec or product-security engineer responding to a dependency incident.
- Secondary operator: platform engineer or engineering lead coordinating fixes across repositories.
- Future buyer: security platform, application security, or software-supply-chain team.

### Market

This belongs to DevSecOps, application security, software composition analysis, and software-supply-chain incident response. It is not Web3 or crypto related.

### Existing workflow failure

Existing tools can report separate repository findings. The hard organizational question is different:

1. Which applications are reachable from this selected affected package-version set?
2. Through which exact resolved dependency chain?
3. Which supplied real candidate changes clear the most selected-incident exposure?
4. Does the resolved candidate portfolio actually remove those paths?
5. Which unrelated known advisories still remain afterward?

HydraCut makes that workflow deterministic and reproducible across a portfolio.

### Why a normal LLM is insufficient

An LLM can explain a result, but it is not the source of truth for exact installed versions, dependency edges, bounded reachability, or exhaustive candidate combinations. It can omit paths, invent packages, confuse version ranges, and cannot produce a repeatable graph snapshot receipt without deterministic tools.

No LLM is required in the MVP. An optional future explanation layer may summarize only returned evidence and must remain removable.

## 4. Product truth contract

HydraCut detects:

- Exact `package@version` instances in committed npm lockfiles.
- Matches between those versions and known OSV advisory records.
- Reachable source-to-application pairs within the imported graph, selected dependency scopes, selected source set, and declared maximum depth.
- One shortest witness path per reachable source-to-application pair.
- Residual pairs after replacing baseline snapshots with supplied authentic candidate snapshots.
- Other OSV-matched package versions that persist in the candidate state.

HydraCut does not detect or prove:

- Exploitability in the application’s runtime context.
- Function-level or symbol-level reachability.
- Active compromise, malware execution, or production deployment.
- Whether a candidate builds, passes tests, preserves APIs, or is safe to deploy.
- Every possible dependency path when `pathCount` is 1.
- Unbounded graph reachability.
- A globally minimal remediation over changes the user did not supply.

Approved result language:

- “Dependency-level potential exposure.”
- “Reachable within the imported graph and displayed bounds.”
- “One shortest witness path.”
- “Selected incident cleared in the candidate graph.”
- “Exact minimum among the supplied candidates and declared limits.”

Rejected result language:

- “Exploitable.”
- “Compromised.”
- “Completely safe.”
- “All paths” without a path-count and depth qualification.
- “Automatic fix.”
- “Global minimum cut.”

## 5. User workflow

### Prepared historical demo

1. User opens the verified demo portfolio.
2. The app displays repository URLs, immutable commit SHAs, lockfile SHA-256 hashes, and OSV source timestamps.
3. The user selects one or more real vulnerable package versions.
4. HydraDB runs the baseline `MSpaths` traversal.
5. The UI shows reachable application pairs and one shortest witness per pair.
6. The user opens Candidate Lab and selects supplied authentic candidate commits.
7. HydraCut evaluates every allowed candidate subset as a separate graph scenario.
8. The UI ranks combinations for the selected incident.
9. The user opens the winning scenario receipt and sees the second traversal, residual selected-incident pairs, and unrelated OSV findings that remain.

### Real user scan

1. User adds one or more public GitHub repositories at an exact commit, or uploads `package.json` plus `package-lock.json`.
2. If the URL points to a branch or `HEAD`, the service resolves and records an immutable commit SHA before analysis.
3. The service fetches files only. It never clones, installs, builds, or executes repository code.
4. npm Arborist reconstructs the exact virtual dependency tree from the lockfile.
5. Exact package versions are batch-queried against OSV.
6. The resolved graph and provenance are ingested into self-hosted HydraDB.
7. The user chooses an incident source set and dependency scopes.
8. HydraDB computes the bounded exposure pairs.
9. The user may add authentic candidate commits or lockfile pairs.
10. HydraCut evaluates those candidates and produces a reproducibility receipt.

The app never modifies the user’s repository and never creates vulnerabilities.

## 6. MVP input contract

### Supported

- npm only.
- Public GitHub repository plus exact commit SHA.
- Uploaded `package.json` and `package-lock.json` pair.
- `package-lock.json` lockfile versions 2 and 3, which were exercised in the historical corpus.
- Up to 10 baseline application snapshots per portfolio.
- Up to 6 candidate actions per planning run.
- Up to 10 MiB per uploaded or fetched lockfile.
- Up to 5,000 package instances per snapshot.
- Maximum path length 16 total relationships, including `MATCHES_INCIDENT`.

### Not supported in MVP

- Private GitHub organizations or OAuth connectors.
- Arbitrary Git hosts or arbitrary URLs.
- yarn, pnpm, PyPI, Maven, Cargo, or container SBOMs.
- npm lockfile v1 until it passes the same extraction fixtures.
- Monorepo workspace semantics that Arborist cannot reconstruct from the supplied root files.
- Candidate generation from advisory text.
- Pull-request creation or repository writes.

## 7. Authentic demo corpus

The main demo uses three public repositories and genuine Dependabot-era transitions. No repository, dependency, advisory, or fix is fabricated.

| Repository | Baseline commit | Candidate commit | Baseline lock SHA-256 | Candidate lock SHA-256 | Selected-incident scope |
|---|---|---|---|---|---|
| `bradtraversy/nodekb` | `0d2634e7310afc8f82aba1dc082632f68557abc9` | `5762100bfb342353e98f171238980e9b693ab520` | `5dd9da02108f8bf2bc58f9cd99977e9244424f602ff6cea3eb857254e5ac4e9e` | `88380b7cbd655d655bf1aa0c5a6ffae4ae25f8a838b4a770b6e55e0cdce94fe8` | production |
| `BetaHuhn/spaces-cli` | `7c7d74f777bf4dd08f348dee8522b2a1a1e471a1` | `17e68f80b8578ea1db64277888a712cc0d8a257f` | `3c9fbe5313f7a718f5e947139579cb303df257d6634099f55095684381f714d0` | `e5ddc567bd4d6e09795b04985452fdf38fc2053b614282c24671aca2749a1c66` | development |
| `arkon/crcmaker` | `227810dc672395ad24b4bd732128aa708e942bf2` | `d19651452306478be6b0dd582ecfcf024beebaeb` | `0fe60a4752b22c70d6c7c211843ba9eb6023dcd668686bfb6a1742ba86124ee6` | `77477a5b51e7176c28cb03fcb84ec8182271fa472946e0c268e0cdd6da0e5660` | development |

Selected incident:

- `minimist@1.2.5`
- OSV `GHSA-xvch-5gv4-984h`
- Alias `CVE-2021-44906`
- Verified candidate version `minimist@1.2.6`
- Current OSV query for `1.2.6` returned no match for this advisory.

Verified selected-incident witness examples:

- `minimist@1.2.5 <- mkdirp@0.5.5 <- node-pre-gyp@0.15.0 <- bcrypt@5.0.0 <- nodekb`
- `minimist@1.2.5 <- http-server <- crcmaker`
- `minimist@1.2.5 <- rc` or another equal-length resolved witness chain `<- ... <- spaces-cli`

The displayed chain is one shortest witness. Equal-length witnesses may vary, so source-to-application pairs, not exact path arrays, are the stable comparison unit.

### Real many-source proof

The same unmodified baseline portfolio was batch-queried against OSV:

- 1,253 unique package versions.
- 105 package versions with at least one current OSV match.
- Three legible demo sources reach all three applications:
  - `minimist@1.2.5`
  - `semver@5.7.1`
  - `brace-expansion@1.1.11`

The live scenario-scoped `MSpaths` proof returned:

- Baseline: 3 source anchors, 3 application targets, 9 reachable source-target pairs.
- Candidate portfolio: 3 source anchors, 3 targets, 6 residual pairs.
- Selected minimist incident after all three authentic candidate changes: 0 residual pairs.

Therefore the product must say:

> The selected minimist incident is cleared in the candidate graph. Six pairs from the other two selected vulnerable versions remain. This does not certify the portfolio as safe.

## 8. Graph ontology

### Critical-path nodes

`ApplicationSnapshot`

- Integer `id`
- `snapshot_key`
- repository owner/name
- immutable commit SHA
- lockfile SHA-256
- extraction status and maximum observed dependency depth

`PackageInstance`

- Integer `id`
- unique instance key
- package name and exact version
- purl
- lockfile location
- repository and commit SHA
- immutable snapshot key
- npm dependency classification

`ScenarioApplication`

- Integer `id`
- unique scenario/application key
- `scenario_key`
- `portfolio_key`
- repository identity
- role as the path-procedure target for one selected snapshot

`IncidentSource`

- Integer `id`
- unique scenario-scoped `source_selector`
- affected package name, version, and purl
- selected incident key

### Provenance and planning nodes

- `Advisory`: OSV ID, aliases, modified timestamp, source URL, affected range, withdrawn state.
- `Scenario`: baseline or candidate bundle, input hashes, creation time, status.
- `CandidateAction`: baseline snapshot, candidate snapshot, source URL, commit SHA, lockfile diff counts.
- `ProofReceipt`: query hash, bounds, result digest, read epoch, bookmark, timing, and status.

### Critical relationships

- `(ApplicationSnapshot)-[:PROD_DEPENDS_ON]->(PackageInstance)`
- `(ApplicationSnapshot)-[:DEV_DEPENDS_ON]->(PackageInstance)`
- `(ApplicationSnapshot)-[:OPTIONAL_DEPENDS_ON]->(PackageInstance)`
- `(ApplicationSnapshot)-[:PEER_DEPENDS_ON]->(PackageInstance)`
- `(ApplicationSnapshot)-[:OTHER_DEPENDS_ON]->(PackageInstance)`
- Package-instance dependency edges use the same mutually exclusive types.
- `(ScenarioApplication)-[:USES_SNAPSHOT]->(ApplicationSnapshot)`
- `(PackageInstance)-[:MATCHES_INCIDENT]->(IncidentSource)`

Every dependency edge receives exactly one scope type. The graph must not also create a generic duplicate dependency edge because duplicate relationship variants can consume path results and destabilize witnesses.

Metadata edges such as `SUPPORTED_BY`, `DERIVED_FROM`, and `APPLIES_CHANGE` are excluded from path-procedure `relTypes`.

## 9. Identity and scenario isolation

HydraDB requires non-negative integer node and relationship IDs.

The application will:

1. Construct a canonical string key containing scenario, repository, commit, lockfile location, package, version, and edge endpoints as applicable.
2. Hash it with SHA-256.
3. Convert the first 13 hexadecimal digits to a 52-bit non-negative safe integer.
4. Maintain an ingestion-time ID-to-key registry.
5. Reject the scan on any collision instead of overwriting data.

Product identifiers remain string properties. They are not used as HydraDB internal IDs.

HydraDB path procedures query the current graph snapshot and do not provide application-selectable historical `asOf` traversal. Therefore:

- Every authentic repository commit is materialized once as an immutable `ApplicationSnapshot` plus its snapshot-scoped `PackageInstance` topology.
- Each candidate combination is a thin scenario projection containing `ScenarioApplication` targets that select the appropriate immutable snapshots through `USES_SNAPSHOT`.
- Each scenario receives its own `IncidentSource` anchors and scenario-owned `MATCHES_INCIDENT` edges to package instances in its selected snapshots.
- Every `source_selector` is unique to exactly one scenario and one affected package version.
- Every `ScenarioApplication` target in a scenario shares one strict-format `portfolio_key`.
- The target filter and scenario-specific source selectors prevent one scenario from contributing results to another.

This thin-projection design was live-tested across all 8 demo combinations. Each scenario required 4 nodes, consisting of 3 targets and 1 incident anchor, plus 3 to 6 scenario edges, and returned the same residual sequence as the fully duplicated spike.

## 10. Load-bearing HydraDB query contract

The baseline and candidate receipt use the same native query shape:

```cypher
CALL algo.MSpaths({
  sourceLabel: 'IncidentSource',
  sourceProperty: 'source_selector',
  sourceValues: ['<scenario-source-1>', '<scenario-source-2>'],
  targetLabel: 'ScenarioApplication',
  targetProperty: 'portfolio_key',
  targetValues: ['<scenario-portfolio>'],
  pairwise: false,
  relTypes: [
    'MATCHES_INCIDENT',
    'PROD_DEPENDS_ON',
    'DEV_DEPENDS_ON',
    'USES_SNAPSHOT'
  ],
  relDirection: 'incoming',
  maxLen: 12,
  pathCount: 1,
  resultLimit: 6
})
YIELD path
RETURN path
```

### Injection boundary

The current HTTP API rejected array parameters inside path-procedure selector fields. The query builder may render only:

- Server-generated selectors matching `^[a-z0-9-]+$`.
- Relationship types from a fixed server-side allowlist.
- Server-computed integer bounds.

Repository names, package names, versions, advisory text, and other user-controlled values are never interpolated into Cypher.

### Completeness rule

For `pathCount: 1`:

```text
resultLimit = matchedIncidentSourceCount * matchedApplicationTargetCount
```

Before traversal, the application verifies selector uniqueness and exact matched source/target counts. After traversal it verifies:

- `next_cursor` is absent.
- Returned row count does not exceed the theoretical pair bound.
- Returned unique source-target pair count equals returned path row count.
- Maximum imported dependency depth plus the `MATCHES_INCIDENT` and `USES_SNAPSHOT` edges does not exceed `maxLen` if the UI uses “complete within imported graph” language.

A live test proved that `resultLimit: 1` returns 1 of 3 pairs with no explicit truncation flag. A raw hard-coded cap is prohibited.

### Scope queries

- Runtime-only view: `MATCHES_INCIDENT`, `PROD_DEPENDS_ON`, and `USES_SNAPSHOT`.
- Development view: add `DEV_DEPENDS_ON`.
- Optional and peer dependencies are opt-in and visible in the receipt.
- All-scope results must never be presented as runtime exposure.

### Secondary graph views

- The primary product truth is the `MSpaths` source-target pair set.
- A selected pair may request additional bounded witness paths with `SPpaths` only after its exact runtime contract passes during Forge.
- “Observed convergence” may be aggregated only over returned bounded witnesses and is not a claim about every possible path.

## 11. HydraCut candidate and optimizer contract

### What counts as a candidate

A candidate action must provide a real resolved dependency state:

- Public GitHub candidate commit for the same repository, or
- Uploaded candidate `package.json` plus `package-lock.json`.

An advisory’s suggested fixed version, a manually typed version number, an LLM answer, or a graph node deletion is not a candidate state.

### Candidate validation

For each action:

1. Resolve immutable repository and commit identity.
2. Fetch only manifest and lockfile.
3. Hash both files.
4. Reconstruct the candidate tree with Arborist.
5. Confirm repository identity matches the baseline action target.
6. Compute exact package-instance and edge differences.
7. Batch-query all candidate exact versions against OSV.
8. Materialize the immutable candidate snapshot once.
9. Run the same `MSpaths` query.

### Exact bounded search

- Maximum candidate actions: 6.
- Maximum combinations: `2^6 = 64`.
- Every valid combination becomes a thin scenario projection that selects baseline or candidate snapshots through `USES_SNAPSHOT`.
- Invalid combinations, such as two mutually exclusive commits for one repository, are rejected before enumeration.
- Results are compared by stable source-to-application pairs, not witness-path arrays.

Objective order:

1. Minimize residual selected-incident runtime exposure pairs.
2. Minimize number or declared cost of candidate application changes.
3. Minimize total changed package-instance count in candidate lockfiles.
4. Use deterministic candidate-key ordering as the final tie-breaker.

The result is called:

> Exact minimum among the supplied authentic candidates, selected incident, dependency scopes, applications, and traversal bounds.

It is not called a global minimum remediation.

### Verified demo optimization

For the three genuine minimist candidate commits, all 8 subsets were materialized and queried:

| Candidate actions applied | Residual selected-incident application pairs |
|---:|---:|
| 0 | 3 |
| Any 1 | 2 |
| Any 2 | 1 |
| All 3 | 0 |

The exact zero-residual set within this candidate universe is all three actions.

## 12. Reproducibility receipt

Each receipt must include:

- Repository URLs and immutable baseline/candidate commit SHAs.
- `package.json` and lockfile SHA-256 hashes.
- File retrieval timestamp and GitHub response identity where available.
- OSV request package/version pairs, advisory IDs, advisory modified timestamps, withdrawn status, and retrieval timestamp.
- Scenario key and deterministic graph-key schema version.
- Matched source count and target count.
- Selected relationship scopes.
- `maxLen`, `pathCount`, and computed `resultLimit`.
- Exact OpenCypher query or canonical query hash.
- HydraDB image digest.
- HydraDB `read_epoch` and bookmark.
- Query elapsed time.
- Sorted reachable source-target pairs and SHA-256 result digest.
- Candidate action set and lockfile changed-package count.
- Removed, persistent, and newly OSV-matched pairs.
- Explicit limitations statement.

The receipt is reproducibility evidence, not a cryptographic attestation and not proof that a build or deployment is safe.

## 13. User interface

### Screen 1: Portfolio Import

- Prepared verified demo or public repository input.
- Immutable SHA resolution.
- Lockfile/hash/provenance preview.
- Dependency counts, depth, and scope counts.
- Import errors shown per repository without inventing partial success.

### Screen 2: Incident Radius

- Selected real advisory/package-version sources.
- Runtime, development, optional, and peer scope controls.
- Source-to-application exposure matrix.
- One shortest witness chain per reachable pair.
- Raw Cypher, bounds, query time, read epoch, and bookmark drawer.
- Clear “dependency exposure, not exploitability” label.

### Screen 3: Candidate Lab

- Add authentic candidate commits or file pairs.
- Show exact lockfile differences and OSV changes.
- Enumerate valid combinations up to 64.
- Rank by the declared objective.
- Never present arbitrary graph-node cuts as upgrades.

### Screen 4: Before/After Proof

- Baseline selected-incident pair count.
- Candidate residual selected-incident pair count.
- Removed and persistent pairs.
- Other known advisory matches still present.
- Downloadable JSON receipt.
- “Selected incident cleared” state distinct from “other risks remain.”

### Required states

- No lockfile.
- Unsupported lockfile version.
- Malformed lockfile.
- GitHub not found, moved, or rate-limited.
- OSV unavailable or paginated.
- HydraDB unavailable or query rejected.
- Depth clipped.
- Result completeness not established.
- No OSV matches.
- Advisory matches but no selected-scope path.
- Candidate does not change selected incident.
- Candidate clears selected incident but introduces or retains other OSV matches.
- Candidate-combination limit exceeded.

## 14. Application services and jobs

Logical endpoints, to be finalized in Forge:

- `POST /api/portfolios`: create portfolio and add immutable baseline inputs.
- `POST /api/portfolios/:id/import`: fetch, validate, extract, query OSV, and ingest.
- `GET /api/jobs/:id`: deterministic phase and error status.
- `POST /api/incidents`: select source package versions and dependency scopes.
- `POST /api/incidents/:id/traverse`: run baseline `MSpaths`.
- `POST /api/candidates`: add and validate authentic candidate state.
- `POST /api/plans/evaluate`: enumerate and materialize bounded combinations.
- `GET /api/receipts/:id`: return canonical JSON proof.

Long operations run as explicit jobs with phases:

`VALIDATE -> FETCH -> HASH -> EXTRACT -> OSV_QUERY -> GRAPH_WRITE -> VERIFY_COUNTS -> TRAVERSE -> RECEIPT`

No phase may silently fall back to mock data.

## 15. Persistence and cleanup

- HydraDB stores graph entities, scenario data, provenance metadata, and proof metadata.
- Raw fetched files need not be retained after hashing and extraction unless the user explicitly downloads a receipt bundle.
- Canonical JSON receipts are stored outside the graph as immutable files and referenced by hash from `ProofReceipt` nodes.
- A scenario cleanup deletes only its scenario targets, incident anchors, and scenario-owned edges. Immutable repository snapshots remain reusable.
- `DETACH DELETE` was live-tested successfully on a cleanup probe.
- Bulk scenario cleanup and concurrent cleanup are Forge verification gates.

## 16. Security and privacy

- Allow only `https://github.com/{owner}/{repo}` inputs and GitHub API/raw endpoints.
- Reject redirects to non-allowlisted hosts.
- Do not accept arbitrary URLs.
- Enforce file-count, content-type, and 10 MiB file-size limits.
- Never run `npm install`, lifecycle scripts, repository binaries, build scripts, or tests.
- Never clone user repositories in the service path.
- Parse only JSON manifests with Arborist virtual-tree loading.
- Keep any GitHub token server-side and optional. Public unauthenticated GitHub API use is limited to 60 requests/hour; authenticated use is typically 5,000/hour.
- Do not place HydraDB Bolt, HTTP, or admin ports on the public internet.
- Keep the HydraDB development token out of the repository and use deployment secrets.
- Generate all Cypher selector literals server-side under a strict character grammar.
- Record but never execute advisory reference URLs.
- MVP is single-operator. Multi-tenant isolation is not claimed.

## 17. Deployment and usability

Primary distribution:

- Public GitHub repository.
- Open-source license and third-party attributions.
- One-command Docker Compose stack containing the app and pinned HydraDB image.
- Seed command for the verified historical demo.
- Separate command for a public-repository scan.
- Health checks for app and HydraDB.
- Persistent volume with documented cleanup.

The app must remain usable without the hosted HydraDB SDK. A frontend-only Vercel deployment is insufficient because self-hosted HydraDB is required. A hosted demo, if provided, must run the same containerized backend on infrastructure with persistent storage.

## 18. Performance boundaries

Verified on the current local ARM64 container and accumulated audit graph:

- Real three-application baseline: 1,742 package instances, 43 application edges, and 2,896 package edges.
- Selected-incident all-scope query: 3 pairs.
- Selected-incident production-only query: 1 pair.
- Three-source all-scope query: 9 baseline pairs and 6 candidate pairs.
- Repeated scenario queries after graph accumulation: approximately 2.0 to 2.7 seconds.
- Production-only query on the smaller scope was approximately 365 ms.

MVP performance targets, not yet verified:

- At most 10 application snapshots.
- At most 50,000 package instances per portfolio.
- At most 6 candidate actions and 64 scenarios.
- Visible progress for any operation over 1 second.
- No claim about enterprise scale until measured on a clean pinned environment.

Scenario evaluation may still dominate planning time because every valid combination requires a native traversal. The UI must show progress and may stop after a declared time budget without claiming an exact optimum unless every valid combination completed.

## 19. Failure semantics

| Failure | Product response |
|---|---|
| GitHub file cannot be fetched | Fail that input with immutable URL and HTTP reason |
| Lockfile exceeds limit | Reject before parsing |
| Arborist cannot reconstruct tree | Fail scan; do not ingest partial topology |
| OSV batch page token present | Fetch remaining pages before marking advisory scan complete |
| OSV unavailable | Mark advisory evidence incomplete; do not return a clean result |
| HydraDB write fails | Mark scenario invalid; do not traverse |
| Source/target count mismatch | Block traversal and receipt |
| Observed tree depth exceeds supported `maxLen` | Mark result depth-bounded/partial |
| Query returns cursor or duplicate pair rows | Mark completeness unproven and block exact-plan claim |
| Candidate tree invalid | Exclude candidate with reason |
| One combination fails | Exact optimizer status fails unless retried successfully |
| Candidate clears selected incident but other advisories remain | Show both facts prominently |
| No path is returned | Say “no path within declared graph and bounds,” never “safe” |

## 20. Test contract

### Unit

- Lockfile v2/v3 extraction.
- Dependency-scope classification.
- Canonical key and 52-bit ID determinism.
- Collision rejection.
- GitHub input normalization and SSRF rejection.
- OSV batch alignment and pagination.
- Candidate repository identity and lockfile diff.
- Exact subset enumeration and deterministic tie-breaking.
- Receipt canonicalization and hashing.

### HydraDB contract

- Authenticated readiness, write, and readback.
- Batched `UNWIND` node and relationship ingestion.
- Supported `MERGE` form and rejected unsupported forms.
- Strong-consistency `MSpaths` result shape.
- Incoming direction semantics.
- Scenario-specific source selectors.
- Thin `ScenarioApplication -> USES_SNAPSHOT -> ApplicationSnapshot` projections.
- Typed dependency-scope filtering.
- Computed result bound and silent-truncation regression.
- Candidate second traversal.
- `DETACH DELETE` cleanup.

### Historical integration golden tests

- Exact repository SHAs and lock hashes.
- Exact Arborist package/edge counts.
- `minimist@1.2.5` is present before and absent after.
- Baseline selected incident returns 3 application pairs.
- Production-only selected incident returns 1 pair.
- All three real candidates return 0 selected-incident pairs.
- Three-source baseline returns 9 pairs.
- Three-source candidate returns 6 pairs.
- All 8 selected-incident candidate combinations return residual counts `3, 2, 2, 1, 2, 1, 1, 0` when ordered by bit mask.

### Negative and honesty tests

- Fixed version with no selected advisory.
- No OSV match.
- Equal-length witness variation does not change pair comparison.
- Candidate retains selected incident.
- Candidate introduces another current OSV match.
- Truncated result blocks completeness.
- Depth-clipped graph blocks completeness.
- Missing candidate combinations block exact-minimum language.
- No fixture or mock result appears in user-scan mode.

## 21. Three-minute demo contract

### 0:00 to 0:25, authenticity

- Show the three public repository links, baseline/candidate SHAs, lock hashes, and real OSV records.
- State that no repository was modified and no vulnerability was seeded.

### 0:25 to 1:05, CampaignRadius

- Select the three real vulnerable package versions.
- Run one native scenario-scoped `MSpaths` query.
- Show 9 source-to-application pairs, dependency scopes, and one witness.
- Open the raw query/bounds drawer briefly.

### 1:05 to 1:50, HydraCut

- Focus the incident on `minimist@1.2.5`.
- Show three authentic candidate commits.
- Evaluate all 8 combinations.
- Show that only the three-action combination reaches zero selected-incident pairs.

### 1:50 to 2:30, second traversal proof

- Open the candidate scenario.
- Show the second native `MSpaths` query and 0 minimist pairs.
- Immediately show that 6 semver/brace-expansion pairs remain.
- State: selected incident cleared, portfolio not certified safe.

### 2:30 to 3:00, sponsor depth

- Show self-hosted HydraDB container, explicit graph schema, query timing, read epoch/bookmark, and downloadable receipt.
- State that removing HydraDB removes both exposure discovery and counterfactual verification.

## 22. Ruthless MVP cut line

Must ship:

- Prepared real three-repository historical portfolio.
- Public GitHub exact-commit import or lockfile-pair upload.
- npm lockfile v2/v3 extraction without execution.
- OSV batch matching and provenance.
- Self-hosted HydraDB graph ingest.
- Scenario-scoped native `MSpaths` baseline traversal.
- Runtime/development scope filtering.
- Authentic candidate input and separate scenario materialization.
- Exhaustive planner up to 6 candidates.
- Second native traversal and before/after pair comparison.
- Receipt with hashes, query, bounds, epoch/bookmark, and caveats.
- Four focused screens and honest error states.

Cut from MVP:

- LLM or chat interface.
- Embeddings or vector search.
- Hosted HydraDB SDK.
- Private organization connectors.
- Automatic PR generation.
- Automatic fixed-version selection.
- Function reachability.
- CODEOWNERS/team routing.
- CI integration.
- Typosquat, maintainer-risk, malware, or provenance heuristics.
- Cross-ecosystem support.
- Native temporal-history claims.
- Arbitrary graph-cut recommendations.
- Multi-track submission.

## 23. Caveat ledger

### Verified

- Official HydraDB image runs locally; observed digest: `sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709`.
- Authenticated OpenCypher writes, reads, batched `UNWIND`, typed edges, strong consistency, JSON, NDJSON, and `algo.MSpaths` work.
- HydraDB IDs must be non-negative integers.
- `CREATE ... RETURN` is rejected.
- Batched vertex `MERGE (n:Label {id: row.id})` is rejected; `MERGE (n {id: row.id}) SET n:Label` works under `UNWIND`.
- Relationship batches require explicit endpoint labels.
- Selector arrays are not accepted as ordinary composite query parameters in the tested HTTP path procedure call.
- Current path execution is snapshot-scoped; application-selectable historical `read_epoch` traversal was not available.
- Duplicate relationship variants can duplicate structural witnesses.
- Result limits truncate without an explicit truncation flag.
- Scenario-specific source selectors return the correct bounded pairs.
- `DETACH DELETE` works on the tested cleanup probe.
- All historical repository commits, lockfiles, selected minimist transitions, and hashes are real.
- Arborist reconstructed every selected before/after tree.
- OSV batch matching works and currently has no documented request rate limit; HTTP/1.1 responses have a 32 MiB limit and querybatch can paginate.
- The selected incident produced 3 baseline pairs, 1 runtime-only pair, and 0 pairs after all three authentic candidates.
- The three-source proof produced 9 baseline pairs and 6 candidate pairs.
- All 8 selected-incident candidate subsets were materialized and queried.
- Public competitors overlap blast radius and simple graph-cut positioning.

### Verified caveat

The local HydraDB container logged repeated object-store garbage-collection errors for `put_opts` update mode against `LocalFileSystem`. Queries and writes continued, but this is an operational warning. We must pin the tested image, retain logs, use isolated storage, and avoid claiming production robustness from this local run.

### Unverified, required during Forge/build

- Clean-environment performance and memory usage.
- Linux x86_64 image behavior if the final host is not ARM64.
- Bulk scenario cleanup under repeated and concurrent jobs.
- Fifty-thousand-node portfolio target.
- Six-candidate, 64-scenario runtime budget.
- Public deployment persistence and restart recovery.
- `SPpaths` witness-expansion contract on the pinned image.
- Lockfile v1 and complex npm workspaces.
- End-to-end candidate detection of newly introduced advisories.
- OSV outage retry/backoff behavior.
- GitHub redirect and rate-limit behavior in the final server.
- Any multi-user or tenant isolation.

### Rejected assumptions

- Track 02-A is empty or uncrowded.
- CampaignRadius alone is sufficiently original.
- A greedy path-node set cover is a deployable remediation.
- A fixed version string is equivalent to a resolved candidate graph.
- HydraDB provides native application-selectable historical path traversal.
- `read_epoch` is a user-facing time-travel parameter.
- One returned witness is every possible dependency path.
- Zero selected-incident paths means the app is safe.
- Historical public repositories imply production deployment.
- It is acceptable to present illustrative counts such as 37 apps, 143 paths, 9 teams, or 3 fixes as real without evidence.
- It is acceptable to use a TanStack fixture without authentic and reproducible sources, targets, and candidate states.

## 24. Forge entry gate

Forge may begin only after the user approves this product definition and the following remain locked:

- CampaignRadius evidence plus HydraCut candidate proof, not either concept alone.
- Self-hosted HydraDB OSS on both critical computations.
- Authentic historical public corpus.
- Scenario-scoped many-source selectors.
- Source-to-application pairs as the stable truth unit.
- Authentic candidate lockfiles/commits only.
- Exact bounded optimizer language.
- Selected-incident clearance separated from overall safety.
- No LLM, vectors, hosted-SDK shortcut, fabricated findings, or arbitrary graph cuts.

After approval, Forge must produce the PRD, architecture, final Cypher contracts, API schemas, UX specification, threat model, test plan, implementation sequence, and demo storyboard from this document without widening the claims.

## 25. Evidence index

Durable local evidence:

- [`docs/evidence/2026-08-19-pre-forge-runtime.json`](docs/evidence/2026-08-19-pre-forge-runtime.json)
- [`docs/context/2026-08-18-hydracut-combined-audit.md`](docs/context/2026-08-18-hydracut-combined-audit.md)

Primary external references:

- [HydraDB open-source repository](https://github.com/hydra-db/hydradb)
- [OSV API](https://google.github.io/osv.dev/api/)
- [OSV batch-query contract and pagination](https://google.github.io/osv.dev/post-v1-querybatch/)
- [Selected minimist advisory](https://osv.dev/vulnerability/GHSA-xvch-5gv4-984h)
- [GitHub REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [GitHub repository contents API](https://docs.github.com/en/rest/repos/contents)
- [nodekb candidate commit](https://github.com/bradtraversy/nodekb/commit/5762100bfb342353e98f171238980e9b693ab520)
- [spaces-cli candidate commit](https://github.com/BetaHuhn/spaces-cli/commit/17e68f80b8578ea1db64277888a712cc0d8a257f)
- [crcmaker candidate commit](https://github.com/arkon/crcmaker/commit/d19651452306478be6b0dd582ecfcf024beebaeb)
