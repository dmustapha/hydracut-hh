import { AddProposedFixForm, DiscoveryButton, ProposedFixPanel } from "../../../../components/proposed-fix-panel";
import { listProposedFixes } from "../../../../db/repository";
import { PageHeader, WorkflowRail } from "../../../../components/atlas";

export default async function ProposedFixesPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const rows = await listProposedFixes(incidentId);
  const entries = rows.map((row) => ({ fix: { key: row.key, repository: row.repository, origin: row.origin as "github-pr" | "github-commit" | "github-branch" | "upload", ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}), ...(row.headSha ? { headSha: row.headSha } : {}), ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}), manifestSha256: row.manifestSha256, lockfileSha256: row.lockfileSha256, snapshotKey: row.snapshotKey, changedPackageCount: row.outcome.changedPackageCount, state: row.state }, outcome: row.outcome }));
  return <div className="stack-lg"><PageHeader eyebrow="Authentic immutable states" title="Proposed fixes" description="Each outcome comes from a full graph reconstruction and native traversal. HydraCut never generates a fix." /><WorkflowRail active="proposed-fixes" incidentId={incidentId} /><div className="grid-2"><section className="panel"><h2>Discover public evidence</h2><p className="muted">Search public repository history for a complete resolved state.</p><DiscoveryButton incidentKey={incidentId} /></section><AddProposedFixForm incidentKey={incidentId} /></div><ProposedFixPanel entries={entries} /></div>;
}
