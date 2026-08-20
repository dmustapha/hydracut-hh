"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface JobBody { state?: string; events?: Array<{ phase: string; state: string; detail: { digest?: string } }> }
interface ReceiptSummary { verificationUniverse: { baseline: { pairs: unknown[] } }; final: { pairs: unknown[]; refusalReasons: string[]; state: string }; selectedSourceKeys: string[] }

export default function VerifyPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const [jobId, setJobId] = useState<string>();
  const [error, setError] = useState<string>();
  const { data: job } = useQuery<JobBody>({ queryKey: ["job", jobId], enabled: Boolean(jobId), queryFn: async () => { const response = await fetch(`/api/jobs/${jobId}`); if (!response.ok) throw new Error("JOB_POLL_FAILED"); return response.json(); }, refetchInterval: (query) => ["COMPLETE", "FAILED"].includes(query.state.data?.state ?? "") ? false : 1_000 });
  const verify = async () => {
    const response = await fetch(`/api/plans/${planId}/verify`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ expectedPlanDigest: planId }) });
    const body = await response.json();
    if (!response.ok) return setError(body.message ?? "Verification failed closed.");
    setJobId(body.jobId);
  };
  const digest = job?.events?.findLast((event) => event.phase === "RECEIPT")?.detail.digest;
  const receipt = useQuery<ReceiptSummary>({ queryKey: ["receipt", digest], enabled: Boolean(digest), queryFn: async () => { const response = await fetch(`/api/receipts/${digest}`); if (!response.ok) throw new Error("RECEIPT_UNAVAILABLE"); return response.json(); } });
  return <main className="stack"><header><p className="accent">Second native traversal</p><h1>Verify combined plan</h1><p>No individual outcome is unioned into proof.</p></header><button className="button primary" disabled={Boolean(jobId)} onClick={() => void verify()}>Run final HydraDB proof</button>{error && <p role="alert" className="danger">{error}</p>}<ol>{job?.events?.map((event) => <li key={event.phase}>{event.phase}: {event.state}</li>)}</ol>{job?.state === "FAILED" && <p role="alert" className="danger">Final verification failed closed. Inspect the job evidence.</p>}{receipt.data && <section className="panel"><h2>Combined before and after</h2><p>{receipt.data.verificationUniverse.baseline.pairs.length} baseline pairs → {receipt.data.final.pairs.length} bounded-universe final pairs.</p><p>Final state {receipt.data.final.state}</p>{receipt.data.final.refusalReasons.length > 0 && <div role="alert" className="danger">Refused: {receipt.data.final.refusalReasons.join(", ")}</div>}</section>}{digest && <a className="button primary" href={`/proof/${digest}`}>Open immutable receipt</a>}</main>;
}
