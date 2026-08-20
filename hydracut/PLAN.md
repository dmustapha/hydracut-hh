# HydraCut powered by CampaignRadius: Implementation Plan

**Project:** HydraCut powered by CampaignRadius  
**Hackathon:** HydraDB Hackathon  
**Deadline:** 2026-08-20 23:59 PT  
**Build window:** 1.25 days maximum  
**Architecture:** `hydracut/ARCHITECTURE.md` — sole code and infrastructure source of truth  
**PRD:** `hydracut/PRD.md` — product truth, flows, risks, and acceptance source

## 1. Operating rules

1. Execute phases and tasks in order. Do not cross a gate with an unchecked item.
2. Copy each named file contract from the cited Architecture section; do not invent a substitute service or result path.
3. Run the exact verification command after each task and commit only its listed files.
4. A failed decision point follows its matching DT tree. If the terminal branch is reached, stop and record `BLOCKED`; never add a mock, stored-success response, or fabricated count.
5. “Proposed fix” is the only user-facing term. Dependency-level potential exposure is never described as exploitability or portfolio safety.
6. Self-hosted HydraDB, explicit OpenCypher, and native `algo.MSpaths` are mandatory at baseline and final combined verification.
7. `VERIFY-MILESTONE` tasks are mandatory. Run `seed-demo.ts` before every browser suite or demo take; it imports and asserts authentic bytes rather than inserting results.
8. Create the test named beside each component in the same task. A source file without its listed test evidence is incomplete.

## 2. Phase overview

| Phase | Purpose | Estimate | Depends on |
|:---:|---|---:|---|
| 0 | Resolve toolchain and pinned runtime contracts | 0.08 day | — |
| 1 | Create domain truth, persistence, and authentic seed | 0.18 day | Phase 0 |
| 2 | Prove every external integration and native graph path | 0.25 day | Phase 1 |
| 3 | Join jobs, baseline, proposed fixes, planner, and final receipt | 0.25 day | Phase 2 |
| 4 | Build the action-first BFF and incident-command frontend | 0.18 day | Phase 3 |
| 5 | Exercise failure, security, accessibility, and demo gates | 0.10 day | Phase 4 |
| 6 | Deploy, reproduce, and capture judge evidence | 0.08 day | Phase 5 |
| **Total** |  | **1.12 days** | ≤ 1.25 days; 0.13-day proof/rework reserve |

## 3. Phase 0 — Compatibility and runtime truth

**Purpose:** Fail early on exact package or HydraDB incompatibility before product code.  
**Estimated time:** 0.08 day

### Task 0.1 — Create the exact workspace manifest

**Architecture references:** §§1.3–1.5, 11.1–11.3, 15.4  
**Files:** Create `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`.

**Steps:**

1. Copy the six complete file bodies from Architecture §§11.1–11.3 into the project root.
2. Run `corepack enable && corepack prepare pnpm@11.22.0 --activate && pnpm install --lockfile-only`.
   Expected: exit 0; `pnpm-lock.yaml` exists; every direct version is exact.
3. Run `pnpm install --frozen-lockfile && pnpm exec tsc --version`.
   Expected: exit 0 and `Version 7.0.2`.

**Commit:** `git add package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json next.config.ts vitest.config.ts playwright.config.ts && git commit -m "chore: pin HydraCut toolchain"`

### Task 0.2 — Create the isolated runtime stack

**Architecture references:** §§1.2, 11.4–11.7, 13.2  
**Files:** Create `Dockerfile`, `docker-compose.yml`, `Caddyfile`.

**Steps:**

1. Copy all three file bodies from Architecture §§11.4–11.5 and create local secret files with mode `0600` outside git.
2. Run `docker compose config --quiet`.
   Expected: exit 0 and no unresolved required variable.
3. Run `docker compose pull postgres hydradb` then `docker image inspect ghcr.io/hydra-db/hydradb@sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709 --format '{{index .RepoDigests 0}}'`.
   Expected: output contains the frozen SHA-256 digest.

**Commit:** `git add Dockerfile docker-compose.yml Caddyfile && git commit -m "ops: pin private HydraDB stack"`

### Task 0.3 — Record dependency and target-architecture evidence

**Architecture references:** §§1.3, 11.7, 15.4  
**Files:** Modify `tasks/todo.md`, `pipeline-log.md`.

**Steps:**

1. Run `pnpm list --depth 0 && docker version && docker compose version | tee docs/evidence/build-toolchain.txt`.
   Expected: exact direct versions and target engine versions are captured.
2. Run `docker compose up -d postgres hydradb && docker compose ps`.
   Expected: PostgreSQL healthy; HydraDB running only on the private network.

**Commit:** `git add docs/evidence/build-toolchain.txt tasks/todo.md pipeline-log.md && git commit -m "docs: capture build toolchain evidence"`

### Phase 0 gate

- [ ] `pnpm install --frozen-lockfile` exits 0.
- [ ] TypeScript reports 7.0.2 or DT-21 records an evidence-backed compatible exact version.
- [ ] HydraDB image identity equals the frozen digest.
- [ ] `docker compose config --quiet` exits 0 and HydraDB has no host port.
- [ ] No application source file exists yet.

## 4. Phase 1 — Domain, persistence, and authentic seed

**Purpose:** Establish one vocabulary, canonical truth, durable state, and corpus entry point.  
**Estimated time:** 0.18 day

### Task 1.1 — Write the domain knowledge contract

