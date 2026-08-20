# HydraCut Forensic Graph Atlas Design

## Decision

HydraCut will use a forensic graph atlas identity: an evidence-led dependency operations workspace built around real paths, immutable inputs, and bounded conclusions. The interface should feel like a precise technical instrument, not a generic SaaS dashboard or an AI product.

The user delegated the final direction after requiring a non-purple palette, non-generic typography, real product research, complete page coverage, coherent flow, disciplined formatting, strong containers, exact alignment, and purposeful animation.

## Approaches Considered

### 1. Forensic Graph Atlas (selected)

A warm graphite drafting surface combines compact operational navigation, editorial hierarchy, and a graph workspace that behaves like evidence. Signal vermilion marks the active path and selected intervention.

Strengths:

- Makes HydraDB traversal the visual and technical center.
- Supports dense security evidence without looking like a terminal theme.
- Creates a distinctive visual identity that scales from triage to receipt.
- Separates active actions, warnings, failures, and verified proof cleanly.

Tradeoff: requires careful graph and data-density design on every breakpoint.

### 2. Incident Command Terminal

A high-density mono-first interface with strong status bands and compressed tables.

Strengths: fast scanning and operational urgency.

Tradeoff: visually familiar, less editorial, and too close to a generic hacker terminal. It also weakens long-form evidence readability.

### 3. Evidence Ledger

A light editorial system modeled on audit reports and technical publishing.

Strengths: excellent trust, provenance, and receipt readability.

Tradeoff: the graph feels secondary, and operational incident response loses urgency.

## Visual Identity

World statement: HydraCut lives in a forensic graph operations room where every dependency path is handled like evidence on a dark drafting table.

Signature element: the cut line. A single signal-vermilion traversal line connects source, dependency witness, application, proposed fix, and final receipt across the product. It is always data-backed and never decorative.

Palette:

- Canvas: warm graphite `#0C0E0F`.
- Surface 1: `#111416`.
- Surface 2: `#171B1E`.
- Surface 3: `#1D2226`.
- Line: mineral gray with restrained opacity.
- Primary text: warm white, not pure white.
- Muted text: cool stone gray with accessible contrast.
- Brand accent: signal vermilion `#F15A3C`.
- Semantic colors remain separate: green for verified, amber for bounded warning, red for failure, blue-gray for neutral information.

Background:

- Fine drafting grid at very low contrast.
- Subtle paper grain below 0.08 opacity.
- Sparse graph-line traces only where they represent workflow or data.
- No gradient blobs, star fields, glass clouds, or full-black void.

Typography:

- Display: IBM Plex Sans Condensed for route titles, section markers, and high-value metrics.
- Body: IBM Plex Sans for readable dense interface copy.
- Evidence: IBM Plex Mono for hashes, package coordinates, timestamps, Cypher, digests, and immutable identifiers.
- Numeric values use tabular figures.
- Long digests wrap or truncate with an explicit copy control. They never force horizontal overflow.

## Layout System

Desktop shell:

- 248px collapsible left rail.
- 12-column content grid with a 1440px maximum working width.
- 24px page gutters at standard desktop, 32px on wide screens.
- Persistent context bar for active role, incident, application, scope, plan, and receipt.
- Main surfaces align to one grid. No card may drift from the shared column edges.

Tablet shell:

- Compact icon and label rail.
- Content uses an 8-column grid.
- Secondary evidence moves into a resizable or collapsible inspector.

Mobile shell:

- Compact top identity bar and four-item bottom navigation.
- Route title and workflow progress stay above content.
- Dense tables become structured evidence cards, never clipped tables.
- Digests, package coordinates, and queries wrap safely.
- Primary action remains reachable without covering content.

Container rules:

- Radius scale: 4px, 8px, and 12px only.
- Evidence trays use thin borders and inset tonal separation, not drop-shadow card soup.
- Nested surfaces reduce radius and padding as depth increases.
- Pills are reserved for compact status and filters.
- Every box must have one purpose: summary, action, evidence, inspector, or warning.

## Global Information Architecture

Primary navigation groups the product by job:

1. Respond: Incidents.
2. Investigate: Graph and Portfolio.
3. Ingest: Imports and Jobs.
4. Prove: Proof receipts.
5. Operate: System.

The incident workflow uses a persistent progression rail:

1. Baseline.
2. Impact.
3. Proposed fixes.
4. Coverage plan.
5. Combined proof.
6. Receipt.

Role switching changes emphasis without changing truth or losing incident, application, scope, plan, receipt, history, or focus context.

