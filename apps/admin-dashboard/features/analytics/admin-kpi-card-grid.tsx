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
    return <p className="text-sm text-[var(--text-muted)]">{emptyLabel}</p>;
  }

  return (
    <div
      className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4"
      role="list"
      aria-label="Key metrics"
    >
      {items.map((item) => (
        <div
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1"
          role="listitem"
          key={item.key}
        >
          <p className="text-xs font-semibold text-[var(--text-muted)]">{item.label}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{item.value}</p>
          {item.helperText && <p className="text-xs text-[var(--text-secondary)]">{item.helperText}</p>}
        </div>
      ))}
    </div>
  );
}
