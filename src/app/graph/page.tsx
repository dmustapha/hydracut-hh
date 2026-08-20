import { loadIncidentImpact } from "../../db/repository";

export const dynamic = "force-dynamic";

export default async function GraphPage({ searchParams }: { searchParams: Promise<{ incident?: string; pair?: string }> }) {
  const query = await searchParams;
  const impact = query.incident ? await loadIncidentImpact(query.incident) : null;
  const pair = impact?.baseline.pairs.find((item) => `${item.sourceKey}:${item.applicationKey}` === query.pair);
  return <main className="stack"><header><p className="accent">Bounded witness</p><h1>Graph explorer</h1><p>The pair table remains canonical.</p></header>{pair ? <article className="panel"><h2>{pair.sourceKey} → {pair.applicationKey}</h2><ol>{pair.witnessNodeKeys.map((key) => <li key={key}><code>{key}</code></li>)}</ol><p>{pair.witnessRelationshipTypes.join(" → ")}</p></article> : <p className="panel">Select a verified source-to-application pair from an incident impact matrix. No topology is inferred without that context.</p>}</main>;
}