**Architecture references:** §§3.2, 13.3–13.4, 17, 20.1  
**Files:** Create `docs/DOMAIN-GUIDE.md`.

**Steps:**

1. Write every term, state, limitation, OpenCypher template, and forbidden overclaim enumerated in Architecture §20.1.
2. Run `rg -n "exploitability|portfolio safe|candidate" docs/DOMAIN-GUIDE.md`.
   Expected: only explicit forbidden-language explanations; no user-facing use of the forbidden term.

**Commit:** `git add docs/DOMAIN-GUIDE.md && git commit -m "docs: define HydraCut domain truth"`

### Task 1.2 — Create canonical domain logic with tests

**Architecture references:** §§3–5, 15.1  
**Files:** Create `src/domain/types.ts`, `src/domain/canonical.ts`, `src/domain/planner.ts`, `src/domain/receipt.ts`, `src/domain/sarif.ts`, `tests/domain.test.ts`.

**Steps:**

1. Copy the six file bodies from Architecture §§3–5 and §19 exactly.
2. Copy the authored unit rows for canonical ordering, deterministic planner tie-break, required/forbidden dominance, and verification-universe/scope plan-key rebinding. Receipt, persistence, and SARIF integration assertions run only after authentic receipt construction in Tasks 3.1 and 5.1.
3. Run `pnpm vitest run tests/domain.test.ts && pnpm typecheck`.
   Expected: all domain tests pass and TypeScript exits 0.

**Commit:** `git add src/domain tests/domain.test.ts && git commit -m "feat: create canonical exposure domain"`

### Task 1.3 — Create typed persistence and append-only receipts

**Architecture references:** §§6, 12.2, 13.2, 17.5  
**Files:** Create `src/db/schema.ts`, `src/db/client.ts`, `src/db/repository.ts`.

**Steps:**

1. Copy Architecture §6 exactly; verify it contains the §17.5 lifecycle methods, expected-state updates, typed row construction, separate selected-incident/verification baselines, and immutable plan bindings for pairs, snapshots, source coordinates, and scopes.
2. Run `docker compose build migrate && docker compose up -d postgres && docker compose run --rm migrate`.
   Expected: migration exits 0 and all tables in §6.1 exist.
3. Run `pnpm typecheck && pnpm vitest run tests/domain.test.ts`.
   Expected: strict persistence types compile and the authored domain tests pass. Insert-only behavior is not claimed from this unit command; Task 5.1 proves it against PostgreSQL.

**Commit:** `git add src/db && git commit -m "feat: add durable provenance store"`

### Task 1.4 — Create the authentic seed entry point

**Architecture references:** §§15.2, 18.1; PRD §6.1  
**Files:** Create `scripts/seed-demo.ts`.

**Steps:**

1. Copy Architecture §18.1 exactly. Its checked dynamic loader lets the Phase-1 seed contract compile before `src/jobs/pipeline.ts` exists; execution remains intentionally gated until Task 3.3 and fails `SEED_PIPELINE_UNAVAILABLE` if invoked early.
2. Run `rg -n 'docs/evidence/2026-08-19-pre-forge-runtime.json|expectedLockfileSha256|handleImport' scripts/seed-demo.ts`.
   Expected: all three contract markers are present; there is no insert of a pair count, baseline, outcome, plan, or receipt.
3. Run `pnpm typecheck`.
   Expected: the seed contract compiles before the pipeline file exists because the checked loader is runtime-bound; no static missing-module error is permitted.

**Commit:** `git add scripts/seed-demo.ts && git commit -m "seed: import authentic frozen corpus"`

### Task 1.5 — VERIFY-MILESTONE: domain foundation

**Architecture references:** §§3–6, 15.4  
**Files:** Modify `VERIFY-REPORT.md`, `BUILD-REPORT.md` via the verifier.

**Steps:**

1. Invoke `hackathon-verify` in milestone mode for the current project.
   Expected: `VERIFY-REPORT.md` exists with WINNER-READINESS ≥50, Demo Flow kill zone clear, and at most one blocked integration.
2. Record the score and exact gaps in `BUILD-REPORT.md`.

**Commit:** `git add VERIFY-REPORT.md BUILD-REPORT.md && git commit -m "verify: gate domain foundation"`

### Phase 1 gate

- [ ] Domain unit suite and strict typecheck pass.
- [ ] Repository write surfaces expose no receipt overwrite or snapshot-identity mutation; the live PostgreSQL insert-only mutation gate remains Task 5.1.
- [ ] Seed entry contract references only frozen input evidence and the production import handler; execution is explicitly gated at Task 3.3.
- [ ] Raw repository bytes are absent from PostgreSQL and logs.
- [ ] Milestone score is ≥50 with no critical kill zone.

## 5. Phase 2 — External and graph integrations

**Purpose:** Prove source evidence, complete topology, and native graph behavior independently.  
**Estimated time:** 0.25 day

### Task 2.1 — Create immutable GitHub and OSV clients

**Architecture references:** §§7.1–7.2, 12, 17.1  
**Files:** Create `src/integrations/github.ts`, `src/integrations/osv.ts`.

**Steps:**

1. Copy Architecture §§7.1–7.2; retain fixed origins, immutable SHA resolution, response caps, Link pagination, exact query alignment, and per-result OSV continuation.
2. Run `pnpm typecheck`.
   Expected: immutable resolution, contents caps, retry/freshness provenance, OSV alignment, and continuation code compile with no error.
3. Defer the authenticated network assertions to the exact `pnpm test:corpus` command in Task 3.1, after its production pipeline import exists.

