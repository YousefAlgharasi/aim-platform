import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { getAdminApiConfig } from '../../../../lib/api/admin-api-config';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth/admin-auth';

type LoginRequestBody = {
  readonly email: string;
  readonly password: string;
};

export async function POST(request: NextRequest) {
  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { success: false, error: 'Email and password are required.' },
      { status: 400 },
    );
  }

  const config = getAdminApiConfig();
  const backendUrl = `${config.backendApiBaseUrl.replace(/\/$/, '')}/auth/login`;

  let backendResponse: Response;
  try {
    backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to reach the authentication service.' },
      { status: 502 },
    );
  }

  const backendBody = (await backendResponse.json()) as Record<string, unknown>;

  if (!backendResponse.ok) {
    const errorMessage =
      typeof backendBody === 'object' && backendBody !== null
        ? (backendBody as Record<string, unknown>).message ?? (backendBody as Record<string, unknown>).error ?? 'Login failed.'
        : 'Login failed.';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: backendResponse.status },
    );
  }

  const data = (backendBody as Record<string, unknown>).data as Record<string, unknown> | undefined;
  const accessToken = (data?.accessToken ?? (backendBody as Record<string, unknown>).accessToken) as string | undefined;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'No access token received from backend.' },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_TOKEN_COOKIE, accessToken, {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true });
}
