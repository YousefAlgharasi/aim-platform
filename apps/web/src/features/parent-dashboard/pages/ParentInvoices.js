// P14-066: Parent Invoice History UI
// All invoice data from backend — no client-side computation.

import { useState, useEffect } from 'react';
import { getUserInvoices, getInvoice } from '../api/billingApiClient';
import { ParentCard, ParentTable, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getUserInvoices()
      .then((data) => { if (!cancelled) { setInvoices(data.invoices || data || []); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);

  const handleViewInvoice = async (invoiceId) => {
    try {
      const data = await getInvoice(invoiceId);
      setSelectedInvoice(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (invoices.length === 0) return <ParentEmptyState message="No invoices yet." />;

  if (selectedInvoice) {
    return (
      <div className="parent-invoices">
        <button className="parent-invoices__back" onClick={() => setSelectedInvoice(null)}>
          ← Back to Invoices
        </button>
        <ParentCard title={`Invoice ${selectedInvoice.invoiceNumber || selectedInvoice.id}`}>
          <div className="parent-invoices__detail">
            <p><strong>Status:</strong> {selectedInvoice.status}</p>
            <p><strong>Total:</strong> {formatAmount(selectedInvoice.totalAmount, selectedInvoice.currency)}</p>
            <p><strong>Date:</strong> {formatDate(selectedInvoice.invoiceDate)}</p>
          </div>
          {selectedInvoice.items && selectedInvoice.items.length > 0 && (
            <div className="parent-invoices__items">
              <h4>Line Items</h4>
              <ParentTable
                columns={['Description', 'Qty', 'Amount']}
                rows={selectedInvoice.items.map((item) => [
                  item.description,
                  item.quantity || 1,
                  formatAmount(item.amount, selectedInvoice.currency),
                ])}
              />
            </div>
          )}
        </ParentCard>
      </div>
    );
  }

  return (
    <div className="parent-invoices">
      <h2 className="parent-page__title">Invoice History</h2>
      <ParentTable
        columns={['Date', 'Amount', 'Status', '']}
        rows={invoices.map((inv) => [
          formatDate(inv.invoiceDate),
          formatAmount(inv.totalAmount, inv.currency),
          inv.status,
          <button
            key={inv.id}
            className="parent-invoices__view-btn"
            onClick={() => handleViewInvoice(inv.id)}
          >
            View
          </button>,
        ])}
      />
    </div>
  );
}

function formatAmount(amount, currency) {
  if (amount == null) return '—';
  return `${(amount / 100).toFixed(2)} ${(currency || 'USD').toUpperCase()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

export default ParentInvoices;