**Commit:** `git add src/integrations/github.ts src/integrations/osv.ts && git commit -m "feat: add immutable GitHub and OSV evidence"`

### Task 2.2 — Create independent exploitation enrichment

**Architecture references:** §§7.3, 12.1, 17.1  
**Files:** Create `src/integrations/enrichment.ts`.

**Steps:**

1. Copy Architecture §7.3 and retain independent `Promise.allSettled` semantics.
2. Run `pnpm typecheck`.
   Expected: exit 0.
3. Defer the focused live/blocked CISA and FIRST assertions to Task 3.1's corpus suite, which supplies the authored Undici adapter and exact test command.

**Commit:** `git add src/integrations/enrichment.ts && git commit -m "feat: add KEV and EPSS evidence"`

### Task 2.3 — Create no-execution Arborist extraction

**Architecture references:** §§7.4, 12, 13.1, 15.1  
**Files:** Create `src/integrations/arborist.ts`.

**Steps:**

1. Copy Architecture §7.4 exactly; preserve lockfile v2/v3, 10 MB, 5,000-node, 16-depth, and temporary-directory cleanup guards.
2. Run `pnpm typecheck`.
   Expected: exit 0.
3. Defer six-lock execution/digest assertions to Task 3.1's `pnpm test:corpus`; that authored harness owns immutable fetch, no-execution mutation, and cleanup evidence.

**Commit:** `git add src/integrations/arborist.ts && git commit -m "feat: extract complete npm topology safely"`

### Task 2.4 — Create the load-bearing HydraDB adapter and oracles

**Architecture references:** §§7.5–7.6, 15.1–15.3, 17  
**Files:** Create `src/integrations/hydradb.ts`, `tests/hydradb.contract.test.ts`.

**Steps:**

1. Copy Architecture §§7.5–7.6 and the self-contained HydraDB contract fixture from §19 exactly. Do not create the lifecycle corpus test until its production pipeline dependency is authored in Task 3.1.
2. Run `docker compose build graph-contract && docker compose up -d hydradb && docker compose run --rm graph-contract` against the digest-pinned container.
   Expected: native `CALL algo.MSpaths`, exact selector counts, incoming direction, scope filters, epoch/bookmark, duplicate/cursor checks, and cleanup all pass.

**Commit:** `git add src/integrations/hydradb.ts tests/hydradb.contract.test.ts && git commit -m "feat: prove native HydraDB exposure"`

### Task 2.5 — VERIFY-MILESTONE: load-bearing integrations

**Architecture references:** §§7, 12, 15.4  
**Files:** Modify `VERIFY-REPORT.md`, `BUILD-REPORT.md`.

**Steps:**

1. Invoke `hackathon-verify` in milestone mode.
   Expected: WINNER-READINESS ≥65, native HydraDB kill zone clear, and authenticated external-source execution explicitly reported as blocked until the production composition in Task 3.1. Do not report the Integration kill zone clear here.
2. Record the exact score, the intentional external-integration hold, and unresolved operational warnings.

**Commit:** `git add VERIFY-REPORT.md BUILD-REPORT.md && git commit -m "verify: gate native graph integrations"`

### Phase 2 gate

- [ ] GitHub, OSV, CISA, FIRST, and Arborist adapters compile; their live contracts and the OSV-Scanner differential oracle remain an explicit Phase-3 gate, not Phase-2 evidence.
- [ ] Native baseline `MSpaths` pair set equals the fixed self-contained contract fixture; independent BFS equality remains Task 3.1.
- [ ] Cardinality, cursor, duplicate, bound, epoch, and bookmark mutations fail closed.
- [ ] HydraDB is private and removal makes the baseline test fail.
- [ ] Milestone score is ≥65; native graph truth is clear and the external Integration kill zone remains visibly blocked until Task 3.1.

## 6. Phase 3 — End-to-end analysis and proof

**Purpose:** Produce baseline truth, verify real proposed fixes, choose coverage, and re-query one combined graph.  
**Estimated time:** 0.25 day

### Task 3.1 — Create and prove the complete lifecycle pipeline

**Architecture references:** §§8.2, 12, 17.1–17.5  
**Files:** Create `src/jobs/pipeline.ts`, `tests/corpus.integration.test.ts`; modify `src/db/repository.ts`.

**Steps:**

1. Copy Architecture §8.2 exactly and verify every §17 algorithm is present: exact-version scan, active incident grouping, selected-incident and bounded verification-universe baselines, independent BFS gate, full proposed-fix extraction, pair-set outcome, bounded coverage planner, plan-bound scope/source drift checks, combined scenario, final native traversal, canonical receipt, and `finally` cleanup.
2. Copy the final Architecture §19 corpus block exactly and verify it covers removed vulnerable-package success, GitHub/OSV failures, six-lock extraction, BFS, and OSV-Scanner parity; execute scope/source/snapshot staleness and the remaining phase-crash matrix in Task 5.1.
3. Run `pnpm typecheck && docker compose --profile test build test-runner && docker compose up -d postgres hydradb && docker compose run --rm migrate && docker compose run --rm graph-contract && docker compose --profile test run --rm test-runner pnpm test:corpus`.
   Expected: the selected-incident baseline has 3 minimist pairs, the matched bounded verification baseline has 9 pairs, three authentic proposed fixes remove one selected pair each, and one final combined native query returns 0 minimist pairs while preserving 6 other verification-universe pairs.

