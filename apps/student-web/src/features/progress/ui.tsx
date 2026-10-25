import { Link } from 'react-router-dom';

/** Shared Tailwind class strings + small pieces for the Progress pages (prototype ProgressTab language). */
export const h1 = 'm-0 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white';
export const intro = 'm-0 text-sm text-slate-500 dark:text-slate-400';
export const sectionTitle = 'm-0 text-base font-extrabold tracking-tight text-slate-900 dark:text-white';
export const muted = 'm-0 text-sm text-slate-500 dark:text-slate-400';
export const meta = 'm-0 text-xs font-medium text-slate-500 dark:text-slate-400';
export const link = 'text-xs font-semibold text-[#4F46E5] dark:text-indigo-400 no-underline hover:underline';
export const linkLg = 'text-sm font-semibold text-[#4F46E5] dark:text-indigo-400 no-underline hover:underline';
export const itemTitle = 'text-base font-bold text-slate-900 dark:text-white [overflow-wrap:anywhere]';
export const pageStack = 'flex flex-col gap-6';
export const list = 'm-0 flex list-none flex-col gap-3 p-0';
export const barTrack = 'h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700';
export const barFill = 'h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300';
export const barFillWeak = 'h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-300';

export const tone = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  primary: 'bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
} as const;

export function badge(t: string): string {
  return `inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${t}`;
}

/** Back action: prototype's rounded chevron button + label. */
export function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-10 items-center gap-2 self-start no-underline text-sm font-semibold text-slate-600 hover:text-[#4F46E5] dark:text-slate-300 dark:hover:text-indigo-400"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <svg className="size-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </span>
      {children}
    </Link>
  );
}
