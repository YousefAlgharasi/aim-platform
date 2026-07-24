/* ── Horizontal bar ── */
type Props = {
  readonly label: string;
  readonly value: number;
  readonly max: number;
  readonly color: string;
};

export function HBar({ label, value, max, color }: Props) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-bold text-[var(--text-primary)]">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-neutral-100,#f5f5f5)] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
