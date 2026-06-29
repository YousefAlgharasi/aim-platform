import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  features: Record<string, unknown>;
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  status: string;
}

interface BillingPrice {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  billingInterval: 'month' | 'year' | 'one_time';
  status: string;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  total: number;
  currency: string;
  periodEnd: string | null;
  invoiceUrl: string | null;
}

interface BillingData {
  plans: BillingPlan[];
  prices: BillingPrice[];
  subscriptions: Subscription[];
  invoices: Invoice[];
}

export function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchBilling() {
    setLoading(true);
    setError('');
    Promise.all([
      apiClient.get<{ products: unknown[]; prices: BillingPrice[]; plans: BillingPlan[] }>('/billing/pricing'),
      apiClient.get<{ subscriptions: Subscription[]; entitlements: unknown[] }>('/billing/subscriptions'),
      apiClient.get<Invoice[]>('/billing/invoices'),
    ])
      .then(([pricing, subs, invoices]) => {
        setData({
          plans: pricing.plans,
          prices: pricing.prices,
          subscriptions: subs.subscriptions,
          invoices,
        });
      })
      .catch((err: ApiError) => setError(err.message || 'Failed to load billing'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchBilling(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchBilling} />;
  if (!data) return null;

  const activeSubscription = data.subscriptions.find(s => s.status === 'active' || s.status === 'trialing');

  function priceForPlan(plan: BillingPlan) {
    return data?.prices.find(p => p.id === plan.priceId);
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Billing</h1>

      {activeSubscription && (
        <Card>
          <div className={styles.subscriptionInfo}>
            <h2 className={styles.subtitle}>Current Subscription</h2>
            <div className={styles.subDetail}>
              <span className={styles.subLabel}>Status</span>
              <span className={styles.subValue}>{activeSubscription.status}</span>
            </div>
            {activeSubscription.currentPeriodEnd && (
              <div className={styles.subDetail}>
                <span className={styles.subLabel}>Renews</span>
                <span className={styles.subValue}>{new Date(activeSubscription.currentPeriodEnd).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <section>
        <h2 className={styles.subtitle}>Plans</h2>
        <div className={styles.planGrid}>
          {data.plans.map(plan => {
            const isCurrent = activeSubscription?.planId === plan.id;
            const price = priceForPlan(plan);
            return (
              <Card key={plan.id}>
                <div className={`${styles.planCard} ${isCurrent ? styles.planCurrent : ''}`}>
                  {isCurrent && <span className={styles.currentBadge}>Current</span>}
                  <h3 className={styles.planName}>{plan.name}</h3>
                  {price && (
                    <div>
                      <span className={styles.planPrice}>{(price.amount / 100).toFixed(2)} {price.currency.toUpperCase()}</span>
                      <span className={styles.planPeriod}>/{price.billingInterval}</span>
                    </div>
                  )}
                  {plan.description && <p>{plan.description}</p>}
                  {!isCurrent && (
                    <Link to={`/billing/checkout/${plan.id}`}>
                      <Button variant="primary" fullWidth>Choose Plan</Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {data.invoices.length > 0 && (
        <section>
          <h2 className={styles.subtitle}>Invoices</h2>
          <Card>
            <div className={styles.invoiceList}>
              {data.invoices.map(inv => (
                <div key={inv.id} className={styles.invoiceItem}>
                  <span>{inv.periodEnd ? new Date(inv.periodEnd).toLocaleDateString() : '—'}</span>
                  <div className={styles.invoiceMeta}>
                    <span className={styles.invoiceAmount}>{(inv.total / 100).toFixed(2)} {inv.currency.toUpperCase()}</span>
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
