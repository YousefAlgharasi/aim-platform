// P13-062: Parent-facing notification API client.
//
// Calls the shared /api/v1/notifications endpoints (P13-044/P13-045) using
// the parent's own bearer token. The backend derives recipient scope from
// the authenticated user — this client never passes a child id or any
// other scope override, and never computes read/unread or delivery state
// locally.

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

async function notificationsRequest(path, options = {}) {
  const { method = 'GET', body } = options;
  const token = getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/notifications${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
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

export async function getNotificationInbox(limit = 20, offset = 0) {
  return notificationsRequest(`/inbox?limit=${limit}&offset=${offset}`);
}

export async function markNotificationAsRead(eventId) {
  return notificationsRequest(`/inbox/${encodeURIComponent(eventId)}/read`, {
    method: 'PATCH',
  });
}

export async function dismissNotification(eventId) {
  return notificationsRequest(`/inbox/${encodeURIComponent(eventId)}/dismiss`, {
    method: 'PATCH',
  });
}

export async function getChannelPreferences() {
  return notificationsRequest('/preferences');
}

export async function updateChannelPreference(channel, category, enabled) {
  return notificationsRequest('/preferences', {
    method: 'PATCH',
    body: { channel, category, enabled },
  });
}

export async function getQuietHours() {
  return notificationsRequest('/quiet-hours');
}

export async function updateQuietHours(data) {
  return notificationsRequest('/quiet-hours', {
    method: 'PATCH',
    body: data,
  });
}
