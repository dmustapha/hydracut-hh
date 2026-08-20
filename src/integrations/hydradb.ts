// File: src/integrations/hydradb.ts
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { request } from "undici";
import { canonicalDigest, deterministicId, sha256 } from "../domain/canonical";
import type {
  ExposurePair,
  ExtractedSnapshot,
  Scope,
  TraversalBounds,
  TraversalReceipt,
} from "../domain/types";

const selectorPattern = /^[a-z0-9-]+$/;
const relationshipByScope: Record<Scope, string> = {
  production: "PROD_DEPENDS_ON",
  development: "DEV_DEPENDS_ON",
  optional: "OPTIONAL_DEPENDS_ON",
  peer: "PEER_DEPENDS_ON",
};

interface QueryMeta {
  read_epoch?: number;
  bookmark?: string;
  next_cursor?: string;
  elapsed_ms?: number;
}

interface QueryResponse {
  records?: Array<Record<string, unknown>>;
  data?: Array<Record<string, unknown>>;
  metadata?: QueryMeta;
  read_epoch?: number;
  bookmark?: string;
  next_cursor?: string;
  columns?: string[];
  rows?: unknown[][];
}

function config() {
  const url = process.env.HYDRADB_HTTP_URL;
  const token = process.env.HYDRADB_TOKEN_FILE
    ? readFileSync(process.env.HYDRADB_TOKEN_FILE, "utf8").trim()
    : process.env.HYDRADB_TOKEN;
  const namespace = process.env.HYDRADB_GRAPH_NAMESPACE ?? "default";
  if (!url || !token) throw new Error("HYDRADB_CONFIGURATION_REQUIRED");
  return { url, token, namespace };
}

async function query(
  cypher: string,
  parameters: Record<string, unknown> = {},
  retryRead = false,
): Promise<QueryResponse> {
  const { url, token, namespace } = config();
  const queryId = randomUUID();
  const started = performance.now();
  for (let attempt = 1; attempt <= (retryRead ? 20 : 1); attempt += 1) {
    try {
      const response = await request(`${url}/v1/graphs/${namespace}/query`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "x-graph-namespace": namespace, "x-consistency": "strong", "idempotency-key": queryId },
        body: JSON.stringify({ cell_id: "cell-0", query_id: queryId, query: cypher, parameters, consistency: "strong" }),
        headersTimeout: 15_000,
        bodyTimeout: 30_000,
      });
      if (response.statusCode === 200) {
        const value = (await response.body.json()) as QueryResponse;
        value.metadata = { ...value.metadata, elapsed_ms: performance.now() - started };
        return value;
      }
      const detail = await response.body.text();
      const retryable = response.statusCode >= 500 || (response.statusCode === 400 && detail.includes("is already active"));
      if (!retryRead || !retryable || attempt === 20) throw new Error(`HYDRADB_HTTP_${response.statusCode}:${cypher}:${detail}`);
    } catch (error) {
      if (!retryRead || attempt === 20 || String(error).includes("HYDRADB_HTTP_")) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("HYDRADB_QUERY_RETRY_EXHAUSTED");
}

export async function waitForHydraDBReady(attempts = 30): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await query("MATCH (n:PackageInstance) RETURN n.id LIMIT 1", {}, true);
      return;
    } catch (error) {
      if (attempt === attempts) throw new Error("HYDRADB_READINESS_TIMEOUT", { cause: error });
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
}

function literal(value: string): string {
  if (!selectorPattern.test(value)) throw new Error("UNSAFE_SELECTOR");
  return `'${value}'`;
}

function relationshipLiteral(value: string): string {
  if (!/^[A-Z][A-Z0-9_]+$/.test(value)) throw new Error("UNSAFE_RELATIONSHIP_TYPE");
  return `'${value}'`;
}

function relationshipTypes(scopes: Scope[]): string[] {
  return ["MATCHES_INCIDENT", ...scopes.map((scope) => relationshipByScope[scope]), "USES_SNAPSHOT"];
}

function assertBatchIds(rows: Array<{ id: number; key: string }>): void {
  const registry = new Map<number, string>();
  for (const row of rows) {
    const prior = registry.get(row.id);
    if (prior && prior !== row.key) throw new Error("DETERMINISTIC_ID_COLLISION");
    registry.set(row.id, row.key);
  }
}

