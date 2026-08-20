# HydraCut domain guide

HydraCut is powered by CampaignRadius. It records immutable package states, authoritative advisory evidence, graph traversal evidence, and canonical receipts.

## Vocabulary

- A **package instance** is one resolved `(snapshotKey, location, name, version, purl)` node. A package/version is only a name and exact version and is not an instance until its snapshot and location are known.
- A resolved graph contains application roots and dependency edges. Scope edges are `PROD_DEPENDS_ON`, `DEV_DEPENDS_ON`, `OPTIONAL_DEPENDS_ON`, and `PEER_DEPENDS_ON`; scope is explicit and never inferred.
- Advisory evidence preserves OSV range events, aliases, withdrawn state, CVSS vector, fixed versions, references, and source stamps. KEV is `LISTED`, `NOT_LISTED`, or `UNKNOWN`. EPSS probability and percentile remain decimal strings; unavailable values are `UNKNOWN`.
- **Dependency-level potential exposure** means a bounded graph path from an incident source to an application. A source/application pair is identified only by `sourceKey + applicationKey`; one shortest witness is retained.
- The **CampaignRadius baseline** is the verified native HydraDB `MSpaths` traversal over the complete current portfolio and selected advisory sources.
- A **proposed fix** is a complete immutable repository snapshot with verified extraction, exact source mapping, and a measured pair delta. It is the only user-facing term for a remediation option.
- Coverage prediction is planner set algebra over individually verified outcomes. Combined proof is a new scenario, new graph write, and one final native traversal; prediction is never proof.
- `VERIFIED_WITHIN_BOUNDS` means all declared cardinality, bound, cursor, duplicate, epoch, bookmark, and digest checks passed. `PARTIAL` means evidence is incomplete. `UNKNOWN` means the result cannot be asserted. `ERROR` means a guard or computation failed.
- A receipt is canonical provenance: input identities, source stamps, advisory and exploitation evidence, topology, baseline, verification universe, final traversal, proposed-fix outcomes, plan binding, graph image/schema, limitations, and digest.

## Exact traversal templates

Baseline and final proof use the same reviewed OpenCypher template, with scenario-specific selectors and bounds:

```cypher
CALL algo.MSpaths({
  sourceLabel: 'IncidentSource',
  sourceProperty: 'source_selector',
  sourceValues: [<source selectors>],
  targetLabel: 'ScenarioApplication',
  targetProperty: 'portfolio_key',
  targetValues: [<scenario selector>],
  pairwise: false,
  relTypes: ['MATCHES_INCIDENT', <scope edges>, 'USES_SNAPSHOT'],
  relDirection: 'incoming',
  maxLen: <imported depth + 3>,
  pathCount: 1,
  resultLimit: <source count * application count>
}) YIELD path RETURN path
```

Selector cardinalities are checked before traversal. A verified result requires no cursor, duplicate pair, truncation, or missing epoch/bookmark, and its pair digest must match the independently expected set.

## Limits and forbidden claims

HydraCut does not perform source-code reachability, malware detection, or comprehensive vulnerability coverage. It does not provide tenant isolation or production high availability. It does not decide for untrusted tenants.

The phrase “exploitability” is forbidden because dependency-level potential exposure is not exploitability analysis. The phrase “portfolio safe” is forbidden because a cleared selected incident does not certify application or portfolio safety. The historical field name “candidate” is forbidden in user-facing copy; use “proposed fix”.

No LLM or agent selects vulnerabilities, computes exposure, recommends a proposed fix, chooses a plan, generates a receipt, or decides whether the graph is clean. Optional narrative may only summarize receipt-backed fields.

## Glossary mapping

| Internal concept | User-facing term |
|---|---|
| complete immutable remediation snapshot | proposed fix |
| baseline pair set | CampaignRadius baseline |
| bounded native traversal result | verified exposure evidence |
| planner result before re-traversal | coverage prediction |
| final combined HydraDB traversal | combined proof |
