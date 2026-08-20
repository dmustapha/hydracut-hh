# Hack Hydra Market Reality Map

## Scope and Track Strategy Contract

- **Contract:** `single-track`
- **Selected track:** Track 02-A, Supply Chain Blast Radius
- **Demand boundary:** The target user must already own repositories, dependency manifests, SBOMs, security alerts, or incident-response responsibility. Do not invent a new operator, marketplace, or data source.
- **HydraDB requirement:** Self-hosted HydraDB must compute a necessary transitive exposure or remediation answer through OpenCypher or `algo.*paths`. A precomputed JSON answer copied into a graph fails the contract.

## Generator-Safe Demand Map

This section is safe to give to every generator. It contains evidenced users, jobs, workflows, economic signals, privacy boundaries, distribution paths, and authority chains. It intentionally omits named products, named competitors, collision analysis, saturation claims, and source attribution.

### Opportunity 1: Portfolio incident blast-radius triage

| Field | Market reality |
|---|---|
| User and named buyer | **User:** Application-security engineer or incident commander. **Buyer or authorizer:** Organization owner, security manager, or repository administrator with authority over security configuration and remediation work. |
| Existing workflow | When a new advisory or package compromise appears, teams inspect alerts and dependency paths per repository, search manifests and lockfiles, assign findings, and ask service owners to patch or rotate secrets. |
| Costly failure | A fast-moving compromise can affect many versions and packages within minutes. Reviewing repositories independently delays scope, containment, credential rotation, and owner assignment. |
| Existing economic signal | Organizations repeatedly run dependency scans in CI, receive and assign alerts, maintain security roles, and spend developer time on upgrade pull requests and manual review. |
| Current substitute | Repository security tabs, CLI audits, spreadsheet or ticket aggregation, manual code search, and asking each service owner to inspect their own dependency tree. |
| Natural confidentiality | Private repository names, lockfiles, internal package names, service ownership, deployment mappings, alert dispositions, and credential-exposure assumptions are commercially sensitive. Public open-source inputs remain public. |
| Reachable distribution | Start with five open-source maintainers or small engineering teams through a local lockfile importer and shareable incident report. The same workflow can later become a CI action or repository app. |
| Authority chain | **Invoke:** Security engineer selects an advisory or compromised package version. **Fund or authorize:** Organization owner or security manager authorizes repository access and response work. **Observe:** Importer reads manifests, lockfiles, or SBOMs the user can access. **Verify:** HydraDB returns bounded dependency paths with source and timestamp properties. **Receive:** Service owners receive an affected-asset list and exact introduction paths. |

### Opportunity 2: Remediation sequencing by shared dependency chokepoints

| Field | Market reality |
|---|---|
| User and named buyer | **User:** Platform security lead coordinating several service owners. **Buyer or authorizer:** Engineering director, security manager, or organization owner who controls remediation priority. |
| Existing workflow | Teams inspect the vulnerable transitive path in each project, identify which direct parent introduced it, then open or request upgrades project by project. |
| Costly failure | The same compromised transitive package may enter many services through a small set of shared parents. Treating every alert independently duplicates work and can produce conflicting upgrade choices. |
| Existing economic signal | Existing tools already group vulnerabilities by dependency, show affected paths, and generate fix pull requests. This proves repeated willingness to spend engineering time on path analysis and upgrades. |
| Current substitute | Sort alerts by severity, manually group them by package, export dependency reports, and select direct-parent upgrades using individual project trees. |
| Natural confidentiality | The cross-project dependency inventory and service ownership map reveal internal architecture and patch capacity. |
| Reachable distribution | Offer a local incident workspace that imports several lockfiles and produces a ranked remediation plan that a security lead can share with service owners. |
| Authority chain | **Invoke:** Platform security lead chooses the incident and candidate parent upgrade. **Fund or authorize:** Engineering or security leadership assigns remediation capacity. **Observe:** The importer reads authorized dependency snapshots. **Verify:** HydraDB computes all affected paths and re-runs a counterfactual graph with candidate edges removed or versions changed. **Receive:** Service owners receive prioritized parent upgrades and the number of exposure paths each removes. |

### Opportunity 3: Historical exposure during a malicious publication window

| Field | Market reality |
|---|---|
| User and named buyer | **User:** Incident responder or post-incident investigator. **Buyer or authorizer:** Security manager or engineering leader accountable for breach assessment. |
| Existing workflow | Responders compare advisory timelines with install logs, lockfile commits, CI runs, and deployed artifact records to decide whether a bad version ever executed. |
| Costly failure | A repository can be clean now but may have installed or deployed a malicious version during a narrow attack window. Current-state scans can miss the historical exposure that triggers secret rotation or forensic review. |
| Existing economic signal | Teams retain commit history, CI logs, dependency snapshots, and audit records, then spend incident-response time reconstructing timelines after compromise. |
| Current substitute | Manual timestamp comparison across advisory pages, version-control history, CI logs, package-lock diffs, and deployment records. |
| Natural confidentiality | CI history, deployment topology, exact install times, runner identities, and secret-access assumptions are sensitive operational data. |
| Reachable distribution | Begin with local Git history plus lockfile snapshots and a documented real incident window. The product can prove value without requiring live production access. |
| Authority chain | **Invoke:** Incident responder selects package, affected versions, and time window. **Fund or authorize:** Security manager authorizes repository and CI-history analysis. **Observe:** Importer reads authorized historical lockfiles and timestamps. **Verify:** HydraDB traverses versioned `DEPENDS_ON` and `OBSERVED_IN` edges constrained by time. **Receive:** Incident lead gets a path-based list of assets that were exposed during the window and the evidence behind each conclusion. |

