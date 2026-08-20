// File: src/db/schema.ts
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type {
  AdvisoryEvidence,
  CanonicalReceipt,
  ExtractedSnapshot,
  ExploitationEvidence,
  PlanConstraints,
  ProposedFix,
  ProposedFixOutcome,
  RepositoryIdentity,
  Scope,
  SourceStamp,
  TraversalReceipt,
} from "../domain/types";

export const resultState = pgEnum("result_state", [
  "VERIFIED_WITHIN_BOUNDS",
  "PARTIAL",
  "UNKNOWN",
  "ERROR",
]);

export const portfolios = pgTable("portfolios", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const snapshots = pgTable(
  "snapshots",
  {
    key: text("key").primaryKey(),
    portfolioKey: text("portfolio_key").references(() => portfolios.key).notNull(),
    repository: text("repository").notNull(),
    role: text("role").$type<"current" | "proposed" | "historical">().notNull(),
    commitSha: text("commit_sha").notNull(),
    manifestSha256: text("manifest_sha256").notNull(),
    lockfileSha256: text("lockfile_sha256").notNull(),
    extractionSha256: text("extraction_sha256").notNull(),
    packageCount: integer("package_count").notNull(),
    edgeCount: integer("edge_count").notNull(),
    maxDepth: integer("max_depth").notNull(),
    topology: jsonb("topology").$type<ExtractedSnapshot>().notNull(),
    identity: jsonb("identity").$type<RepositoryIdentity>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("snapshot_content_identity").on(
      table.portfolioKey,
      table.repository,
      table.commitSha,
      table.manifestSha256,
      table.lockfileSha256,
    ),
    index("snapshot_portfolio").on(table.portfolioKey),
  ],
);

export const advisories = pgTable("advisories", {
  key: text("key").primaryKey(),
  osvId: text("osv_id").notNull(),
  payloadSha256: text("payload_sha256").notNull(),
  evidence: jsonb("evidence").$type<AdvisoryEvidence>().notNull(),
  exploitation: jsonb("exploitation").$type<ExploitationEvidence>().notNull(),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull(),
}, (table) => [uniqueIndex("advisory_version").on(table.osvId, table.payloadSha256)]);

export const findings = pgTable(
  "findings",
  {
    key: text("key").primaryKey(),
    snapshotKey: text("snapshot_key").references(() => snapshots.key).notNull(),
    packageKey: text("package_key").notNull(),
    advisoryKey: text("advisory_key").references(() => advisories.key).notNull(),
    state: resultState("state").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("finding_identity").on(table.snapshotKey, table.packageKey, table.advisoryKey),
  ],
);

export const incidents = pgTable("incidents", {
  key: text("key").primaryKey(),
  portfolioKey: text("portfolio_key").references(() => portfolios.key).notNull(),
  title: text("title").notNull(),
  sourceFindingKeys: jsonb("source_finding_keys").$type<string[]>().notNull(),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  baseline: jsonb("baseline").$type<TraversalReceipt>(),
  verificationSourceCoordinates: jsonb("verification_source_coordinates").$type<string[]>().notNull(),
  verificationBaseline: jsonb("verification_baseline").$type<TraversalReceipt>(),
  state: resultState("state").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const proposedFixes = pgTable(
  "proposed_fixes",
  {
    key: text("key").primaryKey(),
    incidentKey: text("incident_key").references(() => incidents.key).notNull(),
    repository: text("repository").notNull(),
    origin: text("origin").notNull(),
    sourceUrl: text("source_url"),
    headSha: text("head_sha"),
    discoveryEvidence: jsonb("discovery_evidence").$type<ProposedFix["discoveryEvidence"]>(),
    manifestSha256: text("manifest_sha256").notNull(),
    lockfileSha256: text("lockfile_sha256").notNull(),
    snapshotKey: text("snapshot_key").references(() => snapshots.key).notNull(),
    baselinePairDigest: text("baseline_pair_digest").notNull(),
    baselineSnapshotKeys: jsonb("baseline_snapshot_keys").$type<string[]>().notNull(),
    outcome: jsonb("outcome").$type<ProposedFixOutcome>().notNull(),
    state: resultState("state").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("proposed_fix_incident").on(table.incidentKey)],
);

export const plans = pgTable("plans", {
  key: text("key").primaryKey(),
  incidentKey: text("incident_key").references(() => incidents.key).notNull(),
  proposedFixKeys: jsonb("proposed_fix_keys").$type<string[]>().notNull(),
  baselinePairKeys: jsonb("baseline_pair_keys").$type<string[]>().notNull(),
  baselineSnapshotKeys: jsonb("baseline_snapshot_keys").$type<string[]>().notNull(),
  verificationSourceCoordinates: jsonb("verification_source_coordinates").$type<string[]>().notNull(),
  verificationBaselinePairKeys: jsonb("verification_baseline_pair_keys").$type<string[]>().notNull(),
  scopes: jsonb("scopes").$type<Scope[]>().notNull(),
  constraints: jsonb("constraints").$type<PlanConstraints>().notNull(),
  predictedResidual: jsonb("predicted_residual").$type<string[]>().notNull(),
  exhaustiveWithinBounds: boolean("exhaustive_within_bounds").notNull(),
  state: text("state").notNull(),
  manualOverride: boolean("manual_override").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const receipts = pgTable("receipts", {
  digest: text("digest").primaryKey(),
  schemaVersion: text("schema_version").notNull(),
  resultState: resultState("result_state").notNull(),
  receipt: jsonb("receipt").$type<CanonicalReceipt>().notNull(),
  canonicalJson: text("canonical_json").notNull(),
  supersedes: text("supersedes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sourceCache = pgTable(
  "source_cache",
  {
    source: text("source").notNull(),
    requestDigest: text("request_digest").notNull(),
    payloadSha256: text("payload_sha256").notNull(),
    payload: jsonb("payload").notNull(),
    stamps: jsonb("stamps").$type<SourceStamp[]>().notNull(),
    freshUntil: timestamp("fresh_until", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.source, table.requestDigest] })],
);

export const jobs = pgTable(
  "jobs",
  {
    key: text("key").primaryKey(),
    queue: text("queue").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    inputDigest: text("input_digest").notNull(),
    brokerId: text("broker_id"),
    state: text("state").$type<"CREATING" | "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED">().notNull(),
    errorCode: text("error_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("job_idempotency").on(table.queue, table.idempotencyKey)],
);

export const phaseEvents = pgTable(
  "phase_events",
  {
    jobId: text("job_id").notNull(),
    sequence: integer("sequence").notNull(),
    phase: text("phase").notNull(),
    state: text("state").notNull(),
    attempt: integer("attempt").notNull(),
    detail: jsonb("detail").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.jobId, table.sequence] })],
);

export const auditEvents = pgTable("audit_events", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  event: text("event").notNull(),
  actor: text("actor").default("single-operator").notNull(),
  subjectKey: text("subject_key").notNull(),
  detail: jsonb("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
