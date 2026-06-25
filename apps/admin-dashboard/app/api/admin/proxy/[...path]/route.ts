import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { getAdminApiConfig } from '../../../../../lib/api/admin-api-config';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../lib/auth/admin-auth';

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const backendPath = `/admin/${path.join('/')}`;
  const config = getAdminApiConfig();
  const baseUrl = config.backendApiBaseUrl.replace(/\/$/, '');
  const url = new URL(`${baseUrl}${backendPath}`);

  const searchParams = request.nextUrl.searchParams;
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text();
    } catch {
      // no body
    }
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to reach backend service.' },
      { status: 502 },
    );
  }

  const responseBody = await backendResponse.text();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
