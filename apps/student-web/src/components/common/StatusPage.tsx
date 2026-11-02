import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

export function StatusPage({ code, message }: { code: string; message: string }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-brand-soft/40 via-white to-surface-sunken/50 dark:from-elevated dark:via-elevated dark:to-elevated p-6 text-center">
      <h1 className="m-0 text-7xl font-black tracking-tight bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
        {code}
      </h1>
      <p className="m-0 text-xl font-bold text-ink">{t(message)}</p>
      <Link to="/" className="mt-2 font-bold text-sm text-brand-ink underline underline-offset-2">
        {t('Back to Dashboard')}
      </Link>
    </div>
  );
}
