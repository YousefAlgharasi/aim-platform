import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../i18n';
import { useI18n } from '../../i18n/I18nContext';
import { formatMoney } from './billingFormat';
import { fetchMyPayments, type CoursePayment } from './courseBillingApi';

const STATUS: Record<CoursePayment['status'], { label: string; tone: string }> = {
  pending: { label: 'Pending', tone: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/50' },
  approved: { label: 'Approved', tone: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50' },
  rejected: { label: 'Rejected', tone: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/50' },
};

/** Route: /billing/payments — the student's course payments and their review status. */
export function MyPaymentsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<CoursePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchMyPayments()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err, t('Failed to load payments'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">{t('My payments')}</h1>
      {items.length === 0 ? (
        <EmptyState title={t('My payments')} message={t("You haven't made any course payments yet.")} />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 ring-1 ring-[#E2E8F0] dark:ring-slate-700 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white">{p.courseTitle}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS[p.status].tone}`}>{t(STATUS[p.status].label)}</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">{formatMoney(p.amount, p.currency)}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{p.walletName} · {t('Transaction {number}', { number: p.transactionNumber })}</span>
              <span className="text-xs text-slate-400">{formatDate(p.createdAt)}</span>
              {p.adminNote && (
                <span className={`text-sm ${p.status === 'rejected' ? 'text-rose-600' : 'text-slate-500'}`}>{t('Note: {note}', { note: p.adminNote })}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
