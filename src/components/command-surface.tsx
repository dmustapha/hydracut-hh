"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { MetricTile, PageHeader, StatusLozenge } from "./atlas";

export function ClientProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export interface IncidentRow {
  key: string;
  title: string;
  packageVersion: string;
  kev: string;
  epss: string;
  cvss: number | null;
  applicationKeys: string[];
  productionApplications: number;
  allApplications: number;
  proposedFixes: number;
  state: string;
  freshness: string;
}

export function ContextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const search = useSearchParams();
  const suffix = search.toString();
  const current = usePathname() === href;
  return <Link aria-current={current ? "page" : undefined} className={className} href={`${href}${suffix ? `?${suffix}` : ""}`}>{children}</Link>;
}

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const active = search.get("role") ?? "appsec";
  const change = (role: string) => {
    const next = new URLSearchParams(search);
    next.set("role", role);
    router.push(`${pathname}?${next.toString()}`);
  };
  return <div className="role-switch" aria-label="Role view">{["appsec", "developer", "leader"].map((role) => <button className="button" aria-pressed={active === role} key={role} onClick={() => change(role)}>{role === "appsec" ? "AppSec" : role.charAt(0).toUpperCase() + role.slice(1)}</button>)}</div>;
}

export function RoleProjection() {
  const search = useSearchParams();
  const role = search.get("role") ?? "appsec";
  const application = search.get("application");
  const copy = role === "developer"
    ? `Developer view${application ? ` · ${application}` : " · select an affected application"}`
    : role === "leader" ? "Leader view · portfolio status and blockers" : "AppSec view · incident command and proof controls";
  return <p className="context-key" aria-live="polite" style={{ margin: ".75rem 0 0" }}>{copy}</p>;
}

export function filterIncidentRows(incidents: IncidentRow[], filters: { stateFilter: string; scopeFilter: string; kevFilter: string; fixFilter: string; query: string; applicationFilter: string; epssThreshold: string; cvssThreshold: string }) {
  const query = filters.query.toLowerCase();
  const application = filters.applicationFilter.toLowerCase();
  return incidents.filter((incident) => (filters.stateFilter === "all" || incident.state === filters.stateFilter)
    && (filters.scopeFilter === "all" || (filters.scopeFilter === "production" ? incident.productionApplications > 0 : incident.allApplications > incident.productionApplications))
    && (filters.kevFilter === "all" || incident.kev === filters.kevFilter)
    && (filters.fixFilter === "all" || (filters.fixFilter === "available" ? incident.proposedFixes > 0 : incident.proposedFixes === 0))
    && incident.title.toLowerCase().includes(query)
    && (!application || incident.applicationKeys.some((key) => key.toLowerCase().includes(application)))
    && (!filters.epssThreshold || Number.parseFloat(incident.epss) >= Number(filters.epssThreshold))
    && (!filters.cvssThreshold || (incident.cvss !== null && incident.cvss >= Number(filters.cvssThreshold))));
}

