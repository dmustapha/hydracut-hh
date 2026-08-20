import { describe, expect, it } from "vitest";
import { mergeHrefWithContext } from "../src/components/atlas";
import { comparisonGeometry, witnessGeometry } from "../src/components/atlas";
import { filterIncidentRows, type IncidentRow } from "../src/components/command-surface";
import type { ExposurePair } from "../src/domain/types";

describe("design forge context links", () => {
  it("merges current context without creating a second query delimiter", () => {
    expect(mergeHrefWithContext("/graph?incident=incident-1&pair=source%3Aapp", "role=developer&portfolio=default")).toEqual({ pathname: "/graph", href: "/graph?role=developer&portfolio=default&incident=incident-1&pair=source%3Aapp" });
  });
  it("lets destination values override context values", () => {
    expect(mergeHrefWithContext("/proof/digest?role=appsec", "role=leader&incident=incident-1").href).toBe("/proof/digest?role=appsec&incident=incident-1");
  });
});

const pair = (applicationKey: string, nodes: string[]): ExposurePair => ({ sourceKey: "OSV-1:pkg@1", applicationKey, scopes: ["production"], witnessNodeKeys: nodes, witnessRelationshipTypes: nodes.slice(0, -1).map(() => "DEPENDS_ON"), depth: nodes.length - 1 });

describe("design forge evidence geometry and filtering", () => {
  it("resolves witness edges to stable node IDs and preserves typed labels", () => {
    const geometry = witnessGeometry([pair("org/app", ["source", "dep", "application"]) ]);
    expect(geometry.edges).toHaveLength(2);
    expect(geometry.edges.every((edge) => geometry.nodes.some((node) => node.id === edge.from) && geometry.nodes.some((node) => node.id === edge.to))).toBe(true);
    expect(geometry.edges.map((edge) => edge.type)).toEqual(["DEPENDS_ON", "DEPENDS_ON"]);
  });

  it("keeps shared pair lanes stable and preserves before-only edges", () => {
    const before = pair("org/app", ["source", "dep", "application"]);
    const after = pair("org/app", ["source", "application"]);
    const geometry = comparisonGeometry([before], [after]);
    const beforeEdge = geometry.edges.find((edge) => edge.kind === "before");
    const afterEdge = geometry.edges.find((edge) => edge.kind === "after");
    expect(beforeEdge).toBeDefined();
    expect(afterEdge).toBeDefined();
    expect(geometry.nodes.find((node) => node.id === beforeEdge?.from)?.y).toBe(geometry.nodes.find((node) => node.id === afterEdge?.from)?.y);
  });

  it("filters by affected application IDs and numeric CVSS base score", () => {
    const rows = [{ key: "one", title: "CVE-1", packageVersion: "pkg@1", kev: "NOT_LISTED", epss: "0.1", cvss: 8.2, applicationKeys: ["org/api"], productionApplications: 1, allApplications: 1, proposedFixes: 0, state: "UNKNOWN", freshness: "now" }, { key: "two", title: "CVE-2", packageVersion: "pkg@2", kev: "NOT_LISTED", epss: "0.1", cvss: 9.1, applicationKeys: ["org/web"], productionApplications: 1, allApplications: 1, proposedFixes: 0, state: "UNKNOWN", freshness: "now" }] satisfies IncidentRow[];
    const result = filterIncidentRows(rows, { stateFilter: "all", scopeFilter: "all", kevFilter: "all", fixFilter: "all", query: "", applicationFilter: "org/api", epssThreshold: "", cvssThreshold: "8.5" });
    expect(result).toHaveLength(0);
    expect(filterIncidentRows(rows, { stateFilter: "all", scopeFilter: "all", kevFilter: "all", fixFilter: "all", query: "", applicationFilter: "org/web", epssThreshold: "", cvssThreshold: "8.5" }).map((row) => row.key)).toEqual(["two"]);
  });
});
