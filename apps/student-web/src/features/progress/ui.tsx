import { Link } from 'react-router-dom';

/** Shared Tailwind class strings + small pieces for the Progress pages (prototype ProgressTab language). */
export const h1 = 'lp-display m-0 text-[2rem] font-semibold text-ink sm:text-[2.5rem]';
export const intro = 'm-0 text-base text-ink-muted';
export const sectionTitle = 'm-0 text-xl font-semibold tracking-tight text-ink';
export const muted = 'm-0 text-base text-ink-muted';
export const meta = 'm-0 text-sm text-ink-muted';
export const link = 'text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink';
export const linkLg = 'text-base font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink';
export const itemTitle = 'text-lg font-semibold text-ink [overflow-wrap:anywhere]';
export const pageStack = 'flex flex-col gap-6';
export const list = 'm-0 flex list-none flex-col gap-3 p-0';
export const barTrack = 'h-2 w-full overflow-hidden rounded-full bg-ink/10';
export const barFill = 'h-full rounded-full bg-brand transition-all duration-300';
export const barFillWeak = 'h-full rounded-full bg-brand transition-all duration-300';

export const tone = {
  neutral: 'bg-surface-muted text-ink-soft',
  primary: 'bg-brand-soft text-brand-ink',
  success: 'bg-success-soft text-success-ink',
  warning: 'bg-warning-soft text-warning-ink',
  error: 'bg-danger-soft text-danger-ink',
} as const;

export function badge(t: string): string {
  return `inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${t}`;
}

/** Back action: prototype's rounded chevron button + label. */
export function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center gap-2 self-start no-underline text-sm font-semibold text-ink-soft hover:text-ink"
    >
      <span className="flex size-11 items-center justify-center rounded-full ring-1 ring-line-strong">
        <svg className="size-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </span>
      {children}
    </Link>
  );
}
