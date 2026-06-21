// P15-058: KPI card grid — renders backend-resolved metric values only
export type AdminKpiCardItem = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly helperText?: string;
};

type Props = {
  readonly items: readonly AdminKpiCardItem[];
  readonly emptyLabel?: string;
};

export function AdminKpiCardGrid({ items, emptyLabel = 'No metrics available yet.' }: Props) {
  if (items.length === 0) {
    return <p className="aim-kpi-empty">{emptyLabel}</p>;
  }

  return (
    <div className="aim-kpi-grid" role="list" aria-label="Key metrics">
      {items.map((item) => (
        <div className="aim-kpi-card" role="listitem" key={item.key}>
          <p className="aim-kpi-label">{item.label}</p>
          <p className="aim-kpi-value">{item.value}</p>
          {item.helperText && <p className="aim-kpi-helper">{item.helperText}</p>}
        </div>
      ))}
      <style>{`
        .aim-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-16);
        }
        .aim-kpi-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-16);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .aim-kpi-label {
          margin: 0;
          font-size: 13px;
          font-weight: var(--weight-semibold);
          color: var(--text-muted);
        }
        .aim-kpi-value {
          margin: 0;
          font-size: 28px;
          font-weight: var(--weight-bold);
          color: var(--text-primary);
        }
        .aim-kpi-helper {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .aim-kpi-empty {
          margin: 0;
          color: var(--text-muted);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
