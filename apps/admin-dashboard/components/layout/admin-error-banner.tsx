// P11-008: AIM design system error / alert banner
type Variant = 'error' | 'warning' | 'info' | 'success';

type Props = {
  readonly variant?: Variant;
  readonly title?: string;
  readonly message: string;
};

const VARIANT_MAP: Record<Variant, string> = {
  error:   'bg-[var(--error-soft)] text-[var(--error-soft-fg)] border-l-red-500',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning-soft-fg)] border-l-amber-500',
  info:    'bg-[var(--info-soft)] text-[var(--info-soft-fg)] border-l-blue-500',
  success: 'bg-[var(--success-soft)] text-[var(--success-soft-fg)] border-l-emerald-500',
};

export function AdminErrorBanner({ variant = 'error', title, message }: Props) {
  return (
    <div
      className={`flex flex-col gap-1 p-3 px-4 rounded-xl border-l-4 text-sm leading-5 ${VARIANT_MAP[variant]}`}
      role="alert"
      aria-live="assertive"
    >
      {title && <strong className="font-semibold">{title}</strong>}
      <span>{message}</span>
    </div>
  );
}