**Commit:** `git add src/jobs/pipeline.ts src/db/repository.ts tests/corpus.integration.test.ts && git commit -m "feat: verify real proposed fixes and combined plan"`

### Task 3.2 — Create durable jobs and phase ownership

**Architecture references:** §§8, 12.2–12.3, 17.4  
**Files:** Create `src/jobs/queue.ts`, `src/worker.ts`.

**Steps:**

1. Copy Architecture §§8.1 and 8.3 exactly; register all five queues and require database plus native HydraDB contract readiness.
2. Run `pnpm typecheck && docker compose build worker && docker compose up -d worker && for attempt in $(seq 1 24); do [ "$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q worker)")" = healthy ] && break; [ "$attempt" -eq 24 ] && exit 1; sleep 5; done && docker compose logs worker | rg 'worker-ready' && docker compose exec -T postgres psql -U hydracut -d hydracut -c "select name from pgboss.queue order by name;"`.
   Expected: typecheck exits 0, one `worker-ready` event follows five rows named for the five queues in `pgboss.queue`, and tokens are absent from logs.
3. Terminate the worker during a disposable import with `docker compose kill -s TERM worker`, restart it with `docker compose up -d worker`, and poll the job through A05 from the test runner.
   Expected: the durable job resumes at a safe phase without a duplicate snapshot or receipt.

**Commit:** `git add src/jobs/queue.ts src/worker.ts && git commit -m "feat: add durable analysis worker"`

### Task 3.3 — Create the reproducible proof runner

**Architecture references:** §§15.2, 18.2, 20.2; PRD §7.6  
**Files:** Create `scripts/proof.ts`.

**Steps:**

1. Copy Architecture §18.2 exactly; create `artifacts/` at runtime; call the production lifecycle; assert hashes/counts/BFS/oracle and canonical digest.
2. Run `docker compose build worker && docker compose run --rm worker pnpm seed:demo && docker compose run --rm worker pnpm seed:demo` before proof.
   Expected: both seed runs resolve the same three baseline snapshot keys with no duplicate identity row and insert no computed result.
3. Run `mkdir -p artifacts && docker compose run --rm worker pnpm proof | tee artifacts/proof-run-1.jsonl && docker compose run --rm worker pnpm proof | tee artifacts/proof-run-2.jsonl` without changing inputs.
   Expected: both runs report `PASS`; normalized topology and pair digests match; receipt creation times may differ and therefore full receipt digests are separately valid.
4. Run `rg -n 'PASS|receiptDigest|lockfileSha256|pairDigest' artifacts/proof-run-1.jsonl artifacts/proof-run-2.jsonl` and record the two successful proof-run digests and exact input hashes for the Task 5.1 tamper gate; do not mutate the generated artifacts in place.
   Expected: both authentic proofs are retained, and no unverified tamper claim is made before the adversarial test file exists.

**Commit:** `git add scripts/proof.ts && git commit -m "proof: reproduce authentic portfolio result"`

### Phase 3 gate

- [ ] Every proposed fix has a real immutable commit and complete graph.
- [ ] Authenticated GitHub plus live OSV/CISA/FIRST contracts, six-lock Arborist extraction, and OSV-Scanner differential oracle pass; the Integration kill zone is clear here for the first time.
- [ ] Coverage output is prediction only and bounded-search wording is accurate.
- [ ] Final outcome comes from one new combined native `MSpaths`, never unioned deltas.
- [ ] The final query uses the exact source coordinates, baseline pair set, snapshots, and scopes committed into the plan key.
- [ ] Receipt stores the exact canonical object whose digest is published.
- [ ] `pnpm proof` and corpus differential oracles pass.

## 7. Phase 4 — Incident-command product surface

**Purpose:** Expose receipt-backed AppSec decisions, secondary role projections, and all API contracts.  
**Estimated time:** 0.18 day

### Task 4.1 — Create the BFF contract

**Architecture references:** §§10, 13.1, 17.5  
**Files:** Create `src/app/api/[...path]/route.ts`.

**Steps:**

1. Copy both `src/app/api/[...path]/route.ts` blocks from Architecture §§10.2–10.3 exactly; verify all 16 rows connect to typed operations, including A06's strict bounded verification-coordinate set and A12's immutable plan/universe/scope preconditions.
2. Add route-contract cases to `tests/demo.e2e.spec.ts` after Task 4.5 creates it; meanwhile run `pnpm typecheck`.
   Expected: strict schemas, request IDs, immutable proof caching, and fail-closed errors compile.
3. Run `test "$(rg -c 'method: "' 'src/app/api/[...path]/route.ts')" -eq 15 && pnpm typecheck`.
   Expected: 15 dispatcher rows cover 16 PRD endpoints because receipt JSON/SARIF share one regex; unsupported methods retain the authored 405 branch. Behavioral route failures execute in Task 5.1.

**Commit:** `git add src/app/api && git commit -m "feat: expose bounded incident API"`

### Task 4.2 — Create the visual foundation and command surface

**Architecture references:** §§9.1, 14  
**Files:** Create `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/command-surface.tsx`.

**Steps:**

1. Copy Architecture §9.1 and preserve semantic labels, focus treatment, contrast tokens, reduced-motion behavior, and honest service status.
2. Run `pnpm build`.
   Expected: production Next build exits 0 with no hydration error.
3. Capture the required before screenshot before visual refinement and an after screenshot only after Task 4.5 browser verification.

**Commit:** `git add src/app/globals.css src/app/layout.tsx src/app/page.tsx src/components/command-surface.tsx && git commit -m "feat: create incident command entry"`

