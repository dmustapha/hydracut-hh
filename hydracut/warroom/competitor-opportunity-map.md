# Hack Hydra Competitor Opportunity Map

## Scope and Track Strategy Contract

- **Contract:** `single-track`
- **Selected track:** Track 02-A, Supply Chain Blast Radius
- **Eligibility test:** Every generated finalist must make a self-hosted HydraDB OpenCypher traversal or native `algo.*paths` procedure necessary to the incident-response outcome. If HydraDB is removed, the product must lose its ability to compute and prove transitive exposure.
- **Automatic rejects:** Hosted-SDK-only retrieval, embeddings plus similarity, a repository-local vulnerability list, or a graph used only for visualization.
- **Delivery constraint:** One builder, about 2.5 days, one sharp 90-second demo inside a 3-minute submission video.

## Evidence Boundary

This map uses the Hack Hydra brief, the intel research brief, first-party product documentation, and the user-supplied Discord observations. The generator-safe section describes demonstrated mechanisms and open jobs without naming products or competitors. Named attribution, collision analysis, and saturation judgments are isolated in the gate-only appendix and must not enter generator prompts.

## Generator-Safe Opportunity Map

### Cluster A: Repository-local dependency detection and update automation

| Field | Evidence-backed opportunity |
|---|---|
| User and job | Repository maintainers and security engineers need to detect a vulnerable dependency in one codebase and decide whether to update, dismiss, or block it. |
| Costly failure | A known vulnerable package can remain in a manifest or lockfile, while a noisy alert queue can obscure the dependency paths that matter most. |
| Core mechanism | Parse a manifest or lockfile, construct a dependency tree, match package versions to advisories, and optionally open an update pull request. |
| Asset lifecycle | Dependency is declared, resolved to a version, installed, flagged, upgraded or removed, then re-scanned. |
| Confidential operation | Private repository manifests, lockfiles, and alert dispositions expose proprietary architecture and security posture. Public repositories do not require confidentiality. |
| Proof pattern | Show the exact manifest, affected version, introduction path, advisory, fixed version, and resulting pull request or clean re-scan. |
| Distribution path | CLI, CI action, repository app, and pull-request checks already sit inside the maintainer workflow. |
| Demonstrated strength | Tight developer feedback loops and concrete remediation actions are already understood and trusted. |
| Missing outcome | During an ecosystem-wide compromise, repository-by-repository alerts do not by themselves provide one causal map of every affected repository, service, deployment, and shared dependency path. |
| Unserved edge state | A newly compromised package may have no fix yet, may appear through multiple parents, or may have existed only in a historical deployment window. |
| Portable primitive | Convert a local dependency path into a portfolio-wide reverse reachability traversal, then prove the minimal set of parent upgrades that collapses the blast radius. |

### Cluster B: Open dependency and vulnerability intelligence

| Field | Evidence-backed opportunity |
|---|---|
| User and job | Tool builders and researchers need normalized package, version, dependency, project, and advisory data across ecosystems. |
| Costly failure | Package identity, version ranges, and transitive resolution are easy to mismatch, producing false exposure or missed exposure. |
| Core mechanism | Stable package metadata APIs expose resolved dependencies; vulnerability APIs match package versions or commits to machine-readable advisory records. |
| Asset lifecycle | Package version is published, dependency requirements are resolved, advisory is published or modified, and consumers re-query exposure. |
| Confidential operation | Public registry and advisory data are not confidential. The private join is the organization's repository, build, and deployment inventory. |
| Proof pattern | Resolve a real package version, retrieve its dependency graph, match a real advisory, and retain source identifiers and timestamps. |
| Distribution path | Public HTTP APIs, downloadable ecosystem datasets, and package URLs fit directly into developer tools. |
| Demonstrated strength | Normalized identifiers and version-aware advisory ranges make reproducible ingestion possible in a hackathon timeframe. |
| Missing outcome | Public metadata does not know which private repositories or deployments actually consumed a version, which exposure paths are shared, or which remediation removes the most risk. |
| Unserved edge state | Advisory data can change after an initial scan; dependency resolution can differ by lockfile, platform, time, or package-manager behavior. |
| Portable primitive | Join public package and advisory nodes to private repository snapshots, preserving provenance and observation time on every edge. |

