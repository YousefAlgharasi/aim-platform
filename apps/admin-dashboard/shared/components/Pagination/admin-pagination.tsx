// P11-009: AIM design system pagination component
import Link from 'next/link';

type Props = {
  readonly page?: number;
  readonly currentPage?: number;
  readonly totalPages?: number;
  readonly totalCount?: number;
  readonly pageSize?: number;
  readonly buildHref?: (page: number) => string;
  readonly onPageChange?: (newPage: number) => void;
  readonly label?: string;
};

const btnClass =
  'inline-flex items-center min-h-9 px-4 rounded-lg text-sm font-medium text-[var(--color-primary-600)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--primary-soft)] hover:border-[var(--color-primary-200)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer';
const disabledClass =
  'inline-flex items-center min-h-9 px-4 rounded-lg text-sm font-medium text-[var(--disabled-fg)] bg-[var(--disabled-bg)] border border-[var(--disabled-border)] cursor-not-allowed pointer-events-none';

export function AdminPagination({
  page: pageProp,
  currentPage,
  totalPages: totalPagesProp,
  totalCount,
  pageSize,
  buildHref,
  onPageChange,
  label = 'pagination',
}: Props) {
  const activePage = currentPage ?? pageProp ?? 1;
  const totalPages =
    totalPagesProp ??
    (totalCount != null && pageSize != null ? Math.ceil(totalCount / pageSize) : 1);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-6" aria-label={label}>
      {activePage > 1 ? (
        buildHref ? (
          <Link className={btnClass} href={buildHref(activePage - 1)} aria-label="Previous page">
            ← Previous
          </Link>
        ) : (
          <button
            type="button"
            className={btnClass}
            onClick={() => onPageChange?.(activePage - 1)}
            aria-label="Previous page"
          >
            ← Previous
          </button>
        )
      ) : (
        <span className={disabledClass} aria-disabled="true">
          ← Previous
        </span>
      )}

      <span className="text-xs text-[var(--text-secondary)] px-2" aria-current="page">
        Page {activePage} of {totalPages}
      </span>

      {activePage < totalPages ? (
        buildHref ? (
          <Link className={btnClass} href={buildHref(activePage + 1)} aria-label="Next page">
            Next →
          </Link>
        ) : (
          <button
            type="button"
            className={btnClass}
            onClick={() => onPageChange?.(activePage + 1)}
            aria-label="Next page"
          >
            Next →
          </button>
        )
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  );
}
