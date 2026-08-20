import { notFound } from "next/navigation";
import { ContextLink } from "../../../components/command-surface";
import { BaselineControls, ImpactMatrix } from "../../../components/impact-matrix";
import { ProposedFixPanel } from "../../../components/proposed-fix-panel";
import { listIncidents, listProposedFixes, loadIncidentBundle } from "../../../db/repository";

export const dynamic = "force-dynamic";

export default async function IncidentPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const bundle = await loadIncidentBundle(incidentId).catch(() => null);
  if (!bundle) notFound();
  const incident = bundle.incident;
  const fixes = await listProposedFixes(incidentId);
  const selectedEvidence = bundle.advisories[0]?.evidence;
  if (!selectedEvidence) notFound();
  const selectedCoordinate = `${selectedEvidence.packageName}@${selectedEvidence.exactVersion}`;
  const availableCoordinates = [...new Set((await listIncidents()).filter((row) => row.portfolioKey === incident.portfolioKey).map((row) => row.title.slice(row.title.indexOf(":") + 1)))].sort();
  return <div className="stack"><header><p className="accent">Incident command</p><h1>{incident.title}</h1><p>Dependency-level potential exposure, not exploitability.</p></header><nav className="tabs" aria-label="Incident sections"><ContextLink href={`/incidents/${incidentId}/impact`}>Impact</ContextLink><ContextLink href={`/incidents/${incidentId}/proposed-fixes`}>Proposed fixes</ContextLink><ContextLink href={`/incidents/${incidentId}/plan`}>Plan</ContextLink></nav><BaselineControls incidentKey={incidentId} sourceFindingIds={incident.sourceFindingKeys} selectedCoordinate={selectedCoordinate} availableCoordinates={availableCoordinates} /><section className="panel stack"><h2>Vulnerability evidence</h2>{bundle.advisories.map((row) => <article key={row.key}><h3>{row.evidence.osvId} · {row.evidence.packageName}@{row.evidence.exactVersion}</h3><p>Aliases {row.evidence.aliases.join(", ") || "none"} · CVSS {row.evidence.cvssVector ?? "UNKNOWN"} · KEV {row.exploitation.kev} · EPSS {row.exploitation.epssProbability ?? "UNKNOWN"}</p><p>Published {row.evidence.publishedAt} · modified {row.evidence.modifiedAt} · withdrawn {row.evidence.withdrawnAt ?? "no"}</p><details><summary>Ranges, fixes, references, and source provenance</summary><pre>{JSON.stringify({ ranges: row.evidence.rangeEvents, fixedVersions: row.evidence.fixedVersions, references: row.evidence.references, sources: [row.evidence.source, ...row.exploitation.sources] }, null, 2)}</pre></details></article>)}</section><div id="impact">{incident.baseline ? <ImpactMatrix traversal={incident.baseline} /> : <div className="panel">Baseline traversal is not verified.</div>}</div><div id="fixes"><ProposedFixPanel entries={fixes.map((row) => ({ fix: { key: row.key, repository: row.repository, origin: row.origin as "github-pr" | "github-commit" | "github-branch" | "upload", ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}), ...(row.headSha ? { headSha: row.headSha } : {}), ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}), manifestSha256: row.manifestSha256, lockfileSha256: row.lockfileSha256, snapshotKey: row.snapshotKey, changedPackageCount: row.outcome.changedPackageCount, state: row.state }, outcome: row.outcome }))} /></div><section className="panel" id="plan"><h2>Portfolio fix plan</h2><p>Review transparent coverage before requesting the final combined HydraDB proof.</p><ContextLink className="button primary" href={`/incidents/${incidentId}/plan`}>Review plan</ContextLink></section><section className="panel" id="proof"><h2>Proof</h2><p>A receipt appears only after the final native traversal and all refusal checks.</p></section></div>;
}
