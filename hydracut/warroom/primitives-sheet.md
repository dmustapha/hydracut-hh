# Working Primitives Sheet: Hack Hydra

## Hackathon Contract

- **Hackathon type:** Infra / Tooling
- **Selected track:** Track 02-A, Supply Chain Blast Radius
- **Track strategy:** Single-track. Every candidate must be deeply eligible for Track 02-A.
- **Catalog loaded:** 100 named winner or finalist placements across 15 result-bearing hackathon or program families, plus unnamed cohorts and events with results pending.
- **Primary sponsor primitive:** Self-hosted HydraDB OSS using visible `OpenCypher` traversal and at least one native path procedure on the critical path.
- **Removal test:** If HydraDB, the dependency graph, or the traversal is removed, the security result must become impossible, not merely slower.
- **Demo constraint:** The decisive proof must fit inside the submission's three-minute video and be understandable within 90 seconds.

`[PRIMARY]` marks families directly suited to Infra / Tooling. `[CROSS-POLLINATION]` marks families retained as remix material. The latter are not recommendations to add crypto or AI where Hack Hydra does not require them.

## Mechanism Families: Creative Adaptation Deck

### 1. Developer Security Guardrails `[PRIMARY]`

- **Sources:** Aegis402 and Keeper-Gate (ETHGlobal Open Agents), Sui-Immunizer and Lulu AI Firewall (Sui x OpenClaw), Sudont (Solana Frontier), Sentry and Aegis (Somnia).
- **Core primitive:** Put a reusable policy, audit, or interception layer directly in a high-risk execution path.
- **Why it won:** The protection is observable, immediately useful, and easy to prove with an allowed-versus-blocked action.
- **Adaptation axis:** Move from payment or agent-call interception to dependency admission. A package install, pull request, or release is allowed only after HydraDB proves the transitive exposure path is within policy.
- **Hack Hydra remix:** `package@version` enters, HydraDB traverses affected dependents, and the tool emits a signed or reproducible allow, warn, or block decision with the exact path as evidence.

### 2. Diagnostic Analytics With Honest Evidence `[PRIMARY]`

- **Sources:** LPlens (ETHGlobal Open Agents), Undertow and Pacifica Analytics (Pacifica), YieldCompass (Solana Frontier).
- **Core primitive:** Convert complex system state into an actionable diagnosis while labeling how every conclusion was produced.
- **Why it won:** Closed-form reasoning, simulation, and `VERIFIED` / `COMPUTED` / `ESTIMATED` labels made the result credible rather than decorative.
- **Adaptation axis:** Replace financial-position diagnosis with software exposure diagnosis. Label findings as `DIRECT`, `TRANSITIVE`, `INFERRED`, or `UNKNOWN` and attach a traversed path plus source provenance.
- **Hack Hydra remix:** A blast-radius result is not a red badge. It is a judge-visible chain of package versions, relationship types, advisory evidence, traversal depth, and confidence class.

### 3. Reusable SDK, CLI, and Policy Primitives `[PRIMARY]`

- **Sources:** Keeper-Gate and Aegis402 (ETHGlobal Open Agents), Pacifica CLI (Pacifica), ArcPay SDK and Protocol 402 (Arc / Circle), FHEVM Example Factory and FHE Hub (Zama).
- **Core primitive:** Package a difficult integration into a narrow reusable interface that another developer can adopt quickly.
- **Why it won:** Judges could see both the primitive and a live consumer proving it was real.
- **Adaptation axis:** Expose one opinionated command or CI action, such as `hydra-blast check package@version`, backed by the same graph service used in the visual demo.
- **Hack Hydra remix:** Ship the consumer experience first. The CLI or GitHub check is proof of reuse, not a substitute for the product demo.

### 4. Live Autonomous Operations `[PRIMARY]`

- **Sources:** ZW.ARM (KeeperHub), Magma Finance (Sui Overflow), Peaks and Clawpump (Solana Frontier), Sentri (0G APAC).
- **Core primitive:** A system watches changing state and takes or recommends a concrete action without waiting for a bespoke manual investigation.
- **Why it won:** Real transactions and repeated live decisions proved that the system was operating, not merely proposing an architecture.
- **Adaptation axis:** Watch advisories, lockfiles, or package releases and incrementally recompute only newly affected regions of the dependency graph.
- **Hack Hydra remix:** Ingest a new compromise event live, then visibly change the affected-repository set through a fresh HydraDB traversal.

### 5. Multi-Agent Review and Consensus `[PRIMARY]`

