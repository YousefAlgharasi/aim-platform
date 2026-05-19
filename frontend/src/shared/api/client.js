const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

export async function getHealthStatus() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed with ${response.status}`);
  }

  return response.json();
}

export async function runAimDemoSession(scenario) {
  const response = await fetch(`${API_BASE_URL}/dev/aim/demo-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scenario }),
  });

  if (!response.ok) {
    throw new Error(`AIM demo failed with ${response.status}`);
  }

  return response.json();
}

export { API_BASE_URL };

