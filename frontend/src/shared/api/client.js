const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

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
  return requestJson(
    `/students/${encodePathSegment(studentId)}/sessions/${encodePathSegment(sessionId)}/attempts`,
    {
      method: 'POST',
      body: { attempts },
    },
  );
}

export async function getPilotAdaptiveResult(studentId, sessionId) {
  return requestJson(
    `/students/${encodePathSegment(studentId)}/sessions/${encodePathSegment(sessionId)}/adaptive-result`,
  );
}

export async function getPilotRecommendation(studentId) {
  return requestJson(`/students/${encodePathSegment(studentId)}/recommendation`);
}

export { API_BASE_URL };