- **Sources:** DAIO, Aegis402, and Slopstock's live agents (ETHGlobal Open Agents), SynapseMesh (0G APAC), SomniaFlow-adjacent catalog patterns in Somnia finalists.
- **Core primitive:** Separate analysis roles, reconcile disagreement, and preserve an auditable decision path.
- **Why it won:** Multiple roles made high-stakes review legible and gave judges a visible protocol rather than a single opaque model answer.
- **Adaptation axis:** Use sparingly. Different analyzers may interpret advisory severity, exploitability, or remediation, but HydraDB traversal remains the source of graph truth.
- **Hack Hydra remix:** A reviewer may explain the blast radius, but cannot manufacture it. The graph result must survive with all LLM components removed.

### 6. Provenance, Lineage, and Verifiable Knowledge `[PRIMARY]`

- **Sources:** Mnemosyne (ETHGlobal Open Agents), Lineage and Ivaronix (0G APAC), NeoSoul (0G APAC), Cognivern-like memory is excluded from generation as a current competitor but reinforces demand at the gate.
- **Core primitive:** Every assertion carries origin, history, and an inspectable proof of how it became current.
- **Why it won:** Verifiability turns retrieved information into accountable knowledge.
- **Adaptation axis:** Attach each dependency edge to a manifest, lockfile, registry record, or commit, and attach each vulnerability edge to an OSV or advisory record.
- **Hack Hydra remix:** A judge clicks any impacted application and sees both the traversed dependency path and the evidence that created each edge.

### 7. Temporal State and Supersession `[PRIMARY]`

- **Sources:** Clan World's selective memory mechanic (ETHGlobal Open Agents), NeoSoul (0G APAC), Forg3t Protocol's machine-unlearning direction (Avalanche Build Games).
- **Core primitive:** State changes over time, and the system makes retention, deletion, or supersession explicit.
- **Why it won:** Temporal constraints created measurable behavior and prevented stale state from masquerading as current truth.
- **Adaptation axis:** Model package versions, advisory publication, patches, and lockfile updates as a time-aware graph. Ask what was exposed at incident time versus what is exposed now.
- **Hack Hydra remix:** Demonstrate the same repository before and after a version bump. The first traversal finds a path; the second proves the path is broken.

### 8. Graph-Native Reachability and Many-to-Many Evaluation `[PRIMARY]`

- **Sources:** This family comes primarily from Hack Hydra's native `algo.SPpaths`, `algo.SSpaths`, and `algo.MSpaths` capabilities. Catalog analogues include CrowdBrain's routing, SynapseMesh's coordination, and dependency-like composability tools.
- **Core primitive:** Evaluate paths and affected sets inside the database rather than fanning out queries or approximating relationships with similarity search.
- **Why it can win here:** It is the clearest possible proof that HydraDB is load-bearing and graph-native.
- **Adaptation axis:** Single source to all downstream consumers, one package to one repository proof path, and batch evaluation across advisories and repositories.
- **Hack Hydra remix:** Use `algo.SSpaths` for blast radius, `algo.SPpaths` for the explainable route, and `algo.MSpaths` for portfolio-wide triage when verified against the shipped OSS API.

### 9. Simulation and Counterfactual Testing `[PRIMARY]`

- **Sources:** LPlens's 1,000-swap Monte Carlo simulation (ETHGlobal Open Agents), CrowdBrain's simulation-to-real routing (Solana Frontier).
- **Core primitive:** Show not only current state but how an intervention changes outcomes under a reproducible scenario.
- **Why it won:** The demonstration produced evidence of consequence rather than a static score.
- **Adaptation axis:** Simulate removing, upgrading, pinning, or replacing a dependency and rerun reachability to compare impact.
- **Hack Hydra remix:** "Patch package X to version Y" becomes a counterfactual graph edit whose new traversal proves how much risk disappears.

### 10. Chain-Native or Ecosystem-Native Composability `[PRIMARY]`

- **Sources:** Pacifica CLI, ArcPay SDK, FHEVM hubs, DeepBook-oriented Sui tools, and 0G storage/compute projects across the catalog.
- **Core primitive:** Build around the sponsor ecosystem's distinctive execution model so removal of that ecosystem destroys the product's key guarantee.
- **Why it won:** Native fit scores better than a generic app with a sponsor import.
- **Adaptation axis:** For Hack Hydra, translate "chain-native" into "graph-database-native." The pivotal behavior must be typed, bounded graph traversal executed by self-hosted HydraDB.
- **Hack Hydra remix:** Avoid generic vulnerability scanning with HydraDB as storage. Make graph reachability, path explanation, and batch traversal the security mechanism.

### 11. Constrained Memory and Scarcity Mechanics `[CROSS-POLLINATION]`

