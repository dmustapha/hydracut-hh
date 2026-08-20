// File: src/db/repository.ts
import { and, desc, eq, gt, inArray, ne } from "drizzle-orm";
import { db } from "./client";
import { canonicalDigest } from "../domain/canonical";
import { solveCoveragePlan } from "../domain/planner";
import {
  advisories,
  auditEvents,
  findings,
  incidents,
  jobs,
  phaseEvents,
  plans,
  portfolios,
  proposedFixes,
  receipts,
  snapshots,
  sourceCache,
} from "./schema";
import type {
  AdvisoryEvidence,
  CanonicalReceipt,
  PortfolioPlan,
  ProposedFix,
  ProposedFixOutcome,
  ResultState,
  Scope,
  TraversalReceipt,
  ExploitationEvidence,
  JobResult,
} from "../domain/types";

export async function saveSnapshot(row: typeof snapshots.$inferInsert): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(snapshots).values(row).onConflictDoNothing();
    if (row.role !== "current") return;
    await tx.update(snapshots).set({ role: "historical" }).where(and(
      eq(snapshots.portfolioKey, row.portfolioKey),
      eq(snapshots.repository, row.repository),
      eq(snapshots.role, "current"),
      ne(snapshots.key, row.key),
    ));
    await tx.update(snapshots).set({ role: "current" }).where(eq(snapshots.key, row.key));
  });
  const stored = (await db.select().from(snapshots).where(eq(snapshots.key, row.key)).limit(1))[0];
  const immutable = (value: typeof snapshots.$inferInsert | typeof snapshots.$inferSelect) => ({
    key: value.key, portfolioKey: value.portfolioKey, repository: value.repository, commitSha: value.commitSha,
    manifestSha256: value.manifestSha256, lockfileSha256: value.lockfileSha256,
    extractionSha256: value.extractionSha256, packageCount: value.packageCount, edgeCount: value.edgeCount,
    maxDepth: value.maxDepth,
  });
  if (!stored || canonicalDigest(immutable(stored)) !== canonicalDigest(immutable(row))) {
    throw new Error("SNAPSHOT_INSERT_CONFLICT");
  }
}

export async function ensurePortfolio(key: string, name = key): Promise<void> {
  await db.insert(portfolios).values({ key, name }).onConflictDoNothing();
}

export async function findIncident(key: string) {
  const rows = await db.select().from(incidents).where(eq(incidents.key, key)).limit(1);
  return rows[0] ?? null;
}

export async function listIncidents() {
  return db.select().from(incidents).orderBy(incidents.createdAt);
}

export async function invalidatePortfolioIncidents(portfolioKey: string): Promise<void> {
  await db.transaction(async (tx) => {
    const rows = await tx.select({ key: incidents.key }).from(incidents).where(eq(incidents.portfolioKey, portfolioKey));
    const keys = rows.map((row) => row.key);
    await tx.update(incidents).set({ state: "UNKNOWN", baseline: null, verificationBaseline: null,
      verificationSourceCoordinates: [] }).where(eq(incidents.portfolioKey, portfolioKey));
    if (!keys.length) return;
    await tx.update(proposedFixes).set({ state: "UNKNOWN" }).where(inArray(proposedFixes.incidentKey, keys));
    await tx.update(plans).set({ state: "FAILED" }).where(inArray(plans.incidentKey, keys));
  });
}

export async function listPortfolioSnapshots(portfolioKey: string) {
  return db.select().from(snapshots).where(and(eq(snapshots.portfolioKey, portfolioKey), eq(snapshots.role, "current")))
    .orderBy(snapshots.repository, snapshots.key);
}

export async function findSnapshot(key: string) {
  return (await db.select().from(snapshots).where(eq(snapshots.key, key)).limit(1))[0] ?? null;
}

export async function saveAdvisoryVersion(key: string, evidence: AdvisoryEvidence, exploitation: ExploitationEvidence): Promise<void> {
  await db.insert(advisories).values({ key, osvId: evidence.osvId, payloadSha256: evidence.source.payloadSha256, evidence, exploitation, retrievedAt: new Date(evidence.source.retrievedAt) }).onConflictDoNothing();
}

