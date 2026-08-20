# Proof status

Fresh authenticated corpus replay is intentionally pending. The local GitHub secret is empty and the replay received `GITHUB_RATE_LIMITED` (`BLK-EXT-001`). A persistent cloud VM is also mandatory before Deploy (`DEP-001`).

No receipt, SARIF, pair count, screenshot, demo URL, or deployment claim is fabricated while those gates are unresolved. Reproduce after resolving the blockers with:

```bash
docker compose run --rm worker pnpm proof
```

The expected output must contain a fresh digest, exact immutable source hashes, baseline and final native `algo.MSpaths` records, strong-consistency metadata, and a valid SARIF 2.1.0 projection.
