// P11-008: AIM design system loading skeleton
type Props = {
  readonly rows?: number;
  readonly label?: string;
};

export function AdminLoadingSkeleton({ rows = 5, label = 'Loading…' }: Props) {
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-8 w-60 rounded-lg bg-[var(--surface-sunken)] animate-pulse mb-2" aria-hidden="true" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-5 rounded-lg bg-[var(--surface-sunken)] animate-pulse"
          aria-hidden="true"
          style={{ width: `${85 + (i % 3) * 5}%` }}
        />
      ))}
    </div>
  );
}
