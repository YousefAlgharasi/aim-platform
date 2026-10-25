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
import { PageHeader, KV, StatusPill, ChevronIcon, h2Cls, subCls, pillCls, tableWrapCls, textLinkCls } from '../profile/ui';

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
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Account" title="Billing" subtitle="Your plan, usage and invoices." />

      {notice && <Banner variant="success">{notice}</Banner>}

      <section className="flex flex-col gap-3">
        <h2 className={h2Cls}>Current subscription</h2>
        {liveSubscriptions.length === 0 ? (
          <Card>
            <p className={subCls}>You don't have an active subscription. Choose a plan below to get started.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {liveSubscriptions.map(sub => {
              const plan = planById(sub.planId);
              const price = plan ? priceById(plan.priceId) : undefined;
              return (
                <div
                  key={sub.id}
                  className="rounded-2xl p-5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-extrabold tracking-tight m-0">{plan?.name ?? 'Subscription'}</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20">
                      {humanizeKey(sub.status)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    {price && (
                      <div className="flex justify-between gap-3">
                        <span className="text-indigo-100">Price</span>
                        <span className="font-bold">
                          {formatMoney(price.amount, price.currency)} / {INTERVAL_LABELS[price.billingInterval] ?? price.billingInterval}
                        </span>
                      </div>
                    )}
                    {sub.trialEnd && sub.status === 'trialing' && (
                      <div className="flex justify-between gap-3">
                        <span className="text-indigo-100">Trial ends</span>
                        <span className="font-bold">{fmtDate(sub.trialEnd)}</span>
                      </div>
                    )}
                    {sub.currentPeriodEnd && (
                      <div className="flex justify-between gap-3">
                        <span className="text-indigo-100">{sub.cancelAtPeriodEnd ? 'Ends' : 'Renews'}</span>
                        <span className="font-bold">{fmtDate(sub.currentPeriodEnd)}</span>
                      </div>
                    )}
                  </div>
                  {sub.status === 'past_due' && (
                    <Banner variant="warning">Your last payment failed. Please update your payment method with our payment provider.</Banner>
                  )}
                  {sub.cancelAtPeriodEnd ? (
                    <p className="text-sm text-indigo-100 m-0">Cancellation requested — you keep access until the end of the current period.</p>
                  ) : (
                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="!bg-white/15 !text-white hover:!bg-white/25"
                        onClick={() => { setCancelError(''); setCancelTarget(sub); }}
                      >
                        Cancel subscription
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {activeEntitlements.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className={h2Cls}>What's included</h2>
          <Card>
            <ul className="list-none m-0 p-0 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {activeEntitlements.map(e => (
                <li key={e.id} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <span
                    className={`size-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${e.granted ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-300'}`}
                    aria-hidden="true"
                  >
                    {e.granted ? '✓' : '✕'}
                  </span>
                  <span className="flex-1 min-w-0">{humanizeKey(e.featureKey)}</span>
                  {e.usageLimit !== null && (
                    <span className="text-xs font-semibold text-slate-400">{e.usageCount} / {e.usageLimit}</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className={h2Cls}>Plans</h2>
        {data.plans.length === 0 ? (
          <EmptyState title="No plans available" message="There are no plans available for purchase right now." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.plans.map(plan => {
              const isCurrent = liveSubscriptions.some(s => s.planId === plan.id);
              const price = priceById(plan.priceId);
              const features = includedFeatureLabels(plan.features);
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 bg-white dark:bg-slate-800 shadow-sm flex flex-col gap-3.5 ${
                    isCurrent ? 'ring-2 ring-[#4F46E5]' : 'ring-1 ring-[#E2E8F0] dark:ring-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white m-0">{plan.name}</h3>
                    {isCurrent && <span className={pillCls}>Current</span>}
                  </div>
                  {price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold tracking-tight text-[#4F46E5] dark:text-indigo-400">{formatMoney(price.amount, price.currency)}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {price.billingInterval === 'one_time' ? ' one-time' : `/${INTERVAL_LABELS[price.billingInterval] ?? price.billingInterval}`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">Price unavailable</span>
                  )}
                  {plan.description && <p className={subCls}>{plan.description}</p>}
                  {features.length > 0 && (
                    <ul className="list-none m-0 p-0 flex flex-col gap-2 flex-1">
                      {features.map(f => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                          <span className="size-5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center text-[11px] font-extrabold shrink-0" aria-hidden="true">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!isCurrent && (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="mt-auto"
                      disabled={!price}
                      onClick={() => navigate(`/billing/checkout/${plan.id}`)}
                    >
                      Choose plan
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2Cls}>Invoice history</h2>
        {data.invoices.length === 0 ? (
          <Card><p className={subCls}>No invoices yet.</p></Card>
        ) : (
          <div className={tableWrapCls}>
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              {data.invoices.map(inv => (
                <button
                  key={inv.id}
                  type="button"
                  className="flex items-center justify-between gap-3 px-4 py-3.5 min-h-[56px] bg-transparent border-none text-start cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => openInvoice(inv)}
                >
                  <span>{fmtDate(inv.paidAt ?? inv.periodEnd ?? inv.createdAt)}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-extrabold">{formatMoney(inv.total, inv.currency)}</span>
                    <StatusPill tone={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</StatusPill>
                    <ChevronIcon className="size-4 text-slate-400" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {pastSubscriptions.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className={h2Cls}>Past subscriptions</h2>
          <div className={tableWrapCls}>
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              {pastSubscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{planById(sub.planId)?.name ?? 'Subscription'}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {humanizeKey(sub.status)}{sub.canceledAt ? ` · ${fmtDate(sub.canceledAt)}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Modal open={!!cancelTarget} onClose={() => !cancelling && setCancelTarget(null)} title="Cancel subscription?">
        <div className="flex flex-col gap-4">
          <p className={subCls}>
            Your subscription will stay active until the end of the current billing period
            {cancelTarget?.currentPeriodEnd ? ` (${fmtDate(cancelTarget.currentPeriodEnd)})` : ''}, then it won't renew.
          </p>
          {cancelError && <Banner variant="error">{cancelError}</Banner>}
          <div className="flex flex-wrap justify-end gap-2">
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
          <div className="flex flex-col gap-2.5">
            <KV label="Status">{invoiceDetail.invoice.status}</KV>
            {(invoiceDetail.invoice.periodStart || invoiceDetail.invoice.periodEnd) && (
              <KV label="Period">
                {fmtDate(invoiceDetail.invoice.periodStart)} – {fmtDate(invoiceDetail.invoice.periodEnd)}
              </KV>
            )}
            {invoiceDetail.invoice.paidAt && (
              <KV label="Paid">{fmtDate(invoiceDetail.invoice.paidAt)}</KV>
            )}
            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
            {invoiceDetail.items.map(item => (
              <KV key={item.id} label={`${item.description}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`}>
                {formatMoney(item.amount, item.currency)}
              </KV>
            ))}
            <KV label="Subtotal">{formatMoney(invoiceDetail.invoice.subtotal, invoiceDetail.invoice.currency)}</KV>
            <KV label="Tax">{formatMoney(invoiceDetail.invoice.tax, invoiceDetail.invoice.currency)}</KV>
            <KV label="Total" strong>{formatMoney(invoiceDetail.invoice.total, invoiceDetail.invoice.currency)}</KV>
            {invoiceDetail.invoice.invoiceUrl && (
              <a href={invoiceDetail.invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className={`${textLinkCls} mt-2`}>
                View invoice from payment provider
              </a>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
