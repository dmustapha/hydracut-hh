# DEBUG REPORT

## Executive Summary
- **Generated:** 2026-08-20T06:30:00Z
- **Last Updated:** 2026-08-20T15:10:00Z
- **Confidence Score:** 84/100
- **Unresolved Issues:** no local Debug blocker remains; persistent deployment and formal live rehearsal are downstream gates.
- **Security Findings:** no new security findings; secret scan and private HydraDB port gates passed.
- **Test Coverage:** baseline/domain 4/4; HydraDB contract 4/4; optional edge 1/1; source/test ratio 0.139 (below target).
- **Recommendation:** continue at the conductor's Design Forge checkpoint; do not claim deployment or formal live-rehearsal evidence until the persistent VM exists.

Debug is running in full mode. External credential and persistent-VM blockers are carried from Build and will not be represented as passes.

## Quality-Gate Disposition
- Phase 1 baseline: complete.
- Phase 2 known risks: complete with blockers; seven accepted/blocked risks are carried from Build.
- Phase 3 runtime integration: complete — HydraDB contract 4/4, optional edge 1/1, migration and Compose health pass, and authenticated corpus replay pass with fresh receipt/SARIF.
- Phase 4 end-to-end: complete. The corrected standalone launcher, localhost origin, serial workers, bulk incident reads, accessible scroll regions, and pg-boss producer startup produced an exit-0 18-test browser run; the retried mobile F01 passed separately with retries disabled, and F06 passed independently in 44.2 seconds.
- Phase 5 adversarial: complete, 4/4 on isolated Compose volumes. Validation errors stay inside the API envelope; immutable collisions, pair tampering, SARIF refusal, and source/scope/snapshot drift all fail closed.
- Phase 6 performance: not run because no stable browser/runtime evidence exists and no performance claim is required for the local gate.
- Phase 7 security: complete for available static gates (secrets scan, private HydraDB exposure); no new findings.
- Phase 8 final report: complete; downstream continuation authorized. `DEP-001` belongs to Deploy, not Debug.

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
- No local Debug blocker remains. `DEP-001` still blocks Deploy, and formal rehearsal remains correctly ordered after the live deployment audits.
