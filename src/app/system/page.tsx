import { databaseHealth } from "../../db/client";
import { loadSystemFacts } from "../../db/repository";
import { hydraHealth } from "../../integrations/hydradb";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const [database, hydradb, facts] = await Promise.all([databaseHealth(), hydraHealth(), loadSystemFacts()]);
  return <main className="stack"><header><p className="accent">Runtime evidence</p><h1>System</h1></header><section className="grid-4"><article className="panel"><h2>PostgreSQL</h2><p>{database ? "Ready" : "Unavailable"}</p></article><article className="panel"><h2>HydraDB OSS</h2><p>{hydradb ? "Ready" : "Unavailable"}</p></article><article className="panel"><h2>Graph image</h2><code>{facts.graphImageDigest}</code></article><article className="panel"><h2>Boundary</h2><p>Single operator; graph ports private</p></article></section><pre className="panel">{JSON.stringify(facts, null, 2)}</pre></main>;
}