- **Sources:** Clan World: Aelder Whispers (ETHGlobal Open Agents).
- **Core primitive:** Forced forgetting makes selection quality measurable and creates strategic pressure.
- **Why it won:** One memorable rule shaped the entire user experience and generated a live, judge-readable consequence.
- **Adaptation axis:** Translate memory scarcity into triage scarcity. A responder has a limited remediation budget and must choose which dependency cuts collapse the greatest blast radius.
- **Hack Hydra remix:** Rank the smallest set of upgrades that disconnects the most vulnerable paths, while keeping the graph analysis load-bearing.

### 12. Fractional Ownership and Revenue Sharing `[CROSS-POLLINATION]`

- **Sources:** Slopstock (ETHGlobal Open Agents), Lineage (0G APAC), Kamo Finance's yield tokenization (Sui Overflow).
- **Core primitive:** Split ownership or revenue claims over a productive asset.
- **Why it won:** The asset produced observable value and the economic rights followed from real use.
- **Adaptation axis:** Do not add tokens. Extract the deeper primitive: attribute shared risk or maintenance responsibility across many consumers of one dependency.
- **Hack Hydra remix:** Show which teams, repositories, or maintainers share exposure to the same transitive root cause so one remediation can serve many owners.

### 13. Stake, Slash, and Reputation for Truth `[CROSS-POLLINATION]`

- **Sources:** Mnemosyne (ETHGlobal Open Agents), Omnispect-style trust scoring appears only in Dami's gate appendix and cannot seed ideas.
- **Core primitive:** Claims become costly to make dishonestly and gain weight through accountable history.
- **Why it won:** Truth quality had a mechanism and consequence rather than a vague moderation promise.
- **Adaptation axis:** Avoid fabricating a token economy. Translate staking into evidence-weighted advisory confidence and accountable override history.
- **Hack Hydra remix:** Security teams may accept or suppress a finding only with a reason and provenance record, while the underlying path remains immutable evidence.

### 14. Confidential Compute and Public Proof `[CROSS-POLLINATION]`

- **Sources:** Slopstock's TEE-sealed weights, Sentri, Ivaronix, and Ghast/Anima-adjacent private processing (0G APAC), PayGod (Avalanche LatAm), Shadow and Private Uniswap (Zama).
- **Core primitive:** Sensitive computation happens inside a protected boundary while outsiders can verify an approved result.
- **Why it won:** Privacy was the mechanism, not a late feature.
- **Adaptation axis:** Applicable only if a real private enterprise dependency graph is used. Public npm data must not be relabeled confidential.
- **Hack Hydra remix:** A company can prove a vulnerable path exists without publishing its private repository topology, but this is optional cross-pollination and likely out of sprint scope.

### 15. Zero-Knowledge and Encrypted Application Mechanics `[CROSS-POLLINATION]`

- **Sources:** Shadow, FileZ, Z-Payment, Agora, and Private Uniswap (Zama), Cibon, FHEsplit, and SecSanta (ETHRome Zama), Stellar Real-World ZK solicitation.
- **Core primitive:** Prove or compute over hidden data without exposing the raw input.
- **Why it won:** The cryptographic property directly enabled the application behavior.
- **Adaptation axis:** Use only when the graph itself is naturally private and proof generation is feasible. Otherwise it violates the sprint and becomes garnish.
- **Hack Hydra remix:** Potential future proof of "no vulnerable path under policy P" over private topology. Not a default warroom direction.

### 16. Agent Identity, Markets, and Subscriptions `[CROSS-POLLINATION]`

- **Sources:** 0xgents, Agentra, and NeoSoul (0G APAC), Slopstock (ETHGlobal Open Agents), solv-001 is reserved for the gate-only appendix.
- **Core primitive:** Persistent identity, service discovery, ownership, or subscription turns autonomous software into an accountable economic actor.
- **Why it won:** The system connected identity to repeated utility or value flow.
- **Adaptation axis:** Extract accountable actor identity, not the marketplace. Attribute each graph mutation, policy decision, or remediation to a durable actor.
- **Hack Hydra remix:** Preserve who ingested an advisory, who approved a suppression, and who shipped a fix, without creating a cold-start market.

### 17. Payments, Escrow, and Agentic Commerce `[CROSS-POLLINATION]`

