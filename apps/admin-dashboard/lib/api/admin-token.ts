// P11-010: Server-side token helper
// Token is always read from the HTTP-only cookie server-side.
// Never exposed to the browser or passed as a prop.
import { cookies } from 'next/headers';
const ADMIN_AUTH_TOKEN_COOKIE = 'aim_admin_access_token';

export async function getAdminToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
}
