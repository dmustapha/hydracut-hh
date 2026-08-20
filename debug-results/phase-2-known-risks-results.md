# Phase 2 — Known Risks Triage

| Risk | Class | Disposition | Evidence |
|---|---|---|---|
| ~4 GiB Docker Desktop memory envelope | STRUCTURAL/TESTABLE | ACCEPTED with runtime warning | PostgreSQL + pinned HydraDB + web Compose stack became healthy; full corpus/browser load remains blocked and uncredited. |
| DEV-003 full amd64 application image | TESTABLE | CLEARED | `docker compose build web` passed after build/runtime fixes. |
| BLK-EXT-001 GitHub immutable corpus replay | EXTERNAL | ACCEPTED/BLOCKED | Real `docker compose run --rm worker pnpm proof` failed without fabricated evidence; first observed failure was `HYDRADB_HTTP_500` during optional-edge corpus write, and Build records empty token/rate limit. |
| DEV-017 standalone browser E2E database wiring | EXTERNAL/RUNTIME | ACCEPTED/BLOCKED | Compose runtime is required; no host-only evidence credited. |
| DEV-019 adversarial authentic proof fixture | EXTERNAL/RUNTIME | ACCEPTED/BLOCKED | Requires migrated corpus/proof runtime; not treated as pass. |
| DEV-020 timed rehearsal | EXTERNAL/RUNTIME | ACCEPTED/UNTESTED | Requires completed authenticated corpus and browser execution. |
| DEP-001 persistent VM | EXTERNAL | ACCEPTED/BLOCKED | No cloud credentials/provisioning; local Docker is not deployment evidence. |
| DEV-022 fresh receipt/SARIF | EXTERNAL | ACCEPTED/BLOCKED | Correctly absent while authentic corpus proof is unavailable. |

Additional real check: a new optional-scope HydraDB contract test passed 1/1 after the corpus error, so the failure is not reproduced by a minimal optional relationship alone.
