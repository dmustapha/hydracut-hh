# Context Snapshot — external timeout fix

User asked whether blocker resolution required reauthentication.

Findings:
- `gh auth status`: active `dmustapha`, token in macOS keyring, scopes include repo/workflow.
- `gh api rate_limit`: 5000 remaining.
- `secrets/github_token` was empty; populated from `gh auth token`, mode 0600, 41 bytes. Reauthentication is not required.
- Authentic proof against the existing graph/Postgres state failed with `HeadersTimeoutError`.
- Clean temporary proof volumes were created to isolate stale state; migration passed.
- Clean proof replay then failed with `HeadersTimeoutError: HTTP/2: headers timeout after 3000`.
- Direct container probes showed GitHub/OSV/CISA/FIRST endpoints respond successfully but can approach multi-second latency. Source adapters had hard-coded `headersTimeout: 3_000`.
- Minimal root-cause fix applied via `apply_patch`: GitHub, OSV, and enrichment adapter headersTimeout changed to 15_000; body timeouts unchanged. `pnpm typecheck && pnpm test` passed (4/4).
- `docker compose build worker` is currently running after the timeout fix; rebuild must finish before rerunning clean proof.

Separate blocker:
- `DEP-001` persistent zero-cost VM remains unresolved and cannot be solved without Oracle/cloud credentials/provisioning authorization. Do not fabricate deployment.

Conductor remains paused at mandatory Design Brief checkpoint before Design Forge.
