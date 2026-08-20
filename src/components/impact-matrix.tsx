"use client";

import { useState } from "react";
import type { ExposurePair, Scope, TraversalReceipt } from "../domain/types";

export function BaselineControls({ incidentKey, sourceFindingIds, selectedCoordinate, availableCoordinates }: { incidentKey: string; sourceFindingIds: string[]; selectedCoordinate: string; availableCoordinates: string[] }) {
  const allScopes: Scope[] = ["production", "development", "optional", "peer"];
  const [scopes, setScopes] = useState<Scope[]>(["production"]);
  const [verificationSourceCoordinates, setVerificationSources] = useState<string[]>([selectedCoordinate]);
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const run = async () => {
    setError(undefined);
    const response = await fetch(`/api/incidents/${incidentKey}/traversals`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ scopes, sourceFindingIds, verificationSourceCoordinates }) });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Baseline analysis failed closed.");
    setJobId(body.jobId);
  };
  return <section className="panel stack"><h2>Baseline and verification universe</h2><div className="row">{allScopes.map((scope) => <label key={scope}><input type="checkbox" checked={scopes.includes(scope)} disabled={scope === "production"} onChange={(event) => setScopes(event.target.checked ? [...scopes, scope] : scopes.filter((item) => item !== scope))} />{scope}</label>)}</div><fieldset><legend>Advisory-backed exact versions for before/after proof</legend>{availableCoordinates.map((coordinate) => <label key={coordinate}><input type="checkbox" checked={verificationSourceCoordinates.includes(coordinate)} disabled={coordinate === selectedCoordinate} onChange={(event) => setVerificationSources(event.target.checked ? [...verificationSourceCoordinates, coordinate] : verificationSourceCoordinates.filter((item) => item !== coordinate))} />{coordinate}</label>)}</fieldset><button className="button primary" onClick={() => void run()}>Run native baselines</button>{jobId && <a href={`/jobs/${jobId}`}>Open baseline job</a>}{error && <p role="alert" className="danger">{error}</p>}</section>;
}

function Witness({ pair }: { pair: ExposurePair }) {
  return <ol aria-label="One shortest dependency witness">{pair.witnessNodeKeys.map((node, index) => <li key={`${node}:${index}`}>{node}{index < pair.witnessRelationshipTypes.length ? ` via ${pair.witnessRelationshipTypes[index]}` : ""}</li>)}</ol>;
}

export function ImpactMatrix({ traversal }: { traversal: TraversalReceipt }) {
  return <section className="stack" aria-labelledby="impact-title"><div className="row"><h2 id="impact-title">Portfolio impact</h2><span className="badge">{traversal.state}</span></div>{traversal.refusalReasons.length > 0 && <div className="panel danger" role="alert">Verification refused: {traversal.refusalReasons.join(", ")}</div>}<div className="grid-4"><div className="panel"><span className="metric">{traversal.pairs.length}</span><p>source-to-application pairs</p></div><div className="panel"><span className="metric">{traversal.bounds.matchedSourceCount}</span><p>matched sources</p></div><div className="panel"><span className="metric">{traversal.bounds.matchedTargetCount}</span><p>matched applications</p></div><div className="panel"><span className="metric">{traversal.elapsedMs.toFixed(0)}ms</span><p>native traversal</p></div></div><div className="table-wrap"><table><caption>Reachable pairs within displayed bounds</caption><thead><tr><th>Source</th><th>Application</th><th>Depth</th><th>One witness</th></tr></thead><tbody>{traversal.pairs.map((pair) => <tr key={`${pair.sourceKey}:${pair.applicationKey}`}><td>{pair.sourceKey}</td><td>{pair.applicationKey}</td><td>{pair.depth}</td><td><Witness pair={pair} /></td></tr>)}</tbody></table></div><details className="panel"><summary>Raw HydraDB proof</summary><pre>{traversal.query}</pre><p>Epoch {traversal.readEpoch} · bookmark {traversal.bookmark}</p><p>Result limit {traversal.bounds.resultLimit} · digest {traversal.pairDigest}</p></details></section>;
}