### Opportunity 4: Uncertainty-aware response for incomplete private dependency data

| Field | Market reality |
|---|---|
| User and named buyer | **User:** Application-security engineer responsible for private packages or partially scanned repositories. **Buyer or authorizer:** Organization owner or security manager who can grant repository and package-registry access. |
| Existing workflow | Security teams scan supported manifests and dependencies, then manually investigate findings marked unknown, unsupported, stale, or blocked by inaccessible private packages. |
| Costly failure | A binary affected or unaffected answer hides missing evidence. False confidence is dangerous during incident response, while treating every unknown as affected wastes remediation capacity. |
| Existing economic signal | Reachability systems already expose pending, unknown, unsupported, and inconclusive states, proving that users encounter and triage incomplete evidence. |
| Current substitute | Review scanner logs, request credentials or manifests from service owners, annotate tickets, and rerun the scan after missing inputs become available. |
| Natural confidentiality | Private package names, internal registries, dependency topology, source code, and access-control failures are naturally sensitive. |
| Reachable distribution | Target teams with private monorepos or internal packages through a self-hosted importer that never uploads topology. A five-user pilot can use synthetic internal-package names against real dependency shapes. |
| Authority chain | **Invoke:** Security engineer requests a blast-radius query. **Fund or authorize:** Organization owner grants least-privilege access to private manifests. **Observe:** Importer records present and missing evidence separately. **Verify:** HydraDB returns confirmed paths and frontier nodes where evidence ends. **Receive:** Incident lead receives affected, cleared, and unknown sets with reasons, not a false binary. |

### Opportunity 5: Pull-request impact projection across an owned portfolio

| Field | Market reality |
|---|---|
| User and named buyer | **User:** Repository maintainer or platform engineer reviewing a dependency update. **Buyer or authorizer:** Repository administrator, organization owner, or security manager who controls CI policy. |
| Existing workflow | Pull-request checks compare dependency changes, flag known vulnerable additions, and may fail CI based on policy. Reviewers inspect the changed dependency and its project-level impact. |
| Costly failure | A change to a shared internal package or platform template can propagate to many repositories after merge, but a single-repository check may not show the prospective portfolio blast radius. |
| Existing economic signal | Teams already run pull-request dependency checks, enforce CI rules, and review automated upgrade pull requests. |
| Current substitute | Review the local dependency diff, search for consumers manually, notify downstream teams, and wait for later scans to expose propagated issues. |
| Natural confidentiality | Private repository relationships, internal package names, planned version changes, and release schedules are sensitive. |
| Reachable distribution | A local check can accept a dependency diff and a small repository inventory, then post a static report to the pull request without needing write access. |
| Authority chain | **Invoke:** Maintainer submits a dependency-changing pull request. **Fund or authorize:** Repository admin or security manager configures the check. **Observe:** CI supplies the authorized before and after manifests. **Verify:** HydraDB computes downstream consumers and compares the before and after path sets. **Receive:** Reviewer sees which owned assets gain or lose exposure before merge. |

## Demand Synthesis for Generators

### Evidenced recurring behaviors

1. Teams maintain dependency manifests, lockfiles, or SBOMs.
2. Security tools construct direct and transitive dependency trees.
3. Advisories are matched to exact package versions or commits.
4. Alerts are assigned, dismissed, fixed, and re-scanned.
5. Pull requests and CI checks are established remediation and prevention channels.
6. Private dependencies and incomplete evidence produce real unknown states.

### Buyer and operator boundary

- A repository maintainer can inspect and fix repositories they control.
- A repository administrator or organization owner can enable dependency security and authorize repository integrations.
- A security manager can manage security alerts and configurations across an organization.
- A service owner can receive a path and perform the code change.
- The project may analyze and report. It must not claim authority to patch, deploy, revoke credentials, or change an external service without an authorized actor and supported interface.

### Honest demo boundary

- Public registry metadata and advisories may be live.
- Repository snapshots may be local fixtures or user-authorized imports.
- Historical deployments may be reconstructed from fixture logs if labeled simulated.
- A counterfactual remediation may be computed without opening a real pull request, but it must be labeled projected.
- Judge-visible proof must include the actual HydraDB query or procedure, returned paths, input provenance, and a before or after removal test.

## Gate-Only Source Attribution Appendix

**Do not include this appendix, named substitutes, or source-specific collision conclusions in generator prompts. Reveal it only after the raw idea pool is durably frozen.**

### Opportunity 1 attribution: Portfolio incident blast-radius triage

