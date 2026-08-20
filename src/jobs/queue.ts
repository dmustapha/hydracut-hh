import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { PgBoss } from "pg-boss";
import { canonicalDigest } from "../domain/canonical";
import { attachBrokerJob, markJobState, registerJob } from "../db/repository";

export const queueNames = ["import-snapshot", "refresh-evidence", "evaluate-proposed-fix", "verify-plan", "cleanup-scenario"] as const;
export type QueueName = (typeof queueNames)[number];

const connectionString = process.env.DATABASE_URL_FILE
  ? readFileSync(process.env.DATABASE_URL_FILE, "utf8").trim()
  : process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL_REQUIRED");

export const boss = new PgBoss({ connectionString, application_name: "hydracut-worker" });
boss.on("error", (error) => process.stderr.write(`${JSON.stringify({ level: "error", error })}\n`));

export async function startQueue(): Promise<void> {
  await boss.start();
  for (const name of queueNames) await boss.createQueue(name);
}

export async function enqueue<T extends object>(name: QueueName, data: T, idempotencyKey?: string): Promise<string> {
  const stableKey = idempotencyKey ?? randomUUID();
  const jobId = canonicalDigest({ name, stableKey });
  const inputDigest = canonicalDigest(data);
  const created = await registerJob({ key: jobId, queue: name, idempotencyKey: stableKey, inputDigest, state: "CREATING" });
  if (!created) return jobId;
  try {
    const brokerId = await boss.send(name, { ...data, productJobId: jobId }, {
      retryLimit: 2, retryDelay: 5, retryBackoff: true, expireInSeconds: 900, singletonKey: jobId,
    });
    if (!brokerId) throw new Error("QUEUE_ENQUEUE_FAILED");
    await attachBrokerJob(jobId, brokerId);
    return jobId;
  } catch (error) {
    await markJobState(jobId, "FAILED", "QUEUE_ENQUEUE_FAILED");
    throw error;
  }
}
