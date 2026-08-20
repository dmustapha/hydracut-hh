"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ExposurePair } from "../domain/types";

export function AppMark({ size = 32 }: { size?: number }) {
  return <img src="/logo.svg" width={size} height={size} alt="HydraCut mark" />;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <header className="page-header"><div className="page-header-coordinate" aria-hidden="true">HC / EVIDENCE SURFACE</div><div className="row page-header-row"><div className="page-header-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div></header>;
}

export function StatusLozenge({ state }: { state: string }) {
  const normalized = state.toUpperCase();
  const toneMap: Record<string, string> = { VERIFIED_WITHIN_BOUNDS: "verified", COMPLETE: "verified", READY: "verified", IMMUTABLE: "verified", BOUNDED: "info", PARTIAL: "partial", RUNNING: "partial", UNKNOWN: "partial", STALE: "partial", LOADING: "partial", FAILED: "failed", REFUSED: "failed", ERROR: "failed", CANCELLED: "failed", DOWN: "failed", COMPLETE_WITH_BLOCKERS: "partial", NOT_VERIFIED: "partial" };
  const tone = toneMap[normalized] ?? "info";
  return <span className={`status-lozenge ${tone}`}>{normalized.replaceAll("_", " ")}</span>;
}

export function MetricTile({ value, label, tone }: { value: string | number; label: string; tone?: "accented" }) {
  return <article className={`metric-card ${tone ?? ""}`}><span className="metric-rule" aria-hidden="true" /><span className="metric">{value}</span><span className="metric-label">{label}</span></article>;
}

export function EmptyState({ eyebrow = "Evidence boundary", title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <section className="empty-state"><span className="empty-state-mark" aria-hidden="true">∅</span><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p>{action && <div className="empty-state-action">{action}</div>}</div></section>;
}

function currentContext(search: URLSearchParams, pathname: string) {
  const values: string[] = [];
  const incident = search.get("incident") ?? (pathname.match(/incidents\/([^/]+)/)?.[1]);
  const application = search.get("application");
  const portfolio = search.get("portfolio");
  const plan = search.get("plan") ?? pathname.match(/plans\/([^/]+)/)?.[1];
  const digest = search.get("digest") ?? pathname.match(/proof\/([^/]+)/)?.[1];
  if (incident) values.push(`incident ${shorten(incident, 20)}`);
  if (application) values.push(`application ${shorten(application, 24)}`);
  if (portfolio) values.push(`portfolio ${shorten(portfolio, 20)}`);
  if (!portfolio && (pathname === "/portfolio" || pathname === "/imports")) values.push("portfolio default");
  if (plan) values.push(`plan ${plan.slice(0, 12)}`);
  if (digest) values.push(`receipt ${digest.slice(0, 12)}`);
  return values;
}

export function ContextBar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const context = currentContext(search, pathname);
  const role = search.get("role") ?? "appsec";
  const changeRole = (nextRole: string) => { const next = new URLSearchParams(search); next.set("role", nextRole); router.push(`${pathname}?${next.toString()}`); };
  return <div className="context-bar"><div><span className="context-key">Active context</span>{context.length ? context.map((item) => <span className="context-value" key={item}>{item}</span>) : <span className="faint">No incident or scope selected</span>}</div><div className="context-controls"><span className="context-key">Role</span>{["appsec", "developer", "leader"].map((item) => <button className="context-role" key={item} aria-pressed={role === item} onClick={() => changeRole(item)}>{item === "appsec" ? "AppSec" : item[0]!.toUpperCase() + item.slice(1)}</button>)}</div></div>;
}

type WorkflowProps = { active: string; incidentId?: string; planId?: string; digest?: string };
export function WorkflowRail({ active, incidentId, planId, digest }: WorkflowProps) {
  const base = incidentId ? `/incidents/${incidentId}` : "/incidents";
  const steps: Array<[string, string, string]> = [["baseline", "01 Baseline", base], ["impact", "02 Impact", `${base}/impact`], ["proposed-fixes", "03 Proposed fixes", `${base}/proposed-fixes`], ["plan", "04 Coverage plan", `${base}/plan`], ["verify", "05 Combined proof", planId ? `/plans/${planId}/verify` : `${base}/plan`], ["receipt", "06 Receipt", digest ? `/proof/${digest}` : "/proof"]];
  return <nav className="workflow-rail" aria-label="Incident workflow">{steps.map(([key, label, href], index) => <ContextLink className={`workflow-step ${key === active ? "active" : index < steps.findIndex(([item]) => item === active) ? "done" : ""}`} href={href} key={key}>{label}</ContextLink>)}</nav>;
}

