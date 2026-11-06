/**
 * Single source of truth for action buttons (<Button>, link-buttons, raw <button>).
 * Primary = flat brand blue pill; secondary = outlined pill; ghost = text. Minimum action height is 44px; default 48px; hero CTAs 56px.
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
    'bg-brand text-white hover:bg-brand-hover active:bg-brand-active ' +
    'disabled:bg-disabled disabled:text-ink-disabled',
  secondary:
    'bg-transparent text-ink ring-1 ring-inset ring-line-strong ' +
    'hover:bg-surface-strong ' +
    'disabled:bg-disabled disabled:text-ink-disabled disabled:ring-0',
  ghost:
    'bg-transparent text-ink-soft hover:bg-surface-strong hover:text-ink disabled:text-ink-disabled',
};

export const BTN_SIZE: Record<ButtonSize, string> = {
  sm: 'h-11 px-5 text-sm rounded-full',
  md: 'h-12 px-6 text-[15px] rounded-full',
  lg: 'h-14 px-7 text-base rounded-full',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
): string {
  return `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]}${fullWidth ? ' w-full' : ''}`;
}
