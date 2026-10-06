export const SkeletonLines = ({ lines = 3 }) => (
  <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
    {Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className="h-4 animate-pulse rounded bg-panel"
        style={{ width: `${95 - i * 12}%` }}
      />
    ))}
  </div>
);

export const LoadError = ({ what }) => (
  <p className="font-mono text-sm text-muted">
    <span className="text-error">E484:</span> Can't open {what}. The API might be waking up, try a refresh.
  </p>
);
