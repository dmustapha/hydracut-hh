import { canonicalDigest, sha256 } from "../domain/canonical";
import { finalizeReceipt } from "../domain/receipt";
import type {
  AdvisoryEvidence,
  CanonicalReceipt,
  ExposurePair,
  ExtractedSnapshot,
  PortfolioPlan,
  ProposedFix,
  ProposedFixDiscoveryEvidence,
  ProposedFixOutcome,
  RepositoryIdentity,
  Scope,
  SourceStamp,
} from "../domain/types";
import {
  appendAuditEvent,
  appendPhaseEvent,
  createPlanForIncident,
  findReceipt,
  findSnapshot,
  ensurePortfolio,
  invalidatePortfolioIncidents,
  listPortfolioSnapshots,
  listIncidents,
  loadIncidentBundle,
  loadPlanBundle,
  saveAdvisoryVersion,
  saveFinding,
  saveIncident,
  saveIncidentBaseline,
  saveProposedFix,
  saveReceipt,
  saveSnapshot,
} from "../db/repository";
import { extractSnapshot } from "../integrations/arborist";
import { discoverProposedFixes, fetchRepositoryFile, resolveCommit } from "../integrations/github";
import { enrichCve } from "../integrations/enrichment";
import { assertAdvisoryActive, fetchAdvisory, queryExactCoordinate, queryExactPackages, refreshSelectedAdvisory } from "../integrations/osv";
import {
  cleanupScenario,
  runTraversal,
  traversalBounds,
  writeApplicationRoot,
  writeScenario,
  writeSnapshot,
  verifySnapshotReadback,
} from "../integrations/hydradb";

type ImportPayload = {
  jobId: string;
  portfolioKey: string;
  role?: "current" | "proposed";
  expectedLockfileSha256?: string;
} & (
  | { kind: "github"; repository: string; ref: string }
  | { kind: "upload"; repository: string; manifestBase64: string; lockfileBase64: string }
);

interface VerifyPayload {
  jobId: string;
  receipt: Omit<CanonicalReceipt, "final">;
  plan: PortfolioPlan;
  scenarioKey: string;
  portfolioSelector: string;
  scopes: Scope[];
  applications: Array<{ applicationKey: string; snapshotKey: string }>;
  sources: Array<{ sourceKey: string; selector: string; packageKeys: string[] }>;
  maxImportedDepth: number;
  expectedPairKeyDigest: string;
}

type VerifyRequest = { jobId?: string; planKey: string; expectedPlanDigest: string };

async function phase(jobId: string, sequence: number, name: string, detail: Record<string, unknown> = {}): Promise<void> {
  await appendPhaseEvent({ jobId, sequence, phase: name, state: "COMPLETE", attempt: 1, detail });
}

function snapshotIdentity(repository: string, commitSha: string,
  manifest: { blobSha: string; sha256: string; bytes: Uint8Array; sourceStamp?: SourceStamp },
  lockfile: { blobSha: string; sha256: string; bytes: Uint8Array; sourceStamp?: SourceStamp },
  source: "github" | "upload", resolutionStamp?: SourceStamp): RepositoryIdentity {
  return { repository, commitSha, manifestBlobSha: manifest.blobSha, lockfileBlobSha: lockfile.blobSha,
    manifestSha256: manifest.sha256, lockfileSha256: lockfile.sha256, manifestBytes: manifest.bytes.length,
    lockfileBytes: lockfile.bytes.length, apiVersion: source === "github" ? "2026-03-10" : "local-upload-v1",
    source, sourceStamps: [resolutionStamp, manifest.sourceStamp, lockfile.sourceStamp]
      .filter((stamp): stamp is SourceStamp => Boolean(stamp)), retrievedAt: new Date().toISOString() };
}

function decodeUpload(value: string): { bytes: Uint8Array; sha256: string; blobSha: "upload" } {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) throw new Error("UPLOAD_BASE64_INVALID");
  const bytes = Uint8Array.from(Buffer.from(value, "base64"));
  if (Buffer.from(bytes).toString("base64") !== value) throw new Error("UPLOAD_BASE64_INVALID");
  if (bytes.length > 10 * 1024 * 1024) throw new Error("UPLOAD_TOO_LARGE");
  return { bytes, sha256: sha256(bytes), blobSha: "upload" };
}

