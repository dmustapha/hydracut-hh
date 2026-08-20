"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

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
  cvss: string;
  productionApplications: number;
  allApplications: number;
  proposedFixes: number;
  state: string;
  freshness: string;
}

export function ContextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const search = useSearchParams();
  const suffix = search.toString();
  return <Link className={className} href={`${href}${suffix ? `?${suffix}` : ""}`}>{children}</Link>;
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
  return <div className="row" aria-label="Role view">{["appsec", "developer", "leader"].map((role) => <button className="button" aria-pressed={active === role} key={role} onClick={() => change(role)}>{role === "appsec" ? "AppSec" : role.charAt(0).toUpperCase() + role.slice(1)}</button>)}</div>;
}

export function RoleProjection() {
  const search = useSearchParams();
  const role = search.get("role") ?? "appsec";
  const application = search.get("application");
  const copy = role === "developer"
    ? `Developer view${application ? ` · ${application}` : " · select an affected application"}`
    : role === "leader" ? "Leader view · portfolio status and blockers" : "AppSec view · incident command and proof controls";
  return <p className="badge" aria-live="polite">{copy}</p>;
}

export function CommandSurface({ incidents }: { incidents: IncidentRow[] }) {
  const role = useSearchParams().get("role") ?? "appsec";
  const verified = incidents.filter((incident) => incident.state === "VERIFIED_WITHIN_BOUNDS").length;
  return <div className="stack">
    <div className="row"><RoleSwitcher /><span className="badge">OSV, KEV, EPSS freshness visible</span></div>
    <header><p className="accent">{role === "leader" ? "Portfolio posture" : role === "developer" ? "Repository action" : "Incident command"}</p><h1>{role === "leader" ? `${incidents.length} incidents · ${verified} verified analyses` : role === "developer" ? "What must this repository change?" : "What requires action now?"}</h1></header>
    <p className="muted">Ordered by KEV, production exposure, EPSS, CVSS, portfolio impact, and verified fix availability.</p>
    <div className="table-wrap desktop-table"><table><caption>{incidents.length} authentic advisory-backed incidents</caption><thead><tr><th>Incident</th><th>Evidence</th><th>Production</th><th>All scopes</th><th className="optional">Proposed fixes</th><th>State</th></tr></thead><tbody>{incidents.map((incident) => <tr key={incident.key}><td><ContextLink href={`/incidents/${incident.key}`}><strong>{incident.title}</strong></ContextLink><br /><span className="muted">{incident.packageVersion}</span></td><td>KEV {incident.kev}<br />EPSS {incident.epss}<br />CVSS {incident.cvss}</td><td>{incident.productionApplications}</td><td>{incident.allApplications}</td><td className="optional">{incident.proposedFixes}</td><td><span className="badge">{incident.state}</span><br /><small>{incident.freshness}</small></td></tr>)}</tbody></table></div>
    <div className="mobile-cards">{incidents.map((incident) => <article className="panel" key={incident.key}><ContextLink href={`/incidents/${incident.key}`}><strong>{incident.title}</strong></ContextLink><p>{incident.packageVersion}</p><p>KEV {incident.kev} · EPSS {incident.epss} · CVSS {incident.cvss}</p><p>{incident.productionApplications} production / {incident.allApplications} all applications</p><span className="badge">{incident.state}</span><small>{incident.freshness}</small></article>)}</div>
  </div>;
}