export function CommandSurface({ incidents }: { incidents: IncidentRow[] }) {
  const role = useSearchParams().get("role") ?? "appsec";
  const search = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(search.get("q") ?? "");
  const [stateFilter, setStateFilter] = useState(search.get("state") ?? "all");
  const [scopeFilter, setScopeFilter] = useState(search.get("scope") ?? "all");
  const [kevFilter, setKevFilter] = useState(search.get("kev") ?? "all");
  const [fixFilter, setFixFilter] = useState(search.get("fixes") ?? "all");
  const [applicationFilter, setApplicationFilter] = useState(search.get("application") ?? "");
  const [epssThreshold, setEpssThreshold] = useState(search.get("epss") ?? "");
  const [cvssThreshold, setCvssThreshold] = useState(search.get("cvss") ?? "");
  const [selectedKey, setSelectedKey] = useState(search.get("selected") ?? "");
  const verified = incidents.filter((incident) => incident.state === "VERIFIED_WITHIN_BOUNDS").length;
  const production = incidents.reduce((sum, incident) => sum + incident.productionApplications, 0);
  const partial = incidents.filter((incident) => incident.state.includes("PARTIAL") || incident.state.includes("UNKNOWN")).length;
  const filtered = filterIncidentRows(incidents, { stateFilter, scopeFilter, kevFilter, fixFilter, query, applicationFilter, epssThreshold, cvssThreshold });
  const selected = filtered.find((incident) => incident.key === selectedKey);
  const updateFilters = (nextQuery: string, nextState: string, nextScope = scopeFilter, nextKev = kevFilter, nextFixes = fixFilter, nextApplication = applicationFilter, nextEpss = epssThreshold, nextCvss = cvssThreshold) => { const params = new URLSearchParams(search); const values: Array<[string, string]> = [["q", nextQuery], ["state", nextState], ["scope", nextScope], ["kev", nextKev], ["fixes", nextFixes], ["application", nextApplication], ["epss", nextEpss], ["cvss", nextCvss]]; for (const [key, value] of values) value && value !== "all" ? params.set(key, value) : params.delete(key); router.replace(`/incidents?${params.toString()}`); };
  const selectIncident = (key: string) => { setSelectedKey(key); const params = new URLSearchParams(search); params.set("selected", key); router.replace(`/incidents?${params.toString()}`); };
  return <div className="stack-lg">
    <PageHeader eyebrow={role === "leader" ? "Portfolio posture" : role === "developer" ? "Repository action" : "Incident command"} title={role === "leader" ? `${incidents.length} incidents · ${verified} verified analyses` : role === "developer" ? "What must this repository change?" : "What requires action now?"} description="Ordered by KEV, production exposure, EPSS, CVSS, portfolio impact, and verified fix availability." />
    <div className="grid-4"><MetricTile tone="accented" value={incidents.length} label="authentic incidents" /><MetricTile value={production} label="production applications" /><MetricTile value={verified} label="verified within bounds" /><MetricTile value={partial} label="partial / unknown" /></div>
    <div className="evidence-tray filter-bar"><label>Find advisory<input value={query} onChange={(event) => { setQuery(event.target.value); updateFilters(event.target.value, stateFilter); }} placeholder="CVE, package, advisory…" /></label><label>Application<input value={applicationFilter} onChange={(event) => { setApplicationFilter(event.target.value); updateFilters(query, stateFilter, scopeFilter, kevFilter, fixFilter, event.target.value); }} placeholder="repository or app" /></label><label>State<select value={stateFilter} onChange={(event) => { setStateFilter(event.target.value); updateFilters(query, event.target.value); }}><option value="all">All states</option>{[...new Set(incidents.map((item) => item.state))].map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Scope<select value={scopeFilter} onChange={(event) => { setScopeFilter(event.target.value); updateFilters(query, stateFilter, event.target.value); }}><option value="all">All scopes</option><option value="production">Production</option><option value="non-production">Non-production</option></select></label><label>KEV<select value={kevFilter} onChange={(event) => { setKevFilter(event.target.value); updateFilters(query, stateFilter, scopeFilter, event.target.value); }}><option value="all">Any KEV</option><option value="LISTED">KEV listed</option><option value="NOT_LISTED">Not listed</option></select></label><label>EPSS ≥<input type="number" min="0" max="1" step=".01" value={epssThreshold} onChange={(event) => { setEpssThreshold(event.target.value); updateFilters(query, stateFilter, scopeFilter, kevFilter, fixFilter, applicationFilter, event.target.value); }} /></label><label>CVSS ≥<input type="number" min="0" max="10" step=".1" value={cvssThreshold} onChange={(event) => { setCvssThreshold(event.target.value); updateFilters(query, stateFilter, scopeFilter, kevFilter, fixFilter, applicationFilter, epssThreshold, event.target.value); }} /></label><label>Proposed fix<select value={fixFilter} onChange={(event) => { setFixFilter(event.target.value); updateFilters(query, stateFilter, scopeFilter, kevFilter, event.target.value); }}><option value="all">Any fix state</option><option value="available">Available</option><option value="none">None found</option></select></label><span className="mono muted">{filtered.length} / {incidents.length} shown</span></div>
    <div className="incident-layout"><div><div className="table-wrap desktop-table" tabIndex={0}><table><caption>{filtered.length} authentic advisory-backed incidents</caption><thead><tr><th>Incident</th><th>Evidence</th><th>Production</th><th>All scopes</th><th className="optional">Proposed fixes</th><th>State</th></tr></thead><tbody>{filtered.map((incident) => <tr className={selectedKey === incident.key ? "row-selected" : ""} tabIndex={0} onClick={() => selectIncident(incident.key)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectIncident(incident.key); }} key={incident.key}><td><ContextLink href={`/incidents/${incident.key}`}><strong>{incident.title}</strong></ContextLink><br /><span className="muted">{incident.packageVersion}</span></td><td>KEV {incident.kev}<br />EPSS {incident.epss}<br />CVSS {incident.cvss ?? "UNKNOWN"}</td><td>{incident.productionApplications}</td><td>{incident.allApplications}</td><td className="optional">{incident.proposedFixes}</td><td><StatusLozenge state={incident.state} /><br /><small>{incident.freshness}</small></td></tr>)}</tbody></table></div><div className="mobile-cards">{filtered.map((incident) => <article className={`panel stack ${selectedKey === incident.key ? "row-selected" : ""}`} onClick={() => selectIncident(incident.key)} key={incident.key}><div className="row" style={{ justifyContent: "space-between" }}><ContextLink href={`/incidents/${incident.key}`}><strong>{incident.title}</strong></ContextLink><StatusLozenge state={incident.state} /></div><p className="mono muted">{incident.packageVersion}</p><p>KEV {incident.kev} · EPSS {incident.epss} · CVSS {incident.cvss ?? "UNKNOWN"}</p><p>{incident.productionApplications} production / {incident.allApplications} all applications · {incident.proposedFixes} proposed fixes</p><small className="faint">{incident.freshness}</small></article>)}</div></div>{selected && <aside className="evidence-tray incident-preview"><p className="eyebrow">Selected incident</p><h2>{selected.title}</h2><StatusLozenge state={selected.state} /><p className="muted">{selected.packageVersion}</p><p>{selected.productionApplications} production applications within the displayed bound.</p><ContextLink className="button primary" href={`/incidents/${selected.key}`}>Open dossier</ContextLink></aside>}</div>
  </div>;
}