export async function saveFinding(row: typeof findings.$inferInsert): Promise<void> {
  await db.insert(findings).values(row).onConflictDoNothing();
}

export async function loadFindings(keys: string[]) {
  return keys.length ? db.select().from(findings).where(inArray(findings.key, keys)) : [];
}

export async function loadIncidentBundle(key: string) {
  const incident = await findIncident(key);
  if (!incident) throw new Error("INCIDENT_NOT_FOUND");
  const findingRows = await loadFindings(incident.sourceFindingKeys);
  const advisoryKeys = [...new Set(findingRows.map((row) => row.advisoryKey))];
  const advisoryRows = advisoryKeys.length
    ? await db.select().from(advisories).where(inArray(advisories.key, advisoryKeys))
    : [];
  const snapshotRows = await listPortfolioSnapshots(incident.portfolioKey);
  return { incident, findings: findingRows, advisories: advisoryRows, snapshots: snapshotRows };
}

export async function loadPlanBundle(key: string) {
  const plan = await findPlan(key);
  if (!plan) throw new Error("PLAN_NOT_FOUND");
  const fixRows = plan.proposedFixKeys.length
    ? await db.select().from(proposedFixes).where(inArray(proposedFixes.key, plan.proposedFixKeys))
    : [];
  const incident = await loadIncidentBundle(plan.incidentKey);
  return { plan, fixes: fixRows, ...incident };
}

export async function saveIncident(row: typeof incidents.$inferInsert): Promise<void> {
  await db.insert(incidents).values(row).onConflictDoUpdate({ target: incidents.key, set: {
    title: row.title,
    sourceFindingKeys: row.sourceFindingKeys,
    scopes: row.scopes,
    state: "UNKNOWN",
    baseline: null,
    verificationSourceCoordinates: [],
    verificationBaseline: null,
  } });
}

export async function saveIncidentBaseline(key: string, baseline: TraversalReceipt, verificationBaseline: TraversalReceipt,
  scopes: Scope[], verificationSourceCoordinates: string[]): Promise<void> {
  const changed = await db.update(incidents).set({ baseline, verificationBaseline, scopes,
    verificationSourceCoordinates: [...verificationSourceCoordinates].sort(),
    state: baseline.state === "VERIFIED_WITHIN_BOUNDS" && verificationBaseline.state === "VERIFIED_WITHIN_BOUNDS"
      ? "VERIFIED_WITHIN_BOUNDS" : "PARTIAL" }).where(eq(incidents.key, key)).returning({ key: incidents.key });
  if (changed.length !== 1) throw new Error("INCIDENT_STATE_WRITE_MISMATCH");
}

export async function saveProposedFix(
  fix: ProposedFix,
  incidentKey: string,
  outcome: ProposedFixOutcome,
  baseline: { pairDigest: string; snapshotKeys: string[] },
): Promise<void> {
  await db.insert(proposedFixes).values({
    key: fix.key,
    incidentKey,
    repository: fix.repository,
    origin: fix.origin,
    outcome,
    sourceUrl: fix.sourceUrl,
    headSha: fix.headSha,
    discoveryEvidence: fix.discoveryEvidence,
    manifestSha256: fix.manifestSha256,
    lockfileSha256: fix.lockfileSha256,
    snapshotKey: fix.snapshotKey,
    baselinePairDigest: baseline.pairDigest,
    baselineSnapshotKeys: [...baseline.snapshotKeys].sort(),
    state: fix.state,
  }).onConflictDoNothing();
}

export async function listProposedFixes(incidentKey: string) {
  return db.select().from(proposedFixes).where(eq(proposedFixes.incidentKey, incidentKey))
    .orderBy(proposedFixes.repository, proposedFixes.key);
}

