export default function Loading() {
  return <div className="loading-state" role="status" aria-live="polite"><span className="eyebrow">HydraCut · loading evidence</span><strong>Reading persisted graph state…</strong><span className="loading-cut" aria-hidden="true" /><ol><li>Resolve context</li><li>Read evidence</li><li>Preserve bounds</li></ol></div>;
}
