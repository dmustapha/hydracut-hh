# Recovered Raw Generator Pool

These 12 concepts were recovered from four completed Claude subagent transcripts. They are frozen before collision filtering. The fifth generator failed at the session limit and is rerun separately.

## Defender and incident-response lens

### IDEA 1: Zero
**Problem:** Security on-call cannot quickly map a newly compromised package to every exposed service and owning team.
**Market Anchor:** Organizations maintain SBOMs and investigate new vulnerability advisories across application fleets.
**Named Buyer:** Application security lead or platform security lead.
**Existing Workflow:** Search manifests and scanner alerts service by service, then assign remediation manually.
**Current Substitute:** SCA alert lists, SBOM search, spreadsheets, and recursive scripts.
**Mechanism:** Reverse dependency reachability from one compromised `PackageVersion` to all `Repo`, `Service`, and `Team` nodes.
**Chain-Native Angle:** HydraDB-native angle: `algo.SSpaths` computes the unknown-depth affected set and exact evidence paths.
**Sponsor Fit:** Self-hosted HydraDB stores versioned dependency edges and executes the critical traversal.
**Demo Hook:** Enter one malicious package and watch affected services light up hop by hop, ranked by shortest path.
**Competitor-Derived Insight:** Current scanners prove demand for package risk alerts and SBOM inventory.
**Missing Outcome:** Immediate cross-fleet ownership-aware blast radius with a visible dependency chain.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove HydraDB reachability and the app cannot determine transitive exposure or explain paths.
**Proof Path:** Real package graph plus advisory input, live Cypher traversal, affected services, exact paths, and query timing.
**Authority and Integration Map:** Security lead enters an OSV package identifier, HydraDB queries imported deps.dev plus local SBOM roots, UI renders database receipts; organization layer is a labeled demo dataset.
**Adaptation Note:** Family: live consumer demos, extracted immediate visible state change and adapted it to incident response. Family: honesty labels, adapted into explicit real versus demo organization data labels.

### IDEA 2: Patient Zero
**Problem:** Teams know they are exposed but not which dependency update will reduce the most exposure first.
**Market Anchor:** Vulnerability backlogs require risk-based remediation prioritization.
**Named Buyer:** Application security lead managing remediation SLAs.
**Existing Workflow:** Sort by severity and patch projects independently.
**Current Substitute:** Scanner priority scores and manual dependency-tree inspection.
**Mechanism:** Many-source path aggregation identifies shared intermediate dependencies, then reruns reachability with a proposed edge change.
**Chain-Native Angle:** HydraDB-native angle: `algo.MSpaths` plus counterfactual traversal makes remediation order a graph result.
**Sponsor Fit:** HydraDB performs both path enumeration and post-change verification.
**Demo Hook:** Click one proposed pin and watch exposed services collapse from a large set to a small set.
**Competitor-Derived Insight:** Alerting tools demonstrate that finding affected dependencies is valuable.
**Missing Outcome:** A defensible answer to what should be fixed first and how much risk it removes.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove path aggregation and there is no remediation frontier or verified reduction.
**Proof Path:** Advisory targets, service roots, `MSpaths`, ranked cut candidates, simulated edge change, second traversal, measured delta.
**Authority and Integration Map:** Security lead requests analysis, project-owned graph simulates proposed dependency pin, judge compares before and after receipts; no external package mutation is claimed.
**Adaptation Note:** Family: closed-form or computed recommendations, extracted evidence-backed action ordering and adapted it to graph cut analysis. CROSS: game state mutation to security counterfactuals.

### IDEA 3: Typo Tripwire
**Problem:** A developer can mistype a package name without understanding the potential organizational exposure.
**Market Anchor:** Registry users install packages by human-entered names and registries remove malicious impersonators.
**Named Buyer:** Registry security engineer or application security lead.
**Existing Workflow:** Detect suspicious names with heuristics, then investigate packages separately.
**Current Substitute:** Edit-distance lists, reputation checks, and package scanners.
**Mechanism:** Traverse precomputed `TYPOSQUAT_OF` edges into reverse dependency reachability for the legitimate package's trust surface.
**Chain-Native Angle:** HydraDB-native angle: heterogeneous graph traversal joins lexical relationships to dependency exposure.
**Sponsor Fit:** `algo.SPpaths` explains the impersonation link and `algo.SSpaths` computes the potential blast radius.
**Demo Hook:** Type a misspelled package, see its legitimate target and every repo one typo away from exposure.
**Competitor-Derived Insight:** Typosquat detection and package graph scanning are both proven security jobs.
**Missing Outcome:** Consequence-aware prioritization of typosquat candidates.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove HydraDB and the product becomes two disconnected lists rather than one explainable risk path.
**Proof Path:** Package-name input, similarity edge, live path procedure, affected roots, exact evidence path.
**Authority and Integration Map:** Registry data supplies package names, loader computes transparent edit-distance edges, HydraDB supplies traversal, UI labels potential rather than realized exposure.
**Adaptation Note:** Family: pre-audit plus post-audit agents, extracted detect then quantify and adapted it into package identity plus blast radius.

