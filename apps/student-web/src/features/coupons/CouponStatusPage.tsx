import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { couponApi, formatPrice, type PurchaseStatus } from './couponApi';

/** Route: /coupon/:token — public, private link. Shows pending / rejected / the coupon code once approved. */
export function CouponStatusPage() {
  const { token = '' } = useParams<{ token: string }>();
  const { t } = useI18n();
  const { user } = useAuth();
  const [status, setStatus] = useState<PurchaseStatus | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    couponApi.purchaseStatus(token).then(setStatus).catch(() => setStatus((s) => (s === undefined ? null : s)));
  }, [token]);

  useEffect(() => { load(); }, [load]);
  // While the payment is being checked, look again every 20 seconds.
  useEffect(() => {
    if (status?.status !== 'pending') return;
    const id = window.setInterval(load, 20_000);
    return () => window.clearInterval(id);
  }, [status?.status, load]);

  if (status === undefined) return <div className="flex flex-col gap-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-32 w-full" /></div>;
  if (status === null) return <Banner variant="error">{t('We could not find this purchase. Check that the link is complete.')}</Banner>;

  async function copy() {
    if (!status?.couponCode) return;
    try { await navigator.clipboard.writeText(status.couponCode); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* no clipboard */ }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="lp-display m-0 text-[2rem] font-semibold">{status.courseTitle}</h1>
        <p className="m-0 mt-1 text-base text-ink-muted">{formatPrice(status.amount, status.currency)} · {status.buyerName}</p>
      </div>

      {status.status === 'pending' && (
        <Banner variant="info">{t('We received your payment and are checking it. This page updates by itself — keep this link to come back later.')}</Banner>
      )}
      {status.status === 'rejected' && (
        <>
          <Banner variant="error">{t('Your payment was not accepted.')}{status.adminNote ? ` ${status.adminNote}` : ''}</Banner>
          <Link to="/welcome#courses" className="text-ink underline">{t('Try again')}</Link>
        </>
      )}
      {status.status === 'approved' && status.couponCode && (
        <>
          <Banner variant="success">{t('Payment accepted. Here is your coupon.')}</Banner>
          <div className="rounded-2xl bg-surface p-6 text-center ring-1 ring-line">
            <p className="m-0 text-sm text-ink-muted">{t('Your coupon code')}</p>
            <p dir="ltr" className="m-0 mt-2 select-all text-3xl font-bold tracking-wider">{status.couponCode}</p>
            <div className="mt-4 flex justify-center"><Button variant="secondary" onClick={copy}>{copied ? t('Copied') : t('Copy code')}</Button></div>
          </div>
          <ol className="m-0 flex flex-col gap-2 ps-5 text-base text-ink-soft">
            <li>{user ? t('Open the course below.') : <>{t('Log in or')} <Link to="/register" className="text-ink underline">{t('create a free account')}</Link>.</>}</li>
            <li>{t('Press “Start course” and enter this code. The course is yours for good.')}</li>
          </ol>
          <Link to={user ? `/curriculum/${status.courseId}` : '/login'} className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 font-semibold text-ink-inverse no-underline">
            {user ? t('Open the course') : t('Log in')}
          </Link>
        </>
      )}
    </div>
  );
}