async function assertNodeIdRegistry(rows: Array<{ id: number; key: string }>): Promise<void> {
  assertBatchIds(rows);
  for (const row of rows) {
    const existing = rowsOf(await query(
      "MATCH (n {id: $id}) RETURN n.key AS existing",
      { id: row.id },
      true,
    ));
    if (existing.some((item) => item.existing != null && item.existing !== row.key)) throw new Error("GRAPH_ID_COLLISION");
  }
}

async function assertRelationshipIdRegistry(rows: Array<{ id: number; key: string }>, type: string): Promise<void> {
  assertBatchIds(rows);
  for (const row of rows) {
    const existing = rowsOf(await query(
      `MATCH ()-[r:${type} {id: $id}]->() RETURN r.key AS existing`,
      { id: row.id }, true,
    ));
    if (existing.some((item) => item.existing !== row.key)) throw new Error("GRAPH_RELATIONSHIP_ID_COLLISION");
  }
}

function rowsOf(response: QueryResponse): Array<Record<string, unknown>> {
  if (response.records) return response.records;
  if (response.data) return response.data;
  if (!response.columns || !response.rows) return [];
  return response.rows.map((values) => Object.fromEntries(response.columns!.map((column, index) => [column, unwrapValue(values[index])]))) as Array<Record<string, unknown>>;
}

async function relationshipRows(prefix: string, retryRead = true): Promise<Array<Record<string, unknown>>> {
  const rows: Array<Record<string, unknown>> = [];
  const pageSize = 500;
  for (const type of ["PROD_DEPENDS_ON", "DEV_DEPENDS_ON", "OPTIONAL_DEPENDS_ON", "PEER_DEPENDS_ON", "MATCHES_INCIDENT", "USES_SNAPSHOT"]) {
    for (let offset = 0; ; offset += pageSize) {
      const page = rowsOf(await query(
        `MATCH ()-[r:${type}]->() WHERE r.key STARTS WITH $prefix RETURN r.key AS key SKIP ${offset} LIMIT ${pageSize}`,
        { prefix }, retryRead,
      ));
      rows.push(...page);
      if (page.length < pageSize) break;
    }
  }
  return rows.filter((row) => typeof row.key === "string" && row.key.startsWith(prefix));
}

function unwrapValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(unwrapValue);
  if (!value || typeof value !== "object") return value;
  const item = value as Record<string, unknown>;
  if (item.type === "null") return null;
  const typedKey = Object.keys(item).find((key) => ["String", "Integer", "Float", "Boolean", "Null"].includes(key));
  if (typedKey) return typedKey === "Null" ? null : unwrapValue(item[typedKey]);
  if (Object.hasOwn(item, "value")) return unwrapValue(item.value);
  return Object.fromEntries(Object.entries(item).map(([key, nested]) => [key, unwrapValue(nested)]));
}

async function selectorCounts(bounds: TraversalBounds): Promise<{ sources: number; targets: number }> {
  const target = literal(bounds.targetSelector);
  const sourceRows = (await Promise.all(bounds.sourceSelectors.map((selector) => query(
    `MATCH (n:IncidentSource) WHERE n.source_selector = ${literal(selector)} RETURN n.source_selector AS selector`, {}, true,
  )))).flatMap(rowsOf);
  const targetRows = rowsOf(await query(
    `MATCH (n:ScenarioApplication) WHERE n.portfolio_key = ${target} RETURN n.application_key AS application`,
    {}, true,
  ));
  return { sources: sourceRows.length, targets: targetRows.length };
}

export function renderTraversal(bounds: TraversalBounds): string {
  const sources = bounds.sourceSelectors.map(literal).join(", ");
  const targets = [bounds.targetSelector].map(literal).join(", ");
  const relTypes = bounds.relationshipTypes.map(relationshipLiteral).join(", ");
  return `CALL algo.MSpaths({
  sourceLabel: 'IncidentSource',
  sourceProperty: 'source_selector',
  sourceValues: [${sources}],
  targetLabel: 'ScenarioApplication',
  targetProperty: 'portfolio_key',
  targetValues: [${targets}],
  pairwise: false,
  relTypes: [${relTypes}],
  relDirection: 'incoming',
  maxLen: ${bounds.maxLen},
  pathCount: 1,
  resultLimit: ${bounds.resultLimit}
}) YIELD path RETURN path`;
}

