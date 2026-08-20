# Phase 3 — Runtime Integration Results

## Non-user-facing connections

- HydraDB native graph contract: PASS, 4/4 tests via `docker compose run --rm graph-contract pnpm test:contract`.
- Optional-scope relationship hardening: PASS, 1/1 via `tests/debug-p2-optional-edge.test.ts`.
- Compose web → PostgreSQL → HydraDB health path: PASS, HTTP 200 with all three booleans true.
- Migration → PostgreSQL schema: PASS, 12 public tables present.

## Blocked integration

- Authentic frozen corpus worker replay: BLOCKED/FAIL-CLOSED. Real run returned `HYDRADB_HTTP_500` while writing an `OPTIONAL_DEPENDS_ON` edge. Build’s credential/rate-limit blocker remains open; no receipt or evidence was emitted.

No mocked responses were used. No existing build tests were modified.
