"use client";

import { useState } from "react";
import type { ExposurePair, Scope, TraversalReceipt } from "../domain/types";
import { ContextLink, MetricTile, StatusLozenge, WitnessGraph } from "./atlas";

export function BaselineControls({ incidentKey, sourceFindingIds, selectedCoordinate, availableCoordinates }: { incidentKey: string; sourceFindingIds: string[]; selectedCoordinate: string; availableCoordinates: string[] }) {
  const allScopes: Scope[] = ["production", "development", "optional", "peer"];
  const [scopes, setScopes] = useState<Scope[]>(["production"]);
  const [verificationSourceCoordinates, setVerificationSources] = useState<string[]>([selectedCoordinate]);
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const run = async () => {
    setError(undefined);
    setPending(true);
    try { const response = await fetch(`/api/incidents/${incidentKey}/traversals`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ scopes, sourceFindingIds, verificationSourceCoordinates }) }); const body = await response.json().catch(() => ({})); if (!response.ok) return setError(body.message ?? "Baseline analysis failed closed."); setJobId(body.jobId); } catch { setError("Baseline analysis is unavailable. No evidence was changed."); } finally { setPending(false); }
  };
  return <section className="panel stack"><h2>Baseline and verification universe</h2><div className="row">{allScopes.map((scope) => <label key={scope}><input type="checkbox" checked={scopes.includes(scope)} disabled={scope === "production"} onChange={(event) => setScopes(event.target.checked ? [...scopes, scope] : scopes.filter((item) => item !== scope))} />{scope}</label>)}</div><fieldset><legend>Advisory-backed exact versions for before/after proof</legend>{availableCoordinates.map((coordinate) => <label key={coordinate}><input type="checkbox" checked={verificationSourceCoordinates.includes(coordinate)} disabled={coordinate === selectedCoordinate} onChange={(event) => setVerificationSources(event.target.checked ? [...verificationSourceCoordinates, coordinate] : verificationSourceCoordinates.filter((item) => item !== coordinate))} />{coordinate}</label>)}</fieldset><button className="button primary" disabled={pending} aria-busy={pending} onClick={() => void run()}>{pending ? "Starting native baseline…" : "Run native baselines"}</button>{jobId && <ContextLink href={`/jobs/${jobId}`}>Open baseline job</ContextLink>}{error && <p role="alert" className="danger">{error}</p>}</section>;
}

function Witness({ pair }: { pair: ExposurePair }) {
  return <ol aria-label="One shortest dependency witness">{pair.witnessNodeKeys.map((node, index) => <li key={`${node}:${index}`}>{node}{index < pair.witnessRelationshipTypes.length ? ` via ${pair.witnessRelationshipTypes[index]}` : ""}</li>)}</ol>;
}

function WitnessCards({ pairs, incidentKey }: { pairs: ExposurePair[]; incidentKey?: string | undefined }) {
  return <div className="mobile-cards">{pairs.map((pair) => <article className="panel stack" key={`mobile:${pair.sourceKey}:${pair.applicationKey}`}><div className="row" style={{ justifyContent: "space-between" }}><strong className="mono">{pair.sourceKey}</strong><span className="mono">depth {pair.depth}</span></div><p className="mono">→ {pair.applicationKey}</p><Witness pair={pair} />{incidentKey && <ContextLink className="button" href={`/graph?incident=${encodeURIComponent(incidentKey)}&pair=${encodeURIComponent(`${pair.sourceKey}:${pair.applicationKey}`)}`}>Inspect pair</ContextLink>}</article>)}</div>;
}

export function ImpactMatrix({ traversal, incidentKey, title = "Portfolio impact" }: { traversal: TraversalReceipt; incidentKey?: string; title?: string }) {
  const headingId = `impact-${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
  return <section className="stack-lg" aria-labelledby={headingId}><div className="section-head"><h2 id={headingId}>{title}</h2><StatusLozenge state={traversal.state} /></div>{traversal.refusalReasons.length > 0 && <div className="panel danger" role="alert">Verification refused: {traversal.refusalReasons.join(", ")}</div>}<div className="grid-4"><MetricTile tone="accented" value={traversal.pairs.length} label="source-to-application pairs" /><MetricTile value={traversal.bounds.matchedSourceCount} label="matched sources" /><MetricTile value={traversal.bounds.matchedTargetCount} label="matched applications" /><MetricTile value={`${traversal.elapsedMs.toFixed(0)}ms`} label="native traversal" /></div><WitnessGraph pairs={traversal.pairs} title={`${title} witness map`} incidentKey={incidentKey} traversalState={traversal.state} /><div className="table-wrap impact-table" tabIndex={0}><table><caption>Canonical pair evidence · ordered witness readback</caption><thead><tr><th>Source</th><th>Application</th><th>Depth</th><th>One witness</th></tr></thead><tbody>{traversal.pairs.map((pair) => <tr key={`${pair.sourceKey}:${pair.applicationKey}`}><td className="mono"><ContextLink href={`/graph?incident=${encodeURIComponent(incidentKey ?? "")}&pair=${encodeURIComponent(`${pair.sourceKey}:${pair.applicationKey}`)}`}>{pair.sourceKey}</ContextLink></td><td className="mono">{pair.applicationKey}</td><td>{pair.depth}</td><td><Witness pair={pair} /></td></tr>)}</tbody></table></div><WitnessCards pairs={traversal.pairs} incidentKey={incidentKey} /><details className="evidence-tray"><summary>Raw HydraDB proof</summary><pre>{traversal.query}</pre><p className="mono">Epoch {traversal.readEpoch} · bookmark {traversal.bookmark}</p><p className="mono">Result limit {traversal.bounds.resultLimit} · pair-key digest {traversal.pairKeyDigest} · expected BFS digest {traversal.bounds.expectedPairKeyDigest} · parity {traversal.pairKeyDigest === traversal.bounds.expectedPairKeyDigest ? "PASS" : "REFUSED"}</p></details></section>;
}
