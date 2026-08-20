import { notFound } from "next/navigation";
import { ImpactMatrix } from "../../../../components/impact-matrix";
import { loadIncidentImpact } from "../../../../db/repository";
import { PageHeader, WorkflowRail } from "../../../../components/atlas";

export default async function ImpactPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const impact = await loadIncidentImpact(incidentId);
  if (!impact) notFound();
  return <div className="stack-lg"><PageHeader eyebrow="CampaignRadius · baseline exposure" title="Portfolio impact" description="Dependency-level potential exposure within displayed bounds. The graph is derived from native traversal witnesses." /><WorkflowRail active="impact" incidentId={incidentId} /><section className="evidence-tray"><div className="section-head"><h2>Selected incident baseline</h2><span className="mono">{impact.baseline.pairs.length} pairs · {impact.baseline.pairDigest}</span></div><ImpactMatrix title="Selected incident evidence" traversal={impact.baseline} incidentKey={incidentId} /></section>{impact.verificationBaseline && <section className="evidence-tray"><div className="section-head"><h2>Verification universe baseline</h2><span className="mono">{impact.verificationBaseline.pairs.length} pairs · {impact.verificationBaseline.pairDigest}</span></div><ImpactMatrix title="Verification universe evidence" traversal={impact.verificationBaseline} incidentKey={incidentId} /></section>}</div>;
}