### Task 4.3 — Create the action-first queue

**Architecture references:** §§9.2, 14; PRD §§3.1, 3.5  
**Files:** Create `src/app/incidents/page.tsx`.

**Steps:**

1. Copy Architecture §9.2; order only by receipt-backed priority fields and retain textual state badges.
2. Run `pnpm build` and open `/incidents` at 1440 px and 390 px.
   Expected: table/card projections contain identical incidents and unknown states remain visible.

**Commit:** `git add src/app/incidents/page.tsx && git commit -m "feat: add AppSec incident queue"`

### Task 4.4 — Create impact, proposed-fix, and proof surfaces

**Architecture references:** §§9.3–9.5, 14; PRD §§3.2–3.7  
**Files:** Create `src/components/impact-matrix.tsx`, `src/components/proposed-fix-panel.tsx`, `src/components/receipt-view.tsx`, `src/app/incidents/[incidentId]/page.tsx`, `src/app/incidents/[incidentId]/impact/page.tsx`, `src/app/incidents/[incidentId]/proposed-fixes/page.tsx`, `src/app/incidents/[incidentId]/plan/page.tsx`, `src/app/plans/[planId]/verify/page.tsx`, `src/app/proof/page.tsx`, `src/app/proof/[digest]/page.tsx`, `src/app/portfolio/page.tsx`, `src/app/graph/page.tsx`, `src/app/imports/page.tsx`, `src/app/jobs/[jobId]/page.tsx`, and `src/app/system/page.tsx`.

**Steps:**

1. Copy the P0 files from Architecture §§9.3–9.5 first: evidence components, incident detail/impact/proposed-fix/plan, plan verification, and proof detail. Preserve the canonical pair table/text witness, bounded exact-version universe selector, matched 9→6 versus selected 3→0 evidence, and digest-before-render guard.
2. Run `pnpm build`; then copy the P1 portfolio/import/job/system/proof-index routes and the P2 graph route exactly. Add no P1/P2 file until the P0 build exits 0.
3. Preserve URL-owned tab, role, scope, selected pair, and history state from Architecture §14, then navigate queue → impact → fixes → plan → proof → back.
   Expected: incident context persists; no graph or zero-pair claim renders from an unknown/partial result.

**Commit:** `git add src/components src/app/incidents/'[incidentId]' src/app/plans src/app/proof src/app/portfolio src/app/graph src/app/imports src/app/jobs src/app/system && git commit -m "feat: add exposure and proof workspace"`

### Task 4.5 — Create the eight-scene browser suite

**Architecture references:** §§14, 15.1, 19; PRD §6  
**Files:** Create `tests/demo.e2e.spec.ts`.

**Steps:**

1. Copy Architecture §19's F01–F08 authentic happy-path suite exactly, including desktop/mobile, axe, keyboard focus, and browser-history assertions. Offline/unknown/tamper and route failure cases are a separate Task 5.1 gate and must not be credited here.
2. Run `docker compose --profile test build worker test-runner && docker compose up -d postgres hydradb && docker compose run --rm migrate && docker compose run --rm graph-contract && docker compose up -d worker && docker compose run --rm worker pnpm seed:demo && docker compose run --rm worker pnpm proof && docker compose --profile test run --rm test-runner`.
   Expected: every scene passes against the authentic stack; axe reports zero serious/critical violations.
3. Run `test -s docs/evidence/screenshots/incidents-desktop.png && test -s docs/evidence/screenshots/proof-mobile.png`.
   Expected: the F01 and F08 tests wrote both PNGs through the test-runner bind mount; they show authentic receipt-backed states and contain no clipped controls. No unbounded host readiness loop or manually propagated receipt digest exists.

**Commit:** `git add tests/demo.e2e.spec.ts docs/evidence/screenshots && git commit -m "test: prove eight incident command scenes"`

### Phase 4 gate

- [ ] F01–F08 pass desktop and mobile using the authentic stack.
- [ ] URL context survives role changes and browser history.
- [ ] Keyboard and axe gates pass; result meaning is not color-only.
- [ ] Historical fallback is visibly historical and never claims a fresh run.
- [ ] The 16-route failure matrix remains visibly pending until Task 5.1; Phase 4 does not claim it.

## 8. Phase 5 — Adversarial hardening and rehearsal

**Purpose:** Prove fail-closed behavior and remove demo-stage ambiguity.  
**Estimated time:** 0.10 day

### Task 5.1 — Execute the mandatory failure matrix

**Architecture references:** §§12–15.3  
**Files:** Create `tests/adversarial.integration.test.ts`; modify `tests/hydradb.contract.test.ts`, `tests/corpus.integration.test.ts`, `tests/demo.e2e.spec.ts`.

**Steps:**

1. Copy Architecture §19's exact adversarial suite and HydraDB response-mutation continuation. Retain the §15.3 case names and add no weaker assertion or mocked success value.
2. Run `pnpm test && docker compose --profile test build graph-contract test-runner && docker compose run --rm graph-contract && docker compose --profile test run --rm test-runner pnpm test:corpus && docker compose --profile test run --rm test-runner pnpm test:adversarial && docker compose --profile test run --rm test-runner`.
   Expected: happy paths pass and every mutation produces explicit `PARTIAL`, `UNKNOWN`, or `ERROR` with verified copy disabled.
3. Run a secret scan and `docker compose port hydradb 8443`.
   Expected: no committed secret; HydraDB returns no host binding.

**Commit:** `git add tests && git commit -m "test: enforce every false-clean guard"`

