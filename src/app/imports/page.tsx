"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContextLink, PageHeader, StatusLozenge } from "../../components/atlas";

export default function ImportsPage() {
  const portfolioKey = useSearchParams().get("portfolio") ?? "default";
  const [kind, setKind] = useState<"github" | "upload">("github");
  const [repository, setRepository] = useState("");
  const [ref, setRef] = useState("");
  const [manifestBase64, setManifestBase64] = useState("");
  const [lockfileBase64, setLockfileBase64] = useState("");
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const encode = (file: File, name: string) => new Promise<string>((resolve, reject) => { if (file.size > 10 * 1024 * 1024) return reject(new Error(`${name.toUpperCase()}_TOO_LARGE`)); const reader = new FileReader(); reader.onerror = () => reject(new Error("FILE_READ_FAILED")); reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.readAsDataURL(file); });
  const submit = async () => {
    setError(undefined);
    const body = kind === "github" ? { kind, repository, ref } : { kind, repository, manifestBase64, lockfileBase64 };
    setPending(true);
    try { const response = await fetch(`/api/imports?portfolio=${encodeURIComponent(portfolioKey)}`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify(body) }); const result = await response.json().catch(() => ({})); if (!response.ok) return setError(result.message ?? "Import failed closed."); setJobId(result.jobId); } catch { setError("Import is unavailable. No input was stored."); } finally { setPending(false); }
  };
  const chooseFile = (file: File | undefined, name: string, setter: (value: string) => void) => { if (!file) return; void encode(file, name).then(setter).catch((cause) => setError(cause instanceof Error ? cause.message : "FILE_READ_FAILED")); };
  return <div className="stack-lg"><PageHeader eyebrow="Ingest · immutable source boundary" title="Imports" description={`Portfolio ${portfolioKey}. HydraCut reads exact public refs or local manifest + lockfile bytes; it never executes repository code.`} /><section className="evidence-tray stack"><div className="row" style={{ justifyContent: "space-between" }}><h2>Input source</h2><StatusLozenge state="NO EXECUTION" /></div><p className="muted">Limits are enforced before persistence: each file ≤ 10 MiB, JSON only, and GitHub refs resolve to an immutable commit before extraction.</p><fieldset className="row"><legend>Choose one source mode</legend><label><span><input type="radio" checked={kind === "github"} onChange={() => setKind("github")} /> Public GitHub ref</span></label><label><span><input type="radio" checked={kind === "upload"} onChange={() => setKind("upload")} /> Local manifest + lockfile</span></label></fieldset><label>Owner/repository<input required value={repository} onChange={(event) => setRepository(event.target.value)} /></label>{kind === "github" ? <label>Commit, branch, or tag<input required value={ref} onChange={(event) => setRef(event.target.value)} /><small className="muted">Stage 1 validates the ref; stage 2 fetches package.json and package-lock.json; stage 3 hashes exact bytes.</small></label> : <><label>package.json<input required type="file" accept="application/json,.json" onChange={(event) => chooseFile(event.target.files?.[0], "manifest", setManifestBase64)} /><small className="muted">Manifest JSON, maximum 10 MiB.</small></label><label>package-lock.json<input required type="file" accept="application/json,.json" onChange={(event) => chooseFile(event.target.files?.[0], "lockfile", setLockfileBase64)} /><small className="muted">Lockfile JSON, maximum 10 MiB. The lockfile is required for graph extraction.</small></label></>}<button className="button primary" disabled={pending || (kind === "upload" && (!manifestBase64 || !lockfileBase64))} aria-busy={pending} onClick={() => void submit()}>{pending ? "Resolving immutable input…" : "Resolve immutable input and import"}</button>{error && <p role="alert" className="danger">{error}</p>}{jobId && <ContextLink className="button" href={`/jobs/${jobId}`}>Open import job</ContextLink>}</section><section className="grid-3"><article className="panel"><h3>Accepted</h3><p className="muted">Public GitHub commit, branch, or tag; JSON manifest and lockfile.</p></article><article className="panel"><h3>Stored</h3><p className="muted">Exact bytes, SHA-256, immutable snapshot key.</p></article><article className="panel"><h3>Refused</h3><p className="muted">Execution, missing lockfiles, unresolved refs, and secret-bearing input.</p></article></section></div>;
}