export async function savePlan(plan: PortfolioPlan, manualOverride = false): Promise<void> {
  await db.insert(plans).values({
    key: plan.key,
    incidentKey: plan.incidentKey,
    proposedFixKeys: plan.proposedFixKeys,
    baselinePairKeys: plan.baselinePairKeys,
    baselineSnapshotKeys: plan.baselineSnapshotKeys,
    verificationSourceCoordinates: plan.verificationSourceCoordinates,
    verificationBaselinePairKeys: plan.verificationBaselinePairKeys,
    scopes: plan.scopes,
    constraints: plan.constraints,
    predictedResidual: plan.predictedResidualPairKeys,
    exhaustiveWithinBounds: plan.exhaustiveWithinBounds,
    state: plan.state,
    manualOverride,
  }).onConflictDoNothing();
}

export async function saveReceipt(
  digest: string,
  receipt: CanonicalReceipt,
  canonicalJson: string,
): Promise<void> {
  if (receipt.resultState !== "VERIFIED_WITHIN_BOUNDS" || receipt.final.state !== "VERIFIED_WITHIN_BOUNDS") {
    throw new Error("RECEIPT_NOT_VERIFIED");
  }
  await db.insert(receipts).values({
    digest,
    schemaVersion: receipt.schemaVersion,
    resultState: receipt.resultState,
    receipt,
    canonicalJson,
    supersedes: receipt.supersedes,
  }).onConflictDoNothing();
  const stored = await findReceipt(digest);
  if (!stored || stored.canonicalJson !== canonicalJson) throw new Error("RECEIPT_INSERT_CONFLICT");
}

export async function findReceipt(digest: string) {
  const rows = await db.select().from(receipts).where(and(
    eq(receipts.digest, digest),
    eq(receipts.resultState, "VERIFIED_WITHIN_BOUNDS"),
  )).limit(1);
  return rows[0] ?? null;
}

export async function listReceipts() {
  return db.select().from(receipts).where(eq(receipts.resultState, "VERIFIED_WITHIN_BOUNDS"))
    .orderBy(desc(receipts.createdAt)).limit(100);
}

export async function findPlan(key: string) {
  return (await db.select().from(plans).where(eq(plans.key, key)).limit(1))[0] ?? null;
}

export async function findLatestPlanForIncident(incidentKey: string) {
  return (await db.select().from(plans).where(eq(plans.incidentKey, incidentKey)).orderBy(desc(plans.createdAt)).limit(1))[0] ?? null;
}

export async function findJob(jobId: string) {
  const request = (await db.select().from(jobs).where(eq(jobs.key, jobId)).limit(1))[0];
  if (!request) return null;
  const events = await db.select().from(phaseEvents)
    .where(eq(phaseEvents.jobId, jobId)).orderBy(desc(phaseEvents.sequence));
  return { ...request, latest: events[0] ?? null, events: [...events].reverse() };
}

export async function registerJob(input: typeof jobs.$inferInsert): Promise<boolean> {
  const inserted = await db.insert(jobs).values(input).onConflictDoNothing().returning({ key: jobs.key });
  if (inserted.length) return true;
  const existing = (await db.select().from(jobs).where(and(eq(jobs.queue, input.queue),
    eq(jobs.idempotencyKey, input.idempotencyKey))).limit(1))[0];
  if (!existing || existing.inputDigest !== input.inputDigest) throw new Error("IDEMPOTENCY_INPUT_DRIFT");
  return false;
}

export async function attachBrokerJob(key: string, brokerId: string): Promise<void> {
  const changed = await db.update(jobs).set({ brokerId, state: "QUEUED", updatedAt: new Date() })
    .where(and(eq(jobs.key, key), eq(jobs.state, "CREATING"))).returning({ key: jobs.key });
  if (changed.length !== 1) throw new Error("JOB_QUEUE_STATE_MISMATCH");
}

export async function markJobState(key: string, state: "RUNNING" | "COMPLETE" | "FAILED", errorCode?: string, result?: JobResult): Promise<void> {
  await db.update(jobs).set({ state, ...(errorCode ? { errorCode } : {}), ...(result ? { result } : {}), updatedAt: new Date() })
    .where(eq(jobs.key, key));
}

export async function loadIncidentImpact(key: string) {
  const incident = await findIncident(key);
  return incident?.baseline ? { incidentKey: key, baseline: incident.baseline, verificationBaseline: incident.verificationBaseline ?? null } : null;
}

