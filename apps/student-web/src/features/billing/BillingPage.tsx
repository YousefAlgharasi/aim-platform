import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Billing.module.css';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  current: boolean;
}

interface Subscription {
  planName: string;
  status: string;
  renewsAt: string | null;
  cancelAt: string | null;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending';
  downloadUrl: string;
}

interface BillingData {
  plans: Plan[];
  subscription: Subscription | null;
  invoices: Invoice[];
}

export function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchBilling() {
    setLoading(true);
    setError('');
    apiClient.get<BillingData>('/billing')
      .then(setData)
      .catch((err: ApiError) => setError(err.message || 'Failed to load billing'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchBilling(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchBilling} />;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Billing</h1>

      {data.subscription && (
        <Card>
          <div className={styles.subscriptionInfo}>
            <h2 className={styles.subtitle}>Current Subscription</h2>
            <div className={styles.subDetail}>
              <span className={styles.subLabel}>Plan</span>
              <span className={styles.subValue}>{data.subscription.planName}</span>
            </div>
            <div className={styles.subDetail}>
              <span className={styles.subLabel}>Status</span>
              <span className={styles.subValue}>{data.subscription.status}</span>
            </div>
            {data.subscription.renewsAt && (
              <div className={styles.subDetail}>
                <span className={styles.subLabel}>Renews</span>
                <span className={styles.subValue}>{new Date(data.subscription.renewsAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <section>
        <h2 className={styles.subtitle}>Plans</h2>
        <div className={styles.planGrid}>
          {data.plans.map(plan => (
            <Card key={plan.id}>
              <div className={`${styles.planCard} ${plan.current ? styles.planCurrent : ''}`}>
                {plan.current && <span className={styles.currentBadge}>Current</span>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div>
                  <span className={styles.planPrice}>{plan.price}</span>
                  <span className={styles.planPeriod}>/{plan.period}</span>
                </div>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, i) => (
                    <li key={i} className={styles.planFeature}>
                      <span className={styles.featureCheck} aria-hidden="true">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <Link to={`/billing/checkout/${plan.id}`}>
                    <Button variant="primary" fullWidth>Choose Plan</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {data.invoices.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Invoices</h2>
          <Card>
            <div className={styles.invoiceList}>
              {data.invoices.map(inv => (
                <div key={inv.id} className={styles.invoiceItem}>
                  <span>{new Date(inv.date).toLocaleDateString()}</span>
                  <div className={styles.invoiceMeta}>
                    <span className={styles.invoiceAmount}>{inv.amount}</span>
                    <span className={inv.status === 'paid' ? styles.statusPaid : styles.statusPending}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
