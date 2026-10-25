import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
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
  INTERVAL_LABELS,
  type BillingPlan,
  type BillingPrice,
  type CheckoutStatus,
} from './billingApi';
import styles from './Billing.module.css';

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
      .catch(err => setLoadError(getErrorMessage(err, 'Failed to load checkout')))
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
          setStatusError(getErrorMessage(err, 'Could not check payment status'));
          stopPolling();
        });
    };
    tick();
  }, [planId, stopPolling]);

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
          setStatusError('We could not find your checkout session.');
        }
      })
      .catch(err => setStatusError(getErrorMessage(err, 'Could not check payment status')));
  }, [result, planId, startPolling]);

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
      setError(getErrorMessage(err, 'Checkout failed'));
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
      <div className={styles.checkoutContainer}>
        <h1 className={styles.heading}>Checkout</h1>
        <Card>
          <div className={styles.orderSummary}>
            {statusError ? (
              <>
                <Banner variant="error">{statusError}</Banner>
                <div className={styles.actions}>
                  {sessionId && <Button variant="secondary" onClick={() => startPolling(sessionId)}>Check again</Button>}
                  <Button variant="ghost" onClick={startOver}>Start over</Button>
                </div>
              </>
            ) : state === 'completed' ? (
              <>
                <div className={styles.statusIcon} aria-hidden="true">✓</div>
                <h2 className={styles.statusTitle}>Payment successful</h2>
                <p className={`${styles.description} ${styles.center}`}>
                  {plan ? `You're now subscribed to ${plan.name}.` : 'Your subscription is active.'}
                </p>
                <Link to="/billing"><Button variant="primary" fullWidth>Go to billing</Button></Link>
              </>
            ) : state === 'failed' || state === 'expired' ? (
              <>
                <div className={styles.statusIcon} aria-hidden="true">✕</div>
                <h2 className={styles.statusTitle}>{state === 'expired' ? 'Checkout expired' : 'Payment failed'}</h2>
                <p className={`${styles.description} ${styles.center}`}>No charge was completed. You can try again.</p>
                <Button variant="primary" fullWidth onClick={startOver}>Try again</Button>
              </>
            ) : (
              <>
                <h2 className={styles.statusTitle}>Waiting for payment confirmation…</h2>
                {polling && <LoadingSpinner />}
                {status?.checkoutUrl && (
                  <a href={status.checkoutUrl} className={styles.link}>Continue to payment page</a>
                )}
                {!status?.checkoutUrl && status && !polling && (
                  <p className={styles.description}>
                    The payment provider hasn't confirmed this checkout yet. This can take a moment.
                  </p>
                )}
                {pollTimedOut && sessionId && (
                  <div className={styles.actions}>
                    <Button variant="secondary" onClick={() => startPolling(sessionId)}>Check again</Button>
                    <Button variant="ghost" onClick={startOver}>Start over</Button>
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
        title="Plan not found"
        message="This plan is no longer available."
        actionLabel="Back to billing"
        onAction={() => navigate('/billing')}
      />
    );
  }

  // ----- Start view -----
  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.heading}>Checkout</h1>

      {result === 'cancel' && <Banner variant="info">Payment was cancelled. You have not been charged.</Banner>}

      <Card>
        <div className={styles.orderSummary}>
          <h2 className={styles.subtitle}>{plan.name}</h2>
          {plan.description && <p className={styles.description}>{plan.description}</p>}
          {price ? (
            <div className={`${styles.orderRow} ${styles.orderTotal}`}>
              <span>Plan ({INTERVAL_LABELS[price.billingInterval] ?? price.billingInterval})</span>
              <span>{formatMoney(price.amount, price.currency)}</span>
            </div>
          ) : (
            <Banner variant="warning">This plan has no active price and can't be purchased right now.</Banner>
          )}
          <p className={styles.description}>
            Any discount from a promotion code is applied by the payment provider on the next page.
          </p>
        </div>
      </Card>

      <Input
        label="Promotion code (optional)"
        value={promoCode}
        onChange={e => setPromoCode(e.target.value)}
        disabled={processing}
        autoComplete="off"
      />

      {error && <Banner variant="error">{error}</Banner>}

      <Button variant="primary" fullWidth onClick={handleCheckout} disabled={processing || !price}>
        {processing ? 'Processing…' : 'Continue to Payment'}
      </Button>

      <p className={`${styles.description} ${styles.center}`}>
        Payment is processed securely through our payment provider.
      </p>
      <Link to="/billing" className={`${styles.link} ${styles.center}`}>Back to billing</Link>
    </div>
  );
}