export function traversalBounds(input: {
  sourceSelectors: string[];
  targetSelector: string;
  scopes: Scope[];
  maxImportedDepth: number;
  targetCount: number;
  expectedPairKeyDigest: string;
}): TraversalBounds {
  const maxLen = input.maxImportedDepth + 3;
  const sourceCount = input.sourceSelectors.length;
  if (!sourceCount || new Set(input.sourceSelectors).size !== sourceCount) throw new Error("SOURCE_SELECTOR_SET_INVALID");
  if (!input.scopes.length || new Set(input.scopes).size !== input.scopes.length) throw new Error("SCOPE_SET_INVALID");
  if (!Number.isInteger(input.targetCount) || input.targetCount < 1) throw new Error("TARGET_COUNT_INVALID");
  if (!Number.isInteger(input.maxImportedDepth) || input.maxImportedDepth < 0) throw new Error("IMPORTED_DEPTH_INVALID");
  if (maxLen > 16) throw new Error("DEPTH_BOUND_EXCEEDED");
  return {
    sourceSelectors: input.sourceSelectors,
    targetSelector: input.targetSelector,
    relationshipTypes: relationshipTypes(input.scopes),
    maxLen,
    pathCount: 1,
    resultLimit: sourceCount * input.targetCount,
    matchedSourceCount: sourceCount,
    matchedTargetCount: input.targetCount,
    expectedPairKeyDigest: input.expectedPairKeyDigest,
  };
}

function nodeProperties(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object") return null;
  const properties = (node as Record<string, unknown>).properties;
  return properties && typeof properties === "object" ? properties as Record<string, unknown> : null;
}

function decodePair(path: unknown, bounds: TraversalBounds): ExposurePair {
  const value = path && typeof path === "object" ? path as Record<string, unknown> : {};
  const nodes = Array.isArray(value.nodes) ? value.nodes : [];
  const relationships = Array.isArray(value.relationships) ? value.relationships : [];
  if (nodes.length < 2) throw new Error("PATH_NODE_COUNT_INVALID");
  if (relationships.length > bounds.maxLen) throw new Error("PATH_DEPTH_EXCEEDED");
  if (relationships.length !== nodes.length - 1) throw new Error("PATH_RELATIONSHIP_COUNT_INVALID");
  const properties = nodes.map(nodeProperties);
  const keys = properties.map((item) => item?.key);
  if (keys.some((key) => typeof key !== "string" || !key.trim())) throw new Error("CANONICAL_NODE_KEY_INVALID");
  const source = properties[0]?.source_key;
  const target = properties.at(-1)?.application_key;
  if (typeof source !== "string" || typeof target !== "string") throw new Error(`PATH_ENDPOINT_SHAPE:${JSON.stringify(value)}`);
  if (!bounds.sourceSelectors.includes(String(properties[0]?.source_selector))) throw new Error("UNEXPECTED_SOURCE_ENDPOINT");
  if (properties.at(-1)?.portfolio_key !== bounds.targetSelector) throw new Error("UNEXPECTED_TARGET_ENDPOINT");
  const relationshipTypes = relationships.map((relationship) => {
    if (!relationship || typeof relationship !== "object") return "";
    const item = relationship as Record<string, unknown>;
    return typeof item.type === "string" ? item.type : typeof item.edge_type === "string" ? item.edge_type : "";
  });
  if (relationshipTypes.some((type) => !bounds.relationshipTypes.includes(type))) throw new Error("UNEXPECTED_RELATIONSHIP_TYPE");
  return {
    sourceKey: source,
    applicationKey: target,
    scopes: relationshipTypes.flatMap((type) => ({ PROD_DEPENDS_ON: ["production"], DEV_DEPENDS_ON: ["development"], OPTIONAL_DEPENDS_ON: ["optional"], PEER_DEPENDS_ON: ["peer"] }[type] ?? [])) as Scope[],
    witnessNodeKeys: keys as string[],
    witnessRelationshipTypes: relationshipTypes,
    depth: relationships.length,
  };
}

