import { loadIncidentImpact } from "../../db/repository";
import { EmptyState, PageHeader, WitnessGraph, EvidenceLink } from "../../components/atlas";

export const dynamic = "force-dynamic";

export default async function GraphPage({ searchParams }: { searchParams: Promise<{ incident?: string; pair?: string }> }) {
  const query = await searchParams;
  const impact = query.incident ? await loadIncidentImpact(query.incident) : null;
  const pair = impact?.baseline.pairs.find((item) => `${item.sourceKey}:${item.applicationKey}` === query.pair);
  return <div className="stack-lg"><PageHeader eyebrow="Investigate · context-bound witness" title="Graph explorer" description="The visual index follows real traversal output. The ordered pair table remains canonical evidence." />{pair ? <div className="stack"><WitnessGraph pairs={[pair]} incidentKey={query.incident} title="Selected source → application witness" /><article className="evidence-tray"><div className="section-head"><h2>{pair.sourceKey} → {pair.applicationKey}</h2><span className="mono">depth {pair.depth}</span></div><ol className="witness-ledger">{pair.witnessNodeKeys.map((key) => <li key={key}><code className="hash">{key}</code></li>)}</ol><p className="mono muted">{pair.witnessRelationshipTypes.join(" → ")}</p></article></div> : <EmptyState title="No verified pair selected" description="Select a persisted source-to-application witness from an incident impact matrix. The atlas will not infer missing topology." action={<EvidenceLink href="/incidents">Return to incident command</EvidenceLink>} />}</div>;
}
