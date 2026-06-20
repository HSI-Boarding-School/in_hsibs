interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

export function SkeletonLoader({ count = 3, className = "" }: SkeletonLoaderProps) {
  return Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`flex flex-col gap-4 rounded-2xl border border-border/50 bg-surface p-5 ${className}`}
      style={{ width: "var(--column-width, 336px)" }}
    >
      <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-border/60" />
      {[0].includes(index) && (
        <div className="aspect-[2/1] w-full animate-pulse rounded-lg bg-border/40" />
      )}
      {[0, 1].includes(index) && (
        <div className="aspect-[4/1] w-full animate-pulse rounded-lg bg-border/30" />
      )}
      {[0, 1, 2].includes(index) && (
        <div className="aspect-[4/1] w-full animate-pulse rounded-lg bg-border/30" />
      )}
    </div>
  ));
}
