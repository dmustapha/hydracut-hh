# Context Snapshot — clean proof replay

The user said “continue” while resolving Build blockers.

Completed before Design Forge: Build, Debug, Wire, and milestone Verify. Design Forge is paused at mandatory `design_handoff` checkpoint.

Build blocker resolution:
- `gh auth status` showed active `dmustapha`; `gh api rate_limit` returned 5000 remaining.
- Populated `secrets/github_token` from `gh auth token`, mode 0600, 41 bytes.
- Rebuilt `hack-hydra-worker`; typecheck/domain tests passed during image build.
- First authentic `docker compose run --rm --no-deps worker pnpm proof` failed with real `HeadersTimeoutError` from HydraDB while full-edge-scan queries were active. No proof evidence claimed.
- Root-cause investigation (systematic-debugging): existing graph/Postgres state was accumulated and HydraDB logs showed repeated `FullEdgeScan`/30s query pressure; a clean-volume reproduction was selected as the minimal environmental hypothesis.
- Created ignored `docker-compose.proof-clean.yml` with temporary named volumes `hack-hydra_postgres_data_proof` and `hack-hydra_hydradb_data_proof`; original `hack-hydra_postgres_data` and `hack-hydra_hydradb_data` preserved.
- Recreated only clean Postgres/HydraDB containers; both started.

Next actions:
1. Run migration on clean Postgres (`CI=true`), then run authentic proof against clean HydraDB.
2. If pass, update BUILD-REPORT/.build-state/PULSE and clear BLK-EXT-001; if timeout recurs, document confirmed runtime/query bottleneck and keep blocker.
3. DEP-001 remains external: no Oracle/SSH credentials or VM provisioned; do not fabricate deployment.
4. Design Forge still requires six human Design Brief answers at conductor checkpoint.
