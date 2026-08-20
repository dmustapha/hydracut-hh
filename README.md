# HydraCut: Forensic dependency remediation proof

HydraCut is an AppSec incident command surface for bounded software supply chain investigations. It imports immutable npm repository states, computes portfolio exposure with self-hosted HydraDB OSS, evaluates authentic proposed fixes, and issues an integrity-checked final receipt. Every verified claim stays scoped to the selected incident, source set, portfolio, dependency scopes, and traversal bounds.

[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![HydraDB](https://img.shields.io/badge/HydraDB-self--hosted-F15A3C)](https://github.com/hydra-db/hydradb)
[![Tests](https://img.shields.io/badge/stress_tests-158%2F158-brightgreen)](tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![HydraCut forensic graph atlas](docs/images/landing.png)

## What is HydraCut?

Dependency scanners list vulnerable packages. HydraCut answers a narrower and more operational question: which applications are reachable from exact vulnerable versions, and does one supplied portfolio of authentic dependency updates remove the selected incident without hiding other known exposure?

The frozen proof corpus contains 3 public repository snapshots, 1,742 package instances, 1,253 unique exact versions, and 2,939 dependency edges. The selected `minimist` incident moves from 3 baseline source-to-application pairs to 0 after three authentic proposed fixes. The wider bounded verification universe moves from 9 pairs to 6, so the receipt never presents the selected result as universal safety.

## Screenshots

| Incident command | Native impact evidence |
|---|---|
| ![Incident queue](docs/images/incidents.png) | ![Impact traversal](docs/images/impact.png) |

| Immutable proof receipt |
|---|
| ![Proof receipt](docs/images/proof.png) |

## Features

- **Immutable inputs:** resolves exact public commits or accepts hashed manifest and lockfile pairs without executing repository code
- **Graph-native impact:** uses explicit OpenCypher and native `algo.MSpaths` as the critical exposure query
- **Authentic proposed fixes:** compares complete dependency states from real commits, branches resolved to commits, pull requests, or uploads
- **Coverage planning:** chooses among supplied authentic candidate states with required, forbidden, and repository-count constraints
- **Combined final proof:** reconstructs one selected plan and runs a second native traversal instead of unioning individual outcomes
- **Fail-closed semantics:** reports `PARTIAL`, `UNKNOWN`, or `ERROR` when evidence, cardinality, freshness, or graph completeness cannot be proved
- **Immutable receipts:** binds inputs, selectors, bounds, queries, pair digests, bookmarks, epochs, limitations, and final results
- **Forensic Graph Atlas:** presents the full incident workflow with bundled IBM Plex typography, signal vermilion, and warm graphite surfaces

## How HydraDB is used

HydraDB is the load-bearing graph engine. PostgreSQL stores workflow state and evidence metadata. HydraDB stores package versions, applications, immutable snapshots, incidents, scenario projections, and dependency relationships. Both services run privately inside Docker Compose. Only Caddy publishes host ports `80` and `443`.

HydraCut renders an explicit native traversal for each proof:

```cypher
CALL algo.MSpaths({
  sourceLabel: 'IncidentSource',
  sourceProperty: 'source_selector',
  sourceValues: [$sourceSelectors],
  targetLabel: 'ScenarioApplication',
  targetProperty: 'portfolio_key',
  targetValues: [$portfolioKey],
  relationshipTypes: ['DEPENDS_ON', 'USES_SNAPSHOT'],
  maxDepth: $boundedDepth,
  resultLimit: $boundedLimit
})
```

The application validates matched source and target cardinality, cursor absence, expected pair-key digests, read epoch, and bookmark metadata. A traversal that is truncated, stale, incomplete, or inconsistent cannot produce a verified receipt.

```text
Browser
  |
  v
Caddy TLS and bearer boundary (public 80/443)
  |
  v
Next.js web and API (private)
  |
  +---> PostgreSQL (workflow, evidence, receipts)
  |
  +---> pg-boss worker
          |
          +---> GitHub immutable bytes
          +---> OSV, CISA KEV, FIRST EPSS
          +---> HydraDB OSS (private OpenCypher and algo.MSpaths)
```

## Proof flow

1. **Import exact bytes:** resolve an immutable repository state and verify its content hashes.
2. **Build topology:** parse the lockfile without package installation or lifecycle-script execution.
3. **Traverse baseline exposure:** run native `algo.MSpaths` for the selected sources and portfolio targets.
4. **Evaluate complete proposed states:** repeat ingestion and traversal for each authentic candidate.
5. **Select a bounded plan:** apply transparent coverage constraints to the supplied candidate set.
6. **Verify one combined scenario:** materialize the selected portfolio and run one final native traversal.
7. **Publish the receipt:** persist the exact query, inputs, bounds, pair sets, digests, limitations, epoch, and bookmark.

## Tech stack

| Layer | Technology |
|---|---|
| Interface | Next.js 16.3.1, React 19.2.8, TanStack Query, XYFlow |
| Language | TypeScript 7.0.2, Node.js 24.10.0 |
| Workflow | pg-boss 12.27.0, PostgreSQL 18.6 |
| Graph | HydraDB OSS, OpenCypher, native `algo.MSpaths` |
| Evidence | GitHub REST, OSV, CISA KEV, FIRST EPSS, npm Arborist |
| Deployment | Docker Compose, Caddy 2.11.4, persistent Linux VM |
| Testing | Vitest 4.1.11, Playwright 1.62.1, axe-core |

## Testing

The completed Stress Test passed 158 of 158 checks with confidence 100. It includes 70 browser assertions across five viewport widths, 42 route-matrix checks, four async workflows, four adversarial API flows, and the native HydraDB contract. The clean-room receipt is `c98af29901132a8ca1dc934c23acc74323f07c2d49c2987fb090158eeb65b657`.

Run focused gates locally:

```bash
pnpm typecheck
pnpm test
pnpm build
docker compose run --rm graph-contract
docker compose run --rm worker pnpm proof
```

The build command outside Docker needs a build-only PostgreSQL URL because dynamic route modules load the database client during page-data collection:

```bash
DATABASE_URL_FILE= \
DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
pnpm build
```

## Try it locally

1. Install Node.js `24.10.0`, pnpm `11.22.0`, Docker, and Docker Compose.
2. Clone the repository and install exact dependencies.
3. Copy `.env.example` to `.env`.
4. Set `APP_DOMAIN=localhost` and provide a local `ACME_EMAIL` value.
5. Create the five files under `secrets/` described in `.env.example`.
6. Start the private data services and run the schema migration.
7. Run the native graph contract before starting the application services.
8. Seed or reproduce the authentic proof from the supplied scripts.

```bash
git clone https://github.com/dmustapha/hydracut-hh.git
cd hydracut-hh
corepack enable
pnpm install --frozen-lockfile
docker compose up -d postgres hydradb
docker compose run --rm migrate
docker compose run --rm graph-contract
docker compose up -d worker web
docker compose run --rm worker pnpm seed:demo
docker compose run --rm worker pnpm proof
```

Never run `docker compose down -v` against a proof-bearing environment. The named PostgreSQL and HydraDB volumes hold durable workflow and graph evidence.

## Required configuration

| Variable or secret | Purpose |
|---|---|
| `APP_DOMAIN` | Caddy hostname for the single public edge |
| `ACME_EMAIL` | ACME certificate contact |
| `DATABASE_URL_FILE` | Mounted PostgreSQL connection-string file |
| `HYDRADB_HTTP_URL` | Private HydraDB HTTP endpoint |
| `HYDRADB_GRAPH_NAMESPACE` | HydraDB graph namespace |
| `HYDRADB_TOKEN_FILE` | Mounted HydraDB bearer-token file |
| `GITHUB_TOKEN_FILE` | Optional read-only GitHub token file |
| `APP_OPERATOR_TOKEN` | Caddy single-operator bearer secret |
| `SOURCE_CACHE_TTL_SECONDS` | External evidence freshness window |

## API reference

The public Caddy edge requires `Authorization: Bearer <operator-token>`. Mutation routes also require an `Idempotency-Key` header and same-origin requests.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Verify web, PostgreSQL, and HydraDB readiness |
| `POST` | `/api/imports` | Import an immutable GitHub or uploaded repository state |
| `GET` | `/api/jobs/:jobId` | Read durable job state and phase events |
| `GET` | `/api/incidents` | List bounded advisory-backed incidents |
| `GET` | `/api/incidents/:incidentId` | Read one incident evidence bundle |
| `POST` | `/api/incidents/:incidentId/traversals` | Queue a native baseline traversal |
| `GET` | `/api/incidents/:incidentId/impact` | Read verified impact pairs and witnesses |
| `GET` | `/api/incidents/:incidentId/proposed-fixes` | List authentic proposed-fix outcomes |
| `POST` | `/api/incidents/:incidentId/proposed-fixes` | Evaluate one supplied authentic state |
| `POST` | `/api/incidents/:incidentId/proposed-fixes/discover` | Discover supported public dependency-update pull requests |
| `POST` | `/api/incidents/:incidentId/plans` | Create a constrained coverage plan |
| `GET` | `/api/plans/:planId` | Read a plan and its evidence bindings |
| `POST` | `/api/plans/:planId/verify` | Queue the final combined native proof |
| `GET` | `/api/receipts/:digest` | Read an integrity-checked immutable receipt |
| `GET` | `/api/receipts/:digest/sarif` | Export a verified receipt as SARIF 2.1.0 |
| `GET` | `/api/system` | Read bounded runtime facts and image digest |

## Project structure

```text
src/app/                 Next.js routes, workflow screens, and API dispatcher
src/components/          Forensic Graph Atlas components
src/db/                  PostgreSQL schema, repository, and health boundary
src/domain/              canonical keys, planner, receipt, SARIF, and types
src/integrations/        GitHub, Arborist, enrichment, OSV, and HydraDB clients
src/jobs/                durable pg-boss queue and proof pipeline
scripts/                 authentic seed and proof entry points
tests/                   unit, contract, integration, adversarial, and browser tests
submission/              proof receipt, SARIF sample, and technical proof notes
docs/images/             authentic runtime screenshots
Dockerfile               pinned multi-stage application image
docker-compose.yml       private data plane and public Caddy edge
Caddyfile                TLS, request-size, method, and bearer boundary
```

## Scope boundaries

HydraCut proves dependency reachability within explicit imported data, source selectors, scopes, target portfolios, traversal bounds, and evidence freshness. It does not claim exploitability, function-level reachability, malware detection, comprehensive vulnerability coverage, tenant isolation, production high availability, or whole-portfolio safety.

Built for [Hack Hydra](https://hackhydra.hydradb.com/) by Dami Mustapha. Track 02-A is the sole project track. Best Use of HydraDB is a separate award target.

## Third-party attribution

HydraDB is licensed separately under AGPL-3.0. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for runtime and dependency attribution.

## License

HydraCut source code is available under the [MIT License](LICENSE).
