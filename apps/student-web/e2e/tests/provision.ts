/**
 * Creates (and removes) the throwaway student the browser test signs in as.
 *
 * Mode A - fresh student per run (preferred, needs the Supabase service key):
 *   E2E_SERVICE_ROLE_KEY=...  E2E_AUTH_URL=http://127.0.0.1:8000   (GoTrue gateway)
 *   -> registers through the real /auth/register endpoint, then confirms the
 *      email through the GoTrue admin API (what clicking the email link does).
 *
 * Mode B - existing student:
 *   E2E_EMAIL=...  E2E_PASSWORD=...
 *   The student must NOT have made a placement choice yet (the gate only shows
 *   once), otherwise the gate step is skipped automatically.
 */
const API = (process.env.API_BASE ?? 'https://api.aim-learn.com').replace(/\/$/, '');

export interface TestStudent {
  email: string;
  password: string;
  authUserId?: string;
}

async function json(res: Response): Promise<any> {
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return { raw: text }; }
}

export async function provisionStudent(): Promise<TestStudent> {
  if (process.env.E2E_EMAIL && process.env.E2E_PASSWORD) {
    return { email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD };
  }
  const key = process.env.E2E_SERVICE_ROLE_KEY;
  const authUrl = process.env.E2E_AUTH_URL;
  if (!key || !authUrl) {
    throw new Error(
      'Set either E2E_EMAIL + E2E_PASSWORD, or E2E_SERVICE_ROLE_KEY + E2E_AUTH_URL (see e2e/README.md).',
    );
  }
  const email = `e2e-web-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@local.com`;
  const password = 'E2e-Placement-123';

  const reg = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName: 'E2E Web Student' }),
  });
  if (!reg.ok) throw new Error(`register failed: ${reg.status} ${JSON.stringify(await json(reg))}`);

  // find the auth user and confirm the email
  const list = await fetch(`${authUrl}/auth/v1/admin/users?per_page=1000`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const users: any[] = (await json(list)).users ?? [];
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error('registered user not found in GoTrue');
  const conf = await fetch(`${authUrl}/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_confirm: true }),
  });
  if (!conf.ok) throw new Error(`email confirm failed: ${conf.status}`);
  return { email, password, authUserId: user.id };
}

export async function removeStudent(s: TestStudent): Promise<void> {
  const key = process.env.E2E_SERVICE_ROLE_KEY;
  const authUrl = process.env.E2E_AUTH_URL;
  if (!s.authUserId || !key || !authUrl || process.env.KEEP_USER === '1') return;
  await fetch(`${authUrl}/auth/v1/admin/users/${s.authUserId}`, {
    method: 'DELETE',
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  }).catch(() => undefined);
  // App-side rows (users/placement_*) are purged with scripts/purge-e2e-users.sh
}
