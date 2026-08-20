"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ImportsPage() {
  const portfolioKey = useSearchParams().get("portfolio") ?? "default";
  const [kind, setKind] = useState<"github" | "upload">("github");
  const [repository, setRepository] = useState("");
  const [ref, setRef] = useState("");
  const [manifestBase64, setManifestBase64] = useState("");
  const [lockfileBase64, setLockfileBase64] = useState("");
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const encode = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("FILE_READ_FAILED")); reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.readAsDataURL(file); });
  const submit = async () => {
    setError(undefined);
    const body = kind === "github" ? { kind, repository, ref } : { kind, repository, manifestBase64, lockfileBase64 };
    const response = await fetch(`/api/imports?portfolio=${encodeURIComponent(portfolioKey)}`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) return setError(result.message ?? "Import failed closed.");
    setJobId(result.jobId);
  };
  return <main className="stack"><header><p className="accent">No repository execution</p><h1>Imports</h1><p>Portfolio {portfolioKey}</p></header><fieldset className="row"><legend>Input source</legend><label><input type="radio" checked={kind === "github"} onChange={() => setKind("github")} />Public GitHub ref</label><label><input type="radio" checked={kind === "upload"} onChange={() => setKind("upload")} />Local manifest + lockfile</label></fieldset><label>Owner/repository<input required value={repository} onChange={(event) => setRepository(event.target.value)} /></label>{kind === "github" ? <label>Commit, branch, or tag<input required value={ref} onChange={(event) => setRef(event.target.value)} /></label> : <><label>package.json<input required type="file" accept="application/json,.json" onChange={(event) => event.target.files?.[0] && void encode(event.target.files[0]).then(setManifestBase64)} /></label><label>package-lock.json<input required type="file" accept="application/json,.json" onChange={(event) => event.target.files?.[0] && void encode(event.target.files[0]).then(setLockfileBase64)} /></label></>}<button className="button primary" disabled={kind === "upload" && (!manifestBase64 || !lockfileBase64)} onClick={() => void submit()}>Resolve immutable input and import</button>{error && <p role="alert">{error}</p>}{jobId && <a href={`/jobs/${jobId}`}>Open import job</a>}</main>;
}