export async function handleImport(payload: ImportPayload): Promise<{ snapshotKey: string; lockfileSha256: string; sourceUrl?: string }> {
  await ensurePortfolio(payload.portfolioKey);
  const resolved = payload.kind === "github" ? await resolveCommit(payload.repository, payload.ref) : undefined;
  const commitSha = resolved?.sha ?? `upload-${sha256(payload.kind === "upload" ? payload.lockfileBase64 : "").slice(0, 32)}`;
  await phase(payload.jobId, 1, "VALIDATE", { commitSha, kind: payload.kind });
  const files = payload.kind === "github"
    ? await Promise.all([fetchRepositoryFile(payload.repository, commitSha, "package.json"), fetchRepositoryFile(payload.repository, commitSha, "package-lock.json")])
    : [decodeUpload(payload.manifestBase64), decodeUpload(payload.lockfileBase64)] as const;
  const [manifest, lockfile] = files;
  if (payload.expectedLockfileSha256 && lockfile.sha256 !== payload.expectedLockfileSha256) throw new Error("EXPECTED_LOCKFILE_HASH_MISMATCH");
  await phase(payload.jobId, 2, "FETCH", { manifestBytes: manifest.bytes.length, lockfileBytes: lockfile.bytes.length });
  const identity = snapshotIdentity(payload.repository, commitSha, manifest, lockfile, payload.kind, resolved?.sourceStamp);
  const snapshotKey = canonicalDigest({ portfolioKey: payload.portfolioKey, repository: identity.repository, commitSha: identity.commitSha,
    manifestSha256: identity.manifestSha256, lockfileSha256: identity.lockfileSha256, source: identity.source });
  await phase(payload.jobId, 3, "HASH", { snapshotKey });
  const snapshot = await extractSnapshot({ snapshotKey, manifest: manifest.bytes, lockfile: lockfile.bytes, identity });
  await phase(payload.jobId, 4, "EXTRACT", { packages: snapshot.packages.length, edges: snapshot.edges.length + snapshot.applicationEdges.length, maxDepth: snapshot.maxDepth });
  await writeSnapshot(snapshot);
  await writeApplicationRoot(snapshot);
  await verifySnapshotReadback(snapshot);
  await phase(payload.jobId, 5, "GRAPH_WRITE", { extractionSha256: snapshot.extractionSha256 });
  await saveSnapshot({ key: snapshot.key, portfolioKey: payload.portfolioKey, repository: identity.repository,
    role: payload.role ?? "current", commitSha: identity.commitSha, manifestSha256: identity.manifestSha256,
    lockfileSha256: identity.lockfileSha256, extractionSha256: snapshot.extractionSha256,
    packageCount: snapshot.packages.length, edgeCount: snapshot.edges.length + snapshot.applicationEdges.length,
    maxDepth: snapshot.maxDepth, topology: snapshot, identity });
  if ((payload.role ?? "current") === "current") await scanPortfolio(payload.portfolioKey);
  return { snapshotKey, lockfileSha256: identity.lockfileSha256, ...(resolved?.html_url ? { sourceUrl: resolved.html_url } : {}) };
}

interface ScenarioSource { sourceKey: string; selector: string; name: string; version: string; packageKeys: string[] }

function sourceDefinitions(bundle: Awaited<ReturnType<typeof loadIncidentBundle>>): ScenarioSource[] {
  const groups = new Map<string, ScenarioSource>();
  for (const finding of bundle.findings) {
    const owner = bundle.snapshots.find((row) => row.key === finding.snapshotKey);
    const pkg = owner?.topology.packages.find((item) => item.key === finding.packageKey);
    const advisory = bundle.advisories.find((row) => row.key === finding.advisoryKey);
    if (!pkg || !advisory) throw new Error("FINDING_EVIDENCE_MISSING");
    const sourceKey = `${advisory.evidence.osvId}:${pkg.name}@${pkg.version}`;
    groups.set(sourceKey, { sourceKey, selector: `src-${sha256(sourceKey).slice(0, 16)}`, name: pkg.name, version: pkg.version, packageKeys: [] });
  }
  return [...groups.values()].sort((a, b) => a.sourceKey.localeCompare(b.sourceKey));
}

function bindSources(sources: ScenarioSource[], snapshots: Array<{ topology: ExtractedSnapshot }>): ScenarioSource[] {
  return sources.map((source) => ({ ...source, packageKeys: snapshots.flatMap(({ topology }) => topology.packages
    .filter((pkg) => pkg.name === source.name && pkg.version === source.version).map((pkg) => pkg.key)) }));
}

function reachableKeys(snapshot: ExtractedSnapshot, scopes: Scope[]): Set<string> {
  const children = new Map<string, string[]>();
  for (const edge of snapshot.edges.filter((item) => scopes.includes(item.scope))) children.set(edge.fromKey, [...(children.get(edge.fromKey) ?? []), edge.toKey]);
  const seen = new Set<string>();
  const queue = snapshot.applicationEdges.filter((item) => scopes.includes(item.scope)).map((item) => item.toKey);
  while (queue.length) { const key = queue.shift()!; if (seen.has(key)) continue; seen.add(key); queue.push(...(children.get(key) ?? [])); }
  return seen;
}

