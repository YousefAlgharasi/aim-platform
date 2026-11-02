import { Link } from 'react-router-dom';

/** Shared Tailwind class strings + small pieces for the Progress pages (prototype ProgressTab language). */
export const h1 = 'm-0 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink';
export const intro = 'm-0 text-sm text-ink-muted';
export const sectionTitle = 'm-0 text-base font-extrabold tracking-tight text-ink';
export const muted = 'm-0 text-sm text-ink-muted';
export const meta = 'm-0 text-xs font-medium text-ink-muted';
export const link = 'text-xs font-semibold text-brand-ink no-underline hover:underline';
export const linkLg = 'text-sm font-semibold text-brand-ink no-underline hover:underline';
export const itemTitle = 'text-base font-bold text-ink [overflow-wrap:anywhere]';
export const pageStack = 'flex flex-col gap-6';
export const list = 'm-0 flex list-none flex-col gap-3 p-0';
export const barTrack = 'h-2 w-full overflow-hidden rounded-full bg-surface-strong';
export const barFill = 'h-full rounded-full bg-gradient-to-r from-brand to-secondary transition-all duration-300';
export const barFillWeak = 'h-full rounded-full bg-gradient-to-r from-warning to-danger transition-all duration-300';

export const tone = {
  neutral: 'bg-surface-muted text-ink-soft',
  primary: 'bg-brand-soft text-brand-ink',
  success: 'bg-success-soft text-success-ink',
  warning: 'bg-warning-soft text-warning-ink',
  error: 'bg-danger-soft text-danger-ink',
} as const;

export function badge(t: string): string {
  return `inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${t}`;
}

/** Back action: prototype's rounded chevron button + label. */
export function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-10 items-center gap-2 self-start no-underline text-sm font-semibold text-ink-soft hover:text-brand-ink"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-control">
        <svg className="size-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </span>
      {children}
    </Link>
  );
}