export function validateTraversalResponse(
  bounds: TraversalBounds,
  counts: { sources: number; targets: number },
  response: QueryResponse,
): TraversalReceipt {
  const cypher = renderTraversal(bounds);
  const rows = rowsOf(response);
  const witnessRefusalReasons: string[] = [];
  const pairs = rows.flatMap((row) => {
    try {
      return [decodePair(row.path, bounds)];
    } catch (error) {
      const reason = error instanceof Error ? error.message : "PATH_SHAPE_INVALID";
      if (["PATH_NODE_COUNT_INVALID", "PATH_RELATIONSHIP_COUNT_INVALID", "CANONICAL_NODE_KEY_INVALID"].includes(reason)) {
        witnessRefusalReasons.push(reason);
        return [];
      }
      throw error;
    }
  }).sort((a, b) =>
    `${a.sourceKey}:${a.applicationKey}`.localeCompare(`${b.sourceKey}:${b.applicationKey}`),
  );
  const keys = pairs.map((pair) => `${pair.sourceKey}:${pair.applicationKey}`);
  const duplicatePairCount = keys.length - new Set(keys).size;
  const cursorPresent = Boolean(response.next_cursor ?? response.metadata?.next_cursor);
  const readEpoch = response.read_epoch ?? response.metadata?.read_epoch;
  const bookmark = response.bookmark ?? response.metadata?.bookmark;
  const refusalReasons = [
    ...(counts.sources !== bounds.matchedSourceCount ? ["SOURCE_CARDINALITY_MISMATCH"] : []),
    ...(counts.targets !== bounds.matchedTargetCount ? ["TARGET_CARDINALITY_MISMATCH"] : []),
    ...(duplicatePairCount ? ["DUPLICATE_PAIR_ROWS"] : []),
    ...(cursorPresent ? ["CURSOR_PRESENT"] : []),
    ...(pairs.length > bounds.resultLimit ? ["RESULT_BOUND_EXCEEDED"] : []),
    ...(typeof readEpoch !== "number" ? ["READ_EPOCH_MISSING"] : []),
    ...(typeof bookmark !== "string" || !bookmark ? ["BOOKMARK_MISSING"] : []),
    ...(canonicalDigest(keys.slice().sort()) !== bounds.expectedPairKeyDigest ? ["BFS_PAIR_SET_MISMATCH"] : []),
    ...new Set(witnessRefusalReasons),
  ];
  return {
    query: cypher,
    querySha256: sha256(cypher),
    bounds,
    pairs,
    pairDigest: canonicalDigest(pairs),
    pairKeyDigest: canonicalDigest(keys.slice().sort()),
    readEpoch: readEpoch ?? -1,
    bookmark: bookmark ?? "",
    elapsedMs: response.metadata?.elapsed_ms ?? 0,
    cursorPresent,
    duplicatePairCount,
    state: refusalReasons.length ? "PARTIAL" : "VERIFIED_WITHIN_BOUNDS",
    refusalReasons,
  };
}

export async function runTraversal(bounds: TraversalBounds): Promise<TraversalReceipt> {
  const counts = await selectorCounts(bounds);
  const response = await query(renderTraversal(bounds), {}, true);
  return validateTraversalResponse(bounds, counts, response);
}

function chunks<T>(rows: T[], size = 100): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < rows.length; index += size) result.push(rows.slice(index, index + size));
  return result;
}

export async function writeSnapshot(snapshot: ExtractedSnapshot): Promise<void> {
  const nodes = snapshot.packages.map((item) => ({ ...item, id: deterministicId(item.key) }));
  await assertNodeIdRegistry(nodes);
  const nodeQuery = `UNWIND $rows AS row
MERGE (n {id: row.id}) SET n:PackageInstance, n.key = row.key,
n.snapshot_key = row.snapshotKey, n.name = row.name, n.version = row.version,
n.purl = row.purl, n.location = row.location`;
  for (const batch of chunks(nodes)) await query(nodeQuery, { rows: batch });
  for (const scope of ["production", "development", "optional", "peer"] as Scope[]) {
    const type = relationshipByScope[scope];
    const edges = snapshot.edges.filter((edge) => edge.scope === scope).map((edge) => ({
      id: deterministicId(edge.key),
      from: deterministicId(edge.fromKey),
      to: deterministicId(edge.toKey),
      key: edge.key,
    }));
    if (!edges.length) continue;
    await assertRelationshipIdRegistry(edges, type);
    for (const batch of chunks(edges)) await query(`UNWIND $rows AS row
MATCH (a:PackageInstance {id: row.from}), (b:PackageInstance {id: row.to})
MERGE (a)-[r:${type} {id: row.id}]->(b) SET r.key = row.key`, { rows: batch });
  }
}

