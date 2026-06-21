// P11-008: AIM design system error / alert banner
type Variant = 'error' | 'warning' | 'info' | 'success';

type Props = {
  readonly variant?: Variant;
  readonly title?: string;
  readonly message: string;
};

const VARIANT_STYLES: Record<Variant, { bg: string; fg: string; border: string }> = {
  error:   { bg: 'var(--error-soft)',   fg: 'var(--error-soft-fg)',   border: 'var(--color-error-500)' },
  warning: { bg: 'var(--warning-soft)', fg: 'var(--warning-soft-fg)', border: 'var(--color-warning-500)' },
  info:    { bg: 'var(--info-soft)',    fg: 'var(--info-soft-fg)',    border: 'var(--color-info-500)' },
  success: { bg: 'var(--success-soft)', fg: 'var(--success-soft-fg)', border: 'var(--color-success-500)' },
};

export function AdminErrorBanner({ variant = 'error', title, message }: Props) {
  const style = VARIANT_STYLES[variant];
  return (
    <div
      className="aim-alert"
      role="alert"
      aria-live="assertive"
      style={{
        background: style.bg,
        color: style.fg,
        borderInlineStartColor: style.border,
      }}
    >
      {title && <strong className="aim-alert-title">{title}</strong>}
      <span className="aim-alert-message">{message}</span>
      <style>{`
        .aim-alert {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-12) var(--space-16);
          border-radius: var(--radius-md);
          border-inline-start: 3px solid;
          font-size: 14px;
          line-height: 20px;
        }
        .aim-alert-title {
          font-weight: var(--weight-semibold);
          font-size: 14px;
        }
        .aim-alert-message { font-size: 14px; }
      `}</style>
    </div>
  );
}
