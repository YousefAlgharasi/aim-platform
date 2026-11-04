import { Card } from '../../../components/common/Card';
import * as ui from './ui';

interface ProgressWidgetProps {
  completionPercent: number;
  label: string;
  meta?: string;
}

export function ProgressWidget({ completionPercent, label, meta }: ProgressWidgetProps) {
  const pct = Math.min(100, Math.max(0, Math.round(completionPercent)));
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 36 36" className="size-16 -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id="levelRingGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" style={{ stopColor: 'rgb(var(--c-brand))' }} />
                <stop offset="100%" style={{ stopColor: 'rgb(var(--c-secondary))' }} />
              </linearGradient>
            </defs>
            <path
              className="stroke-surface-strong"
              fill="none"
              strokeWidth="3.5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              fill="none"
              stroke="url(#levelRingGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${pct}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-ink">
            {pct}%
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-base font-extrabold tracking-tight text-ink">{label}</span>
          {meta && <span className={ui.meta}>{meta}</span>}
        </div>
      </div>
    </Card>
  );
}
