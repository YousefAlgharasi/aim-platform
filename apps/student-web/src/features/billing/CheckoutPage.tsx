import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Billing.module.css';

interface CheckoutData {
  planName: string;
  price: string;
  period: string;
  features: string[];
  tax: string;
  total: string;
}

export function CheckoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  function fetchCheckout() {
    setLoading(true);
    setError('');
    apiClient.get<CheckoutData>(`/api/billing/checkout/${planId}`)
      .then(setCheckout)
      .catch((err: ApiError) => setError(err.message || 'Failed to load checkout'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCheckout(); }, [planId]);

  function handleCheckout() {
    setProcessing(true);
    setError('');
    apiClient.post<{ redirectUrl?: string; status: string }>(`/api/billing/checkout/${planId}/confirm`, {})
      .then(res => {
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl;
        } else {
          navigate('/billing');
        }
      })
      .catch((err: ApiError) => setError(err.message || 'Checkout failed'))
      .finally(() => setProcessing(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error && !checkout) return <ErrorState message={error} onRetry={fetchCheckout} />;
  if (!checkout) return null;

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.heading}>Checkout</h1>

      <Card>
        <div className={styles.orderSummary}>
          <h2 className={styles.subtitle}>{checkout.planName}</h2>
          <ul className={styles.planFeatures}>
            {checkout.features.map((f, i) => (
              <li key={i} className={styles.planFeature}>
                <span className={styles.featureCheck} aria-hidden="true">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className={styles.orderRow}>
            <span>Plan ({checkout.period})</span>
            <span>{checkout.price}</span>
          </div>
          <div className={styles.orderRow}>
            <span>Tax</span>
            <span>{checkout.tax}</span>
          </div>
          <div className={`${styles.orderRow} ${styles.orderTotal}`}>
            <span>Total</span>
            <span>{checkout.total}</span>
          </div>
        </div>
      </Card>

      {error && (
        <p style={{ color: 'var(--color-danger-500)', fontSize: '14px', margin: 0 }}>{error}</p>
      )}

      <Button variant="primary" fullWidth onClick={handleCheckout} disabled={processing}>
        {processing ? 'Processing…' : `Pay ${checkout.total}`}
      </Button>

      <p className={styles.description} style={{ textAlign: 'center' }}>
        Payment is processed securely through our payment provider.
      </p>
    </div>
  );
}
