import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../i18n';
import { useI18n } from '../../i18n/I18nContext';
import { fetchStudentCourses } from '../curriculum/curriculumApi';
import { BackArrowIcon } from '../curriculum/CurriculumIcons';
import { formatMoney } from './billingFormat';
import {
  fetchCourseBilling,
  fetchWallets,
  MAX_RECEIPT_BYTES,
  RECEIPT_TYPES,
  submitCoursePayment,
  walletImageUrl,
  type CourseBilling,
  type PaymentWallet,
} from './courseBillingApi';

/**
 * Route: /curriculum/:subjectId/buy — "Get this course" for paid courses.
 * Shows the backend price and the time rule, then collects the wallet, the
 * transaction number and a receipt screenshot for an admin to confirm.
 */
export function CourseClaimPage() {
  const { subjectId: courseId = '' } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { t, plural } = useI18n();
  const [billing, setBilling] = useState<CourseBilling | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [wallets, setWallets] = useState<PaymentWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [walletId, setWalletId] = useState('');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([fetchCourseBilling(courseId), fetchWallets(), fetchStudentCourses().catch(() => [])])
      .then(([b, w, courses]) => {
        setBilling(b);
        setWallets(w);
        setCourseTitle(courses.find((c) => c.courseId === courseId)?.title ?? '');
      })
      .catch((err) => setError(getErrorMessage(err, t('Failed to load course'))))
      .finally(() => setLoading(false));
  }, [courseId, t]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => () => { if (receiptPreview) URL.revokeObjectURL(receiptPreview); }, [receiptPreview]);

  function pickReceipt(file: File | undefined) {
    setFormError('');
    if (!file) return;
    if (!RECEIPT_TYPES.includes(file.type)) {
      setFormError(t('Choose a PNG, JPEG or WebP image.'));
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setFormError(t('The image must be 5 MB or smaller.'));
      return;
    }
    setReceipt(file);
    setReceiptPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!walletId || !transactionNumber.trim() || !receipt) return;
    setSubmitting(true);
    setFormError('');
    submitCoursePayment(courseId, { walletId, transactionNumber: transactionNumber.trim(), receipt })
      .then(() => {
        setSubmitted(true);
        setTransactionNumber('');
        setReceipt(null);
        setReceiptPreview(null);
        load();
      })
      .catch((err) => setFormError(getErrorMessage(err, t("Couldn't send your payment. Please try again."))))
      .finally(() => setSubmitting(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error || !billing) return <ErrorState message={error || t('Failed to load course')} onRetry={load} />;

  const { price, access } = billing;
  const wallet = wallets.find((w) => w.id === walletId) ?? null;
  const canPay = access.status === 'none' || access.status === 'rejected' || access.status === 'failed';
  const daysLeft = access.daysLeft ?? 0;
  const daysLeftLabel = daysLeft <= 0
    ? t('Less than a day left')
    : plural(daysLeft, { one: t('1 day left'), two: t('2 days left'), few: t('{n} days left [few]', { n: daysLeft }), other: t('{n} days left', { n: daysLeft }) });
  const openCourse = () => navigate(`/curriculum/${courseId}`);

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <Link to="/curriculum" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 no-underline">
        <BackArrowIcon className="size-4 rtl:rotate-180" /> {t('Courses')}
      </Link>
      <div>
        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">{t('Get this course')}</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0 mt-1">{courseTitle}</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 ring-1 ring-[#E2E8F0] dark:ring-slate-700 flex flex-col gap-2">
        {price.isFree ? (
          <span className="text-2xl font-extrabold text-emerald-600">{t('Free')}</span>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{formatMoney(price.amount, price.currency)}</span>
            {price.discountActive && (
              <span className="text-base text-slate-400 line-through">{formatMoney(price.originalAmount, price.currency)}</span>
            )}
          </div>
        )}
        {price.discountActive && price.discountEndsAt && (
          <span className="text-sm font-semibold text-amber-600">{t('Offer ends {date}', { date: formatDate(price.discountEndsAt) })}</span>
        )}
      </div>

      {!price.isFree && access.status !== 'completed' && (
        <Banner variant="info">{t("You'll have {days} days to finish this course after your payment is approved. If you don't finish in time, you'll fail and need to pay again to start over.", { days: price.accessDays })}</Banner>
      )}

      {submitted && access.status === 'pending' && <Banner variant="success">{t("Payment sent. We'll unlock the course once it's confirmed.")}</Banner>}

      {access.status === 'active' && (
        <StatusPanel tone="success" title={t('You have access')}
          body={[daysLeftLabel, access.expiresAt ? t('Finish by {date}', { date: formatDate(access.expiresAt) }) : ''].filter(Boolean).join(' · ')}
          action={t('Open course')} onAction={openCourse} />
      )}
      {access.status === 'completed' && <StatusPanel tone="success" title={t('Course finished')} action={t('Open course')} onAction={openCourse} />}
      {access.status === 'free' && <StatusPanel tone="success" title={t('Free')} action={t('Open course')} onAction={openCourse} />}
      {access.status === 'pending' && <StatusPanel tone="warning" title={t('Waiting for confirmation')} body={t('The course unlocks as soon as an admin confirms your payment.')} />}
      {access.status === 'rejected' && (
        <StatusPanel tone="error" title={t('Payment not accepted')}
          body={[access.rejectionNote ? t('Note: {note}', { note: access.rejectionNote }) : '', t('Fix the details below and send it again.')].filter(Boolean).join('\n')} />
      )}
      {access.status === 'failed' && (
        <StatusPanel tone="error" title={t('Time ran out')}
          body={t("You didn't finish this course in time, so your progress was reset. Pay again to retake it from the start.")} />
      )}

      {canPay && (wallets.length === 0 ? (
        <Banner variant="warning">{t('No payment methods are available right now. Please try again later.')}</Banner>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-5 ring-1 ring-[#E2E8F0] dark:ring-slate-700 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="wallet" className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('1. Choose the wallet you paid with')}</label>
            <select id="wallet" value={walletId} onChange={(e) => setWalletId(e.target.value)} disabled={submitting}
              className="h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white">
              <option value="">{t('Select a wallet')}</option>
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {wallet && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {walletImageUrl(wallet.logoUrl) && <img src={walletImageUrl(wallet.logoUrl)!} alt="" className="size-9 rounded-lg object-contain bg-white" />}
                <span className="font-bold text-slate-900 dark:text-white">{t('Transfer {amount} to:', { amount: formatMoney(price.amount, price.currency) })}</span>
              </div>
              {wallet.accountName && <span className="text-sm text-slate-600 dark:text-slate-300">{t('Account name')}: {wallet.accountName}</span>}
              {wallet.accountNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white" dir="ltr">{wallet.accountNumber}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(wallet.accountNumber ?? '')}>{t('Copy')}</Button>
                </div>
              )}
              {wallet.instructions && <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{wallet.instructions}</p>}
              {walletImageUrl(wallet.qrImageUrl) && (
                <button type="button" onClick={() => setQrOpen(true)} className="self-start border-0 bg-transparent p-0 cursor-zoom-in">
                  <img src={walletImageUrl(wallet.qrImageUrl)!} alt={t('Account number / QR code')} className="h-44 rounded-lg object-contain bg-white" />
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="txn" className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('2. Transaction number')}</label>
            <input id="txn" value={transactionNumber} maxLength={100} onChange={(e) => setTransactionNumber(e.target.value)} disabled={submitting}
              placeholder={t('The reference number of your transfer')}
              className="h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="receipt" className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('3. Receipt screenshot')}</label>
            {receiptPreview && <img src={receiptPreview} alt={t('Receipt preview')} className="max-h-56 self-start rounded-lg object-contain" />}
            <input id="receipt" type="file" accept={RECEIPT_TYPES.join(',')} disabled={submitting}
              onChange={(e) => { pickReceipt(e.target.files?.[0]); e.target.value = ''; }}
              className="sr-only" />
            <label htmlFor="receipt" aria-hidden="true"
              className="self-start inline-flex items-center h-10 px-4 rounded-xl ring-1 ring-slate-300 dark:ring-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
              {receipt ? t('Change screenshot') : t('Choose screenshot')}
            </label>
          </div>

          {formError && <Banner variant="error">{formError}</Banner>}

          <Button type="submit" variant="primary" fullWidth disabled={submitting || !walletId || !transactionNumber.trim() || !receipt}>
            {submitting ? t('Sending…') : t('Send payment for review')}
          </Button>
        </form>
      ))}

      <Link to="/billing/payments" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 no-underline">{t('My payments')}</Link>

      <Modal open={qrOpen && !!wallet} onClose={() => setQrOpen(false)} title={wallet?.name ?? ''}>
        {qrOpen && wallet && walletImageUrl(wallet.qrImageUrl) && <img src={walletImageUrl(wallet.qrImageUrl)!} alt={t('Account number / QR code')} className="w-full rounded-lg object-contain bg-white" />}
      </Modal>
    </div>
  );
}

function StatusPanel({ tone, title, body, action, onAction }: {
  tone: 'success' | 'warning' | 'error'; title: string; body?: string; action?: string; onAction?: () => void;
}) {
  const ring = tone === 'success' ? 'ring-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
    : tone === 'warning' ? 'ring-amber-300 bg-amber-50 dark:bg-amber-950/40'
      : 'ring-rose-300 bg-rose-50 dark:bg-rose-950/40';
  return (
    <div className={`rounded-2xl p-5 ring-1 flex flex-col gap-2 ${ring}`} role="status">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white m-0">{title}</h2>
      {body && <p className="text-sm text-slate-600 dark:text-slate-300 m-0 whitespace-pre-line">{body}</p>}
      {action && <Button variant="primary" onClick={onAction} className="self-start">{action}</Button>}
    </div>
  );
}