export function ContextLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const destination = mergeHrefWithContext(href, search);
  return <Link aria-current={pathname === destination.pathname ? "page" : undefined} className={className} href={destination.href}>{children}</Link>;
}

export function mergeHrefWithContext(href: string, current: URLSearchParams | string): { pathname: string; href: string } {
  const destination = new URL(href, "http://hydracut.local");
  const merged = new URLSearchParams(typeof current === "string" ? current : current.toString());
  destination.searchParams.forEach((value, key) => merged.set(key, value));
  const query = merged.toString();
  return { pathname: destination.pathname, href: `${destination.pathname}${query ? `?${query}` : ""}${destination.hash}` };
}

function shorten(value: string, length = 18) { return value.length > length ? `${value.slice(0, Math.ceil(length / 2))}…${value.slice(-Math.floor(length / 2))}` : value; }
type GraphNode = { id: string; key: string; pairKey: string; x: number; y: number; kind: "source" | "witness" | "application" };
type GraphEdge = { from: string; to: string; type: string; pairKey: string };

function applicationNode(key: string, index: number, length: number) { return index === length - 1 || key.includes(":app:") || key.includes("application/"); }
function graphX(index: number, length: number) { return 84 + (index / Math.max(1, length - 1)) * 832; }
function graphY(lane: number) { return 76 + (lane % 4) * 96; }

export function witnessGeometry(pairs: ExposurePair[]) {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  pairs.forEach((pair, lane) => {
    const pairKey = `${pair.sourceKey}:${pair.applicationKey}`;
    pair.witnessNodeKeys.forEach((key, index) => {
      const kind = index === 0 ? "source" : applicationNode(key, index, pair.witnessNodeKeys.length) ? "application" : "witness";
      const nodeId = `${pairKey}:${key}`;
      nodes.set(nodeId, { id: nodeId, key, pairKey, x: graphX(index, pair.witnessNodeKeys.length), y: graphY(lane), kind });
      if (index < pair.witnessNodeKeys.length - 1) edges.push({ from: nodeId, to: `${pairKey}:${pair.witnessNodeKeys[index + 1]!}`, type: pair.witnessRelationshipTypes[index]!, pairKey });
    });
  });
  return { nodes: [...nodes.values()], edges };
}

export function WitnessGraph({ pairs, title = "Native traversal witness", incidentKey, selectedPairKey, traversalState = "VERIFIED_WITHIN_BOUNDS" }: { pairs: ExposurePair[]; title?: string; incidentKey?: string | undefined; selectedPairKey?: string | undefined; traversalState?: string }) {
  const validPairs = traversalState === "VERIFIED_WITHIN_BOUNDS" ? pairs.filter((pair) => pair.witnessNodeKeys.length > 1 && pair.witnessRelationshipTypes.length === pair.witnessNodeKeys.length - 1) : [];
  const [selected, setSelected] = useState(selectedPairKey ?? (validPairs[0] ? `${validPairs[0].sourceKey}:${validPairs[0].applicationKey}` : ""));
  const graph = useMemo(() => witnessGeometry(validPairs), [validPairs]);
  const selectedPair = validPairs.find((pair) => `${pair.sourceKey}:${pair.applicationKey}` === selected);
  const pairHref = (pair: ExposurePair) => incidentKey ? `/graph?incident=${encodeURIComponent(incidentKey)}&pair=${encodeURIComponent(`${pair.sourceKey}:${pair.applicationKey}`)}` : null;
  return <section className="graph-panel" aria-label={title}><div className="graph-toolbar"><span>{title}</span><span className="mono">{validPairs.length} verified witness pair{validPairs.length === 1 ? "" : "s"}</span></div>{validPairs.length ? <><div className="graph-legend"><span><i className="legend-source" /> source</span><span><i className="legend-witness" /> dependency witness</span><span><i className="legend-application" /> application</span><span className="faint">Choose a canonical path to inspect</span></div><div className="graph-path-list" aria-label={`${title} paths`}>{validPairs.map((pair) => { const pairKey = `${pair.sourceKey}:${pair.applicationKey}`; return <button className="context-role" aria-pressed={selected === pairKey} key={pairKey} onClick={() => setSelected(pairKey)}>{shorten(pair.applicationKey, 24)}</button>; })}</div><svg className="graph-canvas" viewBox="0 0 1000 440" aria-hidden="true"><g className="graph-axis"><text x="84" y="28">SOURCE EVIDENCE</text><text x="500" y="28" textAnchor="middle">DEPENDENCY WITNESS</text><text x="916" y="28" textAnchor="end">APPLICATION</text></g><g>{graph.edges.map((edge, index) => { const from = graph.nodes.find((node) => node.id === edge.from); const to = graph.nodes.find((node) => node.id === edge.to); if (!from || !to) return null; const isSelected = selected === edge.pairKey; return <g key={`${edge.pairKey}-${index}`} className={isSelected ? "graph-edge-selected" : ""} onClick={() => setSelected(edge.pairKey)}><line className={`graph-line ${isSelected ? "" : "secondary"}`} x1={from.x + 24} y1={from.y} x2={to.x - 24} y2={to.y} /><text className="graph-edge-label" x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 9} textAnchor="middle">{shorten(edge.type, 13)}</text></g>; })}</g><g>{graph.nodes.map((node) => <g key={node.id} className={`graph-node-group ${selected === node.pairKey ? "selected" : ""}`} onClick={() => setSelected(node.pairKey)}><circle className={`graph-node ${node.kind}`} cx={node.x} cy={node.y} r="24"/><text className="graph-label" x={node.x} y={node.y + 4} textAnchor="middle">{shorten(node.key.split("/").at(-1) ?? node.key, 12)}</text><text className="graph-type" x={node.x} y={node.y + 42} textAnchor="middle">{node.kind}</text></g>)}</g></svg><div className="graph-inspector" aria-live="polite">{selectedPair ? <><div><span className="eyebrow">Selected path</span><strong>{shorten(selectedPair.sourceKey, 30)} → {shorten(selectedPair.applicationKey, 30)}</strong><span className="mono">depth {selectedPair.depth} · {selectedPair.scopes.join(", ")}</span></div>{pairHref(selectedPair) && <ContextLink className="button" href={pairHref(selectedPair)!}>Open canonical pair</ContextLink>}</> : <span className="muted">Choose a verified path to inspect its evidence.</span>}</div></> : <EmptyState title="No complete witness path" description="The graph refuses to infer topology from partial or malformed traversal evidence." />}</section>;
}