### Cluster C: Reachability and supply-chain risk platforms

| Field | Evidence-backed opportunity |
|---|---|
| User and job | Application-security teams need to reduce alert noise and identify dependencies or vulnerable functions that can actually be reached. |
| Costly failure | Treating every transitive dependency as equally dangerous creates alert fatigue, while private or unsupported dependencies can leave reachability unknown. |
| Core mechanism | Build dependency graphs and, at deeper tiers, call graphs; classify paths as reachable, unreachable, pending, or unknown. |
| Asset lifecycle | Project is scanned, dependency and call graphs are computed, findings are triaged, then a selected project is re-scanned after remediation. |
| Confidential operation | Full application reachability can require proprietary source code, build context, and private dependencies. |
| Proof pattern | Display the exact dependency or function-call chain from application to affected code and show the finding disappear after a controlled fix. |
| Distribution path | Existing CLI, CI, source-control, and dashboard integrations reach security teams where scans already run. |
| Demonstrated strength | Reachability is a stronger prioritization signal than severity alone and provides an intuitive path-shaped proof. |
| Missing outcome | Existing reachability views can still be scan-centric. A responder needs a live, cross-repository incident map that supports rapid reverse traversal, shared-chokepoint analysis, and counterfactual remediation. |
| Unserved edge state | Results can be pending, unknown, unsupported, or stale; private dependencies and historical deployments complicate a binary affected or unaffected answer. |
| Portable primitive | Treat reachability state and evidence quality as edge properties, then compute several bounded response views from the same graph: exposed, uncertain, historically exposed, and cleared. |

### Cluster D: SBOM and software-supply-chain knowledge graphs

| Field | Evidence-backed opportunity |
|---|---|
| User and job | Security and operations practitioners need to ingest SBOMs, connect packages, artifacts, sources, builders, and advisories, then query transitive impact. |
| Costly failure | Metadata remains fragmented across SBOMs, advisories, source repositories, build attestations, and asset inventories, delaying incident response. |
| Core mechanism | Normalize supply-chain evidence into a graph and traverse package-to-artifact-to-vulnerability relationships. |
| Asset lifecycle | Source produces package, builder emits artifact and attestations, SBOM records composition, advisory changes risk state, operator remediates affected software. |
| Confidential operation | Internal SBOMs, artifact digests, builder topology, and deployment relationships can reveal private system composition. |
| Proof pattern | Ingest an SBOM, attach vulnerability evidence, traverse to affected artifacts, and expose the exact evidence path in a visualizer or CLI report. |
| Distribution path | SBOM collectors, GraphQL or REST APIs, security-policy tooling, and self-hosted deployments. |
| Demonstrated strength | A graph is already validated as a natural model for transitive supply-chain evidence and incident response. |
| Missing outcome | A generic dependency graph and visualizer are not enough. The open opportunity is a focused incident command surface with fast bounded reverse traversal, time-aware exposure, remediation counterfactuals, and an immediately legible judge proof. |
| Unserved edge state | Conflicting evidence, missing SBOMs, stale scans, and an advisory that changes over time must remain visible instead of being flattened into one answer. |
| Portable primitive | Pair evidence provenance with a graph-native response primitive: one incident node fans out to affected assets, while proposed fixes fan back into the graph to quantify risk removed. |

### Cluster E: Cross-source operational context graphs