export async function writeApplicationRoot(snapshot: ExtractedSnapshot): Promise<void> {
  const appKey = `application:${snapshot.key}`;
  const appId = deterministicId(appKey);
  await assertNodeIdRegistry([{ id: appId, key: appKey }]);
  const rootRows = [{ id: appId, key: appKey, applicationKey: snapshot.identity.repository, snapshotKey: snapshot.key }];
  const rootQuery = `UNWIND $rows AS row
MERGE (n {id: row.id}) SET n:ApplicationSnapshot, n.key = row.key,
 n.application_key = row.applicationKey, n.snapshot_key = row.snapshotKey`;
  for (const attempt of [0, 1]) {
    await query(rootQuery, { rows: rootRows, attempt });
    const present = rowsOf(await query("MATCH (n:ApplicationSnapshot {id: $id}) RETURN n.key AS key", { id: appId }, true));
    if (present.some((row) => row.key === appKey)) break;
    if (attempt === 1) throw new Error("APPLICATION_ROOT_WRITE_MISMATCH");
  }
  for (const scope of ["production", "development", "optional", "peer"] as Scope[]) {
    const type = relationshipByScope[scope];
    const rows = snapshot.applicationEdges.filter((edge) => edge.scope === scope).map((edge) => ({
      id: deterministicId(edge.key),
      key: edge.key,
      from: appId,
      to: deterministicId(edge.toKey),
    }));
    if (!rows.length) continue;
    await assertRelationshipIdRegistry(rows, type);
    for (const batch of chunks(rows)) await query(`UNWIND $rows AS row
MATCH (a:ApplicationSnapshot {id: row.from}), (b:PackageInstance {id: row.to})
MERGE (a)-[r:${type} {id: row.id}]->(b) SET r.key = row.key`, { rows: batch });
  }
}

export async function verifySnapshotReadback(snapshot: ExtractedSnapshot): Promise<void> {
  if (!selectorPattern.test(snapshot.key)) throw new Error("UNSAFE_SNAPSHOT_KEY");
  const nodes = rowsOf(await query(
    `MATCH (n:PackageInstance) WHERE n.snapshot_key = '${snapshot.key}' RETURN n.key AS key`,
    {}, true,
  ));
  const roots = rowsOf(await query(
    `MATCH (n:ApplicationSnapshot) WHERE n.snapshot_key = '${snapshot.key}' RETURN n.key AS key`,
    {}, true,
  ));
  const edges = await relationshipRows(`${snapshot.key}:`);
  const expectedKeys = [...snapshot.edges, ...snapshot.applicationEdges].map(({ key }) => key).sort();
  const actualKeys = edges.map(({ key }) => String(key)).sort();
  if (nodes.length !== snapshot.packages.length) throw new Error("PACKAGE_READBACK_MISMATCH");
  if (roots.length !== 1) throw new Error("APPLICATION_ROOT_READBACK_MISMATCH");
  if (canonicalDigest(actualKeys) !== canonicalDigest(expectedKeys)) {
    throw new Error("EDGE_READBACK_MISMATCH");
  }
}

