// P11-009: AIM design system badge component
type Variant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

type Props = {
  readonly children: React.ReactNode;
  readonly variant?: Variant;
  readonly label?: string; // aria-label for icon-only badges
};

const VARIANT_MAP: Record<Variant, { bg: string; fg: string }> = {
  default: { bg: 'var(--surface-sunken)',  fg: 'var(--text-secondary)' },
  primary: { bg: 'var(--primary-soft)',    fg: 'var(--color-primary-700)' },
  success: { bg: 'var(--success-soft)',    fg: 'var(--color-success-700)' },
  warning: { bg: 'var(--warning-soft)',    fg: 'var(--color-warning-700)' },
  error:   { bg: 'var(--error-soft)',      fg: 'var(--color-error-700)' },
  info:    { bg: 'var(--info-soft)',       fg: 'var(--color-info-700)' },
  neutral: { bg: 'var(--color-neutral-100)', fg: 'var(--color-neutral-600)' },
};

export function AdminBadge({ children, variant = 'default', label }: Props) {
  const { bg, fg } = VARIANT_MAP[variant];
  return (
    <span
      className="aim-badge"
      aria-label={label}
      style={{ background: bg, color: fg }}
    >
      {children}
      <style>{`
        .aim-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-4);
          padding: 2px var(--space-8);
          border-radius: var(--radius-pill);
          font-size: 12px;
          font-weight: var(--weight-semibold);
          line-height: 18px;
          white-space: nowrap;
        }
      `}</style>
    </span>
  );
}
