import { memo } from 'react';
import Link from 'next/link';
import { AdminSvgIcon } from '../Misc';

type Props = {
  readonly icon: string;
  readonly label: string;
  readonly value: string | number;
  readonly sub?: string;
  readonly accent: 'primary' | 'success' | 'emerald' | 'blue' | 'error' | 'warning';
  readonly href?: string;
};

const ACCENT_STYLES: Record<Props['accent'], string> = {
  primary: 'bg-[var(--primary-soft)] text-[var(--primary-soft-fg)]',
  success: 'bg-[var(--success-soft)] text-[var(--success-soft-fg)]',
  emerald: 'bg-[var(--success-soft)] text-[var(--success-soft-fg)]',
  blue: 'bg-[var(--info-soft)] text-[var(--info-soft-fg)]',
  error: 'bg-[var(--error-soft)] text-[var(--error-soft-fg)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning-soft-fg)]',
};

export const KpiCard = memo(function KpiCard({ icon, label, value, sub, accent, href }: Props) {
  const card = (
    <div className="h-full flex items-start gap-3.5 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-md hover:-translate-y-0.5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ACCENT_STYLES[accent]}`}
      >
        <AdminSvgIcon d={icon} size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold tracking-tight leading-tight text-[var(--text-primary)]">
          {value}
        </p>
        <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{label}</p>
        {sub && <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href} className="no-underline text-inherit block h-full">{card}</Link> : card;
});
