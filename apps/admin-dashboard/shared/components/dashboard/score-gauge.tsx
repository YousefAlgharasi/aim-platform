/* ── Score gauge (half-circle) ── */
type Props = {
  readonly score: number | null;
  readonly label: string;
};

export function ScoreGauge({ score, label }: Props) {
  const pct = score !== null ? Math.min(score, 100) : 0;
  const r = 60;
  const c = Math.PI * r;
  const dash = (pct / 100) * c;
  const gaugeColor =
    score === null
      ? 'var(--text-muted)'
      : score >= 70
      ? 'var(--color-success-500, #22c55e)'
      : score >= 50
      ? 'var(--color-warning-500, #f59e0b)'
      : 'var(--color-error-500, #ef4444)';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path
          d={`M 10 75 A ${r} ${r} 0 0 1 130 75`}
          fill="none"
          stroke="var(--border, #e5e5e5)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {score !== null && (
          <path
            d={`M 10 75 A ${r} ${r} 0 0 1 130 75`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        )}
        <text
          x="70"
          y="68"
          textAnchor="middle"
          className="text-2xl font-extrabold fill-[var(--text-primary)]"
        >
          {score !== null ? `${score}%` : '--'}
        </text>
      </svg>
      <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
