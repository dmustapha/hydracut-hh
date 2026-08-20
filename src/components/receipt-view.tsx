import { allowedConclusion } from "../domain/receipt";
import type { CanonicalReceipt } from "../domain/types";
import { CopyButton, MetricTile, StatusLozenge, WorkflowRail } from "./atlas";

export function ReceiptView({ digest, receipt }: { digest: string; receipt: CanonicalReceipt }) {
  const selectedResidual = receipt.final.pairs.filter((pair) => receipt.selectedSourceKeys.includes(pair.sourceKey)).length;
  return <article className="stack-lg">
    <header className="page-header">
      <p className="eyebrow">Immutable proof receipt</p>
      <div className="row page-header-row"><h1>Bounded proof</h1><StatusLozenge state={receipt.resultState} /></div>
      <p className="mono receipt-coordinate">Incident {receipt.incidentKey}</p>
      <p>{allowedConclusion(receipt)}</p><p className="muted">Created {receipt.createdAt}</p>
      <div className="row"><code className="hash">{digest}</code><CopyButton value={digest} /></div>
    </header>
    <WorkflowRail active="receipt" digest={digest} incidentId={receipt.incidentKey} />
    <div className="grid-4"><MetricTile tone="accented" value={selectedResidual} label="selected residual pairs" /><MetricTile value={receipt.final.pairs.length} label="bounded final pairs" /><MetricTile value={receipt.inputs.length} label="immutable inputs" /><MetricTile value="SHA-256" label="canonical digest" /></div>
    <section className="evidence-tray receipt-inputs"><h2>Inputs</h2>{receipt.inputs.map((input) => <p key={input.lockfileSha256}><span className="mono">{input.repository} · {input.commitSha}</span><br /><small className="muted hash">{input.lockfileSha256} · {input.lockfileBytes} bytes · API {input.apiVersion}</small></p>)}</section>
    <section className="panel"><h2>Bounded conclusion</h2><p>{selectedResidual} selected-incident pairs and {receipt.final.pairs.length} bounded verification-universe pairs remain in the final graph.</p></section>
    <details className="panel"><summary>Topology readback evidence</summary>{receipt.topologies.map((item) => <p key={item.snapshotKey}>{item.repository}: {item.packageCount} packages, {item.relationshipCount} relationships, {item.rootCount} roots, depth {item.maxDepth}<br /><code className="hash">{item.extractionSha256}</code></p>)}</details>
    <details className="panel"><summary>Vulnerability and source evidence</summary>{receipt.advisories.map((item) => <article key={`${item.osvId}:${item.packageName}@${item.exactVersion}`}><h3>{item.osvId} · {item.packageName}@{item.exactVersion}</h3><p>Aliases {item.aliases.join(", ") || "none"} · CVSS {item.cvssVector ?? "UNKNOWN"} · withdrawn {item.withdrawnAt ?? "no"}</p><p>Fixed versions {item.fixedVersions.join(", ") || "none recorded"}</p></article>)}<pre>{JSON.stringify({ exploitation: receipt.exploitation, sources: receipt.sources }, null, 2)}</pre></details>
    <details className="panel"><summary>Proposed-fix outcomes</summary>{receipt.proposedFixes.map((fix, index) => <article key={fix.key}><h3>{fix.repository}</h3><p>{fix.origin} · {fix.headSha ?? fix.lockfileSha256}</p><pre>{JSON.stringify(receipt.outcomes[index] ?? { unknown: ["OUTCOME_MISSING"] }, null, 2)}</pre></article>)}</details>
    <details className="panel"><summary>Traversal evidence</summary><h3>Selected-incident baseline</h3><pre>{receipt.baseline.query}</pre><p>{receipt.baseline.pairDigest}</p><h3>Verification-universe baseline</h3><pre>{receipt.verificationUniverse.baseline.query}</pre><p>{receipt.verificationUniverse.baseline.pairDigest}</p><h3>Final combined traversal</h3><pre>{receipt.final.query}</pre><p>{receipt.final.pairDigest}</p></details>
    <section className="panel warning"><h2>Limitations</h2><ul>{receipt.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <div className="row"><a className="button primary" href={`/api/receipts/${digest}`} download>Download receipt.json</a><a className="button" href={`/api/receipts/${digest}/sarif`} download>Download results.sarif</a></div>
  </article>;
}
