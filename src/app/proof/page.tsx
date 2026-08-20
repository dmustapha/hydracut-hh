import { ContextLink } from "../../components/command-surface";
import { listReceipts } from "../../db/repository";

export const dynamic = "force-dynamic";

export default async function ProofIndexPage() {
  const rows = await listReceipts();
  return <main className="stack"><header><p className="accent">Immutable evidence</p><h1>Proof receipts</h1></header>{rows.length ? rows.map((row) => <article className="panel" key={row.digest}><span className="badge">{row.resultState}</span><h2>{row.receipt.incidentKey}</h2><code>{row.digest}</code><br /><ContextLink href={`/proof/${row.digest}`}>Open receipt</ContextLink></article>) : <p className="panel">No receipt has completed all proof gates.</p>}</main>;
}
