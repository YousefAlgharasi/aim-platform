/* ── Donut chart (pure SVG) ── */
type Segment = { value: number; color: string; label: string };

type Props = {
  readonly segments: readonly Segment[];
  readonly size?: number;
  readonly thickness?: number;
};

export function DonutChart({ segments, size = 140, thickness = 20 }: Props) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - thickness) / 2;
  const c = Math.PI * 2 * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border, #e5e5e5)"
          strokeWidth={thickness}
        />
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((seg, i) => {
              const pct = seg.value / total;
              const dash = c * pct;
              const el = (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              );
              offset += dash;
              return el;
            })}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-2xl font-extrabold fill-[var(--text-primary)]"
        >
          {total.toLocaleString()}
        </text>
      </svg>
      <div className="flex flex-col gap-1.5 w-full">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ background: seg.color }} />
            <span className="flex-1 text-[var(--text-secondary)]">{seg.label}</span>
            <span className="font-bold text-[var(--text-primary)]">{seg.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
