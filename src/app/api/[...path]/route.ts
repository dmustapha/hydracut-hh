import { randomUUID } from "node:crypto";
import { z } from "zod";
import { canonicalDigest } from "../../../domain/canonical";
import { toSarif } from "../../../domain/sarif";
import { databaseHealth } from "../../../db/client";
import {
  createPlanForIncident,
  findIncident,
  findJob,
  findPlan,
  findReceipt,
  listIncidentQueue,
  listProposedFixes,
  loadIncidentBundle,
  loadIncidentImpact,
  loadPlanBundle,
  loadSystemFacts,
} from "../../../db/repository";
import { hydraHealth } from "../../../integrations/hydradb";
import { enqueue } from "../../../jobs/queue";

const sha = z.string().regex(/^[a-f0-9]{64}$/);
const portfolioKey = z.string().regex(/^[A-Za-z0-9_.-]{1,80}$/);
const repository = z.string().regex(/^[\w.-]+\/[\w.-]+$/);
const upload = z.object({ kind: z.literal("upload"), repository, manifestBase64: z.string().max(14_000_000), lockfileBase64: z.string().max(14_000_000) }).strict();
const github = z.object({ kind: z.literal("github"), repository, ref: z.string().min(1).max(255) }).strict();
const importBody = z.discriminatedUnion("kind", [github, upload]);
const fixBody = importBody;
const discoverBody = z.object({ bot: z.enum(["dependabot", "renovate"]).optional() }).strict();
const incidentQuery = z.object({ portfolio: portfolioKey.optional(), state: z.enum(["VERIFIED_WITHIN_BOUNDS", "PARTIAL", "UNKNOWN", "ERROR"]).optional(), cursor: z.coerce.number().int().min(0).default(0), limit: z.coerce.number().int().min(1).max(100).default(50) }).strict();
const traversalBody = z.object({
  scopes: z.array(z.enum(["production", "development", "optional", "peer"])).min(1).refine((items) => new Set(items).size === items.length),
  sourceFindingIds: z.array(z.string()).min(1).refine((items) => new Set(items).size === items.length),
  verificationSourceCoordinates: z.array(z.string().regex(/^.+@[^@]+$/)).min(1).max(100).refine((items) => new Set(items).size === items.length),
}).strict();
const uniqueKeys = z.array(z.string()).max(100).refine((items) => new Set(items).size === items.length);
const planBody = z.object({ proposedFixKeys: uniqueKeys, requiredFixKeys: uniqueKeys, forbiddenFixKeys: uniqueKeys, maxRepositoryChanges: z.number().int().positive().optional() }).strict();
const verifyBody = z.object({ expectedPlanDigest: sha }).strict();

type Context = { params: Promise<{ path: string[] }> };
type Handler = (request: Request, segments: string[], requestId: string) => Promise<Response>;

function segment(segments: string[], index: number): string {
  const value = segments[index];
  if (!value) throw new Error("INVALID_ROUTE_SEGMENT");
  return value;
}

function validateUploadedJson(body: z.infer<typeof upload>): void {
  for (const [name, value] of [["manifest", body.manifestBase64], ["lockfile", body.lockfileBase64]] as const) {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) throw new Error("UPLOAD_BASE64_INVALID");
    const bytes = Buffer.from(value, "base64");
    if (bytes.length > 10 * 1024 * 1024) throw new Error("UPLOAD_TOO_LARGE");
    try { JSON.parse(bytes.toString("utf8")); } catch { throw new Error(`${name.toUpperCase()}_JSON_INVALID`); }
  }
}

function json(value: unknown, status: number, requestId: string, headers = {}): Response {
  return Response.json(value, { status, headers: { "x-request-id": requestId, ...headers } });
}

function failure(code: string, state: "PARTIAL" | "UNKNOWN" | "ERROR", message: string, status: number, requestId: string, retryable = false, details?: Record<string, unknown>, headers = {}): Response {
  return json({ code, state, message, requestId, retryable, ...(details ? { details } : {}) }, status, requestId, headers);
}

function idempotency(request: Request, body: unknown): string {
  const value = request.headers.get("idempotency-key");
  if (!value || !/^[A-Za-z0-9_-]{8,128}$/.test(value)) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  const operator = canonicalDigest(request.headers.get("authorization") ?? "proxy-authenticated-operator");
  return canonicalDigest({ route: new URL(request.url).pathname, operator, body, suppliedKey: value });
}

const rateWindows = new Map<string, { minute: number; count: number }>();

function allowMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new Error("CROSS_ORIGIN_MUTATION");
  const operator = canonicalDigest(request.headers.get("authorization") ?? "proxy-authenticated-operator");
  const minute = Math.floor(Date.now() / 60_000);
  const row = rateWindows.get(operator);
  const next = row?.minute === minute ? { minute, count: row.count + 1 } : { minute, count: 1 };
  rateWindows.set(operator, next);
  return next.count <= 10;
}

async function health(_request: Request, _segments: string[], id: string): Promise<Response> {
  const [database, hydradb] = await Promise.allSettled([databaseHealth(), hydraHealth()]);
  const value = { web: true, database: database.status === "fulfilled" && database.value, hydradb: hydradb.status === "fulfilled" && hydradb.value };
  return Object.values(value).every(Boolean) ? json(value, 200, id) : failure("DEPENDENCY_UNAVAILABLE", "ERROR", "A critical dependency is unavailable.", 503, id, true, value);
}

async function importRepository(request: Request, _segments: string[], id: string): Promise<Response> {
  const body = importBody.parse(await request.json());
  if (body.kind === "upload") validateUploadedJson(body);
  const selectedPortfolio = portfolioKey.parse(new URL(request.url).searchParams.get("portfolio") ?? "default");
  const jobId = await enqueue("import-snapshot", { ...body, portfolioKey: selectedPortfolio, role: "current" }, idempotency(request, { selectedPortfolio, body }));
  return json({ jobId }, 202, id);
}

async function incidentsIndex(request: Request, _segments: string[], id: string): Promise<Response> {
  const url = new URL(request.url);
  const query = incidentQuery.parse(Object.fromEntries(url.searchParams));
  const filtered = (await listIncidentQueue()).filter((row) => (!query.portfolio || row.portfolioKey === query.portfolio) && (!query.state || row.state === query.state));
  if (query.portfolio && filtered.length === 0) return failure("PORTFOLIO_NOT_ANALYZABLE", "UNKNOWN", "Portfolio has no analyzable incidents.", 409, id);
  const items = filtered.slice(query.cursor, query.cursor + query.limit);
  const nextCursor = query.cursor + items.length < filtered.length ? query.cursor + items.length : null;
  return json({ items, nextCursor, total: filtered.length }, 200, id);
}

async function incidentDetail(_request: Request, segments: string[], id: string): Promise<Response> {
  const incident = await findIncident(segment(segments, 1));
  if (!incident) return failure("NOT_FOUND", "ERROR", "Incident not found.", 404, id);
  const bundle = await loadIncidentBundle(incident.key);
  if (bundle.advisories.some((row) => row.evidence.withdrawnAt)) return failure("ADVISORY_WITHDRAWN", "UNKNOWN", "Incident advisory is withdrawn and requires review.", 409, id);
  return json(bundle, 200, id);
}

async function jobDetail(_request: Request, segments: string[], id: string): Promise<Response> {
  const job = await findJob(segment(segments, 1));
  return job ? json(job, 200, id) : failure("NOT_FOUND", "ERROR", "Job not found.", 404, id);
}

async function traverseIncident(request: Request, segments: string[], id: string): Promise<Response> {
  const body = traversalBody.parse(await request.json());
  const incidentKey = segment(segments, 1);
  const bundle = await loadIncidentBundle(incidentKey);
  const selectedCoordinate = bundle.advisories[0] ? `${bundle.advisories[0].evidence.packageName}@${bundle.advisories[0].evidence.exactVersion}` : "";
  if (canonicalDigest(body.sourceFindingIds.slice().sort()) !== canonicalDigest(bundle.incident.sourceFindingKeys.slice().sort()) || !bundle.snapshots.length) return failure("TRAVERSAL_PRECONDITION_FAILED", "UNKNOWN", "Current inputs or finding set are incomplete.", 409, id);
  if (!body.verificationSourceCoordinates.includes(selectedCoordinate)) return failure("SELECTED_INCIDENT_SOURCE_REQUIRED", "UNKNOWN", "Verification sources must include the selected incident coordinate.", 409, id);
  const jobId = await enqueue("refresh-evidence", { incidentKey, ...body }, idempotency(request, body));
  return json({ jobId }, 202, id);
}

async function impact(_request: Request, segments: string[], id: string): Promise<Response> {
  const value = await loadIncidentImpact(segment(segments, 1));
  if (!value) return failure("NOT_FOUND", "ERROR", "Impact not found.", 404, id);
  return value.baseline.state === "VERIFIED_WITHIN_BOUNDS" ? json(value, 200, id) : failure("IMPACT_NOT_VERIFIED", "PARTIAL", "Impact is not verified within bounds.", 409, id, false, value);
}