export function comparisonGeometry(before: ExposurePair[], after: ExposurePair[]) {
  const pairKeys = [...new Set([...before, ...after].map((pair) => `${pair.sourceKey}:${pair.applicationKey}`))].sort();
  const nodes = pairKeys.flatMap((pairKey, lane) => {
    const pairs = [...before, ...after].filter((pair) => `${pair.sourceKey}:${pair.applicationKey}` === pairKey);
    const keys = [...new Set(pairs.flatMap((pair) => pair.witnessNodeKeys))];
    return keys.map((key, index) => ({ id: `${pairKey}:${key}`, key, x: graphX(index, keys.length), y: graphY(lane) }));
  });
  const drawEdges = (pairs: ExposurePair[], kind: "before" | "after") => pairs.flatMap((pair) => {
    const pairKey = `${pair.sourceKey}:${pair.applicationKey}`;
    return pair.witnessNodeKeys.slice(0, -1).map((from, index) => ({ from: `${pairKey}:${from}`, to: `${pairKey}:${pair.witnessNodeKeys[index + 1]!}`, kind }));
  });
  return { nodes, edges: [...drawEdges(before, "before"), ...drawEdges(after, "after")] };
}

export function PathComparison({ before, after, title }: { before: ExposurePair[]; after: ExposurePair[]; title: string }) {
  const geometry = comparisonGeometry(before, after);
  const edges = geometry.edges;
  return <section className="comparison-panel evidence-tray"><div className="section-head"><h2>{title}</h2><span className="mono">same coordinate space · {before.length} → {after.length}</span></div><svg className="graph-canvas" viewBox="0 0 1000 440" role="img" aria-label={`${title} before and after path comparison`}><g>{edges.map((edge, index) => { const from = geometry.nodes.find((node) => node.id === edge.from); const to = geometry.nodes.find((node) => node.id === edge.to); if (!from || !to) return null; return <line key={`${edge.kind}:${edge.from}:${edge.to}:${index}`} className={`comparison-line ${edge.kind}`} x1={from.x + 26} y1={from.y} x2={to.x - 26} y2={to.y} />; })}</g><g>{geometry.nodes.map((node) => <g key={node.id}><circle className="graph-node witness" cx={node.x} cy={node.y} r="24"/><text className="graph-label" x={node.x} y={node.y + 4} textAnchor="middle">{shorten(node.key.split("/").at(-1) ?? node.key, 12)}</text></g>)}</g></svg><div className="comparison-legend"><span><i className="before-dot" /> before baseline</span><span><i className="after-dot" /> after combined</span><span className="mono">Removed paths remain visible as before-only lines.</span></div></section>;
}

export function EvidenceLink({ href, children }: { href: string; children: React.ReactNode }) { return <ContextLink className="button" href={href}>{children}</ContextLink>; }

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { setCopied(false); } };
  return <button className="button" type="button" onClick={() => void copy()} aria-label="Copy value">{copied ? "Copied" : "Copy"}</button>;
}