function bfsPairKeys(snapshots: Array<{ repository: string; topology: ExtractedSnapshot }>, sources: ScenarioSource[], scopes: Scope[]): string[] {
  return snapshots.flatMap((snapshot) => {
    const reachable = reachableKeys(snapshot.topology, scopes);
    return sources.filter((source) => source.packageKeys.some((key) => reachable.has(key))).map((source) => `${source.sourceKey}:${snapshot.repository}`);
  }).sort();
}

async function traverseSnapshotSet(input: { scenarioKey: string; portfolioSelector: string;
  snapshots: Array<{ key: string; repository: string; topology: ExtractedSnapshot }>; sources: ScenarioSource[]; scopes: Scope[] }): Promise<CanonicalReceipt["baseline"]> {
  const boundSources = bindSources(input.sources, input.snapshots);
  const pairKeys = bfsPairKeys(input.snapshots, boundSources, input.scopes);
  await writeScenario({ scenarioKey: input.scenarioKey, portfolioKey: input.portfolioSelector,
    applications: input.snapshots.map((row) => ({ applicationKey: row.repository, snapshotKey: row.key })), sources: boundSources });
  try {
    return await runTraversal(traversalBounds({ sourceSelectors: boundSources.map(({ selector }) => selector), targetSelector: input.portfolioSelector,
      scopes: input.scopes, maxImportedDepth: Math.max(...input.snapshots.map(({ topology }) => topology.maxDepth)),
      targetCount: input.snapshots.length, expectedPairKeyDigest: canonicalDigest(pairKeys) }));
  } finally { await cleanupScenario(input.scenarioKey); }
}

async function scanSnapshot(row: Awaited<ReturnType<typeof listPortfolioSnapshots>>[number]) {
  const matches = await queryExactPackages(row.topology.packages);
  const results: Array<{ findingKey: string; advisory: AdvisoryEvidence; exploitation: Awaited<ReturnType<typeof enrichCve>>; packageKey: string }> = [];
  for (const pkg of row.topology.packages) for (const id of matches.get(pkg.key) ?? []) {
    const advisory = await fetchAdvisory(id, pkg.name, pkg.version);
    const advisoryKey = canonicalDigest({ id, payload: advisory.source.payloadSha256 });
    const findingKey = canonicalDigest({ snapshot: row.key, package: pkg.key, advisory: advisoryKey });
    const exploitation = await enrichCve(advisory.aliases.find((alias) => alias.startsWith("CVE-")));
    await saveAdvisoryVersion(advisoryKey, advisory, exploitation);
    await saveFinding({ key: findingKey, snapshotKey: row.key, packageKey: pkg.key, advisoryKey, state: advisory.withdrawnAt ? "PARTIAL" : "VERIFIED_WITHIN_BOUNDS" });
    results.push({ findingKey, advisory, exploitation, packageKey: pkg.key });
  }
  return results;
}

async function boundedProofEvidence(snapshots: Array<NonNullable<Awaited<ReturnType<typeof findSnapshot>>>>, coordinates: string[], requireGraphPresence = false) {
  const sources: ScenarioSource[] = []; const advisories: AdvisoryEvidence[] = []; const exploitation: CanonicalReceipt["exploitation"] = []; const queryStamps: SourceStamp[] = [];
  for (const coordinate of coordinates) {
    const split = coordinate.lastIndexOf("@"); if (split < 1) throw new Error("PROOF_SOURCE_COORDINATE_INVALID");
    const name = coordinate.slice(0, split); const version = coordinate.slice(split + 1);
    const present = snapshots.some((row) => row.topology.packages.some((item) => item.name === name && item.version === version));
    if (requireGraphPresence && !present) throw new Error("PROOF_SOURCE_PACKAGE_MISSING");
    const coordinateEvidence = await queryExactCoordinate(name, version);
    if (!coordinateEvidence.ids.length) throw new Error("PROOF_SOURCE_OSV_EVIDENCE_MISSING");
    const refreshed = await Promise.all(coordinateEvidence.ids.map((id) => refreshSelectedAdvisory(id, name, version)));
    refreshed.forEach((row) => assertAdvisoryActive(row.advisory));
    advisories.push(...refreshed.map((row) => row.advisory)); queryStamps.push(...coordinateEvidence.queryStamps, ...refreshed.flatMap((row) => row.queryStamps));
    exploitation.push(...await Promise.all(refreshed.map((row) => enrichCve(row.advisory.aliases.find((alias) => alias.startsWith("CVE-"))))));
    sources.push({ sourceKey: `OSV-SET:${coordinate}`, selector: `src-${sha256(coordinate).slice(0, 16)}`, name, version, packageKeys: [] });
  }
  return { sources: sources.sort((a, b) => a.sourceKey.localeCompare(b.sourceKey)), advisories, exploitation, queryStamps, withdrawnSourceKeys: new Set<string>() };
}

