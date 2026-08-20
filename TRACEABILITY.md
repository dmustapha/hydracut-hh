# HydraCut Forge Traceability

This index connects the product contract to its executable architecture, ordered Build task, observable proof, and refusal behavior.

| Feature | Product contract | Architecture owner | Build task | Observable | Primary evidence |
|---|---|---|---|---|---|
| F-001 corpus provenance | PRD §§2.3, 6.1 | §§6, 7.1, 18.1 | 1.3–1.4, 3.3 | FEATURE-OBSERVABLES F-001 | frozen runtime JSON + corpus test |
| F-002 native baseline | PRD F03, C06 | §§7.5–7.6, 17.2 | 2.4, 3.1 | F-002 | HydraDB receipt + BFS digest |
| F-003 incident command | PRD F01, §3.5 | §§9, 14 | 4.2–4.5 | F-003 | Playwright F01 screenshot/axe |
| F-004 proposed fixes | PRD F04, C07 | §§7.1, 8.2, 17.3 | 3.1, 4.4 | F-004 | immutable commit and full-graph outcomes |
| F-005 plan/final proof | PRD F05–F06, C08 | §§5, 17.4 | 3.1, 3.3, 4.4 | F-005 | plan digest + final native receipt |
| F-006 receipt/SARIF | PRD F07, C09 | §§3.4, 12.2, 18.2 | 1.2, 3.3, 4.4 | F-006 | canonical JSON and SARIF download |
| F-007 refusal states | PRD §5, R01–R23 | §§12–15.3 | 5.1 | F-007 | mandatory mutation matrix |
| F-008 role projection | PRD F08 | §§9.1, 14 | 4.2, 4.4–4.5 | F-008 | mobile/history E2E |
| F-009 exact import | PRD F02 | §§7.1, 17.1 | 2.1, 3.1, 4.1 | F-009 | GitHub provenance + no-execution extraction |
| F-010 discovery | PRD F04 | §§7.1, 17.3 | 2.1, 3.1, 4.4 | F-010 | paginated PR evidence |
| F-011 operational views | PRD C12, §3.5 | §§9, 11–13 | 4.4, 6.1 | F-011 | health/freshness/limits E2E |

## Load-bearing chain

`immutable input → Arborist complete graph → exact-version evidence → native baseline MSpaths → real proposed-fix graphs → bounded coverage plan → one combined native MSpaths → canonical receipt`

Every arrow has a fail-closed state in PRD §5, an integration owner in Architecture §§6–13, a Build gate in PLAN phases 1–6, and an observable above. PostgreSQL owns workflow and provenance; it never substitutes for HydraDB reachability.

## Authentic frozen facts

The only pre-Build numeric product facts are those in `docs/evidence/2026-08-19-pre-forge-runtime.json`: 3 repositories, 6 immutable snapshots, 1,742 baseline package instances, 2,896 package dependency edges, selected minimist 3→0 pairs, and bounded three-source verification universe 9→6 pairs. Build must recompute them; Forge does not promote them into fresh runtime claims.
