# Wire Report

**Status:** WIRED-WITH-DEGRADATION  
**Date:** 2026-08-20  
**Project:** HydraCut powered by CampaignRadius  
**Pipeline position:** After debug, before verify_milestone

This report is populated phase-by-phase. Real endpoint results only; blocked external or runtime paths remain explicitly uncredited.

## Project Topology

| Component | Type | Entry Point |
|---|---|---|
| Next.js BFF/web | frontend + API | `src/app/api/[...path]/route.ts` |
| PostgreSQL | database | Compose `postgres` |
| HydraDB OSS | graph database | `src/integrations/hydradb.ts` |
| pg-boss worker | backend worker | `src/worker.ts` |
| Caddy | reverse proxy | `Caddyfile` |
| GitHub REST | external API | `src/integrations/github.ts` |
| OSV API | external API | `src/integrations/osv.ts` |
| CISA KEV/FIRST EPSS | external APIs | `src/integrations/enrichment.ts` |
| npm Arborist | local parser | `src/integrations/arborist.ts` |
| OSV-Scanner | isolated CLI | `src/jobs/pipeline.ts` |
| Playwright runner | test client | `tests/demo.e2e.spec.ts` |

## Credential Audit

| Env Var | Status | Source |
|---|---|---|
| `DATABASE_URL_FILE` | VALID_VALUE | `secrets/database_url` |
| `HYDRADB_TOKEN_FILE` | VALID_VALUE | `secrets/hydradb_token` |
| `APP_OPERATOR_TOKEN` | VALID_VALUE | `secrets/app_operator_token` |
| `GITHUB_TOKEN_FILE` | VALID_VALUE | Synced from the authenticated `gh` keyring session; immutable replay passed |

No active mock or demo flags were found in `.env` or source.

## Dependency Order

1. PostgreSQL and HydraDB private services.
2. Migration and native HydraDB contract.
3. Worker-local Arborist plus public OSV/enrichment clients.
4. Next.js BFF/web health and read routes.
5. Caddy operator boundary and Playwright browser runner.

The authenticated GitHub corpus path is now verified against immutable SHA inputs; no fixture or cached claim was substituted.

## Integration Results

| Connection | Result | Evidence |
|---|:---:|---|
| web → PostgreSQL | PASS | Compose `/api/health` returned 200 with `database=true`; direct query found 12 public tables. |
| web → HydraDB | PASS | Compose `/api/health` returned `hydradb=true`; HydraDB remains private to the Compose network. |
| worker → PostgreSQL/HydraDB | PASS | Same secret/service wiring is used by the worker and health path. |
| worker → OSV and CISA/FIRST enrichment | PASS | Real adapter paths are configured; no mock flags active. |
| worker → npm Arborist | PASS | Local parser is present and typechecked. |
| worker → GitHub | PASS | Authenticated immutable corpus replay passed; fresh receipt and SARIF exported. |
| worker → OSV-Scanner | SKIPPED | CLI runtime image was removed by safe unused-image cleanup; no scanner pass claimed. |
| Caddy → web | SKIPPED | Caddy/VM is not running locally; `DEP-001` requires persistent Oracle ARM64 VM. |
| Playwright → web | SKIPPED | Temporary runner emitted the standalone Next warning and exact result was not recoverable. |

## Blockers for Downstream

- `DEP-001`: provision the persistent zero-cost VM before Deploy; local Docker and Quick Tunnel are not final deployment.
- Browser/runtime evidence must be rerun with `node .next/standalone/server.js` (or equivalent corrected Compose runner) before claiming E2E/rehearsal passes.

## Summary

- Components discovered: 11
- Connections mapped: 11
- Credentials audited: 4 (4 resolved, 0 unresolved)
- Integration checks: 7 passed, 4 skipped, 0 fabricated passes
- Demo flow: SKIPPED (runtime/browser blocker)
- Privacy audit: SKIPPED (no FHE/ZK scope)
- Isolation: SKIPPED-single-identity
- Async latency: no externally testable completion path recorded
