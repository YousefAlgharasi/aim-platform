// P15-068: Parent Analytics Reports API Client
// All report data, run status, and result references come from the
// backend ParentReportsController — the UI never assembles or calculates
// report content client-side.

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

async function parentAnalyticsRequest(path, options = {}) {
  const { method = 'GET', body } = options;
  const token = getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/parent/analytics/reports${path}`, {
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

export async function listParentReportDefinitions() {
  return parentAnalyticsRequest('');
}

export async function runParentReport(reportKey, parameters = {}) {
  return parentAnalyticsRequest(`/${encodeURIComponent(reportKey)}/run`, {
    method: 'POST',
    body: { parameters },
  });
}

export async function getParentReportRunStatus(runId) {
  return parentAnalyticsRequest(`/runs/${encodeURIComponent(runId)}`);
}
