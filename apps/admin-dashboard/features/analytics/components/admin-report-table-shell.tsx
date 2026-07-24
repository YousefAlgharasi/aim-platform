// P15-058: report table shell — wraps AdminTable with safe loading/empty/error states
import { AdminTable, type AdminTableColumn } from '../../../shared/components/Misc';
import { AdminErrorBanner } from '../../../shared/layouts/DashboardLayout';

type Props<T> = {
  readonly columns: readonly AdminTableColumn<T>[];
  readonly rows: readonly T[];
  readonly getRowKey: (row: T) => string;
  readonly caption?: string;
  readonly isLoading?: boolean;
  readonly errorMessage?: string | null;
  readonly emptyLabel?: string;
};

export function AdminReportTableShell<T>({
  columns,
  rows,
  getRowKey,
  caption,
  isLoading = false,
  errorMessage = null,
  emptyLabel = 'No report rows available yet.',
}: Props<T>) {
  if (errorMessage) {
    return <AdminErrorBanner message={errorMessage} />;
  }

  if (isLoading) {
    return (
      <div
        className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--text-muted)] text-sm"
        role="status"
        aria-live="polite"
      >
        Loading report data…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--text-muted)] text-sm">
        {emptyLabel}
      </div>
    );
  }

  return <AdminTable columns={columns} rows={rows} getRowKey={getRowKey} caption={caption} />;
}