### Task 5.2 — Rehearse the timed judge path

**Architecture references:** §§14, 20.2; PRD §§6–7.6  
**Files:** Create `submission/DEMO-SCRIPT.md`; modify `BUILD-REPORT.md`.

**Steps:**

1. Write eight timestamped scenes from PRD §6, including the exact fallback stop conditions.
2. Run `docker compose run --rm worker pnpm seed:demo && docker compose run --rm worker pnpm proof`, then rehearse twice with a 2:52 timer against the proxy.
   Expected: both takes show baseline query, three real proposed fixes, combined query, limitations, and receipt before 2:52.
3. Record overruns, failed transitions, and the chosen correction in `BUILD-REPORT.md`.

**Commit:** `git add submission/DEMO-SCRIPT.md BUILD-REPORT.md && git commit -m "demo: rehearse proof-first judge path"`

### Phase 5 gate

- [ ] Every Architecture §15.3 failure has a passing assertion.
- [ ] No secret or raw lockfile appears in logs/artifacts.
- [ ] HydraDB ports remain private and removal breaks both graph proofs.
- [ ] Two complete demo rehearsals finish by 2:52.
- [ ] No unsupported clean, safety, exploitability, or minimum-plan wording remains.

## 9. Phase 6 — Deployment and final evidence

**Purpose:** Run the same pinned system on the target host and package reproducible proof.  
**Estimated time:** 0.08 day

### Task 6.1 — Start services in verified order

**Architecture references:** §§11.5–11.7, 12, 13.2  
**Files:** Modify `.env`, deployment evidence only; never commit secrets.

**Steps:**

1. Run `docker compose pull && docker compose build --pull` on the Linux x86_64 host.
   Expected: image IDs captured; build exits 0.
2. Run `docker compose up -d postgres hydradb && docker compose run --rm migrate && docker compose run --rm graph-contract && docker compose up -d worker web && docker compose up -d proxy`.
   Expected: `GET /api/health` returns `200` with all three booleans true; only TLS proxy is public.
3. Restart HydraDB and worker once, then rerun contract and receipt digest checks.
   Expected: graph pair digest matches or deployment stops under DT-05/DT-23.

**Commit:** `git add docs/evidence/deployment && git commit -m "ops: capture pinned deployment proof"`

### Task 6.2 — Generate final judge artifacts