## Route-by-Route Design

### `/`: Product entry

Purpose: orient the operator and make the real workflow immediately obvious.

Design:

- A concise statement explains that HydraCut verifies bounded dependency exposure and authentic proposed-fix outcomes.
- A live evidence ribbon shows the verified corpus scale and receipt digest from real persisted data.
- The graph money shot shows source versions flowing through dependency witnesses into applications, then through selected fixes into the final bounded result.
- Primary action opens the incident command. Secondary action opens the immutable receipt.
- No marketing illustration or unsupported claim.

### `/incidents`: Action-first incident command

Purpose: answer what requires action now.

Design:

- Compact operational header with role view and freshness status.
- Priority summary shows actionable, verified, partial, unknown, and production-exposed counts.
- Incident queue uses a strong selected row, consistent numeric columns, restrained evidence tags, and a right-side preview on wide screens.
- Filters cover state, scope, KEV, EPSS, CVSS, application, and proposed-fix availability.
- Mobile uses evidence cards with the same ordering and context.

### `/incidents/[incidentId]`: Incident dossier

Purpose: establish the advisory, exact source coordinates, bounded claims, and workflow state.

Design:

- Two-column dossier: narrative and actions on the left, provenance inspector on the right.
- Header binds incident, package version, freshness, state, and scope.
- Vulnerability evidence uses labeled facts rather than raw paragraph dumps.
- The active workflow stepper leads to Impact, Proposed Fixes, and Plan.
- Raw source details remain available through disclosures without dominating the first scan.

### `/incidents/[incidentId]/impact`: CampaignRadius baseline

Purpose: show the native baseline exposure and its evidence bounds.

Design:

- Graph workspace is the hero: exact source nodes on the left, typed dependency witnesses in the center, applications on the right.
- The selected cut line uses signal vermilion. Verified nodes and bounds use semantic colors.
- Pair summary and bound metrics sit above the graph.
- The canonical source-to-application pair table remains directly below or beside the graph.
- Raw `algo.MSpaths`, epoch, bookmark, result limit, and digest appear in an evidence inspector.

### `/incidents/[incidentId]/proposed-fixes`: Authentic proposed-fix evaluation

Purpose: compare real immutable states without generating a fix.

Design:

- Discovery and exact-ref import form one compact command strip.
- Each proposed fix is an evidence row with origin, actor, commit, lock hash, change counts, and evaluation state.
- Removed, persistent, introduced, and unknown findings use comparable small multiples.
- A before and after dependency mini-map appears only when backed by real extracted graphs.
- Unsupported or partial states replace positive language with a clear refusal panel.

### `/incidents/[incidentId]/plan`: Coverage planning

Purpose: select a bounded intervention under explicit constraints.

Design:

- Coverage matrix remains canonical but gains fixed identifiers, aligned numeric columns, and a sticky constraint header.
- A right-side plan summary explains selection, coverage, repository churn, and residual pairs.
- Required, optional, and forbidden controls have distinct shapes and accessible labels.
- The selected plan visually joins proposed fixes to affected applications using real coverage edges.
- The next action states clearly that selection predicts coverage and does not prove the final graph.

### `/plans/[planId]/verify`: Final combined proof

Purpose: run one fresh native traversal against the combined proposed-fix graph.

Design:

- Before and after graph panels share the same coordinates to make change legible.
- Job phases appear as a vertical evidence timeline with real states and timestamps.
- Metrics separate selected-incident `3 to 0` from wider verification-universe `9 to 6` evidence.
- Failure and partial outcomes replace the success panel rather than coexisting with it.
- Completion reveals the immutable receipt action.

### `/proof`: Receipt index

Purpose: make completed proof discoverable and auditable.

Design:

- Receipt rows show result state, incident, created time, baseline and final counts, and digest.
- Filters cover result state and date.
- Each row has a copyable short digest and a direct open action.
- Empty state explains exactly which proof gates must complete before a receipt exists.

### `/proof/[digest]`: Immutable receipt

Purpose: present a complete proof without overwhelming the first scan.

Design:

- Receipt masthead shows bounded conclusion, digest, timestamp, and export controls.
- A compact proof summary binds immutable inputs, baseline, selected plan, final traversal, and limitations.
- Evidence sections use a left-side receipt index and focused main pane on desktop.
- Long queries, hashes, and JSON live in purpose-built code containers with copy controls and safe wrapping.
- Limitations remain prominent and never appear below a false universal-safety claim.

### `/graph`: Context-bound graph explorer

