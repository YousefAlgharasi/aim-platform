import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  fetchPricing,
  createCheckoutSession,
  fetchCheckoutStatus,
  fetchRecentCheckouts,
  formatMoney,
  intervalLabel,
  type BillingPlan,
  type BillingPrice,
  type CheckoutStatus,
} from './billingApi';
import { PageHeader, BackLink, KV, h2Cls, subCls, textLinkCls } from '../profile/ui';

// Flow (mirrors Flutter checkout_start_page + checkout_status_page):
// 1. POST /billing/checkout { priceId, successUrl, cancelUrl, promotionCode? }.
// 2. If the backend returns a hosted checkoutUrl, redirect the browser to it.
//    The provider sends the user back to successUrl / cancelUrl (this page with
//    ?result=success|cancel). Our session id is kept in sessionStorage.
// 3. Poll GET /billing/checkout/:sessionId/status until it is no longer pending.

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 40; // ~2 minutes

function storageKey(planId: string) {
  return `aim_checkout_session:${planId}`;
}

function readStoredSession(planId: string): string | null {
  try { return sessionStorage.getItem(storageKey(planId)); } catch { return null; }
}

function writeStoredSession(planId: string, sessionId: string | null) {
  try {
    if (sessionId) sessionStorage.setItem(storageKey(planId), sessionId);
    else sessionStorage.removeItem(storageKey(planId));
  } catch {
    // storage unavailable — status lookup falls back to /billing/checkout/recent
  }
}