| Field | Evidence-backed opportunity |
|---|---|
| User and job | Teams want to connect activity from several work systems so an agent can answer who did what and where. |
| Costly failure | Automatic connector ingestion can consume hosted indexing quotas, initialize slowly, and make graph work difficult to inspect. |
| Core mechanism | Ingest records from multiple connectors, resolve identities, and retrieve connected context for an agent. |
| Asset lifecycle | Source record is synchronized, indexed, linked to entities, queried, and used as agent context. |
| Confidential operation | Repository, issue, CRM, and meeting data are naturally private business records. |
| Proof pattern | Ask a cross-source question and return linked records with provenance. |
| Distribution path | SaaS connectors and agent interfaces. |
| Demonstrated strength | Cross-source joins and provenance are compelling when the graph unifies fragmented operational data. |
| Missing outcome | Connector breadth does not answer the Track 02-A job of version-specific, transitive software exposure and remediation. |
| Unserved edge state | Partial sync, quota exhaustion, delayed indexing, and opaque hosted graph construction weaken incident-time reliability. |
| Portable primitive | Adapt cross-source provenance to a bounded self-hosted evidence join: registry metadata, advisory records, repository snapshots, and deployment observations all remain inspectable. |

## Cross-Cluster Synthesis

### 1. Repeated mechanisms that prove demand or feasibility

1. Manifest or SBOM ingestion into a dependency model.
2. Version-aware advisory matching.
3. Direct and transitive path explanation.
4. Repository or organization-level aggregation.
5. Fix advice, pull requests, or policy gates.
6. Graph visualization as judge-visible evidence.

### 2. Missing outcomes shared across clusters

1. A single incident-centric answer across many repositories and deployment snapshots.
2. Reverse blast radius from compromised package version to affected assets, not only forward dependencies from one project.
3. Explicit uncertainty for missing, stale, private, or unsupported evidence.
4. Counterfactual remediation: which one or two parent upgrades remove the most exposure.
5. Historical exposure: whether an asset was vulnerable during the malicious-version window even if it is clean now.

### 3. Underserved users and lifecycle stages

- **Incident commander:** Needs scope and containment order in minutes, after an advisory or compromise lands.
- **Platform security lead:** Needs one portfolio answer across repositories, not a tab-by-tab scan review.
- **Service owner:** Needs the exact introduction path and the smallest safe change.
- **Post-incident reviewer:** Needs a reproducible record of what was exposed, when, and why the system reached that conclusion.

### 4. Strong mechanism pairs not fully served by the reviewed field

1. Version-aware advisory matching plus bounded reverse traversal over private repository snapshots.
2. Evidence provenance plus uncertainty-aware reachability.
3. Historical dependency snapshots plus malicious publication windows.
4. Shared-ancestor analysis plus remediation counterfactuals.
5. Self-hosted private topology plus a live, inspectable OpenCypher proof.

### 5. Proof and distribution patterns worth adapting

- **Proof:** Select a real advisory, run one visible HydraDB traversal, light up affected repositories and paths, then apply a hypothetical or actual version change and show the graph contract.
- **Proof:** Display the query, bounded hop count, path provenance, observed-at timestamp, and count of affected assets.
- **Distribution:** Start as a local CLI and web demo that imports lockfiles or SBOMs, with an obvious later path to CI and repository apps.
- **Distribution:** Reach the first five users through open-source maintainers and small engineering teams already using package audits and GitHub security alerts.

## Gate-Only Collision and Named Attribution Appendix

**Do not include this appendix, its names, or its collision language in generator prompts. Reveal it only after the raw idea pool is durably frozen.**

