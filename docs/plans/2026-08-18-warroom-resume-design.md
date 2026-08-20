# Hack Hydra Warroom Resume Design

**Goal:** Resume the interrupted Track 2A deliberation without discarding completed intel or generator work.

## Approach

Recover the four usable Claude generator outputs, rerun only the failed wildcard lens, and normalize the result into the current warroom schema. Then deduplicate, gate, score with three independent judges, fact-check the top three against primary sources, and select one winner.

## Fixed constraints

- Single track: Track 02-A, supply-chain blast radius.
- One builder, roughly 2.5 days.
- Self-hosted HydraDB OSS is mandatory.
- A real OpenCypher traversal or `algo.*paths` procedure must be the product's critical path.
- Hosted SDK-only and vector-similarity concepts are automatic kills.
- Output one justified winner and `WINNER-BRIEF.md`, then stop before forge.

## Resume strategy considered

1. Restart all five generators: clean but wasteful and loses already useful work.
2. Select directly from the 12 recovered ideas: fast but violates the warroom minimum pool and misses the wildcard lens.
3. Recover four generators and rerun one: preserves work, restores catalog diversity, and satisfies the protocol.

**Chosen:** Option 3.
