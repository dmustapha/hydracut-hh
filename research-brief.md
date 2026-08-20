# Hack Hydra — Research Brief (Intel Phase, maximal depth)

_Generated 2026-08-18. Sources: hackhydra.hydradb.com, luma.com/h038glzk, github.com/hydra-db/hydradb, hydradb.com, docs.hydradb.com (+/AGENTS, /llms.txt), benchmarks.hydradb.com. Discord PENDING (login-gated). Founders' X PENDING._

## 1. The Hackathon (facts)
- **Hack Hydra**, by HydraDB. Open source, 100% online, **$10,000**.
- **Window:** Aug 12 – **Aug 20, 2026, 11:59 PM PT** (submission). Winners Aug 24. As of today (Aug 18) → **~2.5 days left.**
- **Hosts:** Harnoor Singh (@iHarnoorSingh), Abhirup Vijay Gunakar (@abhirupvg), akash Bhat (@bhatvakash). 720 registered on Luma.
- **Company:** HydraDB — "the graph AI runs on." Backed by **Sky9 Capital** + angels **Jeff Dean, Nikesh Arora, Gokul Rajaram, Wade Foster (Zapier)**. This is a well-funded, serious infra startup using the hackathon as an open-source launch moment.
- **Prizes:** Grand $5,000 / Runner-up $3,000 / Third $1,500 / **Best Use of HydraDB $500 (judged separately)**.
- **Judging:** technical execution · use of HydraDB + graph-native approaches · product completeness/usability · quality of results · originality. Top of each track → final round → holistic ranking.
- **Submission:** Google Form + **demo video ≤3 min** + public GitHub (source, README w/ setup + explicit HydraDB-usage explanation, OSS license, third-party attribution).

## 2. CRITICAL STRATEGIC INSIGHT — two HydraDBs
There are two distinct ways to "use HydraDB." They score very differently.

| | **Open-source engine (the repo)** | **Hosted managed SDK** |
|---|---|---|
| What | Raw graph DB: OpenCypher, Bolt 5.x + HTTP, `algo.*paths`, self-host via Docker | `hydradb-sdk` → `api.hydradb.com`, ingest/query retrieval API |
| Graph visibility | You write the Cypher. Graph is THE product. | Graph hidden behind `type: knowledge/memory/all` |
| Hackathon fit | **This is the star** — "as we prepare for our open-source launch." Rewards "graph-native approaches" + Best Use of HydraDB | The "sits in the README" trap if used alone |

**Ruling for warroom/forge:** the winning build MUST put a real OpenCypher traversal (multi-hop / `algo.*paths` / reachability) on the critical path via the **self-hosted OSS engine**. The hosted SDK may be a convenience layer, but the graph work must be visible and load-bearing. Any idea whose core is "embeddings + cosine similarity" is a structural loss.

## 3. HydraDB OSS — build facts (verified)
- **Run (Docker, local mode):** `docker pull ghcr.io/hydra-db/hydradb:latest` then `docker run` with `CLOUD_PROVIDER=local`, `LOCAL_PATH=/data/store`, ports **7687 (Bolt), 8443 (HTTP), 9090 (admin)**, auth-token file (dev token `local-development-token-32-bytes`), `GRAPH_ALLOW_PLAINTEXT=true`, `RUST_MIN_STACK=33554432`. **No source build needed** (avoid — needs libcypher-parser + GraphBLAS, Rust 1.91+).
- **Connect:**
  - Bolt: `neo4j://127.0.0.1:7687` → any Neo4j driver (Python `neo4j`, JS `neo4j-driver`).
  - HTTP: `POST 127.0.0.1:8443/v1/graphs/default/query`, `Authorization: Bearer $TOKEN`, `X-Graph-Namespace: default`, body `{"cell_id":"cell-0","query":"..."}`. JSON + NDJSON.
- **OpenCypher subset:** typed rels, bounded variable-length paths, property/label predicates, ordering, pagination, aggregation, `OPTIONAL MATCH`, `UNION`, batched `UNWIND` writes.
- **Path procedures (the moat):**
  - `algo.SPpaths` — bounded paths, one source → one target.
  - `algo.SSpaths` — bounded paths from one source.
  - `algo.MSpaths` — many indexed sources/targets evaluated together (no client fan-out). Params: `sourceLabel, sourceProperty, sourceValues, targetValues, pairwise, relTypes, relDirection, maxLen, pathCount, fairRelationshipVariants, resultLimit`.
- **Consistency:** `causal` (default) or `strong` per query. Snapshot-consistent reads.
- **Repo layout:** `src/{core,shard,engine,query,client,sparse_kernel}`, `examples/` (smoke/import/benchmark/correctness), `scripts/` (local, MinIO, stress), `docs/` (architecture.md, jepsen, formal-methods), `charts/` (Helm). Rust, AGPL-3.0.

