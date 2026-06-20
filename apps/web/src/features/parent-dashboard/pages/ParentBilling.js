// P14-063: Parent Billing Shell
// Read-only billing overview from backend — no client-side payment logic.

import { useState } from 'react';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentBilling({ childId }) {
  const [activeTab, setActiveTab] = useState('subscription');

  return (
    <div className="parent-billing">
      <h2 className="parent-page__title">Billing & Subscription</h2>
      <div className="parent-billing__tabs">
        <button
          className={`parent-billing__tab ${activeTab === 'subscription' ? 'parent-billing__tab--active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          Subscription
        </button>
        <button
          className={`parent-billing__tab ${activeTab === 'invoices' ? 'parent-billing__tab--active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
        <button
          className={`parent-billing__tab ${activeTab === 'plans' ? 'parent-billing__tab--active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Plans
        </button>
      </div>
      <div className="parent-billing__content">
        <ParentCard title={activeTab === 'subscription' ? 'Current Subscription' : activeTab === 'invoices' ? 'Invoice History' : 'Available Plans'}>
          <ParentLoadingState />
        </ParentCard>
      </div>
    </div>
  );
}

export default ParentBilling;