export async function loadSystemFacts() {
  const [snapshotRows, advisoryRows, findingRows, cacheRows, jobRows, auditRows] = await Promise.all([
    db.select({ key: snapshots.key }).from(snapshots),
    db.select({ key: advisories.key }).from(advisories),
    db.select({ key: findings.key }).from(findings),
    db.select({ source: sourceCache.source, freshUntil: sourceCache.freshUntil, stamps: sourceCache.stamps }).from(sourceCache),
    db.select({ key: jobs.key, state: jobs.state }).from(jobs),
    db.select({ id: auditEvents.id }).from(auditEvents),
  ]);
  return {
    graphNamespace: process.env.HYDRADB_GRAPH_NAMESPACE ?? "default",
    graphImageDigest: "sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709",
    graphSchemaVersion: "1.0.0",
    snapshots: snapshotRows.length,
    advisoryVersions: advisoryRows.length,
    findings: findingRows.length,
    jobs: { total: jobRows.length, failed: jobRows.filter((row) => row.state === "FAILED").length },
    auditEvents: auditRows.length,
    sourceFreshness: cacheRows.map((row) => ({ source: row.source, freshUntil: row.freshUntil.toISOString(),
      stale: row.freshUntil.getTime() <= Date.now(), latest: row.stamps.at(-1) ?? null })),
    limits: { mutationPerMinute: 10, importConcurrency: 4, listRows: 100, uploadBytesPerFile: 10 * 1024 * 1024 },
    requiredSecretNames: ["DATABASE_URL_FILE", "HYDRADB_TOKEN_FILE", "APP_OPERATOR_TOKEN"],
    singleOperator: true,
  };
}

export async function listIncidentQueue() {
  const rows = await listIncidents();
  const findingKeys = [...new Set(rows.flatMap((incident) => incident.sourceFindingKeys))];
  const findingRows = await loadFindings(findingKeys);
  const advisoryKeys = [...new Set(findingRows.map((row) => row.advisoryKey))];
  const incidentKeys = rows.map((row) => row.key);
  const [advisoryRows, fixRows] = await Promise.all([
    advisoryKeys.length ? db.select().from(advisories).where(inArray(advisories.key, advisoryKeys)) : [],
    incidentKeys.length ? db.select().from(proposedFixes).where(inArray(proposedFixes.incidentKey, incidentKeys)) : [],
  ]);
  const findingsByKey = new Map(findingRows.map((row) => [row.key, row]));
  const advisoriesByKey = new Map(advisoryRows.map((row) => [row.key, row]));
  return rows.map((incident) => {
    const finding = incident.sourceFindingKeys.map((key) => findingsByKey.get(key)).find(Boolean);
    const evidence = finding ? advisoriesByKey.get(finding.advisoryKey) : undefined;
    const fixes = fixRows.filter((fix) => fix.incidentKey === incident.key);
    return { key: incident.key, portfolioKey: incident.portfolioKey, title: incident.title, packageVersion: evidence ? `${evidence.evidence.packageName}@${evidence.evidence.exactVersion}` : "UNKNOWN",
      kev: evidence?.exploitation.kev ?? "UNKNOWN", epss: evidence?.exploitation.epssProbability ?? "UNKNOWN",
      cvss: evidence?.evidence.cvssScore ?? null,
      applicationKeys: [...new Set(incident.baseline?.pairs.map((pair) => pair.applicationKey) ?? [])].sort(),
      productionApplications: new Set(incident.baseline?.pairs.filter((pair) => pair.scopes.includes("production")).map((pair) => pair.applicationKey) ?? []).size,
      allApplications: new Set(incident.baseline?.pairs.map((pair) => pair.applicationKey) ?? []).size,
      proposedFixes: fixes.filter((fix) => fix.state === "VERIFIED_WITHIN_BOUNDS").length,
      state: incident.state, freshness: evidence?.evidence.source.retrievedAt ?? "UNKNOWN" };
  });
}

