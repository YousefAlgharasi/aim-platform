/**
 * Single source of truth for action buttons (<Button>, link-buttons, raw <button>).
 * Primary = brand→secondary (blue→violet) gradient; secondary = tinted brand surface with a
 * brand outline; ghost = text. Minimum action height is 44px; default 48px; hero CTAs 56px.
 * Icon-only controls (close, toggles, audio) are NOT action buttons and keep their own sizing.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const BTN_BASE =
  'inline-flex items-center justify-center gap-2 border-0 font-bold no-underline cursor-pointer select-none whitespace-nowrap ' +
  'transition-all duration-200 ease-out active:scale-[0.98] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:active:scale-100';

export const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand to-secondary text-white shadow-md shadow-brand/25 ' +
    'hover:brightness-110 hover:shadow-lg hover:shadow-brand/35 hover:-translate-y-px ' +
    'disabled:bg-none disabled:bg-disabled disabled:text-ink-disabled disabled:shadow-none disabled:brightness-100 disabled:translate-y-0',
  secondary:
    'bg-brand-soft text-brand-ink ring-1 ring-inset ring-brand-line ' +
    'hover:bg-brand-soft-hover hover:ring-brand hover:shadow-md hover:-translate-y-px ' +
    'disabled:bg-disabled disabled:text-ink-disabled disabled:ring-0 disabled:shadow-none disabled:translate-y-0',
  ghost:
    'bg-transparent text-brand-ink hover:bg-brand-soft disabled:text-ink-disabled',
};

export const BTN_SIZE: Record<ButtonSize, string> = {
  sm: 'h-11 px-5 text-sm rounded-2xl',
  md: 'h-12 px-6 text-[15px] rounded-2xl',
  lg: 'h-14 px-7 text-base rounded-2xl tracking-tight',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
): string {
  return `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]}${fullWidth ? ' w-full' : ''}`;
}