## Shift-left and CI lens

### IDEA 4: BlastGate
**Problem:** Dependency changes can introduce transitive risk at merge time before a scanner updates its project view.
**Market Anchor:** Teams gate pull requests with CI checks and dependency review policies.
**Named Buyer:** Platform security engineer owning GitHub branch protection.
**Existing Workflow:** Review lockfile diffs and wait for SCA checks.
**Current Substitute:** GitHub dependency review, Dependabot, SCA checks, and manual lockfile inspection.
**Mechanism:** Compare pre-PR and post-PR reachable risk nodes, then fail CI when the delta breaches policy.
**Chain-Native Angle:** HydraDB-native angle: the policy is a difference between two transitive closures, not a direct-package lookup.
**Sponsor Fit:** Self-hosted HydraDB executes the reachability query and returns exact paths for the CI receipt.
**Demo Hook:** A dependency bump creates a red PR check with the newly introduced compromise path.
**Competitor-Derived Insight:** Existing dependency-review checks prove merge-time security is an established workflow.
**Missing Outcome:** A graph-explained new-exposure gate instead of a static advisory match.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Without two closure queries and path evidence, the check cannot distinguish new from pre-existing exposure.
**Proof Path:** Lockfile diff, graph update in isolated snapshot, traversal delta, policy result, CI check artifact.
**Authority and Integration Map:** Repository maintainer invokes the action, GitHub supplies the diff, project-owned check posts status; demo may simulate GitHub while preserving the live HydraDB query.
**Adaptation Note:** Family: reusable auth SDK and transaction guardian, extracted a pre-execution gate and adapted it to dependency merges. Family: honesty labels, applied to graph-derived evidence.

### IDEA 5: DiffRadius
**Problem:** Developers cannot see the additional transitive packages and maintainers they trust when accepting a version bump.
**Market Anchor:** Developers review dependency diffs before merging upgrades.
**Named Buyer:** Staff engineer or open-source maintainer.
**Existing Workflow:** Read lockfile changes and package release notes.
**Current Substitute:** Lockfile diff viewers and dependency-tree commands.
**Mechanism:** Compute the set difference between before and after dependency closures, including newly reached maintainer nodes.
**Chain-Native Angle:** HydraDB-native angle: two reachability sets make the trust delta directly queryable.
**Sponsor Fit:** HydraDB stores both snapshots or validity-bounded edges and evaluates each closure.
**Demo Hook:** One version bump reveals 41 packages and seven maintainers newly trusted.
**Competitor-Derived Insight:** Dependency update tooling proves upgrade review is frequent and costly.
**Missing Outcome:** A human and structural trust delta, not merely changed lockfile lines.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove reachability and the app cannot discover indirect additions.
**Proof Path:** Before and after lockfiles, two graph snapshots, two closures, set difference, explainable new paths.
**Authority and Integration Map:** Developer supplies lockfiles, project loader writes the graph, HydraDB computes results, no external mutation is claimed.
**Adaptation Note:** Family: memory wipe and state selection, extracted before-versus-after state significance and adapted it to dependency trust.

### IDEA 6: MaintainerReach
**Problem:** Security teams assess risky packages but miss concentration and ownership changes among maintainers controlling the transitive tree.
**Market Anchor:** Package registries publish maintainer ownership and security teams evaluate account compromise risk.
**Named Buyer:** Software supply-chain security lead.
**Existing Workflow:** Inspect package ownership case by case after an alert.
**Current Substitute:** Registry metadata, reputation services, and manual review.
**Mechanism:** Traverse dependency closure into `PUBLISHED_BY` and ownership-history edges, then aggregate packages controlled per maintainer.
**Chain-Native Angle:** HydraDB-native angle: heterogeneous traversal turns package exposure into a human control perimeter.
**Sponsor Fit:** HydraDB combines reachability, typed relationships, aggregation, and temporal ownership facts.
**Demo Hook:** Reveal that four maintainers control most of a project's transitive tree and one is a recent owner.
**Competitor-Derived Insight:** Package scanners establish component risk while registry metadata establishes ownership as a real signal.
**Missing Outcome:** Fleet-specific maintainer concentration and fresh-handoff exposure.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Without the package-to-maintainer graph, the central concentration result disappears.
**Proof Path:** Real registry ownership data, root package input, dependency traversal, ownership expansion, aggregation, evidence paths.
**Authority and Integration Map:** Registry APIs provide public metadata, project loader records provenance, HydraDB computes control concentration; any unavailable 2FA signal is excluded.
**Adaptation Note:** Family: lineage and royalty graphs, extracted durable creator provenance and adapted it to software publisher control.

