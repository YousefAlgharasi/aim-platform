import { buttonClasses } from '../../../components/common/buttonStyles';
/** Shared Tailwind class strings for dashboard widgets (prototype HomePage language). */
export const eyebrow = 'text-sm font-medium text-ink-muted';
export const cardTitle = 'm-0 text-xl font-semibold tracking-tight text-ink';
export const meta = 'text-xs font-semibold text-ink-muted';
export const label = 'text-xs font-semibold text-ink-muted';
export const link = 'inline-block py-2 -my-2 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink';
export const primaryLink = buttonClasses('primary', 'sm');
export const barTrack = 'h-2 w-full overflow-hidden rounded-full bg-ink/10';
export const barFill = 'h-full rounded-full bg-brand transition-all duration-300';
export const iconPill =
  'flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink';

/** The flat card every dashboard widget sits in: hairline outline, no shadow, no gradient. */
export const panel = 'rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6';
