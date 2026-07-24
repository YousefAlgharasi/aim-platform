// P15-058: shared report page layout — header, boundary note, and content slot
import type { ReactNode } from 'react';

type Props = {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly boundaryNote?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
};

export function AdminReportPageLayout({
  eyebrow = 'Admin — Analytics',
  title,
  description,
  boundaryNote,
  actions,
  children,
}: Props) {
  return (
    <section className="flex flex-col gap-5" dir="auto">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-500)]">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        {description && <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>}
        {actions && <div className="flex gap-2 flex-wrap mt-3">{actions}</div>}
      </header>

      {boundaryNote && (
        <div className="p-4 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
          <strong>Backend authority:</strong> {boundaryNote}
        </div>
      )}

      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
