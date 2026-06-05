const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

function authHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(options.token),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return response.json();
}

export async function getHealthStatus() {
  return requestJson('/health');
}

export async function runAimDemoSession(scenario) {
  return requestJson('/dev/aim/demo-session', {
    method: 'POST',
    body: JSON.stringify({ scenario }),
  });
}

export async function createStudentProfile({ name, email }, token) {
  return requestJson('/students', {
    method: 'POST',
    token,
    body: JSON.stringify({ name, email }),
  });
}

export async function getCurrentStudentProfile(token) {
  return requestJson('/students/me', { token });
}

export async function listLessons(studentId, token) {
  return requestJson(`/students/${studentId}/lessons`, { token });
}

export async function getLesson(studentId, lessonId, token) {
  return requestJson(`/students/${studentId}/lessons/${encodeURIComponent(lessonId)}`, { token });
}

export async function startLessonSession(studentId, lessonId, token) {
  return requestJson(`/students/${studentId}/lessons/${encodeURIComponent(lessonId)}/sessions`, {
    method: 'POST',
    token,
  });
}

export async function submitSessionAttempts(studentId, sessionId, attempts, token) {
  return requestJson(`/students/${studentId}/sessions/${encodeURIComponent(sessionId)}/attempts`, {
    method: 'POST',
    token,
    body: JSON.stringify({ attempts }),
  });
}

export async function getAdaptiveResult(studentId, sessionId, token) {
  return requestJson(`/students/${studentId}/sessions/${encodeURIComponent(sessionId)}/adaptive-result`, {
    token,
  });
}

export async function getRecommendation(studentId, token) {
  return requestJson(`/students/${studentId}/recommendation`, { token });
}

export { API_BASE_URL };

