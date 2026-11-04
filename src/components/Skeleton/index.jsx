export const SkeletonLines = ({ lines = 3 }) => (
  <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} className="h-4 animate-pulse rounded-full bg-raised" style={{ width: `${95 - i * 12}%` }} />
    ))}
  </div>
);

export const LoadError = ({ what }) => (
  <p className="text-muted">
    Couldn't load {what}. The API might be waking up, try a refresh in a moment.
  </p>
);
