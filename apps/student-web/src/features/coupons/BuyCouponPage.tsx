import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import {
  couponApi, formatPrice, MAX_RECEIPT_BYTES, rememberPurchase, RECEIPT_TYPES, walletImageUrl,
  type PriceCourse, type PublicWallet,
} from './couponApi';

/** Route: /buy/:courseId — public. Pay into a wallet, upload the receipt, get a private link to follow the purchase. */
export function BuyCouponPage() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<PriceCourse | null | undefined>(undefined);
  const [wallets, setWallets] = useState<PublicWallet[]>([]);
  const [walletId, setWalletId] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [tx, setTx] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([couponApi.courses(), couponApi.wallets()])
      .then(([cs, ws]) => {
        if (!alive) return;
        setCourse(cs.find((c) => c.id === courseId) ?? null);
        setWallets(ws);
        setWalletId((cur) => cur || ws[0]?.id || '');
      })
      .catch(() => alive && setCourse(null));
    return () => { alive = false; };
  }, [courseId]);

  useEffect(() => {
    if (user) {
      setName((n) => n || user.name || '');
      setContact((c) => c || user.email || '');
    }
  }, [user]);

  if (course === undefined) return <div className="flex flex-col gap-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-40 w-full" /></div>;
  if (course === null) {
    return (
      <div className="flex flex-col gap-4">
        <Banner variant="error">{t('This course was not found.')}</Banner>
        <Link to="/welcome#courses" className="text-ink underline">{t('Back to courses')}</Link>
      </div>
    );
  }
  if (course.price.isFree) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="lp-display m-0 text-3xl font-semibold">{course.title}</h1>
        <Banner variant="success">{t('This course is free — no coupon needed.')}</Banner>
        <Link to={user ? `/curriculum/${course.id}` : '/register'} className="text-ink underline">{user ? t('Open the course') : t('Create a free account')}</Link>
      </div>
    );
  }

  const wallet = wallets.find((w) => w.id === walletId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !course) return;
    setError('');
    if (name.trim().length < 2) return setError(t('Please enter your name.'));
    if (contact.trim().length < 5) return setError(t('Please enter your phone number or email, so we can reach you.'));
    if (!walletId) return setError(t('Choose a wallet to pay into.'));
    if (tx.trim().length < 3) return setError(t('Enter the transaction number from your payment.'));
    if (!receipt) return setError(t('Attach a photo or screenshot of the receipt.'));
    if (!RECEIPT_TYPES.includes(receipt.type)) return setError(t('The receipt must be a PNG, JPEG or WebP image.'));
    if (receipt.size > MAX_RECEIPT_BYTES) return setError(t('The receipt image must be 5 MB or smaller.'));
    setBusy(true);
    try {
      const { publicToken } = await couponApi.submitPurchase({ courseId: course.id, buyerName: name.trim(), buyerContact: contact.trim(), walletId, transactionNumber: tx.trim(), receipt });
      rememberPurchase(publicToken, course.title);
      navigate(`/coupon/${publicToken}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, t('We could not send your payment. Please try again.')));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <div>
        <Link to="/welcome#courses" className="text-sm text-ink-muted no-underline hover:text-ink">← {t('Courses')}</Link>
        <h1 className="lp-display m-0 mt-2 text-[2rem] font-semibold">{t('Buy a coupon')}</h1>
        <p className="m-0 mt-2 text-base text-ink-muted">{t('One coupon opens one course for good — no deadline.')}</p>
      </div>

      <div className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <p className="m-0 text-sm text-ink-muted">{t('Course')}</p>
        <p dir="auto" className="m-0 text-xl font-semibold">{course.title}</p>
        <p className="m-0 mt-2 text-2xl font-semibold">
          {formatPrice(course.price.amount, course.price.currency)}
          {course.price.discountActive && <span className="ms-2 text-base font-normal text-ink-muted line-through">{formatPrice(course.price.originalAmount, course.price.currency)}</span>}
        </p>
      </div>

      <section className="flex flex-col gap-3" aria-label={t('How to pay')}>
        <h2 className="m-0 text-lg font-semibold">{t('1. Send the money')}</h2>
        {wallets.length === 0 ? (
          <Banner variant="warning">{t('No payment method is available right now. Please contact us.')}</Banner>
        ) : (
          <div className="flex flex-col gap-2">
            {wallets.map((w) => (
              <label key={w.id} className={`flex cursor-pointer items-start gap-3 rounded-xl p-4 ring-1 ${walletId === w.id ? 'bg-brand-soft ring-brand' : 'bg-surface ring-line'}`}>
                <input type="radio" name="wallet" checked={walletId === w.id} onChange={() => setWalletId(w.id)} className="mt-1" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2 font-semibold">
                    {walletImageUrl(w.logoUrl) && <img src={walletImageUrl(w.logoUrl)!} alt="" className="size-7 rounded object-contain" />}
                    {w.name}
                  </span>
                  {w.accountName && <span className="text-sm text-ink-muted">{w.accountName}</span>}
                  {w.accountNumber && <span dir="ltr" className="select-all text-lg font-semibold tracking-wide">{w.accountNumber}</span>}
                  {w.instructions && <span className="text-sm text-ink-muted">{w.instructions}</span>}
                  {walletId === w.id && walletImageUrl(w.qrImageUrl) && <img src={walletImageUrl(w.qrImageUrl)!} alt={t('QR code')} className="mt-2 size-40 rounded-lg bg-white object-contain p-1" />}
                </span>
              </label>
            ))}
          </div>
        )}
        {wallet && <p className="m-0 text-sm text-ink-muted">{t('Send exactly {amount} then keep the receipt.', { amount: formatPrice(course.price.amount, course.price.currency) })}</p>}
      </section>

      <section className="flex flex-col gap-4" aria-label={t('Your details')}>
        <h2 className="m-0 text-lg font-semibold">{t('2. Tell us about the payment')}</h2>
        <Input label={t('Your name')} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
        <Input label={t('Phone or email')} value={contact} onChange={(e) => setContact(e.target.value)} maxLength={120} autoComplete="email" />
        <Input label={t('Transaction number')} value={tx} onChange={(e) => setTx(e.target.value)} maxLength={60} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="receipt" className="text-sm font-medium text-ink">{t('Receipt (photo or screenshot)')}</label>
          <input id="receipt" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} className="text-sm" />
        </div>
      </section>

      {error && <Banner variant="error">{error}</Banner>}
      <Button type="submit" size="lg" loading={busy} disabled={busy || wallets.length === 0}>{busy ? t('Sending…') : t('Send payment for review')}</Button>
      <p className="m-0 text-sm text-ink-muted">{t('No account needed. We check your payment, then your coupon code appears on the next page.')}</p>
    </form>
  );
}
