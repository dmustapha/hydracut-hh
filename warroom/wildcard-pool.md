# Wildcard Generator Pool

These five ideas complete the missing fifth generator. They were generated before collision material was revealed.

### IDEA 13: HydraCut
**Problem:** Responders know which applications are exposed but not the smallest upgrade set that cuts every malicious path.
**Market Anchor:** Multi-package compromises force defenders to triage many dependency paths under time pressure.
**Named Buyer:** Application security lead or supply-chain incident commander.
**Existing Workflow:** Inspect lockfiles, advisories, and dependency trees repository by repository.
**Current Substitute:** Flat affected-package lists, recursive CLI inspection, spreadsheets, and remediation tickets.
**Mechanism:** `algo.MSpaths` enumerates compromised-version-to-application routes, then a deterministic hitting-set pass selects a minimal cut and a second traversal verifies it.
**Chain-Native Angle:** HydraDB-native angle: complete many-to-many path topology is required to calculate and prove the remediation cut.
**Sponsor Fit:** Self-hosted HydraDB stores exact version edges and performs both load-bearing traversals.
**Demo Hook:** Mark three packages compromised, click `Cut blast radius`, then see a few upgrade nodes turn green and all hostile paths disappear.
**Competitor-Derived Insight:** Existing tools validate package detection, but coordinated path-level remediation remains manual.
**Missing Outcome:** The smallest defensible remediation plan protecting all applications.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove HydraDB and the system cannot enumerate transitive routes or prove the proposed cut.
**Proof Path:** Real lockfiles and advisories, graph ingestion, `MSpaths`, cut selection, scenario overlay, second traversal, zero remaining hostile paths.
**Authority and Integration Map:** Repository owners provide lockfiles; an incident responder marks OSV-backed targets; HydraDB returns live paths; remediation changes remain explicitly simulated.
**Adaptation Note:** Family: honesty-labeled analytics, adapted into `VERIFIED`, `COMPUTED`, and `UNKNOWN` evidence. CROSS: simulation-to-real routing, adapted to route engineers toward the smallest upgrade set.

### IDEA 14: Patch Parallax
**Problem:** Teams cannot tell whether an upgrade removes exposure or reroutes it through another transitive dependency.
**Market Anchor:** Production resolution is governed by exact lockfiles, while upgrade review compares before and after states.
**Named Buyer:** Platform engineering lead approving dependency pull requests.
**Existing Workflow:** Review an upgrade diff, rerun the scanner, and inspect remaining findings.
**Current Substitute:** Before-and-after vulnerability counts without path-level explanation.
**Mechanism:** Store baseline and proposed dependency scenarios, run `algo.SSpaths` in both, and classify paths as removed, persistent, or new.
**Chain-Native Angle:** HydraDB-native angle: the safety claim is a set difference between exact transitive path sets.
**Sponsor Fit:** HydraDB materializes scenario edges and computes both blast radii.
**Demo Hook:** Drag from version A to B, watch red paths disappear, and expose one unexpected orange path that preserves risk.
**Competitor-Derived Insight:** Existing workflows validate upgrade proposals and rescanning.
**Missing Outcome:** Pre-merge path-level proof that a proposed upgrade actually removes exposure.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove HydraDB and this becomes a cosmetic lockfile diff.
**Proof Path:** Baseline and proposed lockfiles, two scenario graphs, paired reachability, path-set comparison, visible delta.
**Authority and Integration Map:** Repository owner supplies both lockfiles, platform lead requests the comparison, HydraDB executes live, merge action remains outside scope.
**Adaptation Note:** Family: pre-audit plus post-audit, adapted around a dependency change. Family: honesty labels, used to distinguish live facts from counterfactual results.

