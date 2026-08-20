// File: src/integrations/arborist.ts
import { createRequire } from "node:module";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonicalDigest } from "../domain/canonical";
import type { DependencyEdge, ExtractedSnapshot, PackageInstance, Scope } from "../domain/types";

const Arborist = createRequire(import.meta.url)("@npmcli/arborist") as new (options: { path: string }) => { loadVirtual(): Promise<unknown> };

interface ArboristNode {
  location: string;
  name: string;
  version: string;
  edgesOut: Map<string, ArboristEdge>;
}

interface ArboristEdge {
  from: ArboristNode;
  to: ArboristNode | null;
  dev: boolean;
  optional: boolean;
  peer: boolean;
}

function scopeOf(edge: ArboristEdge): Scope {
  if (edge.optional) return "optional";
  if (edge.peer) return "peer";
  if (edge.dev) return "development";
  return "production";
}

function packageKey(snapshotKey: string, node: ArboristNode): string {
  return `${snapshotKey}:${node.location}:${node.name}@${node.version}`;
}

function packageFrom(snapshotKey: string, node: ArboristNode): PackageInstance {
  return {
    key: packageKey(snapshotKey, node),
    snapshotKey,
    location: node.location,
    name: node.name,
    version: node.version,
    purl: `pkg:npm/${encodeURIComponent(node.name)}@${encodeURIComponent(node.version)}`,
  };
}

function edgeFrom(snapshotKey: string, edge: ArboristEdge): DependencyEdge | undefined {
  if (!edge.to) return undefined;
  const fromKey = packageKey(snapshotKey, edge.from);
  const toKey = packageKey(snapshotKey, edge.to);
  const scope = scopeOf(edge);
  return { key: `${snapshotKey}:${fromKey}->${toKey}:${scope}`, snapshotKey, fromKey, toKey, scope };
}

function maximumDepth(edges: DependencyEdge[], roots: string[]): number {
  const children = new Map<string, string[]>();
  for (const edge of edges) children.set(edge.fromKey, [...(children.get(edge.fromKey) ?? []), edge.toKey]);
  let max = 0;
  const queue = roots.map((key) => ({ key, depth: 0 }));
  const seen = new Set<string>();
  while (queue.length) {
    const item = queue.shift()!;
    if (seen.has(item.key)) continue;
    seen.add(item.key);
    max = Math.max(max, item.depth);
    for (const child of children.get(item.key) ?? []) queue.push({ key: child, depth: item.depth + 1 });
  }
  return max;
}

async function withDeadline<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("EXTRACTION_TIMEOUT")), milliseconds);
  });
  try {
    return await Promise.race([operation, deadline]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function extractSnapshot(input: {
  snapshotKey: string;
  manifest: Uint8Array;
  lockfile: Uint8Array;
  identity: ExtractedSnapshot["identity"];
}): Promise<ExtractedSnapshot> {
  const directory = await mkdtemp(join(tmpdir(), "hydracut-"));
  try {
    await writeFile(join(directory, "package.json"), input.manifest, { mode: 0o600 });
    await writeFile(join(directory, "package-lock.json"), input.lockfile, { mode: 0o600 });
    const arborist = new Arborist({ path: directory });
    const tree = (await withDeadline(arborist.loadVirtual(), 30_000)) as ArboristNode & { inventory: Map<string, ArboristNode> };
    const allNodes = [...tree.inventory.values()];
    const root = allNodes.find((node) => node.location === "");
    if (!root) throw new Error("APPLICATION_ROOT_MISSING");
    const nodes = allNodes.filter((node) => node !== root);
    if (nodes.length > 5_000) throw new Error("PACKAGE_INSTANCE_LIMIT");
    if (nodes.some((node) => !node.location || !node.name || !node.version)) throw new Error("PACKAGE_IDENTITY_MISSING");
    const packages = nodes.map((node) => packageFrom(input.snapshotKey, node)).sort((a, b) => a.key.localeCompare(b.key));
    if (new Set(packages.map((item) => item.key)).size !== packages.length) throw new Error("PACKAGE_IDENTITY_DUPLICATE");
    const edges = nodes.flatMap((node) =>
      [...node.edgesOut.values()].map((edge) => edgeFrom(input.snapshotKey, edge)).filter(Boolean),
    ).sort((a, b) => a!.key.localeCompare(b!.key)) as DependencyEdge[];
    const applicationEdges = [...root.edgesOut.values()]
      .filter((edge) => edge.to)
      .map((edge) => ({
        key: `${input.snapshotKey}:application->${packageKey(input.snapshotKey, edge.to!)}:${scopeOf(edge)}`,
        snapshotKey: input.snapshotKey,
        fromKey: `application:${input.snapshotKey}`,
        toKey: packageKey(input.snapshotKey, edge.to!),
        scope: scopeOf(edge),
      })).sort((a, b) => a.key.localeCompare(b.key));
    const rootPackageKeys = applicationEdges
      .map((edge) => edge.toKey)
      .filter(Boolean)
      .sort();
    const packageKeys = new Set(packages.map((item) => item.key));
    if (edges.some((edge) => !packageKeys.has(edge.fromKey) || !packageKeys.has(edge.toKey)) ||
      rootPackageKeys.some((key) => !packageKeys.has(key))) throw new Error("DEPENDENCY_ENDPOINT_MISSING");
    const parsed = JSON.parse(Buffer.from(input.lockfile).toString("utf8")) as { lockfileVersion?: number };
    if (parsed.lockfileVersion !== 1 && parsed.lockfileVersion !== 2 && parsed.lockfileVersion !== 3) throw new Error("LOCKFILE_VERSION");
    const normalized = { packages, applicationEdges, edges, rootPackageKeys };
    return {
      key: input.snapshotKey,
      identity: input.identity,
      lockfileVersion: parsed.lockfileVersion,
      ...normalized,
      maxDepth: maximumDepth(edges, rootPackageKeys),
      extractionSha256: canonicalDigest(normalized),
    };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
