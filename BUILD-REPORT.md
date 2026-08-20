# Build Report: HydraCut powered by CampaignRadius

Generated: 2026-08-20T02:20:45Z  
Builder: `hackathon-build` under `hackathon-conductor`

## Summary

| Phase | Steps | Status | Notes |
|---|---|---|---|
| Phase 0: Compatibility and runtime truth | 0.1 to 0.3 | Complete | Exact toolchain and pinned self-hosted HydraDB runtime gate passed on ARM64; amd64 dependencies stage also passed |
| Phase 1: Domain, persistence, and authentic seed | Pending | Pending | |
| Phase 2: External and graph integrations | Pending | Pending | |
| Phase 3: End-to-end analysis and proof | Pending | Pending | |
| Phase 4: Incident-command UI | Pending | Pending | |
| Phase 5: Adversarial hardening and rehearsal | Pending | Pending | |
| Phase 6: Deployment and final evidence | Pending | Pending | Persistent zero-cost cloud VM required by `DEP-001` before Deploy |

## Deviations from Architecture

| ID | Component | ARCHITECTURE Said | ACTUAL | Reason | Class | Downstream Impact |
|---|---|---|---|---|---|---|
| DEV-001 | pnpm lifecycle policy | Only `@npmcli/arborist` is approved for lifecycle scripts | Added `allowBuilds.esbuild: true` and explicit `esbuild` allowlist | pnpm 11.22.0 blocked three locked esbuild postinstall scripts | DEGRADED | Frozen installs execute only the required esbuild scripts; direct versions remain exact |
| DEV-002 | HydraDB persistent-volume initialization | Mount `/data`, use `/data/store` and `/data/cache`, and execute the image entrypoint directly | Mount image-owned `/tmp/graph`, create `/tmp/graph/store` and `/tmp/graph/cache`, then execute `graph-node` as UID/GID 10001 | The pinned image has no writable `/data`; direct startup failed with permission and missing-directory errors | DEGRADED | All later Compose and deployment gates must preserve this non-root initialization wrapper |
| DEV-003 | Docker target architecture | Full Linux x86_64 Dockerfile build is an explicit gate | `linux/amd64` dependencies stage passed; full application/runtime image remains untested until app source exists; ARM64 HydraDB runtime is running | Phase 0 explicitly forbids application source, so full build stages cannot execute yet | UNTESTED | Phase 1/6 must run the complete amd64 image build before deployment claims |

## Failed Attempts and Resolutions

| Step | Error | Attempts | Resolution |
|---|---|---:|---|
| 0.1 | pnpm rejected locked esbuild lifecycle scripts with `ERR_PNPM_IGNORED_BUILDS` | 1 | Added exact esbuild build approval, reran frozen install, and verified TypeScript 7.0.2 |
| 0.2 | HydraDB exited with `Permission denied` under `/data` | 1 | Switched to image-owned `/tmp/graph` and added a non-root directory initialization wrapper |
| 0.2 | HydraDB exited because `/tmp/graph/store` did not exist | 1 | Wrapper creates store and cache directories before `graph-node` |

## Verification Results

| Phase | Command | Expected | Actual | Pass? |
|---|---|---|---|:---:|
| 0.1 | `pnpm install --frozen-lockfile` | Exit 0 | `Already up to date`; `Done in 447ms using pnpm v11.22.0`; exit 0 | YES |
| 0.1 | `pnpm exec tsc --version` | `Version 7.0.2` | `Version 7.0.2`; exit 0 | YES |
| 0.2 | `docker compose config --quiet` | Exit 0, no unresolved variables | Exit 0 | YES |
| 0.2 | `docker image inspect ghcr.io/hydra-db/hydradb@sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709 --format '{{index .RepoDigests 0}}'` | Frozen digest | `ghcr.io/hydra-db/hydradb@sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709`; exit 0 | YES |
| 0.3 | `docker compose ps` | PostgreSQL healthy, HydraDB running privately | `hack-hydra-postgres-1 Up 5 minutes (healthy)`; `hack-hydra-hydradb-1 Up 3 minutes`; exit 0 | YES |
| 0.3 | `docker port hack-hydra-hydradb-1` and `docker port hack-hydra-postgres-1` | No host bindings | Both returned no host binding | YES |
| 0.3 | `pnpm list --depth 0 && docker version && docker compose version` | Exact dependency and engine evidence | 25 packages; Docker 28.5.1; Linux ARM64 server; Compose v2.40.0-desktop.1 | YES |
| 0.3 | `docker build --platform linux/amd64 --target dependencies -t hydracut-phase0-amd64 .` | Cross-target dependency image builds | `#10 naming to docker.io/library/hydracut-phase0-amd64:latest`; `#10 DONE 24.2s`; exit 0 | YES |

## Known Risks for Debug

- Docker Desktop currently has approximately 4 GiB assigned memory. The complete local stack remains unproved.
- Persistent zero-cost cloud VM acquisition is deferred to Deploy and tracked as PULSE item `DEP-001`.
- The full application/runtime Dockerfile build remains untested until Phase 1 creates source files. The amd64 dependencies stage and ARM64 HydraDB runtime are proven.

## Contract Addresses

Not applicable. HydraCut has no blockchain contracts.

## Environment Variables Added

| Key | Source Step | Value or Description |
|---|---|---|

## Phase 0 Evidence Output

### Frozen dependency and target evidence

```text
Already up to date
Done in 447ms using pnpm v11.22.0
Version 7.0.2
exit=0
docker compose config --quiet: exit=0
ghcr.io/hydra-db/hydradb@sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709
direct_dependencies=25
non_exact_versions=0
source_file_count=0
```

### Runtime proof

```text
NAME                    STATUS
hack-hydra-hydradb-1    Up 3 minutes             7687/tcp, 8443/tcp, 9090/tcp, 9443/tcp
hack-hydra-postgres-1   Up 5 minutes (healthy)   5432/tcp
hydradb=postgres=
```

### Secret permission proof

```text
-rw------- .env
drwx------ secrets
-rw------- secrets/postgres_password
-rw------- secrets/database_url
-rw------- secrets/hydradb_token
-rw------- secrets/github_token
-rw------- secrets/app_operator_token
```

### Cross-target proof

```text
#10 naming to docker.io/library/hydracut-phase0-amd64:latest done
#10 DONE 24.2s
```

## Phase 0 Completion

All PLAN Phase 0 commands and gates passed independently. Phase 0 is complete with DEV-001, DEV-002, and the intentionally deferred DEV-003 full application image gate.
