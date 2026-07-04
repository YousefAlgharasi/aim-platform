// P15-058: Admin Analytics API Client Layer
// All admin analytics data comes from backend APIs — no client-side computation.
// This client mirrors the pattern from parent-dashboard/api/parentApiClient.js.

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

async function adminRequest(path, options = {}) {
  const { method = 'GET', body, params } = options;
  const token = getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  let url = `${API_BASE_URL}/api/analytics/admin${path}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    if (query) url += `?${query}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
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

// --- Dashboard ---

export async function getDashboard(params) {
  return adminRequest('/dashboard', { params });
}

// --- Learning Reports ---

export async function getLearningReports(params) {
  return adminRequest('/reports/learning', { params });
}

// --- Curriculum Reports ---

export async function getCurriculumReports(params) {
  return adminRequest('/reports/curriculum', { params });
}

// --- Assessment Reports ---

export async function getAssessmentReports(params) {
  return adminRequest('/reports/assessments', { params });
}

// --- Notification Reports ---

export async function getNotificationReports(params) {
  return adminRequest('/reports/notifications', { params });
}

// --- Revenue Reports ---

export async function getRevenueReports(params) {
  return adminRequest('/reports/revenue', { params });
}

// --- User Reports ---

export async function getUserReports(params) {
  return adminRequest('/reports/users', { params });
}

// --- Exports ---

export async function listExports(params) {
  return adminRequest('/exports', { params });
}

export async function createExport(data) {
  return adminRequest('/exports', { method: 'POST', body: data });
}

export async function getExportStatus(exportId) {
  return adminRequest(`/exports/${encodeURIComponent(exportId)}`);
}

export async function downloadExport(exportId) {
  return adminRequest(`/exports/${encodeURIComponent(exportId)}/download`);
}
