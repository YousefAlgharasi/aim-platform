// P14-064: Parent Pricing Page
// Displays backend-approved plans and prices — no client-side pricing logic.

import { useState, useEffect } from 'react';
import { getPublicPricing } from '../api/billingApiClient';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentPricing({ onSelectPlan }) {
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getPublicPricing()
      .then((data) => { if (!cancelled) { setPlans(data.plans || []); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (plans.length === 0) return <ParentEmptyState message="No plans available at this time." />;

  return (
    <div className="parent-pricing">
      <h2 className="parent-page__title">Choose a Plan</h2>
      <div className="parent-pricing__grid">
        {plans.map((plan) => (
          <ParentCard key={plan.id} title={plan.name}>
            <p className="parent-pricing__description">{plan.description}</p>
            {plan.prices && plan.prices.map((price) => (
              <div key={price.id} className="parent-pricing__price">
                <span className="parent-pricing__amount">
                  {(price.amount / 100).toFixed(2)} {price.currency?.toUpperCase()}
                </span>
                <span className="parent-pricing__interval">/{price.interval}</span>
              </div>
            ))}
            {onSelectPlan && (
              <button
                className="parent-pricing__select-btn"
                onClick={() => onSelectPlan(plan)}
              >
                Select Plan
              </button>
            )}
          </ParentCard>
        ))}
      </div>
    </div>
  );
}

export default ParentPricing;
