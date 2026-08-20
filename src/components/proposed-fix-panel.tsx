"use client";

import { useState } from "react";
import type { ProposedFix, ProposedFixOutcome } from "../domain/types";

export function DiscoveryButton({ incidentKey }: { incidentKey: string }) {
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const discover = async () => {
    const response = await fetch(`/api/incidents/${incidentKey}/proposed-fixes/discover`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: "{}" });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Discovery failed closed.");
    setJobId(body.jobId);
  };
  return <div className="row"><button className="button" onClick={() => void discover()}>Discover public proposed fixes</button>{jobId && <a href={`/jobs/${jobId}`}>Open discovery job</a>}{error && <span role="alert">{error}</span>}</div>;
}

export function AddProposedFixForm({ incidentKey }: { incidentKey: string }) {
  const [repository, setRepository] = useState("");
  const [ref, setRef] = useState("");
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const submit = async () => {
    setError(undefined);
    const response = await fetch(`/api/incidents/${incidentKey}/proposed-fixes`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ kind: "github", repository, ref }) });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Proposed-fix evaluation failed closed.");
    setJobId(body.jobId);
  };
  return <form className="panel stack" onSubmit={(event) => { event.preventDefault(); void submit(); }}><h2>Add an exact public ref</h2><label>Owner/repository<input required value={repository} onChange={(event) => setRepository(event.target.value)} /></label><label>Commit, branch, or tag<input required value={ref} onChange={(event) => setRef(event.target.value)} /></label><button className="button" type="submit">Evaluate complete resolved graph</button>{jobId && <a href={`/jobs/${jobId}`}>Open evaluation job</a>}{error && <span role="alert" className="danger">{error}</span>}</form>;
}

export function ProposedFixPanel({ entries }: { entries: Array<{ fix: ProposedFix; outcome: ProposedFixOutcome }> }) {
  return <section className="stack" aria-labelledby="fix-title"><header><p className="accent">Real resolved states only</p><h2 id="fix-title">Proposed fixes</h2><p className="muted">HydraCut verifies dependency outcomes. It does not certify builds or API compatibility.</p></header>{entries.length === 0 && <div className="panel">No public proposed fix was found. Add an exact commit or hashed lockfile pair.</div>}{entries.map(({ fix, outcome }) => <article className="panel raised stack" key={fix.key}><div className="row"><h3>{fix.repository}</h3><span className="badge">{fix.state}</span></div><p>{fix.origin} · {fix.headSha ?? fix.lockfileSha256}</p><div className="row"><span className="badge">{outcome.removed.length} removed</span><span className="badge">{outcome.persistent.length} persistent</span><span className="badge">{outcome.introduced.length} introduced</span><span className="badge">{outcome.unknown.length} unknown</span></div><p>{outcome.changedPackageCount} package instances changed in the complete resolved lockfile.</p><p>Other advisory-backed findings: {outcome.otherFindings.removed.length} removed, {outcome.otherFindings.persistent.length} persistent, {outcome.otherFindings.introduced.length} introduced.</p>{fix.discoveryEvidence && <details><summary>Discovery evidence</summary><p>PR #{fix.discoveryEvidence.pullNumber} by {fix.discoveryEvidence.actorLogin} ({fix.discoveryEvidence.actorType}) on {fix.discoveryEvidence.headRef}</p><code>{fix.discoveryEvidence.fileListSha256}</code><ul>{fix.discoveryEvidence.changedFiles.map((file) => <li key={file}>{file}</li>)}</ul><pre>{JSON.stringify(fix.discoveryEvidence.sourceStamps, null, 2)}</pre></details>}{fix.sourceUrl && <a href={fix.sourceUrl} rel="noreferrer">Open immutable source evidence</a>}</article>)}</section>;
}
