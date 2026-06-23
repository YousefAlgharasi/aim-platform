#!/usr/bin/env node
//
// CLI to register/login against the AIM platform, mirroring exactly what the
// Flutter mobile app does:
//   1. Auth (login/signup) goes straight to Supabase Auth REST API, using
//      only the public SUPABASE_URL + SUPABASE_ANON_KEY (never the
//      service-role key or JWT secret — those are backend-only secrets).
//   2. The resulting Supabase access_token is sent as a Bearer token to the
//      aim-platform backend-api to bootstrap the profile and fetch /auth/me.
//
// Usage:
//   node scripts/auth-cli.js register <email> <password>
//   node scripts/auth-cli.js login <email> <password>
//
// Config (env vars, all optional except the Supabase ones):
//   SUPABASE_URL              e.g. https://<project-ref>.supabase.co
//   SUPABASE_ANON_KEY         public anon key
//   BACKEND_API_URL           default: http://localhost:3000
//   AUTH_REDIRECT_TO          optional redirect_to for signup confirmation links

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';
const AUTH_REDIRECT_TO = process.env.AUTH_REDIRECT_TO;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  fail(
    'SUPABASE_URL and SUPABASE_ANON_KEY env vars are required.\n' +
      '(Use the public anon key only — never the service-role key.)',
  );
}

async function supabaseSignUp(email, password) {
  const url = new URL('/auth/v1/signup', SUPABASE_URL);
  if (AUTH_REDIRECT_TO) url.searchParams.set('redirect_to', AUTH_REDIRECT_TO);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body.error_description || body.msg || body.error || `HTTP ${res.status}`;
    fail(`Sign-up failed: ${message}`);
  }

  if (!body.access_token) {
    console.log('Sign-up succeeded. Email confirmation is required before signing in.');
    return null;
  }

  console.log('Sign-up succeeded and account is auto-confirmed.');
  return body.access_token;
}

async function supabaseSignIn(email, password) {
  const url = new URL('/auth/v1/token', SUPABASE_URL);
  url.searchParams.set('grant_type', 'password');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body.error_description || body.msg || body.error || `HTTP ${res.status}`;
    fail(`Sign-in failed: ${message}`);
  }

  return body.access_token;
}

async function backendCall(method, path, accessToken, payload) {
  const res = await fetch(new URL(path, BACKEND_API_URL), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const envelope = await res.json().catch(() => ({}));

  if (!res.ok || envelope.success === false) {
    const message = envelope.error?.message || envelope.error || `HTTP ${res.status}`;
    fail(`Backend ${method} ${path} failed: ${message}`);
  }

  return envelope.data;
}

async function syncWithBackend(accessToken) {
  console.log('\nBootstrapping profile with backend-api...');
  const bootstrapData = await backendCall('POST', '/auth/bootstrap', accessToken);
  console.log(JSON.stringify(bootstrapData, null, 2));

  console.log('\nFetching /auth/me...');
  const meData = await backendCall('GET', '/auth/me', accessToken);
  console.log(JSON.stringify(meData, null, 2));
}

async function main() {
  const [action, email, password] = process.argv.slice(2);

  if (!action || !email || !password) {
    fail('Usage: node scripts/auth-cli.js <register|login> <email> <password>');
  }

  let accessToken;

  if (action === 'register') {
    accessToken = await supabaseSignUp(email, password);
    if (!accessToken) {
      console.log('No access token yet — confirm the email, then run "login".');
      return;
    }
  } else if (action === 'login') {
    accessToken = await supabaseSignIn(email, password);
    console.log('Sign-in succeeded.');
  } else {
    fail(`Unknown action "${action}". Use "register" or "login".`);
  }

  console.log(`\nAccess token: ${accessToken}`);
  await syncWithBackend(accessToken);
}

main();
