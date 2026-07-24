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
  primary: 'bg-[var(--color-primary-100,#e0e7ff)] text-[var(--color-primary-600,#4f46e5)]',
  success: 'bg-emerald-100 text-emerald-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  error: 'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-600',
};

export const KpiCard = memo(function KpiCard({ icon, label, value, sub, accent, href }: Props) {
  const card = (
    <div className="flex items-start gap-3.5 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-200 hover:border-[var(--color-primary-200)] hover:shadow-md hover:-translate-y-0.5">
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

  return href ? <Link href={href} className="no-underline text-inherit block">{card}</Link> : card;
});
