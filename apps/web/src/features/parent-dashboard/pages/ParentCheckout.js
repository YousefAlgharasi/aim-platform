// P14-065: Parent Checkout UI
// Checkout session created and managed by backend — no client-side payment processing.

import { useState, useEffect, useCallback } from 'react';
import { createCheckoutSession, getCheckoutStatus } from '../api/billingApiClient';
import { ParentCard, ParentLoadingState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentCheckout({ priceId, planName, onComplete, onBack }) {
  const [sessionId, setSessionId] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!priceId) { setPhase('error'); setError('No plan selected.'); return; }
    let cancelled = false;
    createCheckoutSession(priceId)
      .then((data) => {
        if (cancelled) return;
        setSessionId(data.sessionId || data.id);
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          setPhase('pending');
        }
      })
      .catch((err) => { if (!cancelled) { setError(err.message); setPhase('error'); } });
    return () => { cancelled = true; };
  }, [priceId]);

  const pollStatus = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await getCheckoutStatus(sessionId);
      setCheckoutStatus(data);
      if (data.status === 'completed') {
        setPhase('completed');
        if (onComplete) onComplete(data);
      } else if (data.status === 'expired' || data.status === 'failed') {
        setPhase('failed');
      }
    } catch (err) {
      setError(err.message);
    }
  }, [sessionId, onComplete]);

  useEffect(() => {
    if (phase !== 'pending' || !sessionId) return;
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [phase, sessionId, pollStatus]);

  if (phase === 'loading') {
    return (
      <div className="parent-checkout">
        <ParentCard title="Starting Checkout">
          <ParentLoadingState />
          <p className="parent-checkout__message">Preparing your checkout session...</p>
        </ParentCard>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="parent-checkout">
        <ParentErrorState message={error} />
        {onBack && <button className="parent-checkout__back-btn" onClick={onBack}>Go Back</button>}
      </div>
    );
  }

  if (phase === 'completed') {
    return (
      <div className="parent-checkout">
        <ParentCard title="Payment Complete">
          <div className="parent-checkout__success">
            <span className="parent-checkout__success-icon">✓</span>
            <h3>Thank you!</h3>
            <p>Your subscription to {planName || 'the selected plan'} is now active.</p>
            {onBack && <button className="parent-checkout__back-btn" onClick={onBack}>Return to Billing</button>}
          </div>
        </ParentCard>
      </div>
    );
  }

  if (phase === 'failed') {
    return (
      <div className="parent-checkout">
        <ParentCard title="Checkout Failed">
          <p className="parent-checkout__message">
            {checkoutStatus?.status === 'expired'
              ? 'Your checkout session has expired. Please try again.'
              : 'Payment could not be completed. Please try again.'}
          </p>
          {onBack && <button className="parent-checkout__back-btn" onClick={onBack}>Go Back</button>}
        </ParentCard>
      </div>
    );
  }

  return (
    <div className="parent-checkout">
      <ParentCard title="Completing Payment">
        <ParentLoadingState />
        <p className="parent-checkout__message">Waiting for payment confirmation...</p>
      </ParentCard>
    </div>
  );
}

export default ParentCheckout;
