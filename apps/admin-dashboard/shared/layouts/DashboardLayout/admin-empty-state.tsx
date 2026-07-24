// P11-008: AIM design system empty state component
import type { ReactNode } from 'react';

type Props = {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
};

export function AdminEmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center" role="status" aria-label={title}>
      <div className="flex items-center justify-center" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="12" fill="var(--surface-sunken)" />
          <rect x="12" y="18" width="16" height="2" rx="1" fill="var(--color-neutral-400)" />
          <rect x="16" y="13" width="8" height="2" rx="1" fill="var(--color-neutral-400)" />
          <rect x="14" y="23" width="12" height="2" rx="1" fill="var(--color-neutral-400)" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-[var(--text-primary)] leading-6">{title}</h2>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] leading-5 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