export async function createPlanForIncident(
  incidentKey: string,
  input: { proposedFixKeys: string[]; requiredFixKeys: string[]; forbiddenFixKeys: string[]; maxRepositoryChanges?: number },
): Promise<PortfolioPlan> {
  const incident = await findIncident(incidentKey);
  if (!incident?.baseline || incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS" ||
    !incident.verificationBaseline || incident.verificationBaseline.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("BASELINE_NOT_VERIFIED");
  const rows = await listProposedFixes(incidentKey);
  const baselinePairKeys = incident.baseline.pairs.map((pair) => `${pair.sourceKey}:${pair.applicationKey}`).sort();
  const baselineSnapshotKeys = (await listPortfolioSnapshots(incident.portfolioKey)).map((row) => row.key).sort();
  const selected = rows.filter((row) => input.proposedFixKeys.includes(row.key));
  if (selected.length !== new Set(input.proposedFixKeys).size) throw new Error("UNKNOWN_PROPOSED_FIX");
  if (selected.some((row) => row.state !== "VERIFIED_WITHIN_BOUNDS")) throw new Error("PROPOSED_FIX_NOT_VERIFIED");
  if (selected.some((row) => row.baselinePairDigest !== canonicalDigest(baselinePairKeys) ||
    canonicalDigest(row.baselineSnapshotKeys) !== canonicalDigest(baselineSnapshotKeys))) throw new Error("PROPOSED_FIX_BASELINE_STALE");
  const plan = solveCoveragePlan({
    incidentKey,
    baselinePairs: baselinePairKeys,
    baselineSnapshotKeys,
    verificationSourceCoordinates: incident.verificationSourceCoordinates,
    verificationBaselinePairKeys: incident.verificationBaseline.pairs
      .map((pair) => `${pair.sourceKey}:${pair.applicationKey}`).sort(),
    scopes: incident.scopes as Scope[],
    productionPairs: new Set(incident.baseline.pairs.filter((pair) => pair.scopes.includes("production")).map((pair) => `${pair.sourceKey}:${pair.applicationKey}`)),
    choices: selected.map((row) => ({ fix: { key: row.key, repository: row.repository,
      origin: row.origin as ProposedFix["origin"], ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
      ...(row.headSha ? { headSha: row.headSha } : {}), manifestSha256: row.manifestSha256,
      ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}),
      lockfileSha256: row.lockfileSha256, snapshotKey: row.snapshotKey,
      changedPackageCount: row.outcome.changedPackageCount, state: row.state }, outcome: row.outcome })),
    constraints: { requiredFixKeys: input.requiredFixKeys, forbiddenFixKeys: input.forbiddenFixKeys,
      ...(input.maxRepositoryChanges === undefined ? {} : { maxRepositoryChanges: input.maxRepositoryChanges }) },
    maxStates: 10_000,
  });
  await savePlan(plan);
  await db.insert(auditEvents).values({ event: "PLAN_CREATED", subjectKey: plan.key, detail: { incidentKey, proposedFixKeys: plan.proposedFixKeys } });
  return plan;
}

export async function appendPhaseEvent(input: {
  jobId: string;
  sequence: number;
  phase: string;
  state: string;
  attempt: number;
  detail: Record<string, unknown>;
}): Promise<void> {
  await db.insert(phaseEvents).values(input).onConflictDoNothing();
}

export async function appendAuditEvent(event: string, subjectKey: string, detail: Record<string, unknown>): Promise<void> {
  await db.insert(auditEvents).values({ event, subjectKey, detail });
}

export async function findFreshSourceCache(source: string, requestDigest: string) {
  return (await db.select().from(sourceCache).where(and(eq(sourceCache.source, source),
    eq(sourceCache.requestDigest, requestDigest), gt(sourceCache.freshUntil, new Date()))).limit(1))[0] ?? null;
}

export async function saveSourceCache(row: typeof sourceCache.$inferInsert): Promise<void> {
  await db.insert(sourceCache).values(row).onConflictDoUpdate({ target: [sourceCache.source, sourceCache.requestDigest],
    set: { payloadSha256: row.payloadSha256, payload: row.payload, stamps: row.stamps, freshUntil: row.freshUntil } });
}

export function verifiedState(state: ResultState): boolean {
  return state === "VERIFIED_WITHIN_BOUNDS";
}