- **Sources:** AisaEscrow, VibeCard, RSoft Agentic Bank, OmniAgentPay, Arc Merchant, RouterAI, FEIN, Arcent, and ArcPay SDK (Arc / Circle), Z-Payment (Zama).
- **Core primitive:** Money moves only when a verifiable condition or delegated policy is satisfied.
- **Why it won:** The demo connected a decision to an observable settlement receipt.
- **Adaptation axis:** Translate settlement conditions into release conditions. A build or deployment proceeds only when graph policy passes.
- **Hack Hydra remix:** CI is the "escrow." The artifact is withheld until HydraDB proves no prohibited dependency path remains.

### 18. DeFi Rebalancing, Liquidity, and Structured Risk `[CROSS-POLLINATION]`

- **Sources:** ZW.ARM, Peaks, Senthos, Dropset, YieldCompass, Clawpump, Magma Finance, Pismo Protocol, MizuPay, Kamo Finance, ClashX, Clash of Perps, and Perennia.
- **Core primitive:** Continuously evaluate connected positions and choose an action under risk, liquidity, or yield constraints.
- **Why it won:** The mechanism acted on live state and made tradeoffs visible.
- **Adaptation axis:** Recast a portfolio as a repository estate, a position as a dependency, and rebalancing as the minimal safe upgrade plan.
- **Hack Hydra remix:** Optimize remediation order by repositories protected per change, not by speculative financialization.

### 19. Games, Social Mechanics, and First-Session Wow `[CROSS-POLLINATION]`

- **Sources:** Clan World, Clash of Perps, The Grotto, MintCanvas, InitQuest, NameFi, and the Sui OpenClaw community-facing winners.
- **Core primitive:** A vivid interaction makes system rules understandable through consequence.
- **Why it won:** Judges experienced the mechanism immediately instead of reading about it.
- **Adaptation axis:** Borrow presentation, not gamification for its own sake. Animate the compromise moving through a dependency graph and let the user sever a path.
- **Hack Hydra remix:** The visual spread and repair become the first-session wow while the result remains backed by actual Cypher paths.

### 20. Physical Routing, DePIN, and Real-World Infrastructure `[CROSS-POLLINATION]`

- **Sources:** CrowdBrain, IOChain, Zoneless (Solana Frontier), Meridian and The Grotto (Avalanche Build Games), PayGod (Avalanche LatAm).
- **Core primitive:** Route scarce real-world resources or institutional workflows using verifiable digital coordination.
- **Why it won:** The software connected to a consequential external system or clearly deployable infrastructure.
- **Adaptation axis:** Extract routing under constraints. Route security attention to the smallest affected cut set or the repositories with greatest downstream consequence.
- **Hack Hydra remix:** The scarce resource is incident-response time. HydraDB identifies where one action removes the most paths.

### 21. Naming, Discovery, and Onboarding `[CROSS-POLLINATION]`

- **Sources:** NameFi, InitQuest, Arcana, Sui Jarvis, Watchdog, Pantheon, and onboarding-oriented consumer projects across Initia and Sui.
- **Core primitive:** Reduce the first successful action to a discoverable, guided flow.
- **Why it won:** Product completeness and usability made unfamiliar infrastructure approachable.
- **Adaptation axis:** Turn a package name, repository URL, or lockfile upload into the single entry point, then reveal graph depth progressively.
- **Hack Hydra remix:** A judge should reach a real blast-radius answer without learning Cypher, while an expert can open the exact query and path evidence.

### 22. Community Proof and Shipping Momentum `[CROSS-POLLINATION]`

- **Sources:** Mantle community-voting winners, Mantle's 20 recognized live deployments, ZW.ARM's 450 transactions, and deployed ETHGlobal finalists.
- **Core primitive:** Real usage, repeated execution, or accessible deployment acts as evidence of completeness.
- **Why it won:** "Running now" outweighed speculative roadmap claims.
- **Adaptation axis:** Seed a reproducible dependency corpus and process real advisories. Capture query receipts, latency, path counts, and before/after repair evidence.
- **Hack Hydra remix:** The demo should query a running self-hosted HydraDB instance and show the Cypher and result, not a prerecorded fake graph animation.

## Strongest Cross-Family Combinations for Track 02-A

These are remix prompts, not preselected ideas.

1. **Reachability + honest evidence:** Native path traversal returns `DIRECT` or `TRANSITIVE` findings with provenance per edge.
2. **Reachability + counterfactual simulation:** Remove or upgrade a package and prove which exposure paths disappear.
3. **Reachability + developer guardrail:** A CI gate blocks only when HydraDB finds a policy-violating path.
4. **Many-to-many evaluation + live operations:** A new advisory triggers portfolio-wide `algo.MSpaths` triage without client fan-out.
5. **Temporal state + provenance:** Compare incident-time exposure against current exposure and show which commit closed each path.
6. **Scarcity mechanic + routing:** Given limited remediation capacity, find the smallest change set that protects the most repositories.
7. **First-session wow + reusable primitive:** The same graph service powers an animated web experience and a one-command CLI consumer.

