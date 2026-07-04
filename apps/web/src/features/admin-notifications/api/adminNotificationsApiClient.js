// P13-066: Admin notification monitor API client.
//
// Read-only client for the /api/v1/admin/notifications endpoints
// (P13-046). This client never exposes a mutation action — the admin
// monitor UI can only observe delivery/audit state, never change it.

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

async function adminNotificationsRequest(path) {
  const token = getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/notifications${path}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      let message;
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.detail || text;
      } catch {
        message = text;
      }
      const error = new Error(message || `Request failed with ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getAuditLogs({ eventType, userId, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (eventType) params.set('eventType', eventType);
  if (userId) params.set('userId', userId);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return adminNotificationsRequest(`/audit-logs?${params.toString()}`);
}

export async function getDeliveryAttempts(eventId) {
  return adminNotificationsRequest(`/delivery-attempts/${encodeURIComponent(eventId)}`);
}

export async function getUserEvents(userId, { channel = 'in_app', limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  params.set('channel', channel);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return adminNotificationsRequest(`/events/${encodeURIComponent(userId)}?${params.toString()}`);
}

export async function getTemplates() {
  return adminNotificationsRequest('/templates');
}

export async function getTemplate(templateId) {
  return adminNotificationsRequest(`/templates/${encodeURIComponent(templateId)}`);
}
