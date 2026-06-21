// P18-073: Create Admin AI Management Feature Shell
// Shared request helper for all admin AI management routes (prompts,
// model config, usage/cost, safety review, audit). All data comes from
// backend read/write APIs — no client-side computation of mastery,
// progress, cost, or safety decisions.

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

export async function adminAiRequest(path, options = {}) {
  const { method = 'GET', body } = options;
  const token = getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/ai${path}`, {
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
