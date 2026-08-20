# HydraCut

HydraCut is an AppSec incident command surface powered by CampaignRadius. It imports immutable repository snapshots, maps exact dependency topology in self-hosted HydraDB OSS, evaluates evidenced proposed fixes, and emits bounded proof receipts.

## Setup

1. Copy `.env.example` to `.env` and create mode-0600 files under `secrets/`.
2. Run `pnpm install --frozen-lockfile`.
3. Run `docker compose up -d postgres hydradb`.
4. Run `docker compose run --rm -e CI=true migrate`.
5. Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

The final deployment requires the pinned Compose stack on a persistent Linux VM. Local Docker and a Quick Tunnel are development/demo paths only.

## How HydraDB is used

HydraCut self-hosts the digest-pinned HydraDB OSS service privately on the Compose network. PostgreSQL stores durable workflow and evidence metadata; HydraDB stores package, application, incident, and relationship topology. Baseline and final combined proofs use explicit OpenCypher and native `algo.MSpaths` with strong consistency, bounded depth/result limits, read epoch/bookmark metadata, deterministic IDs, and immutable readback. The app fails closed on missing endpoints, cursors, stale snapshots, drift, or partial results.

## Track and attribution

**Track 02-A — Supply Chain Blast Radius** is the sole project track. **Best Use of HydraDB** is a separate award target.

HydraCut is built by Dami Mustapha and powered by CampaignRadius. See `THIRD_PARTY_NOTICES.md` for dependency attribution.

## Status

The Build implementation is complete through the local Phase 6 preparation. Authentic final corpus evidence and persistent deployment remain pending the recorded GitHub credential/rate-limit and cloud-VM checkpoints. No partial or historical result is presented as a fresh proof.
