import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Billing.module.css';

interface BillingPlan {
  id: string;
  name: string;
  description: string | null;
  priceId: string;
}

interface BillingPrice {
  id: string;
  amount: number;
  currency: string;
  billingInterval: 'month' | 'year' | 'one_time';
}

interface CheckoutSession {
  id: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  checkoutUrl: string | null;
}

export function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<BillingPlan | null>(null);
  const [price, setPrice] = useState<BillingPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  function fetchCheckout() {
    setLoading(true);
    setError('');
    apiClient.get<{ products: unknown[]; prices: BillingPrice[]; plans: BillingPlan[] }>('/billing/pricing')
      .then(pricing => {
        const foundPlan = pricing.plans.find(p => p.id === planId) || null;
        setPlan(foundPlan);
        setPrice(foundPlan ? pricing.prices.find(p => p.id === foundPlan.priceId) || null : null);
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to load checkout'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCheckout(); }, [planId]);

  function handleCheckout() {
    if (!price) return;
    setProcessing(true);
    setError('');
    apiClient.post<CheckoutSession>('/billing/checkout', {
      priceId: price.id,
      successUrl: `${window.location.origin}/billing`,
      cancelUrl: `${window.location.origin}/billing/checkout/${planId}`,
    })
      .then(session => {
        if (session.checkoutUrl) {
          window.location.href = session.checkoutUrl;
        } else {
          navigate('/billing');
        }
      })
      .catch((err: ApiError) => setError(err.message || 'Checkout failed'))
      .finally(() => setProcessing(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error && !plan) return <ErrorState message={error} onRetry={fetchCheckout} />;
  if (!plan) return null;

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.heading}>Checkout</h1>

      <Card>
        <div className={styles.orderSummary}>
          <h2 className={styles.subtitle}>{plan.name}</h2>
          {plan.description && <p>{plan.description}</p>}
          {price && (
            <div className={`${styles.orderRow} ${styles.orderTotal}`}>
              <span>Plan ({price.billingInterval})</span>
              <span>{(price.amount / 100).toFixed(2)} {price.currency.toUpperCase()}</span>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <p style={{ color: 'var(--color-danger-500)', fontSize: '14px', margin: 0 }}>{error}</p>
      )}

      <Button variant="primary" fullWidth onClick={handleCheckout} disabled={processing || !price}>
        {processing ? 'Processing…' : 'Continue to Payment'}
      </Button>

      <p className={styles.description} style={{ textAlign: 'center' }}>
        Payment is processed securely through our payment provider.
      </p>
    </div>
  );
}