async function fixes(request: Request, segments: string[], id: string): Promise<Response> {
  const incidentKey = segment(segments, 1);
  const incident = await findIncident(incidentKey);
  if (!incident) return failure("NOT_FOUND", "ERROR", "Incident not found.", 404, id);
  if (!incident.baseline || incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS") return failure("BASELINE_NOT_VERIFIED", "UNKNOWN", "A verified baseline is required.", 409, id);
  if (request.method === "GET") return json({ items: await listProposedFixes(incidentKey) }, 200, id);
  const body = fixBody.parse(await request.json());
  if (body.kind === "upload") validateUploadedJson(body);
  const origin = body.kind === "upload" ? "upload" : /^[a-f0-9]{40}$/.test(body.ref) ? "github-commit" : "github-branch";
  const jobId = await enqueue("evaluate-proposed-fix", { incidentKey: incident.key, portfolioKey: incident.portfolioKey, origin, ...body }, idempotency(request, body));
  return json({ jobId }, 202, id);
}

async function discoverFixes(request: Request, segments: string[], id: string): Promise<Response> {
  const body = discoverBody.parse(await request.json().catch(() => ({})));
  const incidentKey = segment(segments, 1);
  const incident = await findIncident(incidentKey);
  if (!incident?.baseline || incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS") return failure("BASELINE_NOT_VERIFIED", "UNKNOWN", "A verified baseline is required.", 409, id);
  const jobId = await enqueue("evaluate-proposed-fix", { incidentKey, mode: "discover", ...body }, idempotency(request, body));
  return json({ jobId }, 202, id);
}

async function plans(request: Request, segments: string[], id: string): Promise<Response> {
  const body = planBody.parse(await request.json());
  const value = await createPlanForIncident(segment(segments, 1), {
    proposedFixKeys: body.proposedFixKeys,
    requiredFixKeys: body.requiredFixKeys,
    forbiddenFixKeys: body.forbiddenFixKeys,
    ...(body.maxRepositoryChanges === undefined ? {} : { maxRepositoryChanges: body.maxRepositoryChanges }),
  });
  return json(value, 201, id);
}

async function planDetail(_request: Request, segments: string[], id: string): Promise<Response> {
  const value = await findPlan(segment(segments, 1));
  return value ? json(value, 200, id) : failure("NOT_FOUND", "ERROR", "Plan not found.", 404, id);
}

async function verifyPlan(request: Request, segments: string[], id: string): Promise<Response> {
  const body = verifyBody.parse(await request.json());
  const planKey = segment(segments, 1);
  if (body.expectedPlanDigest !== planKey) return failure("PLAN_DIGEST_DRIFT", "ERROR", "Plan digest does not match the route.", 409, id);
  const bundle = await loadPlanBundle(planKey);
  if (!bundle.incident.baseline || bundle.incident.baseline.state !== "VERIFIED_WITHIN_BOUNDS" || bundle.fixes.length !== bundle.plan.proposedFixKeys.length || bundle.fixes.some((row) => row.state !== "VERIFIED_WITHIN_BOUNDS")) return failure("PLAN_NOT_COMPLETE", "UNKNOWN", "Plan inputs are not complete and immutable.", 409, id);
  const jobId = await enqueue("verify-plan", { planKey, ...body }, idempotency(request, body));
  return json({ jobId }, 202, id);
}

async function system(_request: Request, _segments: string[], id: string): Promise<Response> {
  return json(await loadSystemFacts(), 200, id);
}

async function receipt(request: Request, segments: string[], id: string): Promise<Response> {
  const digest = sha.parse(segment(segments, 1));
  const row = await findReceipt(digest);
  if (!row || canonicalDigest(row.receipt) !== digest) return failure("RECEIPT_UNAVAILABLE", "ERROR", "Receipt is missing or failed integrity verification.", row ? 409 : 404, id);
  if (segments[2] === "sarif" && row.receipt.resultState !== "VERIFIED_WITHIN_BOUNDS") return failure("SARIF_NOT_EXPORTABLE", "PARTIAL", "Only a verified receipt can be exported as SARIF.", 422, id);
  const value = segments[2] === "sarif" ? toSarif(row.receipt, digest) : row.receipt;
  return new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json", "cache-control": "public,max-age=31536000,immutable", "x-request-id": id } });
}

const routes: Array<{ method: string; pattern: RegExp; handle: Handler }> = [
  { method: "GET", pattern: /^health$/, handle: health },
  { method: "POST", pattern: /^imports$/, handle: importRepository },
  { method: "GET", pattern: /^jobs\/[^/]+$/, handle: jobDetail },
  { method: "GET", pattern: /^incidents$/, handle: incidentsIndex },
  { method: "GET", pattern: /^incidents\/[^/]+$/, handle: incidentDetail },
  { method: "POST", pattern: /^incidents\/[^/]+\/traversals$/, handle: traverseIncident },
  { method: "GET", pattern: /^incidents\/[^/]+\/impact$/, handle: impact },
  { method: "GET", pattern: /^incidents\/[^/]+\/proposed-fixes$/, handle: fixes },
  { method: "POST", pattern: /^incidents\/[^/]+\/proposed-fixes$/, handle: fixes },
  { method: "POST", pattern: /^incidents\/[^/]+\/proposed-fixes\/discover$/, handle: discoverFixes },
  { method: "POST", pattern: /^incidents\/[^/]+\/plans$/, handle: plans },
  { method: "GET", pattern: /^plans\/[^/]+$/, handle: planDetail },
  { method: "POST", pattern: /^plans\/[^/]+\/verify$/, handle: verifyPlan },
  { method: "GET", pattern: /^receipts\/[a-f0-9]{64}(\/sarif)?$/, handle: receipt },
  { method: "GET", pattern: /^system$/, handle: system },
];

async function dispatch(request: Request, context: Context): Promise<Response> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const segments = (await context.params).path;
    const key = segments.join("/");
    if (request.method === "POST" && !allowMutation(request)) return failure("RATE_LIMITED", "ERROR", "Mutation rate limit exceeded.", 429, requestId, true, { limit: 10, windowSeconds: 60 }, { "retry-after": "60" });
    const route = routes.find((item) => item.method === request.method && item.pattern.test(key));
    return route ? await route.handle(request, segments, requestId) : failure("NOT_FOUND", "ERROR", "Route not found.", 404, requestId);
  } catch (error) {
    const invalid = error instanceof z.ZodError;
    const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
    if (error instanceof SyntaxError) return failure("INVALID_JSON", "ERROR", "Request body is not valid JSON.", 400, requestId);
    if (invalid) { const tooLarge = error.issues.some((issue) => issue.code === "too_big"); return failure(tooLarge ? "PAYLOAD_TOO_LARGE" : "INVALID_INPUT", "ERROR", "Request validation failed.", tooLarge ? 413 : 400, requestId); }
    if (code === "IDEMPOTENCY_KEY_REQUIRED") return failure(code, "ERROR", "A valid idempotency key is required.", 400, requestId);
    if (code === "CROSS_ORIGIN_MUTATION") return failure(code, "ERROR", "Cross-origin mutation refused.", 403, requestId);
    if (code === "IDEMPOTENCY_INPUT_DRIFT") return failure(code, "ERROR", "Idempotency key was reused with different input.", 409, requestId);
    if (["UPLOAD_TOO_LARGE"].includes(code)) return failure(code, "ERROR", "Uploaded input exceeds the bounded size.", 413, requestId);
    if (["UPLOAD_BASE64_INVALID", "MANIFEST_JSON_INVALID", "LOCKFILE_JSON_INVALID", "LOCKFILE_VERSION"].includes(code)) return failure(code, "ERROR", "Uploaded input is unsupported or malformed.", 422, requestId);
    if (["INCIDENT_NOT_FOUND", "PLAN_NOT_FOUND"].includes(code)) return failure("NOT_FOUND", "ERROR", "Requested resource was not found.", 404, requestId);
    if (["BASELINE_NOT_VERIFIED", "UNKNOWN_PROPOSED_FIX", "PROPOSED_FIX_NOT_VERIFIED", "NO_FEASIBLE_PLAN_WITHIN_BOUNDS", "PLAN_DIGEST_DRIFT", "PLAN_FIX_SET_DRIFT", "SOURCE_FINDING_SET_MISMATCH"].includes(code)) return failure(code, "UNKNOWN", "A verification precondition was not satisfied.", 409, requestId);
    if (/^(GITHUB|OSV|ENRICHMENT|HYDRADB)_/.test(code)) return failure(code.split(":")[0] ?? "SOURCE_UNAVAILABLE", "UNKNOWN", "An external evidence source is unavailable.", 503, requestId, true, undefined, { "retry-after": "60" });
    return failure("INTERNAL_ERROR", "ERROR", "Request failed closed.", 503, requestId, true);
  }
}

export const GET = dispatch;
export const POST = dispatch;
