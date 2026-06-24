#!/usr/bin/env node
//
// CLI to register/login against the aim-platform backend-api, mirroring
// exactly what the Flutter mobile app does: the backend is the sole caller
// of Supabase Auth, so this script only ever talks to backend-api — never
// to Supabase directly, and it never needs Supabase credentials.
//
// Usage:
//   node scripts/auth-cli.js register <email> <password>
//   node scripts/auth-cli.js login <email> <password>
//   node scripts/auth-cli.js refresh <refreshToken>
//
// Config (env vars, all optional):
//   BACKEND_API_URL   default: http://localhost:3000

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

async function backendCall(method, path, body, accessToken) {
  const res = await fetch(new URL(path, BACKEND_API_URL), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const envelope = await res.json().catch(() => ({}));

  if (!res.ok || envelope.success === false) {
    const message = envelope.error?.message || envelope.error || `HTTP ${res.status}`;
    fail(`${method} ${path} failed: ${message}`);
  }

  return envelope.data ?? envelope;
}

async function syncWithBackend(accessToken) {
  console.log('\nBootstrapping profile with backend-api...');
  const bootstrapData = await backendCall('POST', '/auth/bootstrap', undefined, accessToken);
  console.log(JSON.stringify(bootstrapData, null, 2));

  console.log('\nFetching /auth/me...');
  const meData = await backendCall('GET', '/auth/me', undefined, accessToken);
  console.log(JSON.stringify(meData, null, 2));
}

async function main() {
  const [action, ...args] = process.argv.slice(2);

  if (action === 'register') {
    const [email, password] = args;
    if (!email || !password) {
      fail('Usage: node scripts/auth-cli.js register <email> <password>');
    }

    const result = await backendCall('POST', '/auth/register', { email, password });

    if (result.requiresEmailConfirmation) {
      console.log('Registration succeeded. Confirm your email, then run "login".');
      return;
    }

    console.log('Registration succeeded and account is auto-confirmed.');
    console.log(`\nAccess token: ${result.accessToken}`);
    console.log(`Refresh token: ${result.refreshToken}`);
    await syncWithBackend(result.accessToken);
    return;
  }

  if (action === 'login') {
    const [email, password] = args;
    if (!email || !password) {
      fail('Usage: node scripts/auth-cli.js login <email> <password>');
    }

    const result = await backendCall('POST', '/auth/login', { email, password });
    console.log('Login succeeded.');
    console.log(`\nAccess token: ${result.accessToken}`);
    console.log(`Refresh token: ${result.refreshToken}`);
    await syncWithBackend(result.accessToken);
    return;
  }

  if (action === 'refresh') {
    const [refreshToken] = args;
    if (!refreshToken) {
      fail('Usage: node scripts/auth-cli.js refresh <refreshToken>');
    }

    const result = await backendCall('POST', '/auth/refresh', { refreshToken });
    console.log('Refresh succeeded.');
    console.log(`\nAccess token: ${result.accessToken}`);
    console.log(`Refresh token: ${result.refreshToken}`);
    return;
  }

  fail(`Usage: node scripts/auth-cli.js <register|login|refresh> ...`);
}

main();