| Named project or substitute | Verified present surface | Collision implication for Track 02-A | Gate treatment |
|---|---|---|---|
| GitHub Dependency Graph, Dependabot Alerts, and Dependency Review | Repository dependency graph, transitive paths, vulnerable-dependency alerts, pull-request dependency diffs, and fix-version guidance. | A repository alert list, dependency tree, PR vulnerability check, or generic update bot is saturated. | Require incident-centric multi-repository traversal and a different proof outcome. |
| `npm audit` | Sends the package dependency description to the registry, calculates known vulnerabilities and metavulnerabilities, reports dependency paths, and can apply compatible remediations. | A local audit wrapper or JSON dashboard is not original and does not need HydraDB. | Kill unless a load-bearing portfolio graph produces a new outcome. |
| OSV.dev | Version or commit-aware vulnerability query API, batch query, normalized advisory records, and ecosystem data exports. | Advisory lookup is a data source, not a product moat. | Treat OSV as ingestion evidence. Kill if the product ends at matching CVEs to versions. |
| deps.dev | Stable API for package versions, requirements, resolved dependencies, projects, advisories, and related metadata. | Public dependency retrieval is already available. | Treat it as graph seed data. Differentiation must come from private asset joins and HydraDB traversal. |
| Socket | Dependency and function-level reachability, reachability-state categories, supply-chain risk scans, and CI or CLI delivery. | Generic reachability, alert-noise reduction, or a call-chain viewer directly collides. | High collision risk. Require a distinct incident lifecycle outcome such as portfolio reverse impact, historical exposure, or remediation counterfactual. |
| Snyk Open Source | Direct and transitive dependency graphs, organization-wide dependency inventory, affected paths, prioritization, and fix pull requests. | Organization dependency inventory and fix advice are established surfaces. | Kill generic portfolio BOM, dependency-path, and remediation-list concepts. |
| GUAC | Ingests SBOMs and security metadata into a supply-chain graph, queries vulnerabilities through transitive dependencies, visualizes paths, and demonstrates incident response and patch planning. | This is the strongest direct collision. A graph visualizer showing vulnerable dependents is not whitespace. | Any finalist must name a narrower incident job, make HydraDB's native traversal visible, and prove a new outcome beyond GUAC's documented demos. |
| Cognivern, visible Hack Hydra submission | Connects GitHub, Linear, Attio, and audit-log context so agents recall cross-source activity. User-supplied Discord evidence places it in Track 01 or 03, not Track 02-A. | No direct Track 02-A collision, but cross-source graph ingestion is already visible to judges. | Do not pitch generic context unification. Preserve Track 02-A specificity. |
| Other visible Hack Hydra field activity | User-supplied Discord evidence shows hosted connector usage, indexing-budget exhaustion, slow initialization, and query confusion. No Track 02 submission was observed in that sample. | Track 02-A may be less crowded, but absence in a partial Discord sample is not proof that no competitor exists. | Phrase as observed whitespace only. Never claim exclusivity. |

### Saturated surfaces

1. Generic vulnerable dependency dashboard.
2. Repository-local dependency tree or alert list.
3. Transitive path visualization without an incident workflow.
4. SBOM ingestion plus graph browsing.
5. Advisory lookup and severity ranking.
6. Automated fix pull requests.
7. Function-level reachability as the sole novelty claim.

### Named source ledger

- Hack Hydra brief: `/Users/MAC/.codex/skills/hackathon-briefs/hack-hydra.md`
- Hack Hydra intel: `/Users/MAC/hackathon-toolkit/candidates/hack-hydra/research-brief.md`
- Hack Hydra PULSE: `/Users/MAC/hackathon-toolkit/candidates/hack-hydra/PULSE.md`
- GitHub Dependency Graph: https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-graph
- GitHub Dependabot Alerts: https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-alerts
- GitHub Dependency Review: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-dependency-changes-in-a-pull-request
- npm audit: https://docs.npmjs.com/cli/v11/commands/npm-audit/
- OSV API: https://google.github.io/osv.dev/api/
- OSV data sources and exports: https://google.github.io/osv.dev/data/
- deps.dev API v3: https://docs.deps.dev/api/v3/
- Socket dependency reachability: https://docs.socket.dev/docs/dependency-reachability
- Socket reachability result states: https://docs.socket.dev/docs/reachability-results
- Snyk Open Source: https://docs.snyk.io/scan-with-snyk/snyk-open-source
- Snyk organization dependency inventory: https://docs.snyk.io/manage-risk/dependencies-and-licenses/view-dependencies
- GUAC overview and transitive vulnerability queries: https://docs.guac.sh/guac/
- GUAC incident-response demo: https://docs.guac.sh/guac/supply-chain/
- TanStack maintainer security advisory: https://github.com/TanStack/router/security/advisories/GHSA-g7cv-rxg3-hmpx
- TanStack postmortem: https://tanstack.com/blog/npm-supply-chain-compromise-postmortem