export function CheckoutPage() {
  const { planId = '' } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const result = searchParams.get('result');

  const [plan, setPlan] = useState<BillingPlan | null>(null);
  const [price, setPrice] = useState<BillingPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [statusError, setStatusError] = useState('');
  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPlan = useCallback(() => {
    setLoading(true);
    setLoadError('');
    fetchPricing()
      .then(pricing => {
        const foundPlan = pricing.plans.find(p => p.id === planId) || null;
        setPlan(foundPlan);
        setPrice(foundPlan ? pricing.prices.find(p => p.id === foundPlan.priceId) || null : null);
      })
      .catch(err => setLoadError(getErrorMessage(err, t('Failed to load checkout'))))
      .finally(() => setLoading(false));
  }, [planId]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = null;
    setPolling(false);
  }, []);

  const startPolling = useCallback((id: string) => {
    stopPolling();
    setPolling(true);
    setPollTimedOut(false);
    setStatusError('');
    let attempts = 0;
    const tick = () => {
      attempts += 1;
      fetchCheckoutStatus(id)
        .then(s => {
          setStatus(s);
          if (s.status !== 'pending') {
            writeStoredSession(planId, null);
            stopPolling();
          } else if (attempts >= POLL_MAX_ATTEMPTS) {
            setPollTimedOut(true);
            stopPolling();
          } else {
            pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS);
          }
        })
        .catch(err => {
          setStatusError(getErrorMessage(err, t('Could not check payment status')));
          stopPolling();
        });
    };
    tick();
  }, [planId, stopPolling, t]);

  useEffect(() => stopPolling, [stopPolling]);

  // Returning from the payment provider.
  useEffect(() => {
    if (result !== 'success') return;
    const stored = readStoredSession(planId);
    if (stored) {
      setSessionId(stored);
      startPolling(stored);
      return;
    }
    fetchRecentCheckouts()
      .then(recent => {
        const latest = recent[0];
        if (latest) {
          setSessionId(latest.sessionId);
          startPolling(latest.sessionId);
        } else {
          setStatusError(t('We could not find your checkout session.'));
        }
      })
      .catch(err => setStatusError(getErrorMessage(err, t('Could not check payment status'))));
  }, [result, planId, startPolling, t]);

  async function handleCheckout() {
    if (!price) return;
    setProcessing(true);
    setError('');
    const base = `${window.location.origin}/billing/checkout/${encodeURIComponent(planId)}`;
    try {
      const session = await createCheckoutSession({
        priceId: price.id,
        successUrl: `${base}?result=success`,
        cancelUrl: `${base}?result=cancel`,
        promotionCode: promoCode.trim() || undefined,
      });
      writeStoredSession(planId, session.id);
      if (session.checkoutUrl) {
        window.location.assign(session.checkoutUrl);
        return; // keep the button disabled while the browser navigates away
      }
      // No hosted page (e.g. provider not configured) — track the session here.
      setSessionId(session.id);
      startPolling(session.id);
      setProcessing(false);
    } catch (err) {
      setError(getErrorMessage(err, t('Checkout failed')));
      setProcessing(false);
    }
  }

  function startOver() {
    stopPolling();
    writeStoredSession(planId, null);
    setSessionId(null);
    setStatus(null);
    setStatusError('');
    setPollTimedOut(false);
    setSearchParams({}, { replace: true });
  }

  if (loading) return <LoadingSpinner />;
  if (loadError) return <ErrorState message={loadError} onRetry={loadPlan} />;

  // ----- Status view (after a session exists or on return from provider) -----
  if (sessionId || result === 'success') {
    const state = status?.status ?? 'pending';
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
        <PageHeader eyebrow={t('Billing')} title={t('Checkout')} back={<BackLink to="/billing" label="Back to billing" />} />
        <Card>
          <div className="flex flex-col gap-4 items-stretch">
            {statusError ? (
              <>
                <Banner variant="error">{statusError}</Banner>
                <div className="flex flex-wrap gap-2">
                  {sessionId && <Button variant="secondary" onClick={() => startPolling(sessionId)}>{t('Check again')}</Button>}
                  <Button variant="ghost" onClick={startOver}>{t('Start over')}</Button>
                </div>
              </>
            ) : state === 'completed' ? (
              <>
                <div className="size-14 rounded-2xl mx-auto bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center text-2xl font-extrabold" aria-hidden="true">✓</div>
                <h2 className={`${h2Cls} text-center`}>{t('Payment successful')}</h2>
                <p className={`${subCls} text-center`}>
                  {plan ? t("You're now subscribed to {plan}.", { plan: plan.name }) : t('Your subscription is active.')}
                </p>
                <Link to="/billing" className="no-underline"><Button variant="primary" size="lg" fullWidth>{t('Go to billing')}</Button></Link>
              </>
            ) : state === 'failed' || state === 'expired' ? (
              <>
                <div className="size-14 rounded-2xl mx-auto bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-300 flex items-center justify-center text-2xl font-extrabold" aria-hidden="true">✕</div>
                <h2 className={`${h2Cls} text-center`}>{state === 'expired' ? t('Checkout expired') : t('Payment failed')}</h2>
                <p className={`${subCls} text-center`}>{t('No charge was completed. You can try again.')}</p>
                <Button variant="primary" size="lg" fullWidth onClick={startOver}>{t('Try again')}</Button>
              </>
            ) : (
              <>
                <h2 className={`${h2Cls} text-center`}>{t('Waiting for payment confirmation…')}</h2>
                {polling && <LoadingSpinner />}
                {status?.checkoutUrl && (
                  <a href={status.checkoutUrl} className={`${textLinkCls} text-center`}>{t('Continue to payment page')}</a>
                )}
                {!status?.checkoutUrl && status && !polling && (
                  <p className={`${subCls} text-center`}>
                    {t("The payment provider hasn't confirmed this checkout yet. This can take a moment.")}
                  </p>
                )}
                {pollTimedOut && sessionId && (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="secondary" onClick={() => startPolling(sessionId)}>{t('Check again')}</Button>
                    <Button variant="ghost" onClick={startOver}>{t('Start over')}</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <EmptyState
        title={t('Plan not found')}
        message={t('This plan is no longer available.')}
        actionLabel={t('Back to billing')}
        onAction={() => navigate('/billing')}
      />
    );
  }

  // ----- Start view -----
  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto w-full">
      <PageHeader eyebrow={t('Billing')} title={t('Checkout')} back={<BackLink to="/billing" label="Back to billing" />} />

      {result === 'cancel' && <Banner variant="info">{t('Payment was cancelled. You have not been charged.')}</Banner>}

      <Card>
        <div className="flex flex-col gap-3">
          <h2 className={h2Cls}>{plan.name}</h2>
          {plan.description && <p className={subCls}>{plan.description}</p>}
          {price ? (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 px-4 py-3">
              <KV label={t('Plan ({interval})', { interval: intervalLabel(price.billingInterval) })} strong>
                {formatMoney(price.amount, price.currency)}
              </KV>
            </div>
          ) : (
            <Banner variant="warning">{t("This plan has no active price and can't be purchased right now.")}</Banner>
          )}
          <p className={subCls}>
            {t('Any discount from a promotion code is applied by the payment provider on the next page.')}
          </p>
        </div>
      </Card>

      <Input
        label={t('Promotion code (optional)')}
        value={promoCode}
        onChange={e => setPromoCode(e.target.value)}
        disabled={processing}
        autoComplete="off"
      />

      {error && <Banner variant="error">{error}</Banner>}

      <Button variant="primary" size="lg" fullWidth onClick={handleCheckout} disabled={processing || !price}>
        {processing ? t('Processing…') : t('Continue to Payment')}
      </Button>

      <p className={`${subCls} text-center`}>
        {t('Payment is processed securely through our payment provider.')}
      </p>
      <Link to="/billing" className={`${textLinkCls} text-center`}>{t('Back to billing')}</Link>
    </div>
  );
}
