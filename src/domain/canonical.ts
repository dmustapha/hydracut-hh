// File: src/domain/canonical.ts
import { createHash } from "node:crypto";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function normalize(value: unknown): Json {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (typeof value === "object") {
    return normalizeObject(value as Record<string, unknown>);
  }
  throw new TypeError(`Unsupported canonical value: ${typeof value}`);
}

function normalizeObject(value: Record<string, unknown>): Json {
  const entries = Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return Object.fromEntries(entries.map(([key, item]) => [key, normalize(item)]));
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalDigest(value: unknown): string {
  return sha256(canonicalJson(value));
}

export function deterministicId(key: string): number {
  return Number.parseInt(sha256(key).slice(0, 13), 16);
}
