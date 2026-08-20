# Hack Hydra Warroom Resume Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `hackathon-warroom` to execute this plan phase by phase.

**Goal:** Complete the interrupted Hack Hydra warroom and produce one verified winner brief.

**Architecture:** Treat the saved brief, research, PULSE, and recovered Claude transcripts as upstream evidence. Persist each warroom phase before moving forward so another session can resume safely.

**Tech Stack:** Markdown artifacts, JSON state, primary HydraDB/deps.dev/OSV/npm documentation, Codex collaboration agents.

---

### Task 1: Normalize setup

Create `config.json`, `warroom/primitives-sheet.md`, `warroom/competitor-opportunity-map.md`, `warroom/market-reality-map.md`, and `.warroom-state.json`. Verify the fixed Track 2A contract and no upstream blockers.

### Task 2: Complete generation

Persist the recovered 12 ideas, dispatch the missing wildcard lens, and freeze a normalized 15-idea pool in `warroom/raw-pool.md`.

### Task 3: Synthesize and gate

Deduplicate the pool to 6-10 candidates in `warroom/transcript.md`. Record every kill with a specific gate and retain collision flags separately.

### Task 4: Score independently

Dispatch three scorers with randomized candidate ordering. Merge their criterion scores and document spread, unanimity, and track-depth assessments.

### Task 5: Fact-check and select

Verify three load-bearing claims for each top-three candidate using primary sources. Select the strongest zero-failure candidate and write `WINNER-BRIEF.md`.

### Task 6: Close the phase

Validate artifacts, update `.warroom-state.json`, append the canonical warroom PULSE section, complete `tasks/todo.md`, and stop before forge.