- GitHub documents that Dependabot alerts are generated when a new vulnerability enters its advisory database or when the dependency graph changes. Alerts include the affected file, severity, and fixed version: https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-alerts
- GitHub documents that write, maintain, and admin roles can receive and dismiss Dependabot alerts, while organization owners and security managers have organization-wide security authority: https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization and https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/permissions-of-predefined-organization-roles
- The TanStack maintainer advisory records 84 malicious versions across 42 packages published in roughly six minutes, plus credential-theft impact and remediation guidance: https://github.com/TanStack/router/security/advisories/GHSA-g7cv-rxg3-hmpx
- The maintainer postmortem documents the response timeline and the expansion from an initial package list to the full 42-package scope: https://tanstack.com/blog/npm-supply-chain-compromise-postmortem
- **Named substitutes:** GitHub Dependabot, repository search, alert exports, incident tickets.

### Opportunity 2 attribution: Remediation sequencing

- npm documents that `npm audit` submits dependency information, calculates known vulnerabilities and meta-vulnerabilities, reports impact, and can apply compatible remediations: https://docs.npmjs.com/cli/v11/commands/npm-audit/
- Snyk documents organization-wide dependency inventory, project membership, vulnerable path counts, and fix pull requests: https://docs.snyk.io/manage-risk/dependencies-and-licenses/view-dependencies and https://docs.snyk.io/scan-with-snyk/snyk-open-source/manage-vulnerabilities/fix-your-vulnerabilities
- GitHub Dependency Review documents dependency diffs, vulnerability warnings, dependent-project counts, fixed versions, and enforcement in pull requests: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-dependency-changes-in-a-pull-request
- **Named substitutes:** npm audit reports, Snyk dependency inventory, GitHub dependency paths, CSV exports, manual grouping.

### Opportunity 3 attribution: Historical exposure

- The TanStack advisory gives an exact malicious publication window, exact affected versions, install-time execution behavior, and instructions to audit CI that installed those versions: https://github.com/TanStack/router/security/advisories/GHSA-g7cv-rxg3-hmpx
- npm documents that audit results depend on the package lock and that rebuilding a dependency tree without a lockfile can yield different results, supporting snapshot-specific analysis: https://docs.npmjs.com/cli/v11/commands/npm-audit/
- GitHub's dependency-submission API accepts a snapshot with commit SHA, ref, detector, scan time, manifests, resolved package URLs, and dependencies: https://docs.github.com/en/rest/dependency-graph/dependency-submission
- **Named substitutes:** Git history, CI logs, lockfile diffs, deployment logs, manual incident timeline.

### Opportunity 4 attribution: Incomplete private dependency data

- Socket documents explicit reachability states including pending, missing support, unknown, error, and direct-dependency limitations; it also identifies inaccessible private dependencies as a cause of unknown results: https://docs.socket.dev/docs/reachability-results
- GitHub documents that private dependencies may require explicit access configuration for automated updates: https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-security-and-analysis-settings-for-your-organization
- OSV documents version-aware queries and the limits of advisory records as vulnerability evidence, not private asset inventory: https://google.github.io/osv.dev/api/ and https://google.github.io/osv.dev/data_quality.html
- **Named substitutes:** Scanner logs, manual service-owner outreach, credential changes, and repeat scans.

### Opportunity 5 attribution: Pull-request impact projection

- GitHub documents that Dependency Review compares dependency changes in pull requests, exposes vulnerabilities and fixed versions, and can fail a pull-request check through an action: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-dependency-changes-in-a-pull-request
- GitHub documents that its dependency graph derives dependencies from manifests, lockfiles, and submitted snapshots, and can display transitive paths: https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-graph
- deps.dev documents stable access to package metadata and resolved dependencies, making public ecosystem expansion feasible: https://docs.deps.dev/api/v3/
- **Named substitutes:** GitHub Dependency Review, CI policy, repository code search, downstream owner notification.

### Sponsor capability attribution

- Hack Hydra brief and verified intel identify self-hosted HydraDB, OpenCypher, Bolt, and native `algo.SPpaths`, `algo.SSpaths`, and `algo.MSpaths` procedures as the required graph substrate:
  - `/Users/MAC/.codex/skills/hackathon-briefs/hack-hydra.md`
  - `/Users/MAC/hackathon-toolkit/candidates/hack-hydra/research-brief.md`
- Official HydraDB repository: https://github.com/hydra-db/hydradb

### Gate-only market conclusions

1. The market is real, but generic dependency scanning and generic graph blast-radius visualization are already served.
2. The strongest buyer is an existing security manager, organization owner, or repository administrator, not a newly invented graph operator.
3. The most defensible short-sprint opportunity is an incident-time outcome that existing workflows expose but do not make immediate: reverse portfolio impact, historical exposure, uncertainty frontiers, or remediation counterfactuals.
4. Private topology is naturally confidential, but privacy is not itself the novelty. Self-hosting is an adoption and evidence advantage.
5. A credible demo may use public package and advisory data plus a clearly labeled local repository portfolio. It must not imply live access to organizations, deployments, or external remediation systems that were not actually integrated.
