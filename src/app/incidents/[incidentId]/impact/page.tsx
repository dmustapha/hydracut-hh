import { notFound } from "next/navigation";
import { ImpactMatrix } from "../../../../components/impact-matrix";
import { loadIncidentImpact } from "../../../../db/repository";

export default async function ImpactPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const impact = await loadIncidentImpact(incidentId);
  if (!impact) notFound();
  return <main className="stack"><header><p className="accent">CampaignRadius</p><h1>Portfolio impact</h1><p>Dependency-level potential exposure within displayed bounds.</p></header><ImpactMatrix traversal={impact.baseline} /></main>;
}
