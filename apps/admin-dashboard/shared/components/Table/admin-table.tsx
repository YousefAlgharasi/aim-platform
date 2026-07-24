import { memo, type ReactNode } from 'react';

export type AdminTableColumn<T> = {
  readonly key: string;
  readonly header: string;
  readonly render: (row: T) => ReactNode;
  readonly width?: string;
  readonly className?: string;
};

type Props<T> = {
  readonly columns: readonly AdminTableColumn<T>[];
  readonly rows: readonly T[];
  readonly getRowKey: (row: T, index: number) => string;
  readonly caption?: string;
  readonly onRowClick?: (row: T) => void;
};

function AdminTableBase<T>({ columns, rows, getRowKey, caption, onRowClick }: Props<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs" role="region" aria-label={caption ?? 'Data table'}>
      <table className="w-full border-collapse text-left text-sm text-[var(--text-primary)]">
        {caption && <caption className="caption-top text-start text-xs font-semibold text-[var(--text-secondary)] p-4 pt-3 pb-1">{caption}</caption>}
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-sunken)]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap ${col.className ?? ''}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--divider)]">
          {rows.map((row, index) => {
            const isClickable = typeof onRowClick === 'function';
            return (
              <tr
                key={getRowKey(row, index)}
                onClick={isClickable ? () => onRowClick(row) : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={isClickable ? 0 : undefined}
                role={isClickable ? 'button' : undefined}
                className={`transition-colors duration-150 ${
                  isClickable ? 'cursor-pointer hover:bg-[var(--state-hover)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]' : 'hover:bg-[var(--state-hover)]'
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle text-[var(--text-primary)] ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const AdminTable = memo(AdminTableBase) as typeof AdminTableBase;
