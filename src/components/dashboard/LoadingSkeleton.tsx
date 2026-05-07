export const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="h-36 animate-pulse rounded-2xl bg-muted" />
      <div className="h-36 animate-pulse rounded-2xl bg-muted" />
    </div>
    <div className="h-80 animate-pulse rounded-2xl bg-muted" />
  </div>
);
