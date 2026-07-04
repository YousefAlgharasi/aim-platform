const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const LAST_ADAPTIVE_RESULT_KEY = 'aim_last_adaptive_result';
const LAST_ADAPTIVE_RESULT_META_KEY = 'aim_last_adaptive_result_meta';
const REQUEST_TIMEOUT_MS = 45000;

function getStoredAccessToken() {
  if (typeof window === 'undefined') {
    return process.env.REACT_APP_SUPABASE_ACCESS_TOKEN || '';
  }

  return (
    window.localStorage.getItem('aim_supabase_access_token') ||
    window.localStorage.getItem('supabase_access_token') ||
    process.env.REACT_APP_SUPABASE_ACCESS_TOKEN ||
    ''
  );
}

function buildHeaders(hasBody = false) {
  const headers = {};

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getStoredAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function readErrorMessage(response) {
  const text = await response.text();

  if (!text) {
    return `${response.status} ${response.statusText}`;
  }

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.detail === 'string') {
      return parsed.detail;
    }

    if (Array.isArray(parsed.detail)) {
      return parsed.detail
        .map((entry) => {
          if (typeof entry === 'string') {
            return entry;
          }

          if (entry && typeof entry.msg === 'string') {
            return entry.msg;
          }

          return JSON.stringify(entry);
        })
        .join(', ');
    }

    if (typeof parsed.message === 'string') {
      return parsed.message;
    }

    return JSON.stringify(parsed);
  } catch {
    return text;
  }
}

async function requestJson(path, options = {}) {
  const { method = 'GET', body } = options;
  const hasBody = body !== undefined;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: buildHeaders(hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out while waiting for AIM.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || `Request failed with ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function encodePathSegment(value) {
  return encodeURIComponent(String(value));
}

function persistLatestAdaptiveResult({ studentId, sessionId, result }) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LAST_ADAPTIVE_RESULT_KEY, JSON.stringify(result));
  window.localStorage.setItem(
    LAST_ADAPTIVE_RESULT_META_KEY,
    JSON.stringify({
      studentId,
      sessionId,
      savedAt: new Date().toISOString(),
    }),
  );
}

export function getLastStoredAdaptiveResult() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawResult = window.localStorage.getItem(LAST_ADAPTIVE_RESULT_KEY);
  if (!rawResult) {
    return null;
  }

  try {
    const rawMeta = window.localStorage.getItem(LAST_ADAPTIVE_RESULT_META_KEY);
    return {
      result: JSON.parse(rawResult),
      meta: rawMeta ? JSON.parse(rawMeta) : {},
    };
  } catch {
    return null;
  }
}

export function clearLastStoredAdaptiveResult() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LAST_ADAPTIVE_RESULT_KEY);
  window.localStorage.removeItem(LAST_ADAPTIVE_RESULT_META_KEY);
}

export async function getHealthStatus() {
  return requestJson('/health');
}

export async function runAimDemoSession(scenario) {
  return requestJson('/dev/aim/demo-session', {
    method: 'POST',
    body: { scenario },
  });
}

export async function listPilotLessons(studentId) {
  return requestJson(`/students/${encodePathSegment(studentId)}/lessons`);
}

export async function getPilotLesson(studentId, lessonId) {
  return requestJson(
    `/students/${encodePathSegment(studentId)}/lessons/${encodePathSegment(lessonId)}`,
  );
}

export async function startPilotLessonSession(studentId, lessonId) {
  return requestJson(
    `/students/${encodePathSegment(studentId)}/lessons/${encodePathSegment(lessonId)}/sessions`,
    {
      method: 'POST',
      body: {},
    },
  );
}

export async function submitPilotSessionAttempts(studentId, sessionId, attempts) {
  const result = await requestJson(
    `/students/${encodePathSegment(studentId)}/sessions/${encodePathSegment(sessionId)}/attempts`,
    {
      method: 'POST',
      body: { attempts },
    },
  );

  persistLatestAdaptiveResult({ studentId, sessionId, result });
  return result;
}

export async function getPilotAdaptiveResult(studentId, sessionId) {
  const result = await requestJson(
    `/students/${encodePathSegment(studentId)}/sessions/${encodePathSegment(sessionId)}/adaptive-result`,
  );

  persistLatestAdaptiveResult({ studentId, sessionId, result });
  return result;
}

export async function getPilotRecommendation(studentId) {
  return requestJson(`/students/${encodePathSegment(studentId)}/recommendation`);
}

export async function getPilotAdminOverview() {
  return requestJson('/admin/pilot/overview');
}

// ── Token-aware API helpers (used by WebPilot with explicit JWT) ──────

async function requestJsonWithToken(path, token, options = {}) {
  const { method = 'GET', body } = options;
  const hasBody = body !== undefined;
  const headers = {};
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out while waiting for AIM.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || `Request failed with ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function getCurrentStudentProfile(token) {
  return requestJsonWithToken('/students/me', token);
}

export async function createStudentProfile(data, token) {
  return requestJsonWithToken('/students', token, { method: 'POST', body: data });
}

export async function listLessons(studentId, token) {
  return requestJsonWithToken(
    `/students/${encodePathSegment(studentId)}/lessons`,
    token,
  );
}

export async function getLesson(studentId, lessonId, token) {
  return requestJsonWithToken(
    `/students/${encodePathSegment(studentId)}/lessons/${encodePathSegment(lessonId)}`,
    token,
  );
}

export async function startLessonSession(studentId, lessonId, token) {
  return requestJsonWithToken(
    `/students/${encodePathSegment(studentId)}/lessons/${encodePathSegment(lessonId)}/sessions`,
    token,
    { method: 'POST', body: {} },
  );
}

export async function submitSessionAttempts(studentId, sessionId, attempts, token) {
  const result = await requestJsonWithToken(
    `/students/${encodePathSegment(studentId)}/sessions/${encodePathSegment(sessionId)}/attempts`,
    token,
    { method: 'POST', body: { attempts } },
  );
  persistLatestAdaptiveResult({ studentId, sessionId, result });
  return result;
}

export async function getAdaptiveResult(studentId, sessionId, token) {
  const result = await requestJsonWithToken(
    `/students/${encodePathSegment(studentId)}/sessions/${encodePathSegment(sessionId)}/adaptive-result`,
    token,
  );
  persistLatestAdaptiveResult({ studentId, sessionId, result });
  return result;
}

export async function getRecommendation(studentId, token) {
  return requestJsonWithToken(
    `/students/${encodePathSegment(studentId)}/recommendation`,
    token,
  );
}

export { API_BASE_URL };
