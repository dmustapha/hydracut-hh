# HydraCut judge path

Target duration: 2:52 (hard maximum: 3:00). Capture browser and terminal together. The
operator rehearses against the proxy with the pinned self-hosted HydraDB service visible.
Every number, repository, graph result, proposed fix, and receipt is produced by the live
pipeline from the frozen public inputs. There is no demo-only success route.

## Stop conditions

Stop the take and label any previously recorded receipt **historical verified run** if:

- HydraDB baseline or final traversal fails, times out, loses its epoch/bookmark, truncates,
  duplicates, or fails any selector/count/BFS/readback check.
- GitHub or OSV changes the authenticated input/evidence, a source is stale, or a frozen
  source snapshot no longer reproduces its expected hashes.
- A proposed fix is not an immutable commit/lockfile state, its bytes drift, or extraction is
  incomplete. Never substitute a version string, mutable branch, or generated graph.
- KEV or EPSS is unavailable: continue only with a visible `UNKNOWN` field; never render a
  cached zero or delay the graph truth.
- The worker, database, receipt, proxy, or browser route is unavailable. Do not claim a fresh
  run from cached PostgreSQL rows or a prior receipt.

If a stop condition occurs, preserve the historical receipt and explain the divergence. Do
not rewrite history, fabricate a result, or record a success take.

## Eight scenes

| Time | Scene | Screen and action | Spoken proof |
|---|---|---|---|
| 0:00–0:20 | F01 · Action-first incident command | Open `/incidents?role=appsec`; show the verified demo portfolio, freshness strip, minimist incident, OSV/CVSS/KEV/EPSS, and three affected applications. | “Dependency alerts arrive one repository at a time. HydraCut starts with the portfolio decision: what requires action now? This queue uses visible evidence, not a hidden score.” |
| 0:20–0:39 | F02 · Authentic input | Open portfolio provenance; expand one baseline/proposed pair and show public repositories, immutable commits, lockfile hashes, and extractor version. | “These are real public repository states and real later commits. HydraCut reads committed files, hashes them, and reconstructs lockfiles without installing or running repository code.” |
| 0:39–1:11 | F03 · CampaignRadius baseline proof | Open impact matrix; show three minimist pairs, one production pair, one witness, raw OpenCypher, computed bound, and `CALL algo.MSpaths`. Toggle production scope and select nodekb. | “CampaignRadius asks self-hosted HydraDB which applications are reachable from the affected version. Native MSpaths returns three source-to-application pairs. One is production scope. This path is one shortest witness, not an exploitability claim.” |
| 1:11–1:34 | F04 · Real proposed fixes | Open Proposed Fixes; show the three genuine commit links, complete-state outcomes, nodekb comparison, proposed SHA, and changed-package count. | “A fixed version string is not an application fix. HydraCut accepts real commits or lockfiles, rebuilds each complete resolved graph, and shows selected exposure removed, persistent, or introduced.” |
| 1:34–1:54 | F05 · Transparent portfolio plan | Open coverage matrix and selected plan; show the three selected proposed fixes and uncovered-pair count before verification. | “The planner uses verified pair coverage and explicit constraints. It does not sell exponential combinations as product scale, and it never selects an imaginary graph cut.” |
| 1:54–2:24 | F06 · Final combined HydraDB proof | Run final verification; show the second native traversal, final timing, epoch, bookmark, zero selected minimist pairs, and six other vulnerable-version pairs. | “Now HydraCut materializes the chosen portfolio state and runs a second native HydraDB traversal. The selected minimist incident has zero residual pairs within these bounds. Six pairs from two other known vulnerable versions remain. The portfolio is not certified safe.” |
| 2:24–2:43 | F07 · Reproducible receipt | Open the immutable receipt; show digest, inputs, source snapshots, baseline/final query, limitations, JSON download, and SARIF download. Copy the digest. | “Every conclusion carries its inputs, source freshness, graph checks, query bounds, runtime identity, result digest, and limitations. The receipt is evidence another engineer can audit.” |
| 2:43–2:52 | F08 · Role projection and sponsor close | Switch AppSec → Developer → Leader while preserving incident context; finish on `/system` with the private HydraDB health and image digest plus two native-query checks. | “AppSec coordinates the incident, developers get repository context, and leaders see coverage without changing the truth. Remove HydraDB and both the baseline answer and final proof disappear.” |

## Rehearsal checklist

Before each take, run the authentic seed and proof commands from the repository root:

```bash
docker compose run --rm worker pnpm seed:demo
docker compose run --rm worker pnpm proof
```

Then start the proxy, set a 2:52 timer, and record all eight scenes without pausing the
clock. A take passes only when it shows the baseline query, three real proposed fixes, the
combined query, limitations, and the receipt before 2:52. Record both takes in
`BUILD-REPORT.md`, including each overrun, failed transition, and chosen correction. If the
commands are blocked by missing GitHub credentials or database wiring, record the exact
fail-closed error and do not mark the rehearsal as passed.

## Language guard

Use only bounded, evidence-backed language: “within displayed bounds,” “potential exposure,”
“selected incident,” “remaining pairs,” “historical verified run,” and “UNKNOWN.” Never say
“safe,” “portfolio safe,” “fixed” without the immutable proposed state, “exploitable,”
“comprehensive,” “minimum plan,” or “zero vulnerabilities.”
