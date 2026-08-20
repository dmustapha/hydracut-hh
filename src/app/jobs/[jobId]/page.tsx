"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

interface JobView { state: string; errorCode?: string; events: Array<{ sequence: number; phase: string; state: string; detail: Record<string, unknown> }> }

export default function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const query = useQuery<JobView>({ queryKey: ["job", jobId], queryFn: async () => { const response = await fetch(`/api/jobs/${jobId}`); if (!response.ok) throw new Error("JOB_UNAVAILABLE"); return response.json(); }, refetchInterval: ({ state }) => ["COMPLETE", "FAILED", "CANCELLED"].includes(state.data?.state ?? "") ? false : 1_000 });
  return <main className="stack"><header><p className="accent">Durable work</p><h1>Job {jobId}</h1><span className="badge" aria-live="polite">{query.data?.state ?? "LOADING"}</span></header>{query.error && <p role="alert" className="danger">Job status is unavailable.</p>}{query.data?.errorCode && <p role="alert" className="danger">{query.data.errorCode}</p>}<ol className="panel">{query.data?.events.map((event) => <li key={event.sequence}><strong>{event.phase}</strong> · {event.state}<pre>{JSON.stringify(event.detail, null, 2)}</pre></li>)}</ol></main>;
}
