// P11-009: AIM design system pagination component
import Link from 'next/link';

type Props = {
  readonly page: number;
  readonly totalPages: number;
  readonly buildHref: (page: number) => string;
  readonly label?: string;
};

export function AdminPagination({ page, totalPages, buildHref, label = 'pagination' }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="aim-pagination" aria-label={label}>
      {page > 1 ? (
        <Link className="aim-pagination-btn" href={buildHref(page - 1)} aria-label="Previous page">
          ← Previous
        </Link>
      ) : (
        <span className="aim-pagination-btn aim-pagination-btn--disabled" aria-disabled="true">
          ← Previous
        </span>
      )}

      <span className="aim-pagination-info" aria-current="page">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link className="aim-pagination-btn" href={buildHref(page + 1)} aria-label="Next page">
          Next →
        </Link>
      ) : (
        <span className="aim-pagination-btn aim-pagination-btn--disabled" aria-disabled="true">
          Next →
        </span>
      )}
      <style>{`
        .aim-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-8);
          margin-block-start: var(--space-24);
        }
        .aim-pagination-btn {
          display: inline-flex;
          align-items: center;
          min-height: var(--size-btn-sm);
          padding: 0 var(--space-16);
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: var(--weight-medium);
          color: var(--color-primary-600);
          text-decoration: none;
          border: 1px solid var(--border);
          background: var(--surface);
          transition: background var(--duration-fast) var(--ease-standard),
                      border-color var(--duration-fast) var(--ease-standard);
        }
        .aim-pagination-btn:hover {
          background: var(--primary-soft);
          border-color: var(--color-primary-200);
        }
        .aim-pagination-btn:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }
        .aim-pagination-btn--disabled {
          color: var(--disabled-fg);
          background: var(--disabled-bg);
          border-color: var(--disabled-border);
          cursor: not-allowed;
          pointer-events: none;
        }
        .aim-pagination-info {
          font-size: 13px;
          color: var(--text-secondary);
          padding: 0 var(--space-8);
        }
      `}</style>
    </nav>
  );
}
