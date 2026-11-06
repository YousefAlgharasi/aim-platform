import { PageTitleBar } from '../../components/common/PageTitleBar';
import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../i18n';
import { useI18n } from '../../i18n/I18nContext';
import { formatMoney } from './billingFormat';
import { fetchMyPayments, type CoursePayment } from './courseBillingApi';
import { printReceipt, receiptHtml } from './printReceipt';

const STATUS: Record<CoursePayment['status'], { label: string; tone: string }> = {
  pending: { label: 'Pending', tone: 'text-warning-ink bg-warning-soft' },
  approved: { label: 'Approved', tone: 'text-success-ink bg-success-soft' },
  rejected: { label: 'Rejected', tone: 'text-danger-ink bg-danger-soft' },
};

/** Route: /billing/payments — the student's course payments and their review status. */
export function MyPaymentsPage() {
  const { t, locale } = useI18n();
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

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-5">
      <PageTitleBar title={t('My payments')} />
      {items.length === 0 ? (
        <EmptyState title={t('My payments')} message={t("You haven't made any course payments yet.")} />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p) => (
            <div key={p.id} className="bg-surface rounded-2xl p-4 ring-1 ring-line flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-ink">{p.courseTitle}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS[p.status].tone}`}>{t(STATUS[p.status].label)}</span>
              </div>
              <span className="font-bold text-ink">{formatMoney(p.amount, p.currency)}</span>
              <span className="text-sm text-ink-muted">{p.walletName} · {t('Transaction {number}', { number: p.transactionNumber })}</span>
              <span className="text-xs text-ink-muted">{formatDate(p.createdAt)}</span>
              {p.status === 'approved' && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const html = receiptHtml(p, {
                        title: t('Payment receipt'), course: t('Course'), amount: t('Amount'), paidWith: t('Paid with'),
                        transaction: t('Transaction number'), date: t('Date'), reference: t('Reference'), status: t('Status'),
                        statusValue: t('Approved'), note: t('Note'),
                      }, formatDate(p.createdAt), locale === 'ar' ? 'rtl' : 'ltr');
                      if (!printReceipt(html)) setError(t('Allow pop-ups to print your receipt.'));
                    }}
                    className="h-11 cursor-pointer rounded-2xl border-0 bg-brand-soft px-5 text-sm font-bold text-brand-ink ring-1 ring-inset ring-brand-line hover:bg-brand-soft-hover"
                  >
                    {t('Print receipt')}
                  </button>
                </div>
              )}
              {p.adminNote && (
                <span className={`text-sm ${p.status === 'rejected' ? 'text-danger-ink' : 'text-ink-muted'}`}>{t('Note: {note}', { note: `\u2068${p.adminNote}\u2069` })}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
