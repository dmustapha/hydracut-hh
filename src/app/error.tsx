"use client";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="panel error-state" role="alert"><p className="eyebrow">Evidence surface unavailable</p><h1>HydraCut refused this view.</h1><p className="muted">The route could not read its persisted evidence. No verified conclusion is shown.</p><button className="button primary" onClick={reset}>Retry route</button></div>;
}