**Architecture references:** §§18.2, 20.2; PRD §7.6  
**Files:** Create root `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `submission/README.md`, `submission/SUBMISSION-CHECKLIST.md`, `submission/PROOF.md`, `submission/ARCHITECTURE.md`; generate `submission/receipt.json`, `submission/SARIF-SAMPLE.json`.

**Steps:**

1. Run `docker compose run --rm worker pnpm proof | tee submission/proof-run.jsonl` on the deployed stack.
   Expected: `PASS`, fresh digest, all corpus/oracle assertions, and two native query records.
2. Copy generated canonical receipt and SARIF by digest; write source hashes, git SHA, image digests, query bounds, epoch/bookmark, limitations, and exact reproduction commands into the three Markdown files.
3. Run `sha256sum submission/receipt.json submission/SARIF-SAMPLE.json` and `docker compose run --rm -T worker node -e 'const fs=require("node:fs"); const receipt=JSON.parse(fs.readFileSync("submission/receipt.json","utf8")); const sarif=JSON.parse(fs.readFileSync("submission/SARIF-SAMPLE.json","utf8")); if(receipt.resultState!=="VERIFIED_WITHIN_BOUNDS"||sarif.version!=="2.1.0"||!Array.isArray(sarif.runs)) process.exit(1)'`.
   Expected: the canonical receipt byte hash matches its published digest and the generated SARIF satisfies HydraCut's pinned 2.1.0 structural contract.
4. <!-- [CRITIQUE E-1] --> Verify root `README.md` contains setup and an explicit “How HydraDB is used” section; verify `LICENSE` and `THIRD_PARTY_NOTICES.md` are non-empty; complete `submission/SUBMISSION-CHECKLIST.md` with the public repository URL, demo URL, measured duration `<= 3:00`, and every Google Form field.
5. <!-- [CRITIQUE E-2] --> Verify root and submission README files name **Track 02-A — Supply Chain Blast Radius** as the sole project track and list **Best Use of HydraDB** only as a separate award target.

**Commit:** `git add submission && git commit -m "docs: package reproducible HydraCut proof"`

### Task 6.3 — Run post-build verification

**Architecture references:** §§15.4, 20; PRD §11  
**Files:** Modify `VERIFY-REPORT.md`, `BUILD-REPORT.md`, `PULSE.md`.

**Steps:**

1. Invoke `hackathon-verify` in post-build mode.
   Expected: no kill zone, winner-readiness ≥85, HydraDB load-bearing proof present.
2. Re-run `pnpm test && pnpm build && docker compose run --rm graph-contract && docker compose --profile test run --rm test-runner pnpm test:corpus && docker compose --profile test run --rm test-runner pnpm test:adversarial && docker compose --profile test run --rm test-runner && docker compose run --rm worker pnpm proof` from a clean install.
   Expected: every command exits 0; exact evidence paths recorded.

**Commit:** `git add VERIFY-REPORT.md BUILD-REPORT.md PULSE.md && git commit -m "verify: complete post-build winner gate"`

### Phase 6 gate

- [ ] Target-architecture native graph contract and restart proof pass.
- [ ] Fresh final receipt and SARIF validate by digest/schema.
- [ ] Submission claims match receipt and source evidence exactly.
- [ ] Root README, OSS license, third-party attribution, Track 02-A declaration, demo duration, and Google Form checklist are complete.
- [ ] Post-build score is ≥85 with no kill zone.
- [ ] All generated artifacts record git SHA, image digest, and run time.

## 10. Risk decision trees

Each tree maps one PRD CRITICAL/HIGH risk. Medium R08/R09 are tested in Task 2.2 and Architecture §15.3 but do not inflate the required count.

### DT-01 — HydraDB is decorative or bypassed (R01)
Run `docker compose stop hydradb && ! docker compose run --rm graph-contract && ! docker compose run --rm worker pnpm proof`. Expected: both inner commands fail with HydraDB unavailable and no new receipt. If either succeeds, search `rg -n "fallback|cached.*pair|mock" src`; delete the bypass and rerun. If proof still succeeds, stop Build as a critical architecture violation.

### DT-02 — Silent result truncation (R02)
Run the contract case with `resultLimit=1`. Expected: receipt state is not verified. If no cursor is returned, require independent BFS count/pair parity and exact cardinality-derived bound. If parity can still be fooled, stop; do not claim zero pairs.

### DT-03 — Fabricated demo evidence (R03)
Run `docker compose run --rm worker pnpm seed:demo && docker compose run --rm worker pnpm proof`, then compare every input SHA to runtime JSON. Expected: exact hashes and product-computed results. If a hash differs, refetch the immutable commit or use hash-verified vendored bytes labeled as such. If neither matches, show only the historical receipt and stop fresh-demo recording.

### DT-04 — Repository code execution (R04)
Run the process-spawn/network mutation fixture during extraction. Expected: no lifecycle script, package install, or registry request. If any subprocess/package code runs, remove that path and retain Contents fetch plus `loadVirtual()` only. If extraction cannot work without execution, reject the repository.

### DT-05 — HydraDB local storage warning/loss (R05)
Run `docker compose restart hydradb && docker compose run --rm graph-contract && docker compose run --rm worker pnpm proof`. Expected: pair digests match. If GC warnings recur but parity holds, retain warning/evidence and continue demo-only. If pair or epoch data is lost, restore into a new namespace and requery; if parity fails, stop deployment.

### DT-06 — GitHub rate limit or outage (R06)
Run the GitHub contract and inspect `x-ratelimit-remaining/reset`. Expected: immutable bytes resolve. On 403/429, wait until reset or use hash-verified cached/vendored public bytes with provenance. If no verified bytes exist, mark import/proposed fix unknown; never synthesize a lockfile.

### DT-07 — OSV outage or pagination error (R07)
Run alignment and continuation tests. Expected: one result per query and every token exhausted. On timeout/short batch, retry twice then use fresh digest-stamped cache. If no fresh complete payload exists, set advisory state unknown and block verified baseline.

### DT-10 — Arborist differs from lockfile truth (R10)
Run `docker compose --profile test run --rm test-runner pnpm test:corpus`; the image contains the digest-verified OSV-Scanner oracle. Expected: frozen topology and advisory digests match. On mismatch, compare lockfile version, locations, scopes, and repeated versions; correct normalization and rerun. If oracle disagreement remains, stop incident publication.

### DT-11 — Proposed fix is mutable or wrong repository (R11)
Resolve the supplied ref twice and compare repository plus 40-hex SHA. Expected: stored SHA and fetched bytes agree. On drift, reject and request a new evaluation at the new immutable SHA. If repository identity differs, reject permanently.

### DT-12 — Combined plan inferred from deltas (R12)
Stop HydraDB before final verification. Expected: no final receipt. If a receipt appears from unioned individual outcomes, delete that code path and require combined snapshot scenario plus one native query. If combined reconstruction cannot finish, plan remains unverified.

### DT-13 — Generic blast-radius positioning (R13)
Run the 30-second judge rehearsal. Expected: real proposed fixes and final verification are visible by 60 seconds. If narration stops at impact, reorder to action queue → impact → fixes → combined proof. If sponsor mechanism is still unclear, show raw baseline/final OpenCypher and removal test.

### DT-14 — Demo overrun (R14)
Run two timed rehearsals. Expected: ≤2:52 each. If a scene exceeds its budget, remove explanatory navigation and preposition the receipt-backed state; do not skip either native query. If still over 3:00, cut P1 role projection before any P0 proof.

### DT-15 — Too many screens dilute P0 (R15)
Run `docker compose --profile test run --rm test-runner pnpm test:e2e --grep 'F0[1-7]'`. Expected: all P0 scenes pass before P1 views. If a P1 screen blocks P0, revert/defer that P1 task. If P0 remains incomplete, stop all visual refinement until graph/receipt gates pass.

### DT-16 — Exponential combination story returns (R16)
Run `rg -n "2\\^N|exhaustive combinations|all combinations" src submission`. Expected: zero product-story matches. If found, replace with coverage bounds plus final combined proof. Keep the 8-state history only in a labeled regression fixture.

### DT-17 — Graph visual becomes canonical truth (R17)
Disable JavaScript graph rendering in the browser test. Expected: pair table and text witness retain all evidence/actions. If meaning disappears, move it to semantic HTML and mark the visual decorative. If accessible parity is impossible, ship without the graph visual.

### DT-18 — Token or raw lockfile leakage (R18)
Run secret scan and `rg -n "package-lock|authorization|token"` over logs/artifacts. Expected: only hashes/allowlisted metadata. If leaked, rotate the token, purge the artifact from the unshared worktree, add redaction, and rerun. If public history was pushed, stop and rotate before proceeding.

### DT-19 — Public HydraDB exposure (R19)
Run `docker compose port hydradb 8443` and an external port scan. Expected: no binding/no reachability. If open, remove `ports`, retain `expose`, and enforce host firewall. If the hosting platform cannot provide a private network, choose a compliant VM; never deploy HydraDB publicly.

### DT-20 — Receipt digest instability (R20)
Canonicalize the same logical receipt with reordered object keys. Expected: identical digest. If different, find non-canonical values/timestamps and normalize once before hashing/storing. If pair order changes, sort pair keys before digest; never overwrite an old receipt.

### DT-21 — TypeScript/package incompatibility (R21)
Run `pnpm install --frozen-lockfile && pnpm typecheck`. Expected: exit 0. On peer/compiler errors, identify the newest mutually supported exact release from primary package metadata, update Architecture/package/lock together, and rerun all tests. If no compatible set exists, use the newest compatible TypeScript 6 exact version and record the deduction.

### DT-22 — Claims exceed package evidence (R22)
Run forbidden-copy tests for `safe`, `secure`, `not exploitable`, and unqualified `fixed`. Expected: only limitations/negative assertions. Replace violations with selected-incident, dependency-level, and within-bounds wording. If a dynamic value cannot be receipt-backed, remove it.

### DT-23 — HydraDB unavailable or times out (R23)
Block the private HydraDB service and run baseline/final jobs. Expected: explicit error, bounded idempotent retry, no cached-result success. Restore service and rerun the same immutable job. If health/contract still fails after 120 seconds, mark blocked and retain historical proof only as historical.

## 11. File creation ledger

The 53 Architecture files are covered exactly once at first creation:

| Task | Files created | Count |
|---|---|---:|
| 0.1 | package, pnpm workspace, tsconfig, Next, Vitest, Playwright configs | 6 |
| 0.2 | Dockerfile, Compose, Caddyfile | 3 |
| 1.2 | five domain files, domain test | 6 |
| 1.3 | three database files | 3 |
| 1.4 | seed script | 1 |
| 2.1 | GitHub, OSV | 2 |
| 2.2 | enrichment | 1 |
| 2.3 | Arborist | 1 |
| 2.4 | HydraDB and contract test | 2 |
| 3.1 | pipeline and corpus integration test | 2 |
| 3.2 | queue, worker | 2 |
| 3.3 | proof script | 1 |
| 4.1 | API dispatcher | 1 |
| 4.2 | global CSS, layout, home, command component | 4 |
| 4.3 | incident list page | 1 |
| 4.4 | three evidence components; incident detail/impact/proposed-fix/plan; verify; proof index/detail; portfolio; graph; imports; job; system routes | 15 |
| 4.5 | browser test | 1 |
| 5.1 | adversarial integration test | 1 |
| **Total** |  | **53** |

### Literal 53-file coverage manifest

| First-creation task | Exact Architecture file paths |
|---|---|
| 0.1 | `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts` |
| 0.2 | `Dockerfile`, `docker-compose.yml`, `Caddyfile` |
| 1.2 | `src/domain/types.ts`, `src/domain/canonical.ts`, `src/domain/planner.ts`, `src/domain/receipt.ts`, `src/domain/sarif.ts`, `tests/domain.test.ts` |
| 1.3 | `src/db/schema.ts`, `src/db/client.ts`, `src/db/repository.ts` |
| 1.4 | `scripts/seed-demo.ts` |
| 2.1 | `src/integrations/github.ts`, `src/integrations/osv.ts` |
| 2.2 | `src/integrations/enrichment.ts` |
| 2.3 | `src/integrations/arborist.ts` |
| 2.4 | `src/integrations/hydradb.ts`, `tests/hydradb.contract.test.ts` |
| 3.1 | `src/jobs/pipeline.ts`, `tests/corpus.integration.test.ts` |
| 3.2 | `src/jobs/queue.ts`, `src/worker.ts` |
| 3.3 | `scripts/proof.ts` |
| 4.1 | `src/app/api/[...path]/route.ts` |
| 4.2 | `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/command-surface.tsx` |
| 4.3 | `src/app/incidents/page.tsx` |
| 4.4 | `src/components/impact-matrix.tsx`, `src/components/proposed-fix-panel.tsx`, `src/components/receipt-view.tsx`, `src/app/incidents/[incidentId]/page.tsx`, `src/app/incidents/[incidentId]/impact/page.tsx`, `src/app/incidents/[incidentId]/proposed-fixes/page.tsx`, `src/app/incidents/[incidentId]/plan/page.tsx`, `src/app/plans/[planId]/verify/page.tsx`, `src/app/proof/page.tsx`, `src/app/proof/[digest]/page.tsx`, `src/app/portfolio/page.tsx`, `src/app/graph/page.tsx`, `src/app/imports/page.tsx`, `src/app/jobs/[jobId]/page.tsx`, `src/app/system/page.tsx` |
| 4.5 | `tests/demo.e2e.spec.ts` |
| 5.1 | `tests/adversarial.integration.test.ts` |

## 12. Exact downstream handoff

After Forge approval, run `hackathon-build` directly against `hydracut/PLAN.md` in emergency zero-mock mode. Build must stop at the first failed phase gate and must run `hackathon-verify` at Tasks 1.5, 2.5, and 6.3. The first action is Phase 0 compatibility—not UI work.
