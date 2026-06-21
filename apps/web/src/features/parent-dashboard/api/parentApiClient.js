// P12-050: Parent API Client Layer
// All parent data comes from backend read APIs — no client-side computation.

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

async function parentRequest(path, options = {}) {
  const { method = 'GET', body } = options;
  const token = getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/parent${path}`, {
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

export async function listChildren() {
  return parentRequest('/children');
}

export async function getDashboardSummary(childId) {
  return parentRequest(`/children/${encodeURIComponent(childId)}/dashboard-summary`);
}

export async function getChildProgress(childId) {
  return parentRequest(`/children/${encodeURIComponent(childId)}/progress`);
}

export async function getChildAssessments(childId) {
  return parentRequest(`/children/${encodeURIComponent(childId)}/assessments`);
}

export async function getChildActivity(childId) {
  return parentRequest(`/children/${encodeURIComponent(childId)}/activity`);
}

export async function getChildReports(childId, period = 'weekly') {
  return parentRequest(`/children/${encodeURIComponent(childId)}/reports?period=${encodeURIComponent(period)}`);
}

// P18-070: Parent AI Read-Only Summary UI — backend-computed AI Teacher/
// Voice Tutor usage counts only. No conversation/voice content, safety
// reason-category, or learning-state value is ever requested here.
export async function getChildAiUsageSummary(childId) {
  return parentRequest(`/children/${encodeURIComponent(childId)}/ai-summary`);
}

export async function listInvitations() {
  return parentRequest('/invitations');
}

export async function createInvitation(data) {
  return parentRequest('/invitations', { method: 'POST', body: data });
}

export async function acceptInvitation(data) {
  return parentRequest('/invitations/accept', { method: 'POST', body: data });
}

export async function listConsents(childId) {
  return parentRequest(`/children/${encodeURIComponent(childId)}/consents`);
}

export async function grantConsent(data) {
  return parentRequest('/consents', { method: 'POST', body: data });
}

export async function revokeConsent(data) {
  return parentRequest('/consents/revoke', { method: 'POST', body: data });
}

export async function getNotificationPreferences() {
  return parentRequest('/notification-preferences');
}

export async function updateNotificationPreferences(data) {
  return parentRequest('/notification-preferences', { method: 'PATCH', body: data });
}