## Forensics and provenance lens

### IDEA 7: Blast Replay
**Problem:** Incident responders cannot reconstruct when services entered and exited a supply-chain compromise's blast radius.
**Market Anchor:** Post-incident reviews reconstruct timelines from package releases, lockfiles, advisories, and deployment records.
**Named Buyer:** Incident response lead.
**Existing Workflow:** Correlate logs and dependency snapshots manually.
**Current Substitute:** Timeline spreadsheets, scanner history, and package registry timestamps.
**Mechanism:** Re-run reachability at ordered graph snapshots or validity windows and render exposure frames.
**Chain-Native Angle:** HydraDB-native angle: every timeline frame is a traversal over a different graph state.
**Sponsor Fit:** HydraDB stores versioned relationships and executes bounded paths for each replay point.
**Demo Hook:** Scrub six minutes and watch the exposed set bloom, then shrink after remediation.
**Competitor-Derived Insight:** Historical scanner results prove teams need audit evidence after incidents.
**Missing Outcome:** Causal visual replay of dependency propagation rather than a static final-state report.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove temporal graph state and the replay becomes a fabricated animation.
**Proof Path:** Registry timestamps plus captured lockfile snapshots, time-bounded traversal, frame-by-frame counts and paths.
**Authority and Integration Map:** Public registry and advisory timestamps are real, organization snapshots are a labeled fixture, HydraDB produces each frame receipt.
**Adaptation Note:** CROSS: live game ticks to incident state replay. Family: live experiences, adapted into an explorable forensic timeline.

### IDEA 8: Typosquat Lineage
**Problem:** Name similarity alone produces false positives because it cannot distinguish a legitimate fork or rename from an unrelated impersonator.
**Market Anchor:** Registry security teams triage suspicious package names and publisher histories.
**Named Buyer:** npm or PyPI registry security engineer.
**Existing Workflow:** Combine naming heuristics with manual publisher and release-history inspection.
**Current Substitute:** Edit-distance scoring and analyst review.
**Mechanism:** Compare maintainer provenance subgraphs and temporal ordering between a popular package and each look-alike.
**Chain-Native Angle:** HydraDB-native angle: legitimacy is subgraph overlap plus time, not text similarity.
**Sponsor Fit:** HydraDB traverses `SIMILAR_NAME`, `PUBLISHED_BY`, and ownership-history relationships.
**Demo Hook:** A legitimate fork stays connected through shared provenance while a red impostor has zero lineage overlap.
**Competitor-Derived Insight:** Existing typosquat systems validate suspicious-name triage but leave analysts to establish provenance.
**Missing Outcome:** Explainable lineage evidence that reduces false positives.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove provenance traversal and the product falls back to ordinary edit distance.
**Proof Path:** Registry metadata, deterministic name edge, lineage traversal, time ordering, transparent evidence card.
**Authority and Integration Map:** Public registry data supports facts, loader derives similarity edges, HydraDB returns provenance paths; risk score remains advisory.
**Adaptation Note:** Family: verified knowledge provenance, extracted source-linked truth and adapted it to package identity.

### IDEA 9: Serial Publisher
**Problem:** A hijacked maintainer account can publish malicious versions across several packages before advisories identify them.
**Market Anchor:** Registries monitor publish events and respond to compromised maintainer accounts.
**Named Buyer:** Package registry security operations lead.
**Existing Workflow:** Investigate unusual publishing after user reports or malware analysis.
**Current Substitute:** Event monitoring, account controls, and retrospective package takedowns.
**Mechanism:** Detect a cross-package publish burst around one maintainer, then traverse every affected version to downstream dependents.
**Chain-Native Angle:** HydraDB-native angle: a temporal publisher pattern feeds directly into transitive dependency reachability.
**Sponsor Fit:** HydraDB performs temporal relationship aggregation followed by `algo.MSpaths` or repeated `SSpaths`.
**Demo Hook:** A maintainer pulses red after seven releases in minutes, then one click exposes the full downstream footprint.
**Competitor-Derived Insight:** Component scanners react to known bad packages while account compromise incidents show the upstream human trigger.
**Missing Outcome:** Pre-advisory behavior detection joined to impact assessment.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove either the publisher graph or reachability and the product loses detection or consequence.
**Proof Path:** Real registry publish events, transparent threshold, suspect package versions, live graph traversal, affected dependents.
**Authority and Integration Map:** Registry event data is public, project flags rather than suspends accounts, judge sees source facts and HydraDB results; no claim of live registry enforcement.
**Adaptation Note:** Family: pre-audit plus post-audit, adapted to detect a publisher anomaly then measure its impact. CROSS: agent behavior monitoring to maintainer behavior.

