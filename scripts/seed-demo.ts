// File: scripts/seed-demo.ts
import { readFile } from "node:fs/promises";

interface FrozenRepository {
  repository: string;
  baseline_commit: string;
  baseline_lock_sha256: string;
}

type SeedImport = (input: {
  jobId: string;
  portfolioKey: string;
  kind: "github";
  repository: string;
  ref: string;
  expectedLockfileSha256: string;
}) => Promise<{ lockfileSha256: string; snapshotKey: string }>;

async function loadImportHandler(): Promise<SeedImport> {
  const modulePath = ["..", "src", "jobs", "pipeline"].join("/");
  const moduleValue = await import(modulePath) as Record<string, unknown>;
  if (typeof moduleValue.handleImport !== "function") throw new Error("SEED_PIPELINE_UNAVAILABLE");
  return moduleValue.handleImport as SeedImport;
}

async function run(): Promise<void> {
  const handleImport = await loadImportHandler();
  const evidence = JSON.parse(await readFile("docs/evidence/2026-08-19-pre-forge-runtime.json", "utf8")) as {
    corpus: { repositories: FrozenRepository[] };
  };
  for (const [index, item] of evidence.corpus.repositories.entries()) {
    const result = await handleImport({
      jobId: `seed-baseline-${index}`,
      portfolioKey: "verified-public-corpus",
      kind: "github",
      repository: item.repository,
      ref: item.baseline_commit,
      expectedLockfileSha256: item.baseline_lock_sha256,
    });
    if (result.lockfileSha256 !== item.baseline_lock_sha256) throw new Error(`FROZEN_LOCKFILE_DRIFT:${item.repository}`);
    process.stdout.write(`${JSON.stringify({ repository: item.repository, snapshotKey: result.snapshotKey })}\n`);
  }
  process.stdout.write(`${JSON.stringify({ event: "seed-import-complete", next: "pnpm proof" })}\n`);
}

run().catch((error) => {
  process.stderr.write(`${JSON.stringify({ event: "seed-failed", error: String(error) })}\n`);
  process.exit(1);
});