Purpose: inspect one real source-to-application witness without inventing topology.

Design:

- Full graph canvas with a collapsible legend and evidence inspector.
- Breadcrumb preserves incident, scope, source, and application context.
- Selecting a node reveals immutable identifiers and typed relationships.
- Empty state routes the user back to a verified impact pair.

### `/portfolio`: Immutable application portfolio

Purpose: show what applications and exact snapshots are within bounds.

Design:

- Portfolio summary shows applications, package instances, edges, depth, and snapshot freshness.
- Application rows expose repository, commit, lock hash, package count, edge count, and role ownership.
- A compact dependency-density visualization supports scanning but does not replace exact counts.
- Selecting an application preserves context when navigating to incidents.

### `/imports`: Safe ingestion

Purpose: import an exact public ref or local manifest and lockfile without repository execution.

Design:

- Two clearly separated source modes with one shared evidence contract.
- Security boundary copy is visible before file or ref submission.
- Form labels, accepted formats, byte limits, and immutable-resolution behavior are explicit.
- Submission creates a job and shows the next destination.
- Errors identify the failing evidence stage without revealing secrets.

### `/jobs/[jobId]`: Durable job evidence

Purpose: show ingestion, traversal, discovery, and proof progress honestly.

Design:

- Job header shows type, state, duration, and immutable key.
- Timeline groups phases into queued, running, completed, refused, or failed states.
- Each event exposes concise detail first and structured raw evidence on demand.
- Motion is limited to the active phase and stops immediately under reduced-motion settings.

### `/system`: Runtime evidence

Purpose: prove the self-hosted stack and operator boundary without exposing secrets.

Design:

- Service topology diagram shows web, worker, PostgreSQL, and private HydraDB.
- Health cards distinguish ready, degraded, and unavailable.
- HydraDB image digest, graph mode, OpenCypher path, and private-port boundary are visible.
- Raw facts remain copyable in an evidence container.

## Components and Data Formatting

Shared primitives:

- App shell, grouped navigation, context bar, workflow stepper, evidence tray, status lozenge, metric tile, data table, graph canvas, evidence inspector, command strip, job timeline, receipt masthead, code block, copy control, and refusal panel.
- All components derive from tokens. No ad hoc radii, shadows, colors, or spacing.
- Status labels always pair color with text and shape.
- Tables use tabular figures, aligned units, sticky headers when useful, and keyboard-focusable horizontal regions.
- Timestamps use one displayed timezone with accessible exact values.
- Hashes show a short form with copy and reveal actions, while immutable exports retain full values.
- Package coordinates never break at ambiguous separators.

Imagery:

- Use only real data diagrams, graph witnesses, evidence thumbnails, and export previews.
- No stock photography and no generated decorative hero art.
- The logo must remain geometric, legible at 16px, and connected to the cut-line identity.

## Motion

Motion vocabulary:

- Route continuity: 140ms opacity and 4px translation.
- Graph traversal: edges reveal in path order, then settle. Maximum 600ms for a bounded witness.
- Job progress: active phase uses a restrained moving rule, not a spinner wall.
- Status changes: one brief border and label transition.
- Disclosure panels: height and opacity transition under 180ms.
- No continuous ambient animation.
- `prefers-reduced-motion` disables all nonessential movement.

## State Coverage

Every route must specify and verify:

- Loading.
- Empty.
- Ready.
- Selected or active.
- Partial or unknown.
- Error or refused.
- Verified within bounds where applicable.
- Stale evidence where applicable.

No failed or partial state may retain verified wording, success color, or a receipt action.

## Responsive and Accessibility Contract

- Desktop and mobile screenshots are required for every route.
- Keyboard navigation covers shell, filters, tables, disclosures, graph selection, and actions.
- Focus rings use the brand accent with sufficient offset and contrast.
- Text and essential controls meet WCAG AA contrast.
- Color is never the sole state carrier.
- Graph evidence has a table or ordered witness equivalent.
- Touch targets meet 44px minimum where practical.
- Mobile navigation never overlays receipt content or primary actions.

## Verification

- Cross-check all routes against `FEATURE-OBSERVABLES.md`.
- Preserve the complete approved Forge scope and all authentic evidence boundaries.
- Run typecheck, production build, relevant tests, craft audit, route screenshots, responsive checks, accessibility checks, and persona critique.
- Compare before and after screenshots for hierarchy, overflow, route completeness, and graph prominence.
- Do not mark Design Forge complete while any route is visually unfinished, any user-facing observable is unreachable, or any critical or major craft issue remains.
