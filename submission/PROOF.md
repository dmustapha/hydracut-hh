# Proof status

Fresh authenticated corpus replay passed on isolated clean Compose volumes. The GitHub token was synced from the authenticated `gh` keyring session and the replay produced `submission/receipt.json` (digest `250ca53c54c0e90b647e1432fe9d85bdb41ffff5f0904df2290f461240200804`) plus `submission/SARIF-SAMPLE.json`. A persistent cloud VM is still mandatory before Deploy (`DEP-001`).

No screenshot, demo URL, or deployment claim is fabricated while the remaining runtime/deployment gates are unresolved. Reproduce the proof after a clean authenticated environment with:

```bash
docker compose run --rm worker pnpm proof
```

The expected output must contain a fresh digest, exact immutable source hashes, baseline and final native `algo.MSpaths` records, strong-consistency metadata, and a valid SARIF 2.1.0 projection.
