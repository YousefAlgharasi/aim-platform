// P15-058: report table shell — wraps AdminTable with safe loading/empty/error states
import { AdminTable, type AdminTableColumn } from '../common';

type Props<T> = {
  readonly columns: readonly AdminTableColumn<T>[];
  readonly rows: readonly T[];
  readonly getRowKey: (row: T) => string;
  readonly caption?: string;
  readonly isLoading?: boolean;
  readonly errorMessage?: string | null;
  readonly emptyLabel?: string;
};

const shellStyles = `
  .aim-report-table-status {
    padding: var(--space-16);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface-sunken);
    color: var(--text-muted);
    font-size: 14px;
  }
  .aim-report-table-status--error {
    color: var(--text-danger, var(--text-primary));
    border-color: var(--border-danger, var(--border));
  }
`;

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
    return (
      <>
        <div className="aim-report-table-status aim-report-table-status--error" role="alert">
          {errorMessage}
        </div>
        <style>{shellStyles}</style>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="aim-report-table-status" role="status" aria-live="polite">
          Loading report data…
        </div>
        <style>{shellStyles}</style>
      </>
    );
  }

  if (rows.length === 0) {
    return (
      <>
        <div className="aim-report-table-status">{emptyLabel}</div>
        <style>{shellStyles}</style>
      </>
    );
  }

  return (
    <>
      <AdminTable columns={columns} rows={rows} getRowKey={getRowKey} caption={caption} />
      <style>{shellStyles}</style>
    </>
  );
}
