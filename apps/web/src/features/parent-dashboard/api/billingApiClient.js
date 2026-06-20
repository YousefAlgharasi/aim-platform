// P14-063: Parent Billing API Client
// All billing data comes from backend — no client-side payment logic.

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
const TIMEOUT_MS = 30000;

function getAccessToken() {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('aim_supabase_access_token') ||
    window.localStorage.getItem('supabase_access_token') ||
    ''
  );
}

async function billingRequest(path, options = {}) {
  const { method = 'GET', body } = options;
  const token = getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/billing${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Billing request failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('Billing request timed out');
    throw err;
  }
}

export function getPublicPricing() {
  return billingRequest('/pricing');
}

export function getPlans() {
  return billingRequest('/pricing/plans');
}

export function getUserSubscriptions() {
  return billingRequest('/subscriptions');
}

export function getSubscription(subscriptionId) {
  return billingRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export function cancelSubscription(subscriptionId) {
  return billingRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: 'POST',
  });
}

export function createCheckoutSession(priceId) {
  return billingRequest('/checkout', {
    method: 'POST',
    body: { priceId },
  });
}

export function getCheckoutStatus(sessionId) {
  return billingRequest(`/checkout/${encodeURIComponent(sessionId)}/status`);
}

export function getUserInvoices() {
  return billingRequest('/invoices');
}

export function getInvoice(invoiceId) {
  return billingRequest(`/invoices/${encodeURIComponent(invoiceId)}`);
}