export async function writeScenario(input: {
  scenarioKey: string;
  portfolioKey: string;
  applications: Array<{ applicationKey: string; snapshotKey: string }>;
  sources: Array<{ sourceKey: string; selector: string; packageKeys: string[] }>;
}): Promise<void> {
  literal(input.scenarioKey);
  input.sources.forEach((source) => literal(source.selector));
  const apps = input.applications.map((item) => ({
    id: deterministicId(`${input.scenarioKey}:app:${item.applicationKey}`),
    key: `${input.scenarioKey}:app:${item.applicationKey}`,
    applicationKey: item.applicationKey,
    portfolioKey: input.portfolioKey,
    snapshotId: deterministicId(`application:${item.snapshotKey}`),
    relKey: `${input.scenarioKey}:uses:${item.applicationKey}`,
  }));
  await assertNodeIdRegistry(apps);
  await query(`UNWIND $rows AS row
MERGE (n {id: row.id}) SET n:ScenarioApplication, n.key = row.key,
n.application_key = row.applicationKey, n.portfolio_key = row.portfolioKey`, { rows: apps });
  const uses = apps.map((item) => ({ ...item, relId: deterministicId(item.relKey) }));
  await assertRelationshipIdRegistry(uses.map((item) => ({ id: item.relId, key: item.relKey })), "USES_SNAPSHOT");
  await query(`UNWIND $rows AS row
MATCH (a:ScenarioApplication {id: row.id}), (s:ApplicationSnapshot {id: row.snapshotId})
MERGE (a)-[r:USES_SNAPSHOT {id: row.relId}]->(s) SET r.key = row.relKey`, {
    rows: uses,
  });
  const sources = input.sources.map((item) => ({
    id: deterministicId(`${input.scenarioKey}:source:${item.sourceKey}`),
    key: `${input.scenarioKey}:source:${item.sourceKey}`,
    sourceKey: item.sourceKey,
    selector: item.selector,
  }));
  await assertNodeIdRegistry(sources);
  await query(`UNWIND $rows AS row
MERGE (n {id: row.id}) SET n:IncidentSource, n.key = row.key,
n.source_key = row.sourceKey, n.source_selector = row.selector`, { rows: sources });
  const matches = input.sources.flatMap((source) => source.packageKeys.map((packageKey) => ({
    packageId: deterministicId(packageKey),
    sourceId: deterministicId(`${input.scenarioKey}:source:${source.sourceKey}`),
    key: `${input.scenarioKey}:matches:${packageKey}:${source.sourceKey}`,
    relId: deterministicId(`${input.scenarioKey}:matches:${packageKey}:${source.sourceKey}`),
  })));
  await assertRelationshipIdRegistry(matches.map((item) => ({ id: item.relId, key: item.key })), "MATCHES_INCIDENT");
  await query(`UNWIND $rows AS row
MATCH (p:PackageInstance {id: row.packageId}), (s:IncidentSource {id: row.sourceId})
MERGE (p)-[r:MATCHES_INCIDENT {id: row.relId}]->(s) SET r.key = row.key`, {
    rows: matches,
  });
  const nodeRows = [
    ...rowsOf(await query("MATCH (n:ScenarioApplication) RETURN n.key AS key", {}, true)),
    ...rowsOf(await query("MATCH (n:IncidentSource) RETURN n.key AS key", {}, true)),
  ].filter((row) => typeof row.key === "string" && row.key.startsWith(`${input.scenarioKey}:`));
  const edgeRows = await relationshipRows(`${input.scenarioKey}:`);
  const expectedNodes = [...apps.map(({ key }) => key), ...sources.map(({ key }) => key)].sort();
  const expectedEdges = [...apps.map(({ relKey }) => relKey), ...matches.map(({ key }) => key)].sort();
  if (canonicalDigest(nodeRows.map(({ key }) => String(key)).sort()) !== canonicalDigest(expectedNodes)) {
    throw new Error("SCENARIO_NODE_READBACK_MISMATCH");
  }
  if (canonicalDigest(edgeRows.map(({ key }) => String(key)).sort()) !== canonicalDigest(expectedEdges)) {
    throw new Error("SCENARIO_EDGE_READBACK_MISMATCH");
  }
}

export async function cleanupScenario(scenarioKey: string): Promise<void> {
  if (!selectorPattern.test(scenarioKey)) throw new Error("UNSAFE_SCENARIO_KEY");
  for (const label of ["ScenarioApplication", "IncidentSource"]) {
    const rows = rowsOf(await query(`MATCH (n:${label}) RETURN n.key AS key`, {}, true));
    const keys = rows.map((row) => row.key).filter((key): key is string => typeof key === "string" && key.startsWith(`${scenarioKey}:`));
    for (const key of keys) await query(`MATCH (n:${label} {key: '${key}'}) DETACH DELETE n`);
    const remaining = rowsOf(await query(`MATCH (n:${label}) RETURN n.key AS key`, {}, true));
    if (remaining.some((row) => typeof row.key === "string" && row.key.startsWith(`${scenarioKey}:`))) throw new Error("SCENARIO_CLEANUP_INCOMPLETE");
  }
}

export async function hydraHealth(): Promise<boolean> {
  const response = await query("MATCH (n:PackageInstance) RETURN n.id LIMIT 1", {}, true);
  return Array.isArray(rowsOf(response));
}