async function refreshIncidentEvidence(bundle: Awaited<ReturnType<typeof loadIncidentBundle>>) {
  const rows = await Promise.all(bundle.advisories.map(async (row) => {
    const refreshed = await refreshSelectedAdvisory(row.evidence.osvId, row.evidence.packageName, row.evidence.exactVersion);
    assertAdvisoryActive(refreshed.advisory);
    return { ...refreshed, exploitation: await enrichCve(refreshed.advisory.aliases.find((alias) => alias.startsWith("CVE-"))) };
  }));
  return { advisories: rows.map((row) => row.advisory), exploitation: rows.map((row) => row.exploitation), queryStamps: rows.flatMap((row) => row.queryStamps) };
}

function enrichmentLimitations(rows: CanonicalReceipt["exploitation"]): string[] {
  return rows.flatMap((row) => [
    ...(row.kev === "UNKNOWN" ? [`CISA KEV status is UNKNOWN for ${row.cve ?? "an advisory without a CVE alias"}.`] : []),
    ...(row.epssProbability === undefined ? [`FIRST EPSS is UNKNOWN for ${row.cve ?? "an advisory without a CVE alias"}.`] : []),
  ]).sort();
}

export async function scanPortfolio(portfolioKey: string): Promise<string[]> {
  await invalidatePortfolioIncidents(portfolioKey);
  const snapshots = await listPortfolioSnapshots(portfolioKey); const scanned = (await Promise.all(snapshots.map(scanSnapshot))).flat();
  const groups = new Map<string, typeof scanned>();
  for (const item of scanned.filter(({ advisory }) => !advisory.withdrawnAt)) {
    const key = `${item.advisory.osvId}:${item.advisory.packageName}@${item.advisory.exactVersion}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const incidentKeys: string[] = [];
  for (const [group, items] of groups) {
    const key = canonicalDigest({ portfolioKey, group });
    await saveIncident({ key, portfolioKey, title: group, sourceFindingKeys: items.map(({ findingKey }) => findingKey).sort(),
      scopes: ["production", "development", "optional", "peer"], verificationSourceCoordinates: [], verificationBaseline: null, state: "UNKNOWN" });
    incidentKeys.push(key);
  }
  return incidentKeys.sort();
}

export async function handleRefreshEvidence(payload: { jobId: string; incidentKey: string; scopes: Scope[]; sourceFindingIds: string[]; verificationSourceCoordinates: string[] }) {
  const bundle = await loadIncidentBundle(payload.incidentKey);
  if (canonicalDigest(payload.sourceFindingIds.slice().sort()) !== canonicalDigest(bundle.incident.sourceFindingKeys.slice().sort())) throw new Error("SOURCE_FINDING_SET_MISMATCH");
  await refreshIncidentEvidence(bundle);
  const selectedEvidence = bundle.advisories[0]?.evidence; if (!selectedEvidence) throw new Error("SELECTED_INCIDENT_EVIDENCE_MISSING");
  const selectedCoordinate = `${selectedEvidence.packageName}@${selectedEvidence.exactVersion}`;
  if (!payload.verificationSourceCoordinates.includes(selectedCoordinate)) throw new Error("SELECTED_INCIDENT_SOURCE_REQUIRED");
  const baseline = await traverseSnapshotSet({ scenarioKey: `baseline-${payload.jobId}`, portfolioSelector: `portfolio-${sha256(bundle.incident.portfolioKey).slice(0, 16)}`,
    snapshots: bundle.snapshots, sources: sourceDefinitions(bundle), scopes: payload.scopes });
  const verificationEvidence = await boundedProofEvidence(bundle.snapshots, payload.verificationSourceCoordinates, true);
  const verificationBaseline = await traverseSnapshotSet({ scenarioKey: `verification-baseline-${payload.jobId}`,
    portfolioSelector: `verification-${sha256(bundle.incident.portfolioKey).slice(0, 16)}`, snapshots: bundle.snapshots, sources: verificationEvidence.sources, scopes: payload.scopes });
  await saveIncidentBaseline(payload.incidentKey, baseline, verificationBaseline, payload.scopes, payload.verificationSourceCoordinates);
  return baseline;
}

function pairKeys(pairs: ExposurePair[]): string[] { return pairs.map((pair) => `${pair.sourceKey}:${pair.applicationKey}`).sort(); }
function changedPackages(left: ExtractedSnapshot, right: ExtractedSnapshot): number {
  const identity = (item: ExtractedSnapshot["packages"][number]) => `${item.location}:${item.name}@${item.version}`;
  const a = new Set(left.packages.map(identity)); const b = new Set(right.packages.map(identity));
  return [...a].filter((key) => !b.has(key)).length + [...b].filter((key) => !a.has(key)).length;
}

type EvaluatePayload = ImportPayload & { incidentKey: string; origin: ProposedFix["origin"]; sourceUrl?: string; discoveryEvidence?: ProposedFixDiscoveryEvidence };

export async function handleEvaluateProposedFix(payload: EvaluatePayload): Promise<ProposedFixOutcome> {
  const bundle = await loadIncidentBundle(payload.incidentKey);
  if (!bundle.incident.baseline || bundle.incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("BASELINE_NOT_VERIFIED");
  await refreshIncidentEvidence(bundle);
  const baselineRow = bundle.snapshots.find((row) => row.repository === payload.repository); if (!baselineRow) throw new Error("PROPOSED_FIX_REPOSITORY_MISMATCH");
  const imported = await handleImport({ ...payload, role: "proposed" }); const proposedRow = await findSnapshot(imported.snapshotKey); if (!proposedRow) throw new Error("PROPOSED_SNAPSHOT_MISSING");
  const [baselineFindings, proposedFindings] = await Promise.all([scanSnapshot(baselineRow), scanSnapshot(proposedRow)]);
  const findingIdentity = (item: Awaited<ReturnType<typeof scanSnapshot>>[number]) => `${item.advisory.osvId}:${item.advisory.packageName}@${item.advisory.exactVersion}`;
  const beforeFindings = new Set(baselineFindings.map(findingIdentity)); const afterFindings = new Set(proposedFindings.map(findingIdentity));
  const snapshots = bundle.snapshots.map((row) => row.repository === payload.repository ? proposedRow : row);
  const result = await traverseSnapshotSet({ scenarioKey: `fix-${payload.jobId}`, portfolioSelector: `fix-${sha256(payload.jobId).slice(0, 16)}`, snapshots, sources: sourceDefinitions(bundle), scopes: bundle.incident.scopes as Scope[] });
  const baseline = new Set(pairKeys(bundle.incident.baseline.pairs)); const proposed = new Set(pairKeys(result.pairs));
  const baselinePairKeys = [...baseline].sort(); const baselineSnapshotKeys = bundle.snapshots.map((row) => row.key).sort(); const baselinePairDigest = canonicalDigest(baselinePairKeys);
  const fixKey = canonicalDigest({ incident: payload.incidentKey, repository: payload.repository, snapshotKey: imported.snapshotKey, baselinePairDigest, baselineSnapshotKeys });
  const outcome: ProposedFixOutcome = { proposedFixKey: fixKey, removed: [...baseline].filter((key) => !proposed.has(key)), persistent: [...baseline].filter((key) => proposed.has(key)), introduced: [...proposed].filter((key) => !baseline.has(key)),
    unknown: result.state === "VERIFIED_WITHIN_BOUNDS" ? [] : [...baseline], otherFindings: { removed: [...beforeFindings].filter((key) => !afterFindings.has(key)), persistent: [...beforeFindings].filter((key) => afterFindings.has(key)), introduced: [...afterFindings].filter((key) => !beforeFindings.has(key)) }, changedPackageCount: changedPackages(baselineRow.topology, proposedRow.topology) };
  await saveProposedFix({ key: fixKey, repository: payload.repository, origin: payload.origin, ...(payload.sourceUrl || imported.sourceUrl ? { sourceUrl: payload.sourceUrl ?? imported.sourceUrl } : {}), ...(payload.kind === "github" ? { headSha: proposedRow.commitSha } : {}), ...(payload.discoveryEvidence ? { discoveryEvidence: payload.discoveryEvidence } : {}), manifestSha256: proposedRow.manifestSha256, lockfileSha256: proposedRow.lockfileSha256, snapshotKey: imported.snapshotKey, changedPackageCount: outcome.changedPackageCount, state: result.state }, payload.incidentKey, outcome, { pairDigest: baselinePairDigest, snapshotKeys: baselineSnapshotKeys });
  return outcome;
}

export async function handleDiscoverProposedFixes(incidentKey: string) {
  const bundle = await loadIncidentBundle(incidentKey);
  const entries = await Promise.all(bundle.snapshots.map(async (row) => ({ repository: row.repository, pulls: await discoverProposedFixes(row.repository) })));
  return entries.flatMap(({ repository, pulls }) => pulls.map((pull) => ({ incidentKey, portfolioKey: bundle.incident.portfolioKey, kind: "github" as const, repository, ref: pull.head.sha, origin: "github-pr" as const, sourceUrl: pull.html_url, discoveryEvidence: pull.evidence })));
}

export async function handleVerifyPlan(payload: VerifyPayload): Promise<{ digest: string }> {
  await writeScenario({ scenarioKey: payload.scenarioKey, portfolioKey: payload.portfolioSelector, applications: payload.applications, sources: payload.sources });
  try {
    await phase(payload.jobId, 1, "GRAPH_WRITE", { scenarioKey: payload.scenarioKey });
    const bounds = traversalBounds({ sourceSelectors: payload.sources.map((source) => source.selector), targetSelector: payload.portfolioSelector, scopes: payload.scopes, maxImportedDepth: payload.maxImportedDepth, targetCount: payload.applications.length, expectedPairKeyDigest: payload.expectedPairKeyDigest });
    await phase(payload.jobId, 2, "VERIFY_COUNTS", { resultLimit: bounds.resultLimit }); const final = await runTraversal(bounds);
    await phase(payload.jobId, 3, "TRAVERSE", { pairDigest: final.pairDigest, state: final.state });
    const receipt: CanonicalReceipt = { ...payload.receipt, resultState: final.state, final, plan: { ...payload.plan, state: final.state === "VERIFIED_WITHIN_BOUNDS" ? "VERIFIED" : "FAILED" } };
    const material = finalizeReceipt(receipt); await saveReceipt(material.digest, material.receipt, material.json); await phase(payload.jobId, 4, "RECEIPT", { digest: material.digest }); return { digest: material.digest };
  } finally {
    try { await cleanupScenario(payload.scenarioKey); } catch (error) { await appendAuditEvent("scenario.cleanup_failed", payload.scenarioKey, { jobId: payload.jobId, message: error instanceof Error ? error.message : "unknown cleanup error" }); }
  }
}

function planFromRow(row: Awaited<ReturnType<typeof loadPlanBundle>>["plan"]): PortfolioPlan {
  return { key: row.key, incidentKey: row.incidentKey, proposedFixKeys: row.proposedFixKeys, baselinePairKeys: row.baselinePairKeys, baselineSnapshotKeys: row.baselineSnapshotKeys, verificationSourceCoordinates: row.verificationSourceCoordinates, verificationBaselinePairKeys: row.verificationBaselinePairKeys, scopes: row.scopes, predictedResidualPairKeys: row.predictedResidual, constraints: row.constraints, exhaustiveWithinBounds: row.exhaustiveWithinBounds, state: row.state as PortfolioPlan["state"] };
}
function fixFromRow(row: Awaited<ReturnType<typeof loadPlanBundle>>["fixes"][number]): ProposedFix {
  return { key: row.key, repository: row.repository, origin: row.origin as ProposedFix["origin"], ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}), ...(row.headSha ? { headSha: row.headSha } : {}), ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}), manifestSha256: row.manifestSha256, lockfileSha256: row.lockfileSha256, snapshotKey: row.snapshotKey, changedPackageCount: row.outcome.changedPackageCount, state: row.state };
}
export function assertProposedFixBytes(expected: { manifestSha256: string; lockfileSha256: string }, observed: { manifestSha256: string; lockfileSha256: string }): void {
  if (expected.manifestSha256 !== observed.manifestSha256 || expected.lockfileSha256 !== observed.lockfileSha256) throw new Error("PROPOSED_FIX_BYTES_DRIFT");
}

export async function handleVerifyPlanRequest(input: VerifyRequest) {
  if (input.planKey !== input.expectedPlanDigest) throw new Error("PLAN_DIGEST_DRIFT");
  const bundle = await loadPlanBundle(input.planKey);
  if (!bundle.incident.baseline || bundle.incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS" || !bundle.incident.verificationBaseline || bundle.incident.verificationBaseline.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("BASELINE_NOT_VERIFIED");
  const plan = planFromRow(bundle.plan); const currentBaselinePairKeys = pairKeys(bundle.incident.baseline.pairs); const currentBaselineSnapshotKeys = bundle.snapshots.map((row) => row.key).sort();
  if (canonicalDigest(plan.baselinePairKeys) !== canonicalDigest(currentBaselinePairKeys) || canonicalDigest(plan.baselineSnapshotKeys) !== canonicalDigest(currentBaselineSnapshotKeys)) throw new Error("PLAN_BASELINE_STALE");
  if (canonicalDigest(plan.verificationSourceCoordinates) !== canonicalDigest(bundle.incident.verificationSourceCoordinates) || canonicalDigest(plan.verificationBaselinePairKeys) !== canonicalDigest(pairKeys(bundle.incident.verificationBaseline.pairs))) throw new Error("PLAN_VERIFICATION_UNIVERSE_STALE");
  if (canonicalDigest(plan.scopes) !== canonicalDigest([...(bundle.incident.scopes as Scope[])].sort())) throw new Error("PLAN_SCOPE_STALE");
  const recomputedPlanKey = canonicalDigest({ incidentKey: plan.incidentKey, baselinePairs: [...plan.baselinePairKeys].sort(), baselineSnapshotKeys: [...plan.baselineSnapshotKeys].sort(), fixes: [...plan.proposedFixKeys].sort(), verificationSourceCoordinates: [...plan.verificationSourceCoordinates].sort(), verificationBaselinePairKeys: [...plan.verificationBaselinePairKeys].sort(), scopes: [...plan.scopes].sort(), constraints: plan.constraints, exhaustiveWithinBounds: plan.exhaustiveWithinBounds });
  if (recomputedPlanKey !== plan.key) throw new Error("PLAN_STORED_DIGEST_MISMATCH");
  const orderedFixes = bundle.plan.proposedFixKeys.map((key) => bundle.fixes.find((fix) => fix.key === key));
  if (orderedFixes.some((fix) => !fix) || orderedFixes.length !== bundle.fixes.length) throw new Error("PLAN_FIX_SET_DRIFT");
  if (orderedFixes.some((fix) => fix?.baselinePairDigest !== canonicalDigest(plan.baselinePairKeys) || canonicalDigest(fix?.baselineSnapshotKeys ?? []) !== canonicalDigest(plan.baselineSnapshotKeys))) throw new Error("PLAN_FIX_BASELINE_STALE");
  const proposedRows = await Promise.all(orderedFixes.map(async (fix) => {
    if (!fix) throw new Error("PLAN_FIX_SET_DRIFT"); const snapshot = await findSnapshot(fix.snapshotKey); if (!snapshot) throw new Error("PROPOSED_FIX_SNAPSHOT_MISSING");
    if (fix.origin !== "upload" && snapshot.commitSha !== fix.headSha) throw new Error("PROPOSED_FIX_DRIFT");
    if (snapshot.manifestSha256 !== fix.manifestSha256 || snapshot.lockfileSha256 !== fix.lockfileSha256) throw new Error("PROPOSED_FIX_STORED_HASH_DRIFT");
    if (fix.origin !== "upload" && fix.headSha) { const [manifest, lockfile] = await Promise.all([fetchRepositoryFile(fix.repository, fix.headSha, "package.json"), fetchRepositoryFile(fix.repository, fix.headSha, "package-lock.json")]); assertProposedFixBytes(fix, { manifestSha256: manifest.sha256, lockfileSha256: lockfile.sha256 }); }
    return { fix, snapshot };
  }));
  const replacements = new Map(proposedRows.map(({ fix, snapshot }) => [fix.repository, snapshot]));
  const snapshots = bundle.snapshots.map((row) => replacements.get(row.repository) ?? row).sort((a, b) => a.repository.localeCompare(b.repository));
  const selectedSources = sourceDefinitions(bundle); const refreshedSelected = await refreshIncidentEvidence(bundle);
  const boundedEvidence = await boundedProofEvidence(snapshots, plan.verificationSourceCoordinates); const sources = boundedEvidence.sources; const boundSources = bindSources(sources, snapshots);
  const pairKeysExpected = bfsPairKeys(snapshots, boundSources, bundle.incident.scopes as Scope[]);
  const advisories = [...new Map([...refreshedSelected.advisories, ...boundedEvidence.advisories].map((item) => [`${item.osvId}:${item.packageName}@${item.exactVersion}`, item])).values()].sort((a, b) => `${a.osvId}:${a.packageName}@${a.exactVersion}`.localeCompare(`${b.osvId}:${b.packageName}@${b.exactVersion}`));
  const exploitation = [...new Map([...refreshedSelected.exploitation, ...boundedEvidence.exploitation].map((item) => [item.cve ?? canonicalDigest(item.sources), item])).values()].sort((a, b) => (a.cve ?? "").localeCompare(b.cve ?? ""));
  const sourceStamps = [...new Map([...refreshedSelected.queryStamps, ...boundedEvidence.queryStamps, ...advisories.map((item) => item.source), ...exploitation.flatMap((item) => item.sources)].map((item) => [`${item.source}:${item.url}:${item.payloadSha256}`, item])).values()].sort((a, b) => `${a.source}:${a.url}:${a.payloadSha256}`.localeCompare(`${b.source}:${b.url}:${b.payloadSha256}`));
  const verificationBaseline = bundle.incident.verificationBaseline; if (verificationBaseline.state !== "VERIFIED_WITHIN_BOUNDS") throw new Error("VERIFICATION_UNIVERSE_BASELINE_NOT_VERIFIED");
  const selectedVerificationSourceKeys = [...new Set(selectedSources.map((source) => `OSV-SET:${source.name}@${source.version}`))].sort();
  return handleVerifyPlan({ jobId: input.jobId ?? `verify-${input.planKey}`, plan, scenarioKey: `plan-${input.jobId ?? input.planKey}`, portfolioSelector: `plan-${sha256(input.planKey).slice(0, 16)}`, scopes: plan.scopes, applications: snapshots.map((row) => ({ applicationKey: row.repository, snapshotKey: row.key })), sources: boundSources, maxImportedDepth: Math.max(...snapshots.map((row) => row.maxDepth)), expectedPairKeyDigest: canonicalDigest(pairKeysExpected), receipt: {
    schemaVersion: "1.0.0", createdAt: new Date().toISOString(), resultState: "UNKNOWN", portfolioKey: bundle.incident.portfolioKey, incidentKey: bundle.incident.key, selectedSourceKeys: selectedVerificationSourceKeys, inputs: snapshots.map((row) => row.identity), topologies: snapshots.map((row) => ({ snapshotKey: row.key, repository: row.repository, packageCount: row.packageCount, relationshipCount: row.edgeCount, rootCount: row.topology.applicationEdges.length, maxDepth: row.maxDepth, extractionSha256: row.extractionSha256, readbackVerified: true as const, collisionRegistryVerified: true as const })), sources: sourceStamps, advisories, exploitation, baseline: bundle.incident.baseline, verificationUniverse: { kind: plan.verificationSourceCoordinates.length > 1 ? "bounded-portfolio" : "selected-incident", sourceKeys: boundSources.map((source) => source.sourceKey).sort(), baseline: verificationBaseline }, proposedFixes: orderedFixes.map((row) => fixFromRow(row!)), outcomes: orderedFixes.map((row) => row!.outcome), plan, hydraDbImageDigest: "sha256:db78309a233be54662db29744047e985a39b51c45a270d1a1f47c31a62cdb709", graphSchemaVersion: "1.0.0", limitations: enrichmentLimitations(exploitation),
  } });
}

export async function reproduceFrozenCorpus() {
  const evidence = JSON.parse(await (await import("node:fs/promises")).readFile("docs/evidence/2026-08-19-pre-forge-runtime.json", "utf8"));
  const runId = process.env.HYDRACUT_PROOF_RUN_ID ?? `${Date.now()}-${process.pid}`;
  const portfolioKey = `verified-public-corpus-${runId}`; const observedLockfileSha256: string[] = [];
  const jobPrefix = `proof-${runId}`;
  for (const [index, row] of evidence.corpus.repositories.entries()) { const imported = await handleImport({ jobId: `${jobPrefix}-base-${index}`, portfolioKey, role: "current", kind: "github", repository: row.repository, ref: row.baseline_commit, expectedLockfileSha256: row.baseline_lock_sha256 }); observedLockfileSha256.push(imported.lockfileSha256); }
  await scanPortfolio(portfolioKey);
  const incident = (await listIncidents()).find((row) => row.title === `${evidence.selected_incident.advisory}:${evidence.selected_incident.package}@${evidence.selected_incident.affected_version}`); if (!incident) throw new Error("FROZEN_INCIDENT_NOT_FOUND");
  await handleRefreshEvidence({ jobId: `${jobPrefix}-baseline`, incidentKey: incident.key, scopes: ["production", "development", "optional", "peer"], sourceFindingIds: incident.sourceFindingKeys, verificationSourceCoordinates: evidence.many_source_proof.sources });
  const baselineBundle = await loadIncidentBundle(incident.key); const portfolioBaseline = baselineBundle.incident.verificationBaseline; if (!portfolioBaseline) throw new Error("PROOF_VERIFICATION_BASELINE_MISSING");
  const outcomes: ProposedFixOutcome[] = [];
  for (const [index, row] of evidence.corpus.repositories.entries()) outcomes.push(await handleEvaluateProposedFix({ jobId: `${jobPrefix}-fix-${index}`, portfolioKey, incidentKey: incident.key, role: "proposed", kind: "github", repository: row.repository, ref: row["candidate_commit"], expectedLockfileSha256: row["candidate_lock_sha256"], origin: "github-commit" }));
  const plan = await createPlanForIncident(incident.key, { proposedFixKeys: outcomes.map((item) => item.proposedFixKey), requiredFixKeys: [], forbiddenFixKeys: [], maxRepositoryChanges: outcomes.length });
  const { digest } = await handleVerifyPlanRequest({ jobId: `${jobPrefix}-final`, planKey: plan.key, expectedPlanDigest: plan.key }); const stored = await findReceipt(digest); if (!stored) throw new Error("PROOF_RECEIPT_MISSING");
  const snapshots = await listPortfolioSnapshots(portfolioKey);
  return { receipt: stored.receipt, observed: { applications: snapshots.length, packageInstances: snapshots.reduce((sum, row) => sum + row.packageCount, 0), packageEdges: snapshots.reduce((sum, row) => sum + row.topology.edges.length, 0), bfsPairDigest: canonicalDigest(pairKeys(stored.receipt.baseline.pairs)), selectedFinalPairs: stored.receipt.final.pairs.filter((pair) => stored.receipt.selectedSourceKeys.includes(pair.sourceKey)).length, portfolioBaselinePairs: portfolioBaseline.pairs.length, portfolioFinalPairs: stored.receipt.final.pairs.length, lockfileSha256: [...observedLockfileSha256, ...stored.receipt.inputs.map((item) => item.lockfileSha256)].sort(), applicationOsvIds: stored.receipt.advisories.map((row) => row.osvId).sort() } };
}

export function frozenInputDigest(snapshot: ExtractedSnapshot): string { return sha256(`${snapshot.identity.lockfileSha256}:${snapshot.extractionSha256}`); }
export type { EvaluatePayload, ImportPayload, VerifyPayload, VerifyRequest };
