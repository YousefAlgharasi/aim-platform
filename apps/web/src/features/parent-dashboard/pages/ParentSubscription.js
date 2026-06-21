// P14-064: Parent Subscription Page
// Displays backend-approved subscription data — backend is authority.

import { useState, useEffect } from 'react';
import { getUserSubscriptions, cancelSubscription } from '../api/billingApiClient';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentSubscription({ onViewPlans }) {
  const [subscription, setSubscription] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getUserSubscriptions()
      .then((data) => {
        if (cancelled) return;
        const activeSub = (data.subscriptions || []).find(
          (s) => s.status === 'active' || s.status === 'trialing',
        );
        setSubscription(activeSub || null);
        setEntitlements(data.entitlements || []);
        setStatus('ready');
      })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);

  const handleCancel = async () => {
    if (!subscription || cancelling) return;
    if (!window.confirm('Cancel your subscription? It will remain active until the end of the current billing period.')) return;
    setCancelling(true);
    try {
      await cancelSubscription(subscription.id);
      setSubscription((prev) => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;

  if (!subscription) {
    return (
      <div className="parent-subscription">
        <ParentEmptyState message="No active subscription." />
        {onViewPlans && (
          <button className="parent-subscription__view-plans" onClick={onViewPlans}>
            View Plans
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="parent-subscription">
      <h2 className="parent-page__title">My Subscription</h2>
      <ParentCard title="Current Plan">
        <div className="parent-subscription__details">
          <p><strong>Plan:</strong> {subscription.planName || subscription.planId}</p>
          <p><strong>Status:</strong> <span className={`parent-subscription__status parent-subscription__status--${subscription.status}`}>{subscription.status}</span></p>
          {subscription.currentPeriodEnd && (
            <p><strong>Current period ends:</strong> {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
          )}
        </div>
        <div className="parent-subscription__actions">
          {onViewPlans && subscription.status === 'active' && (
            <button className="parent-subscription__change-btn" onClick={onViewPlans}>
              Change Plan
            </button>
          )}
          {subscription.status === 'active' && (
            <button
              className="parent-subscription__cancel-btn"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      </ParentCard>

      {entitlements.length > 0 && (
        <ParentCard title="Your Entitlements">
          <ul className="parent-subscription__entitlements">
            {entitlements.map((ent) => (
              <li key={ent.id} className={`parent-subscription__entitlement ${ent.granted ? 'parent-subscription__entitlement--granted' : ''}`}>
                {ent.granted ? '✓' : '✗'} {ent.featureKey}
                {ent.usageText && <span className="parent-subscription__usage"> — {ent.usageText}</span>}
              </li>
            ))}
          </ul>
        </ParentCard>
      )}
    </div>
  );
}

export default ParentSubscription;