## 4. HydraDB hosted — reference (convenience layer only)
- SDKs: `pip install "hydradb-sdk>=2,<3"`, `npm install @hydradb/sdk@^2`. Base `https://api.hydradb.com`, header `API-Version: 2`.
- Flow: create DB → poll `ready_for_ingestion` → `POST /context/ingest` → poll `graph_creation|completed` → `POST /query` (`type: knowledge|memory|all`, `query_by: hybrid`, `mode: thinking`).
- Concepts: Database (tenant) / Collection (user partition) / Knowledge (shared docs) / Memories (user-scoped) / Graph context (entity-relation triplets, default on).
- Docs: `/get-started/v2/quickstart`, `/AGENTS`, `/api-reference/v2`, `/cookbooks/v2` (support/finance/recruiting/competitive-intel patterns), `/llms.txt` index.

## 5. Why graph beats vector (from the paper — arm the demo narrative)
- **Temporal state:** vectors can't tell current vs superseded fact; HydraDB uses git-style temporal versioning (commit time, validity time, provenance; append-not-overwrite).
- **Multi-hop:** traverses e.g. `Project→blockedBy→Issue→assignedTo→Engineer` — vectors can't chain.
- **Entity resolution:** merges "Sam / @soham / S. Ratnaparkhi" into one node across sources.
- **Benchmarks (LongMemEval-S):** HydraDB **90.79%** overall (best baseline 85.79%); knowledge-updates **97.43%**, temporal **90.97%**, preference **96.67%**, cross-session **76.69%**. Full-context GPT-4o cited at ~8%. Also BEAM 1M, FinanceBench.

## 6. Tracks (with graph-load-bearing angle)
- **01 Enterprise Context + Ontology** — entity resolution across 9 sources → queryable ontology; multi-hop reasoning + conflict resolution. Datasets: Enterprise RAG Bench, Salesforce HERB. _High effort; scope to 1–2 sources for 2.5 days._
- **02 Repos/Deps/Code as Graphs** — **A) Supply-chain blast radius** (npm/PyPI; compromised package → transitive exposure, versions, typosquat; TanStack: 84 malicious artifacts / 42 packages / 6 min). **B) Code graphs for IDE assistants** (call chains, types, configs > similarity). _A is most demo-able + timely; a single `algo.SSpaths`/reachability query IS the product._
- **03 Memory + Context Retrieval** — agent memory over 30–40 sessions, 115K tokens/query; cross-session synthesis, temporal supersession, no confabulation. Datasets: LongMemEval(+V2), BEAM. _Crowded (mem0/Zep); novelty bar high; note HydraDB itself benchmarks here so bar is literally set by the org._

## 7. Recommended direction (pre-warroom hypothesis, not locked)
**Lean Track 02-A (supply-chain blast radius).** Rationale: (a) the value is a graph reachability query vector search structurally cannot answer; (b) TanStack timeliness = originality + real-world; (c) demo-able in 3 min ("this package is compromised → every downstream repo/app affected in N hops, live Cypher"); (d) fits 2.5-day scope with a bounded npm/PyPI subset; (e) maximizes "Best Use of HydraDB" via `algo.SSpaths`. Track 03 is the org's home turf (they set the LongMemEval bar) — beating them there is hard; differentiate on temporal-supersession-as-edges if chosen. Warroom to confirm/challenge.

## 8. Open intel gaps (need user or paid social)
- **Discord** (discord.gg/D8cGSa9H9, channel 1490009069778632955) — login-gated; need Dami's session or pasted content. Likely holds: FAQ, judging clarifications, dataset links, example repos, team-formation, host Q&A.
- **Founders'/org X** (@hydra_db, @iHarnoorSingh, @abhirupvg, @bhatvakash) — hackathon hype, judging hints, prior projects. Fetchable via twit.sh/stablesocial if wanted.
- Dataset access specifics (Enterprise RAG Bench, HERB, LongMemEval, BEAM) — sizes/download for feasibility.

## 9. Discord intel (pasted by Dami 2026-08-18, from #general)
**Rules confirmed:** multi-track allowed BUT each must be a *meaningfully distinct project*; a team can finalist in multiple tracks but win only ONE top-3 award (still eligible for Best Use of HydraDB). Suggested datasets optional unless a track requires. Repo must be public. Work must start on/after Aug 12.

**Hosted-connector pain = field-wide (validates self-hosted OSS strategy):**
- SANJIII: connectors auto-ingested ALL data, burned his limit unintentionally.
- Saharsh: free tier `E9004` **index-budget limit** — connector-synced docs fail indexing.
- Ro-SuperHIT: DB init slow (>5 min first time); confused how to query + get context.
- Abhirup (HydraDB team) offering DM support → team is responsive/hands-on.

**Crowding signal (REAL):** all visible activity = connector-based enterprise/memory ingestion (Track 1 & 3). One visible competitor submission = **Cognivern** (@UNgethe): connects GitHub/Linear/Attio + audit log into one graph, agent memory "who did what across sources" → Track 1/3. **NO ONE seen doing Track 2 (code/deps graphs) → whitespace.**

**Tempo:** people already submitting early (Rohan 8/6); someone asked for deadline extension (no confirmation). Active field, many stuck on basics.

**Strategic conclusion:** Track 2A (supply-chain blast radius), self-hosted Docker + raw Cypher, avoids the E9004/limit/slow-init wall the crowd is hitting, sits in the empty track, maxes graph-load-bearing + Best Use of HydraDB.
