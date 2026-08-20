"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface FixRow { key: string; repository: string; state: string; outcome: { removed: string[]; persistent: string[]; introduced: string[]; changedPackageCount: number } }

export default function PlanPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = use(params);
  const search = useSearchParams();
  const [fixes, setFixes] = useState<FixRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [required, setRequired] = useState<string[]>([]);
  const [forbidden, setForbidden] = useState<string[]>([]);
  const [maxRepositories, setMaxRepositories] = useState(3);
  const [planKey, setPlanKey] = useState<string>();
  const [error, setError] = useState<string>();
  useEffect(() => { void fetch(`/api/incidents/${incidentId}/proposed-fixes`).then((r) => r.json()).then((body) => setFixes(body.items)); }, [incidentId]);
  const createPlan = async () => {
    setError(undefined);
    const response = await fetch(`/api/incidents/${incidentId}/plans`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ proposedFixKeys: selected, requiredFixKeys: required, forbiddenFixKeys: forbidden, maxRepositoryChanges: maxRepositories }) });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Plan creation failed closed.");
    setPlanKey(body.key);
  };
  const suffix = search.toString();
  return <main className="stack"><header><p className="accent">Coverage-based planning</p><h1>Portfolio fix plan</h1><p>Objective order: selected production residual, all-scope residual, repositories changed, package churn, stable key. Selection predicts coverage; only the combined HydraDB traversal proves the outcome.</p></header><div className="table-wrap" tabIndex={0}><table><caption>Verified proposed-fix coverage matrix</caption><thead><tr><th>Repository</th><th>Removed pairs</th><th>Persistent</th><th>Introduced</th><th>Selection constraint</th></tr></thead><tbody>{fixes.map((fix) => <tr key={fix.key}><td><label><input type="checkbox" disabled={fix.state !== "VERIFIED_WITHIN_BOUNDS" || forbidden.includes(fix.key)} checked={selected.includes(fix.key)} onChange={(event) => setSelected(event.target.checked ? [...selected, fix.key] : selected.filter((key) => key !== fix.key))} />{fix.repository}</label></td><td>{fix.outcome.removed.join(", ") || "none"}</td><td>{fix.outcome.persistent.join(", ") || "none"}</td><td>{fix.outcome.introduced.join(", ") || "none"}</td><td><select aria-label={`Constraint for ${fix.repository}`} value={required.includes(fix.key) ? "required" : forbidden.includes(fix.key) ? "forbidden" : "optional"} onChange={(event) => { const value = event.target.value; setRequired(value === "required" ? [...new Set([...required, fix.key])] : required.filter((key) => key !== fix.key)); setForbidden(value === "forbidden" ? [...new Set([...forbidden, fix.key])] : forbidden.filter((key) => key !== fix.key)); if (value === "required") setSelected([...new Set([...selected, fix.key])]); if (value === "forbidden") setSelected(selected.filter((key) => key !== fix.key)); }}><option value="optional">Optional</option><option value="required">Required</option><option value="forbidden">Forbidden</option></select></td></tr>)}</tbody></table></div><label>Maximum repositories changed<input type="number" min={1} max={Math.max(1, fixes.length)} value={maxRepositories} onChange={(event) => setMaxRepositories(Number(event.target.value))} /></label><button className="button primary" disabled={!selected.length} onClick={() => void createPlan()}>Create bounded plan</button>{error && <p role="alert" className="danger">{error}</p>}{planKey && <section className="panel"><h2>Why this plan</h2><p>The deterministic solver compared only the displayed verified proposed fixes under these constraints. It does not claim a global optimum; the final combined graph remains unverified until the next action.</p><a className="button primary" href={`/plans/${planKey}/verify${suffix ? `?${suffix}` : ""}`}>Verify combined plan</a></section>}</main>;
}
