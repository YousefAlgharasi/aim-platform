// P11-008: AIM design system loading skeleton
type Props = {
  readonly rows?: number;
  readonly label?: string;
};

export function AdminLoadingSkeleton({ rows = 5, label = 'Loading…' }: Props) {
  return (
    <div
      className="aim-skeleton-wrapper"
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="aim-skeleton-header" aria-hidden="true" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="aim-skeleton-row"
          aria-hidden="true"
          style={{ width: `${85 + (i % 3) * 5}%` }}
        />
      ))}
      <style>{`
        @keyframes aim-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aim-skeleton-header,
          .aim-skeleton-row { animation: none; background-color: var(--surface-sunken); }
        }
        .aim-skeleton-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .aim-skeleton-header,
        .aim-skeleton-row {
          height: 20px;
          border-radius: var(--radius-sm);
          background: linear-gradient(
            90deg,
            var(--surface-sunken) 25%,
            var(--color-neutral-100) 50%,
            var(--surface-sunken) 75%
          );
          background-size: 800px 100%;
          animation: aim-shimmer 1.4s ease-in-out infinite;
        }
        .aim-skeleton-header {
          height: 32px;
          width: 240px;
          margin-block-end: var(--space-8);
        }
      `}</style>
    </div>
  );
}
