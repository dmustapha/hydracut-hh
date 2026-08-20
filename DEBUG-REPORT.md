# DEBUG REPORT

## Executive Summary
- **Generated:** 2026-08-20T06:30:00Z
- **Last Updated:** 2026-08-20T06:45:00Z
- **Confidence Score:** 61/100
- **Unresolved Issues:** browser runner result was not recoverable after the temporary test-runner container was removed; browser/rehearsal and persistent-VM gates remain.
- **Security Findings:** no new security findings; secret scan and private HydraDB port gates passed.
- **Test Coverage:** baseline/domain 4/4; HydraDB contract 4/4; optional edge 1/1; source/test ratio 0.139 (below target).
- **Recommendation:** continue downstream local evidence; do not claim browser/rehearsal or deployment evidence until the runtime wiring and persistent-VM gates are resolved.

Debug is running in full mode. External credential and persistent-VM blockers are carried from Build and will not be represented as passes.

## Quality-Gate Disposition
- Phase 1 baseline: complete.
- Phase 2 known risks: complete with blockers; seven accepted/blocked risks are carried from Build.
- Phase 3 runtime integration: complete — HydraDB contract 4/4, optional edge 1/1, migration and Compose health pass, and authenticated corpus replay pass with fresh receipt/SARIF.
- Phase 4 end-to-end: blocked before a recoverable result. The temporary test-runner reached `next build` and invoked 18 Playwright tests, but emitted the standalone-runtime warning (`next start does not work with output: standalone`) and its container was removed before an exact pass/fail result could be captured. No pass is claimed.
- Phase 5 adversarial: blocked by the same runtime/corpus prerequisites; no fabricated pass.
- Phase 6 performance: not run because no stable browser/runtime evidence exists and no performance claim is required for the local gate.
- Phase 7 security: complete for available static gates (secrets scan, private HydraDB exposure); no new findings.
- Phase 8 final report: complete with blockers and downstream continuation authorized.

## Baseline Snapshot (Phase 1)
- Source files: 36; test files: 5; ratio: 0.139 (**FAIL**, below 0.30 target). Coverage was not measured.
- `pnpm install --frozen-lockfile`: PASS (pnpm 11.22.0).
- `pnpm exec tsc --version`: PASS (7.0.2).
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS (1 file, 4 tests).
- `docker compose config --quiet`: PASS.
- Pinned HydraDB digest inspection: PASS.
- PostgreSQL migration and table query: PASS (12 public tables).
- `docker build --platform linux/amd64 --target dependencies`: PASS.
- Full `docker compose build web`: PASS after baseline fixes.
- Compose runtime health: PASS — `/api/health` returned HTTP 200 with `{"web":true,"database":true,"hydradb":true}`.
- Baseline fixes: build-only database placeholder; standalone `@swc/helpers` ESM copy; web `HOSTNAME=0.0.0.0` binding.
- Initial host `pnpm build` without runtime secret override: BLOCKED by expected `/run/secrets/database_url` path; host build with injected local database URL: PASS.

## Post-gate blocker resolution

- `BLK-EXT-001` is resolved. The active `gh` keyring session for `dmustapha` had 5,000 GitHub requests remaining; its token was synced into the 0600 Compose secret.
- The initial replay exposed an overly aggressive 3-second external-source header timeout. GitHub, OSV, and CISA/FIRST adapters now use a 15-second header timeout with their existing bounded body timeouts.
- `pnpm typecheck` and `pnpm test` pass after the change.
- Authenticated clean-volume proof passed: receipt digest `250ca53c54c0e90b647e1432fe9d85bdb41ffff5f0904df2290f461240200804`, 3 applications, 1,742 package instances, 2,896 package edges, 9 baseline pairs, 6 final pairs.
- Remaining Debug blockers are browser runtime/rehearsal and `DEP-001`; no deployment claim is made.