## Graph-primitive maximalist lens

### IDEA 10: Fleet BlastRadius
**Problem:** Enterprise security teams need to test hundreds of services against many newly compromised versions at once.
**Market Anchor:** Application fleets consume vulnerability feeds and maintain component inventories.
**Named Buyer:** Director of product security or application security lead.
**Existing Workflow:** Fan out scans per service and merge alerts.
**Current Substitute:** SCA fleet dashboards and per-repository scanning.
**Mechanism:** One many-source-to-many-target reachability query ranks each service-to-compromise path by distance.
**Chain-Native Angle:** HydraDB-native angle: `algo.MSpaths` matches the fleet-by-advisory matrix directly.
**Sponsor Fit:** HydraDB's indexed multi-source path primitive is the only computation producing the product result.
**Demo Hook:** Paste 42 compromised versions and get every exposed service plus its shortest proof path in one query.
**Competitor-Derived Insight:** Fleet dashboards prove organizations aggregate dependency risk across repositories.
**Missing Outcome:** One explicit many-to-many reachability receipt instead of client-side scanner fan-out.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove `MSpaths` and the core fleet-by-target exposure matrix disappears or becomes client orchestration.
**Proof Path:** Real package graph, labeled service roots, advisory target list, live `MSpaths`, returned paths and timing.
**Authority and Integration Map:** Security lead supplies targets, service roots come from demo SBOM fixtures, HydraDB is live, UI labels fixture organization data.
**Adaptation Note:** Family: multi-agent consensus, extracted many inputs resolved in one shared computation and adapted it to many-to-many risk evidence. Family: live consumer demos, adapted to graph animation.

### IDEA 11: ChokePoint
**Problem:** Security teams lack a highest-leverage hardening recommendation across shared dependencies.
**Market Anchor:** Organizations mirror, pin, replace, or patch dependencies to reduce supply-chain risk.
**Named Buyer:** Product security lead with dependency policy authority.
**Existing Workflow:** Prioritize by vulnerability severity and package popularity.
**Current Substitute:** Manual dependency-tree review and package-level risk scores.
**Mechanism:** Identify nodes shared across many exposure paths, simulate removal or pinning, and measure reachability reduction.
**Chain-Native Angle:** HydraDB-native angle: counterfactual cut analysis depends on repeated path computation over a sparse graph.
**Sponsor Fit:** HydraDB path procedures generate candidate funnels and verify each proposed cut.
**Demo Hook:** Click the top choke point and watch attack surface fall by a measured percentage.
**Competitor-Derived Insight:** Scanners show where vulnerabilities are, but remediation remains project-by-project.
**Missing Outcome:** A graph-proven highest-leverage defensive action.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Without counterfactual traversal there is no verified recommendation, only centrality theater.
**Proof Path:** Service roots and risky targets, baseline paths, candidate cuts, rerun with exclusion, delta receipt.
**Authority and Integration Map:** Project simulates rather than applies dependency changes, security lead evaluates output, no external package mutation is claimed.
**Adaptation Note:** Family: Monte Carlo recommendation systems, extracted compare-many-actions discipline and adapted it to deterministic graph counterfactuals.

### IDEA 12: TypoTrace
**Problem:** Teams receive separate typosquat and malware signals without a joined explanation of likely consequence.
**Market Anchor:** Registry and application security teams investigate look-alike packages and known malicious versions.
**Named Buyer:** Software supply-chain security analyst.
**Existing Workflow:** Correlate naming alerts with dependency scanners manually.
**Current Substitute:** Typosquat feeds and SCA dashboards.
**Mechanism:** Traverse from deterministic look-alike relationships through actual dependency paths to known malicious versions or affected service roots.
**Chain-Native Angle:** HydraDB-native angle: heterogeneous path traversal joins identity risk and structural consequence.
**Sponsor Fit:** `algo.MSpaths` or bounded OpenCypher paths return diverse evidence chains.
**Demo Hook:** Select a squat candidate and reveal both the legitimate-name link and real downstream infection paths.
**Competitor-Derived Insight:** Separate security products prove both signals matter.
**Missing Outcome:** One judge-visible graph explaining why a specific look-alike matters to this fleet.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove graph traversal and there is no joined causal chain.
**Proof Path:** Registry names, deterministic similarity edge, dependency graph, known-bad overlay, live bounded paths.
**Authority and Integration Map:** Public data supplies names and advisories, project loader creates disclosed similarity edges, HydraDB produces the joined path.
**Adaptation Note:** Family: transaction guardians, extracted pre-risk screening plus evidence and adapted it to package installation.
