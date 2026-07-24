// P11-009: AIM design system card component
import type { ReactNode } from 'react';

type Props = {
  readonly children: ReactNode;
  readonly title?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly padding?: 'default' | 'lg' | 'none';
  readonly className?: string;
};

const PADDING_MAP: Record<NonNullable<Props['padding']>, string> = {
  default: 'p-4 md:p-5',
  lg: 'p-6 md:p-8',
  none: 'p-0',
};

export function AdminCard({ children, title, description, actions, padding = 'default', className = '' }: Props) {
  return (
    <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 md:p-5 pb-0">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-base font-semibold text-[var(--text-primary)] leading-6">{title}</h2>}
            {description && <p className="text-sm text-[var(--text-secondary)]">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={PADDING_MAP[padding]}>{children}</div>
    </div>
  );
}
