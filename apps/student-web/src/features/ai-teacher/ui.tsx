import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

export function ChevronBackIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`${className} rtl:rotate-180`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function SendIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={`${className} rtl:-scale-x-100`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export function BackLink({ to, label }: { to: string; label: string }) {
  const { t } = useI18n();
  return (
    <Link
      to={to}
      aria-label={t(label)}
      className="size-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center transition-colors"
    >
      <ChevronBackIcon />
    </Link>
  );
}

export const pillLinkClass =
  'inline-flex items-center justify-center gap-1.5 min-h-10 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-300 text-sm font-semibold no-underline hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors';

export function ThumbButton({
  kind, active, disabled, onClick, label,
}: { kind: 'up' | 'down'; active: boolean; disabled: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      className={`size-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors disabled:cursor-default ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-[#4F46E5] dark:text-indigo-300'
          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 disabled:opacity-60'
      }`}
    >
      <svg className={`size-4 ${kind === 'down' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 011.92 2.56l-2.33 8A2 2 0 0117.5 22H4a2 2 0 01-2-2v-8a2 2 0 012-2h2.76a2 2 0 001.79-1.11L12 2a3.13 3.13 0 013 3.88z" />
      </svg>
    </button>
  );
}
