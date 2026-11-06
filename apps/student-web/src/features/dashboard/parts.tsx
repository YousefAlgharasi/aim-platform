import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../i18n/I18nContext';

/** Circular progress for today's lesson goal. Green once met. */
export function GoalRing({ done, target, met, label, size = 136 }: { done: number; target: number; met: boolean; label: string; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, target > 0 ? done / target : 0));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="6" className="stroke-line-strong" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className={`transition-[stroke-dasharray] duration-700 motion-reduce:transition-none ${met ? 'stroke-success' : 'stroke-brand'}`} strokeDasharray={`${pct * c} ${c}`} />
      </svg>
      <span className="lp-num text-4xl font-semibold tracking-tight text-ink rtl:tracking-normal">{done}<span className="text-lg text-ink-muted">/{target}</span></span>
    </div>
  );
}

/** One number with a label, optional progress line, hint and link. A plain figure under a hairline, not a card. */
export function StatTile({ label, value, hint, hintTone = 'text-ink-muted', bar, to }: { label: string; value: string; hint?: string; hintTone?: string; bar?: number; to?: string }) {
  const body = (
    <div className={`flex h-full flex-col gap-1.5 rounded-2xl bg-surface p-5 ring-1 ring-line transition-colors ${to ? 'hover:bg-surface-muted' : ''}`}>
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="lp-num text-4xl font-semibold leading-none tracking-tight text-ink rtl:tracking-normal">{value}</span>
      {bar != null && (
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={bar}>
          <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${bar}%` }} />
        </div>
      )}
      {hint && <span className={`text-sm ${to ? 'underline decoration-line-strong underline-offset-4' : ''} ${hintTone}`}>{hint}</span>}
    </div>
  );
  return to ? <Link to={to} className="block rounded-2xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{body}</Link> : body;
}

/** Shown instead of zeros/"none" when a request failed, so a failure is never mistaken for real data. */
export function Unavailable({ label, onRetry }: { label: string; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-ink-muted">{t('Could not load {what}.', { what: label })}</span>
        <Button size="sm" variant="secondary" onClick={onRetry}>{t('Retry')}</Button>
      </div>
    </Card>
  );
}
