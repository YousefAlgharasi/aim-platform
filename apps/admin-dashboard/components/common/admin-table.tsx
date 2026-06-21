// P11-009: AIM design system admin table component
import type { ReactNode } from 'react';

export type AdminTableColumn<T> = {
  readonly key: string;
  readonly header: string;
  readonly render: (row: T) => ReactNode;
  readonly width?: string;
};

type Props<T> = {
  readonly columns: readonly AdminTableColumn<T>[];
  readonly rows: readonly T[];
  readonly getRowKey: (row: T) => string;
  readonly caption?: string;
};

export function AdminTable<T>({ columns, rows, getRowKey, caption }: Props<T>) {
  return (
    <div className="aim-table-wrapper" role="region" aria-label={caption ?? 'Data table'}>
      <table className="aim-table">
        {caption && <caption className="aim-table-caption">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="aim-table-th"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="aim-table-row">
              {columns.map((col) => (
                <td key={col.key} className="aim-table-td">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .aim-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
        }
        .aim-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          line-height: 20px;
        }
        .aim-table-caption {
          caption-side: top;
          text-align: start;
          font-size: 13px;
          font-weight: var(--weight-semibold);
          color: var(--text-secondary);
          padding: var(--space-12) var(--space-16) var(--space-4);
        }
        .aim-table-th {
          padding: var(--space-12) var(--space-16);
          text-align: start;
          font-size: 12px;
          font-weight: var(--weight-semibold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted);
          border-block-end: 1px solid var(--border);
          white-space: nowrap;
          background: var(--surface-sunken);
        }
        .aim-table-row {
          border-block-end: 1px solid var(--divider);
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .aim-table-row:last-child { border-block-end: none; }
        .aim-table-row:hover { background: var(--state-hover); }
        .aim-table-td {
          padding: var(--space-12) var(--space-16);
          color: var(--text-primary);
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
}