## Winning Patterns: Always Include

1. **One novel mechanic, deeply explored:** Depth beats a list of integrations.
2. **Demo is the product:** The judge experiences the traversal and consequence live.
3. **Ecosystem-native:** Here, graph-native replaces chain-native. Remove HydraDB and the product breaks.
4. **Live and producing value:** A real advisory changes a real dependency graph and produces a real result.
5. **AI plus accountable execution where useful:** AI may explain or normalize inputs, but it cannot replace graph truth.
6. **Privacy or security as the core mechanic:** For Track 02-A, security is the user outcome. Privacy applies only to naturally private topology.

## Anti-Patterns: Always Exclude

1. **Infrastructure that only enables:** A graph SDK without a live blast-radius consumer is incomplete.
2. **Breadth without depth:** npm plus PyPI plus Maven plus connectors is weaker than one exact ecosystem with excellent evidence.
3. **Responsible engineering without novelty:** A polished vulnerability dashboard is not enough if it performs no new graph-native work.
4. **Bottom-up building:** Start with the compromise-to-impact demo, then build only what proves it.
5. **Synthetic economics:** Tokens, staking, or marketplaces do not make dependency analysis innovative.
6. **HydraDB as storage:** Generic scanning plus graph-shaped persistence fails the load-bearing removal test.
7. **Hosted SDK only:** Connector ingestion, hidden graph retrieval, or embeddings plus cosine similarity cannot be the core.
8. **LLM-authored blast radius:** Models may parse or explain, but path membership must come from deterministic HydraDB traversal.
9. **Static graph theater:** A visual graph with hard-coded affected nodes is not evidence.
10. **Unbounded scope:** Cross-registry ingestion, exploit prediction, private enterprise deployment, and autonomous patching cannot all fit the sprint.

## Gate-Only Prior Project Appendix

> **GATE-ONLY:** Never include this section, its names, or its collision framing in generator prompts. Reveal it only after raw ideas are durably recorded. The source catalog labels these as Dami's own shipped projects; current in-flight status must be checked separately during Gate 4a.

| Prior project | Reserved mechanism surface |
|---|---|
| Veil | ZK cross-chain lending |
| AlphaAttest | AI signal marketplace |
| triage-0 / Aegis | Offline clinical decision support |
| AgentTreasury | Self-funding agent |
| DLAD | FHE activation |
| ShadowDesk+ | Confidential trading |
| Omnispect-X | Agent trust scoring |
| RefiRail | Atomic refinance |
| 0g-sentinel | Dual audit |
| Backstop | Transaction co-signer |
| SomniaFlow | Multi-agent orchestration |
| VaraCore | Agent trust infrastructure |
| Verdikt / Verdikt-arc | Settlement court |
| solv-001 | For-hire agent |
| Mirror | Self-checkpointing indexer |
| 9ncore | FHE lending |
| AgentMesh | Peer-to-peer audit mesh |
| GhostPay | Payment streaming |
| Axon | Trading terminal |
| GhostFund | Private yield vault |
| DeepRock | Real-world asset platform |

### Gate 4a Use

- Kill a candidate that repeats one of these mechanisms with only a new database, registry, chain, or interface.
- A supply-chain graph is not automatically a repeat. Kill only when its load-bearing mechanism is substantively the same.
- Check sibling working directories and active project state for in-flight duplicates before selection. An in-flight duplicate is killed regardless of platform.
- If one mechanism cluster reaches 25 percent of the surviving pool, compare the entire cluster against shipped and in-flight work before scoring.

## Catalog Coverage Notes

- **Included result-bearing families:** ETHGlobal Open Agents, 0G APAC, Sui x OpenClaw, Somnia Agentathon, Arbitrum Open House, Zama FHEVM Builder Track, Solana Frontier, Arc / Circle, Zama developer programs, Sui Overflow, Mantle, Pacifica, Avalanche Build Games, Avalanche LatAm Institucional, and Initia INITIATE.
- **Included as evidence but not counted as named winners:** Vara A2A, Stellar Real-World ZK, QVAC Unleash Edge AI, CoinMarketCap / BNB Hack, unnamed award cohorts, and incomplete official result sets.
- **Placement count method:** Counted every explicitly named project occurrence in the catalog, including repeat placements, because the sheet calibrates winning evidence rather than unique teams.
- **No novelty claim:** This deck records reusable mechanisms. Any candidate's novelty must be checked against current products, competitors, and the full catalog during synthesis and fact-checking.
