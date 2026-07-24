// P11-008: AIM design system page header component
import type { ReactNode } from 'react';

type Props = {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-600)]" aria-hidden="true">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] leading-8 tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] leading-6">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </header>
  );
}
