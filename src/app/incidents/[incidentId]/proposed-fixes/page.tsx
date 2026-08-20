import { AddProposedFixForm, DiscoveryButton, ProposedFixPanel } from "../../../../components/proposed-fix-panel";
import { listProposedFixes } from "../../../../db/repository";

export default async function ProposedFixesPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const rows = await listProposedFixes(incidentId);
  const entries = rows.map((row) => ({ fix: { key: row.key, repository: row.repository, origin: row.origin as "github-pr" | "github-commit" | "github-branch" | "upload", ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}), ...(row.headSha ? { headSha: row.headSha } : {}), ...(row.discoveryEvidence ? { discoveryEvidence: row.discoveryEvidence } : {}), manifestSha256: row.manifestSha256, lockfileSha256: row.lockfileSha256, snapshotKey: row.snapshotKey, changedPackageCount: row.outcome.changedPackageCount, state: row.state }, outcome: row.outcome }));
  return <main className="stack"><header><p className="accent">Complete resolved states</p><h1>Proposed fixes</h1><p>Each outcome comes from a full graph reconstruction and native traversal.</p></header><div className="grid-4"><DiscoveryButton incidentKey={incidentId} /><AddProposedFixForm incidentKey={incidentId} /></div><ProposedFixPanel entries={entries} /></main>;
}
