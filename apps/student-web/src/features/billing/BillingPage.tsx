import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  fetchPricing,
  fetchSubscriptions,
  fetchInvoices,
  fetchInvoice,
  cancelSubscription,
  formatMoney,
  includedFeatureLabels,
  humanizeKey,
  isLiveSubscription,
  INTERVAL_LABELS,
  type BillingPlan,
  type BillingPrice,
  type BillingEntitlement,
  type Subscription,
  type Invoice,
  type InvoiceItem,
} from './billingApi';
import styles from './Billing.module.css';

interface BillingData {
  plans: BillingPlan[];
  prices: BillingPrice[];
  subscriptions: Subscription[];
  entitlements: BillingEntitlement[];
  invoices: Invoice[];
}

function fmtDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleDateString() : '—';
}

export function BillingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [notice, setNotice] = useState('');

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState<{ invoice: Invoice; items: InvoiceItem[] } | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  const fetchBilling = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([fetchPricing(), fetchSubscriptions(), fetchInvoices()])
      .then(([pricing, subs, invoices]) => {
        setData({
          plans: pricing.plans ?? [],
          prices: pricing.prices ?? [],
          subscriptions: subs.subscriptions ?? [],
          entitlements: subs.entitlements ?? [],
          invoices: invoices ?? [],
        });
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load billing')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBilling(); }, [fetchBilling]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError('');
    try {
      const updated = await cancelSubscription(cancelTarget.id);
      setData(prev => prev && ({
        ...prev,
        subscriptions: prev.subscriptions.map(s => (s.id === updated.id ? { ...s, ...updated } : s)),
      }));
      setNotice(
        updated.currentPeriodEnd
          ? `Your subscription will end on ${fmtDate(updated.currentPeriodEnd)}.`
          : 'Your subscription has been cancelled.',
      );
      setCancelTarget(null);
    } catch (err) {
      setCancelError(getErrorMessage(err, 'Could not cancel subscription'));
    } finally {
      setCancelling(false);
    }
  }

  function openInvoice(inv: Invoice) {
    setInvoiceOpen(true);
    setInvoiceDetail(null);
    setInvoiceError('');
    setInvoiceLoading(true);
    fetchInvoice(inv.id)
      .then(setInvoiceDetail)
      .catch(err => setInvoiceError(getErrorMessage(err, 'Failed to load invoice')))
      .finally(() => setInvoiceLoading(false));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchBilling} />;
  if (!data) return null;

  const liveSubscriptions = data.subscriptions.filter(isLiveSubscription);
  const pastSubscriptions = data.subscriptions.filter(s => !isLiveSubscription(s));
  const activeEntitlements = data.entitlements.filter(e => e.status === 'active');
  const planById = (id: string) => data.plans.find(p => p.id === id);
  const priceById = (id: string) => data.prices.find(p => p.id === id);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Billing</h1>

      {notice && <Banner variant="success">{notice}</Banner>}

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Current subscription</h2>
        {liveSubscriptions.length === 0 ? (
          <Card>
            <p className={styles.description}>You don't have an active subscription. Choose a plan below to get started.</p>
          </Card>
        ) : (
          liveSubscriptions.map(sub => {
            const plan = planById(sub.planId);
            const price = plan ? priceById(plan.priceId) : undefined;
            return (
              <Card key={sub.id}>
                <div className={styles.subscriptionInfo}>
                  <div className={styles.rowBetween}>
                    <h3 className={styles.planName}>{plan?.name ?? 'Subscription'}</h3>
                    <span className={styles.currentBadge}>{humanizeKey(sub.status)}</span>
                  </div>
                  {price && (
                    <div className={styles.subDetail}>
                      <span className={styles.subLabel}>Price</span>
                      <span className={styles.subValue}>
                        {formatMoney(price.amount, price.currency)} / {INTERVAL_LABELS[price.billingInterval] ?? price.billingInterval}
                      </span>
                    </div>
                  )}
                  {sub.trialEnd && sub.status === 'trialing' && (
                    <div className={styles.subDetail}>
                      <span className={styles.subLabel}>Trial ends</span>
                      <span className={styles.subValue}>{fmtDate(sub.trialEnd)}</span>
                    </div>
                  )}
                  {sub.currentPeriodEnd && (
                    <div className={styles.subDetail}>
                      <span className={styles.subLabel}>{sub.cancelAtPeriodEnd ? 'Ends' : 'Renews'}</span>
                      <span className={styles.subValue}>{fmtDate(sub.currentPeriodEnd)}</span>
                    </div>
                  )}
                  {sub.status === 'past_due' && (
                    <Banner variant="warning">Your last payment failed. Please update your payment method with our payment provider.</Banner>
                  )}
                  {sub.cancelAtPeriodEnd ? (
                    <p className={styles.description}>Cancellation requested — you keep access until the end of the current period.</p>
                  ) : (
                    <div>
                      <Button variant="ghost" size="sm" onClick={() => { setCancelError(''); setCancelTarget(sub); }}>
                        Cancel subscription
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </section>

      {activeEntitlements.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.subtitle}>What's included</h2>
          <Card>
            <ul className={styles.planFeatures}>
              {activeEntitlements.map(e => (
                <li key={e.id} className={styles.planFeature}>
                  <span className={styles.featureCheck} aria-hidden="true">{e.granted ? '✓' : '✕'}</span>
                  <span>{humanizeKey(e.featureKey)}</span>
                  {e.usageLimit !== null && (
                    <span className={styles.planPeriod}>{e.usageCount} / {e.usageLimit}</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Plans</h2>
        {data.plans.length === 0 ? (
          <EmptyState title="No plans available" message="There are no plans available for purchase right now." />
        ) : (
          <div className={styles.planGrid}>
            {data.plans.map(plan => {
              const isCurrent = liveSubscriptions.some(s => s.planId === plan.id);
              const price = priceById(plan.priceId);
              const features = includedFeatureLabels(plan.features);
              return (
                <Card key={plan.id}>
                  <div className={`${styles.planCard} ${isCurrent ? styles.planCurrent : ''}`}>
                    {isCurrent && <span className={styles.currentBadge}>Current</span>}
                    <h3 className={styles.planName}>{plan.name}</h3>
                    {price ? (
                      <div>
                        <span className={styles.planPrice}>{formatMoney(price.amount, price.currency)}</span>
                        <span className={styles.planPeriod}>
                          {price.billingInterval === 'one_time' ? ' one-time' : `/${INTERVAL_LABELS[price.billingInterval] ?? price.billingInterval}`}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.planPeriod}>Price unavailable</span>
                    )}
                    {plan.description && <p className={styles.description}>{plan.description}</p>}
                    {features.length > 0 && (
                      <ul className={styles.planFeatures}>
                        {features.map(f => (
                          <li key={f} className={styles.planFeature}>
                            <span className={styles.featureCheck} aria-hidden="true">✓</span>{f}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!isCurrent && (
                      <Button
                        variant="primary"
                        fullWidth
                        disabled={!price}
                        onClick={() => navigate(`/billing/checkout/${plan.id}`)}
                      >
                        Choose plan
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Invoice history</h2>
        {data.invoices.length === 0 ? (
          <Card><p className={styles.description}>No invoices yet.</p></Card>
        ) : (
          <Card>
            <div className={styles.invoiceList}>
              {data.invoices.map(inv => (
                <button key={inv.id} type="button" className={styles.invoiceItem} onClick={() => openInvoice(inv)}>
                  <span>{fmtDate(inv.paidAt ?? inv.periodEnd ?? inv.createdAt)}</span>
                  <div className={styles.invoiceMeta}>
                    <span className={styles.invoiceAmount}>{formatMoney(inv.total, inv.currency)}</span>
                    <span className={inv.status === 'paid' ? styles.statusPaid : styles.statusPending}>{inv.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </section>

      {pastSubscriptions.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.subtitle}>Past subscriptions</h2>
          <Card>
            <div className={styles.invoiceList}>
              {pastSubscriptions.map(sub => (
                <div key={sub.id} className={styles.subDetail}>
                  <span>{planById(sub.planId)?.name ?? 'Subscription'}</span>
                  <span className={styles.subLabel}>
                    {humanizeKey(sub.status)}{sub.canceledAt ? ` · ${fmtDate(sub.canceledAt)}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      <Modal open={!!cancelTarget} onClose={() => !cancelling && setCancelTarget(null)} title="Cancel subscription?">
        <div className={styles.subscriptionInfo}>
          <p className={styles.description}>
            Your subscription will stay active until the end of the current billing period
            {cancelTarget?.currentPeriodEnd ? ` (${fmtDate(cancelTarget.currentPeriodEnd)})` : ''}, then it won't renew.
          </p>
          {cancelError && <Banner variant="error">{cancelError}</Banner>}
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={cancelling}>Keep subscription</Button>
            <Button variant="primary" onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel subscription'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} title="Invoice">
        {invoiceLoading ? (
          <LoadingSpinner />
        ) : invoiceError ? (
          <Banner variant="error">{invoiceError}</Banner>
        ) : invoiceDetail ? (
          <div className={styles.orderSummary}>
            <div className={styles.subDetail}>
              <span className={styles.subLabel}>Status</span>
              <span className={styles.subValue}>{invoiceDetail.invoice.status}</span>
            </div>
            {(invoiceDetail.invoice.periodStart || invoiceDetail.invoice.periodEnd) && (
              <div className={styles.subDetail}>
                <span className={styles.subLabel}>Period</span>
                <span className={styles.subValue}>
                  {fmtDate(invoiceDetail.invoice.periodStart)} – {fmtDate(invoiceDetail.invoice.periodEnd)}
                </span>
              </div>
            )}
            {invoiceDetail.invoice.paidAt && (
              <div className={styles.subDetail}>
                <span className={styles.subLabel}>Paid</span>
                <span className={styles.subValue}>{fmtDate(invoiceDetail.invoice.paidAt)}</span>
              </div>
            )}
            {invoiceDetail.items.map(item => (
              <div key={item.id} className={styles.orderRow}>
                <span>{item.description}{item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>
                <span>{formatMoney(item.amount, item.currency)}</span>
              </div>
            ))}
            <div className={styles.orderRow}>
              <span>Subtotal</span>
              <span>{formatMoney(invoiceDetail.invoice.subtotal, invoiceDetail.invoice.currency)}</span>
            </div>
            <div className={styles.orderRow}>
              <span>Tax</span>
              <span>{formatMoney(invoiceDetail.invoice.tax, invoiceDetail.invoice.currency)}</span>
            </div>
            <div className={`${styles.orderRow} ${styles.orderTotal}`}>
              <span>Total</span>
              <span>{formatMoney(invoiceDetail.invoice.total, invoiceDetail.invoice.currency)}</span>
            </div>
            {invoiceDetail.invoice.invoiceUrl && (
              <a href={invoiceDetail.invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                View invoice from payment provider
              </a>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
