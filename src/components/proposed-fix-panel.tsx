"use client";

import { useState } from "react";
import type { ProposedFix, ProposedFixOutcome } from "../domain/types";
import { EmptyState, ContextLink, StatusLozenge } from "./atlas";

export function DiscoveryButton({ incidentKey }: { incidentKey: string }) {
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const discover = async () => {
    setPending(true); setError(undefined);
    try { const response = await fetch(`/api/incidents/${incidentKey}/proposed-fixes/discover`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: "{}" }); const body = await response.json().catch(() => ({})); if (!response.ok) return setError(body.message ?? "Discovery failed closed."); setJobId(body.jobId); } catch { setError("Discovery is unavailable. No evidence was changed."); } finally { setPending(false); }
  };
  return <div className="row"><button className="button" disabled={pending} aria-busy={pending} onClick={() => void discover()}>{pending ? "Discovering…" : "Discover public proposed fixes"}</button>{jobId && <ContextLink href={`/jobs/${jobId}`}>Open discovery job</ContextLink>}{error && <span role="alert" className="danger">{error}</span>}</div>;
}

export function AddProposedFixForm({ incidentKey }: { incidentKey: string }) {
  const [repository, setRepository] = useState("");
  const [ref, setRef] = useState("");
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const submit = async () => {
    setError(undefined);
    setPending(true);
    try { const response = await fetch(`/api/incidents/${incidentKey}/proposed-fixes`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ kind: "github", repository, ref }) }); const body = await response.json().catch(() => ({})); if (!response.ok) return setError(body.message ?? "Proposed-fix evaluation failed closed."); setJobId(body.jobId); } catch { setError("Evaluation is unavailable. No evidence was changed."); } finally { setPending(false); }
  };
  return <form className="panel stack" onSubmit={(event) => { event.preventDefault(); if (!pending) void submit(); }}><h2>Add an exact public ref</h2><label>Owner/repository<input required value={repository} onChange={(event) => setRepository(event.target.value)} /></label><label>Commit, branch, or tag<input required value={ref} onChange={(event) => setRef(event.target.value)} /></label><button className="button" disabled={pending} aria-busy={pending} type="submit">{pending ? "Evaluating immutable graph…" : "Evaluate complete resolved graph"}</button>{jobId && <ContextLink href={`/jobs/${jobId}`}>Open evaluation job</ContextLink>}{error && <span role="alert" className="danger">{error}</span>}</form>;
}

export function ProposedFixPanel({ entries }: { entries: Array<{ fix: ProposedFix; outcome: ProposedFixOutcome }> }) {
  const maxOutcome = Math.max(1, ...entries.map(({ outcome }) => outcome.removed.length + outcome.persistent.length + outcome.introduced.length + outcome.unknown.length));
  return <section className="stack" aria-labelledby="fix-title"><header><p className="accent">Real resolved states only</p><h2 id="fix-title">Proposed fixes</h2><p className="muted">HydraCut verifies dependency outcomes. It does not certify builds or API compatibility.</p></header>{entries.length === 0 && <EmptyState title="No complete proposed-fix state" description="Discovery returned no authentic resolved graph. Add an exact public commit or hashed manifest and lockfile pair for evaluation." />}{entries.map(({ fix, outcome }) => <article className="panel raised stack" key={fix.key}><div className="row"><h3>{fix.repository}</h3><StatusLozenge state={fix.state} /></div><p className="mono hash">{fix.origin} · head {fix.headSha ?? "unavailable"} · lock {fix.lockfileSha256} · manifest {fix.manifestSha256} · snapshot {fix.snapshotKey}</p><div className="row"><span className="badge">{outcome.removed.length} removed</span><span className="badge">{outcome.persistent.length} persistent</span><span className="badge">{outcome.introduced.length} introduced</span><span className="badge">{outcome.unknown.length} unknown</span></div><div className="outcome-bars" aria-label="Outcome small multiples"><span style={{ width: `${(outcome.removed.length / maxOutcome) * 100}%` }}><b>removed</b>{outcome.removed.length}</span><span style={{ width: `${(outcome.persistent.length / maxOutcome) * 100}%` }}><b>persistent</b>{outcome.persistent.length}</span><span style={{ width: `${(outcome.introduced.length / maxOutcome) * 100}%` }}><b>introduced</b>{outcome.introduced.length}</span><span style={{ width: `${(outcome.unknown.length / maxOutcome) * 100}%` }}><b>unknown</b>{outcome.unknown.length}</span></div><p>{outcome.changedPackageCount} package instances changed in the complete resolved lockfile.</p><p>Other advisory-backed findings: {outcome.otherFindings.removed.length} removed, {outcome.otherFindings.persistent.length} persistent, {outcome.otherFindings.introduced.length} introduced.</p>{fix.discoveryEvidence && <details><summary>Discovery evidence</summary><p>PR #{fix.discoveryEvidence.pullNumber} by {fix.discoveryEvidence.actorLogin} ({fix.discoveryEvidence.actorType}) on {fix.discoveryEvidence.headRef}</p><code>{fix.discoveryEvidence.fileListSha256}</code><ul>{fix.discoveryEvidence.changedFiles.map((file) => <li key={file}>{file}</li>)}</ul><pre>{JSON.stringify(fix.discoveryEvidence.sourceStamps, null, 2)}</pre></details>}{fix.sourceUrl && <a href={fix.sourceUrl} rel="noreferrer">Open immutable source evidence</a>}</article>)}</section>;
}