### IDEA 15: PathWitness
**Problem:** Flat vulnerability alerts cannot prove why a specific application is exposed.
**Market Anchor:** Incident responders paste dependency-tree evidence into tickets for application owners.
**Named Buyer:** Security incident commander.
**Existing Workflow:** Search repositories, run tree commands, and manually assemble evidence.
**Current Substitute:** Severity alerts and dependency-tree screenshots.
**Mechanism:** `algo.SPpaths` produces a compact application-to-compromised-version witness with ordered nodes and edge provenance.
**Chain-Native Angle:** HydraDB-native angle: the exposure proof is the exact dependency path.
**Sponsor Fit:** Self-hosted HydraDB persists provenance-bearing edges and returns the witness.
**Demo Hook:** Click one alert and expand an evidence card from compromised release to production app, including each source lockfile line.
**Competitor-Derived Insight:** Existing alerts prove speed and prioritization matter.
**Missing Outcome:** A portable, human-auditable exposure proof an application owner can verify.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove traversal and the alert can assert exposure but cannot prove it.
**Proof Path:** Advisory plus lockfile, provenance graph, `SPpaths`, evidence card, raw Cypher and JSON result.
**Authority and Integration Map:** Application owner provides a lockfile, responder marks a compromised OSV identifier, HydraDB returns live path evidence, exports remain local.
**Adaptation Note:** Family: verified knowledge publishing, adapted into source-addressable dependency claims. Family: honesty labels, adapted to graph evidence.

### IDEA 16: Campaign Lens
**Problem:** Responders treat coordinated multi-package compromises as separate alerts and miss shared applications and chokepoints.
**Market Anchor:** Broad campaigns can compromise many artifacts in minutes.
**Named Buyer:** Supply-chain threat hunter or application security incident commander.
**Existing Workflow:** Query packages separately, merge repository lists, and infer common exposure points manually.
**Current Substitute:** Independent vulnerability alerts plus client-side loops.
**Mechanism:** One `algo.MSpaths` query spans many compromised versions and application targets, then groups returned paths by shared intermediate nodes.
**Chain-Native Angle:** HydraDB-native angle: joint campaign structure exists only in the many-source, many-target path set.
**Sponsor Fit:** `MSpaths` replaces fan-out and preserves joint route evidence.
**Demo Hook:** Select six malicious releases, reveal all routes at once, then toggle convergence to highlight shared infrastructure.
**Competitor-Derived Insight:** Current tooling validates rapid correlation of multiple security signals.
**Missing Outcome:** One campaign-wide graph explaining shared exposure structure.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove `MSpaths` and the system falls back to isolated scans with fragile merging.
**Proof Path:** Advisory set and lockfiles, source and target sets, live `MSpaths`, convergence aggregation, campaign graph.
**Authority and Integration Map:** Incident commander selects OSV-backed targets, platform team supplies lockfiles, HydraDB runs live, local aggregation renders path frequency.
**Adaptation Note:** Family: multi-agent consensus, adapted into multi-path corroboration. Family: live value production, adapted into an immediate response plan.

### IDEA 17: Escape Routes
**Problem:** The obvious direct upgrade may be blocked, leaving teams to trial candidate remediations one at a time.
**Market Anchor:** Dependency owners repeatedly regenerate lockfiles and rescan until a compromised release disappears.
**Named Buyer:** Staff engineer or dependency-management owner.
**Existing Workflow:** Inspect trees, test candidate upgrades, and regenerate lockfiles.
**Current Substitute:** Trial-and-error upgrades, changelogs, and repeated scans.
**Mechanism:** Model upgrade edges alongside dependency edges, find bounded candidate change paths with `algo.SPpaths`, and verify each with `algo.SSpaths`.
**Chain-Native Angle:** HydraDB-native angle: a safe escape is a version path satisfying a negative reachability condition.
**Sponsor Fit:** HydraDB discovers candidate upgrade paths and proves the selected route removes compromised reachability.
**Demo Hook:** Show fastest, fewest-change, and lowest-churn escape routes, then select one and turn the application green.
**Competitor-Derived Insight:** Upgrade suggestions prove willingness to change versions while path views prove explainability matters.
**Missing Outcome:** Multiple explainable remediation routes, each verified to remove exposure.
**Multi-Track Architecture:** Single-track contract, Track 02-A only.
**Per-Track Load-Bearing Test:** Remove HydraDB and the app can suggest the newest version but cannot discover or verify alternate routes.
**Proof Path:** Vulnerable lockfile and release metadata, dependency plus upgrade graph, candidate `SPpaths`, safety `SSpaths`, ranked route options.
**Authority and Integration Map:** Repository owner supplies current state, bounded registry metadata supplies releases, HydraDB executes live, patch plan remains simulated.
**Adaptation Note:** CROSS: simulation-to-real routing, adapted from route evaluation to dependency remediation. Family: one novel mechanic deeply explored, centered on graph-proven escape routes.
