import { listPortfolioSnapshots } from "../../db/repository";

export const dynamic = "force-dynamic";

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ portfolio?: string }> }) {
  const portfolioKey = (await searchParams).portfolio ?? "default";
  const rows = await listPortfolioSnapshots(portfolioKey);
  return <main className="stack"><header><p className="accent">Authentic inputs</p><h1>Portfolio</h1><p>{portfolioKey}</p></header>{rows.map((row) => <article className="panel" key={row.key}><h2>{row.repository}</h2><p>{row.commitSha}</p><code>{row.lockfileSha256}</code><p>{row.packageCount} package instances · {row.edgeCount} typed edges · depth {row.maxDepth}</p></article>)}</main>;
}
