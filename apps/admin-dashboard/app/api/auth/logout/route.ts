import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth/admin-auth';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_TOKEN_COOKIE);
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'), 302);
}
