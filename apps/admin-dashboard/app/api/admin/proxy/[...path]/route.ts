import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { getAdminApiConfig } from '../../../../../core/api/admin-api-config';
import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../core/auth/admin-auth';

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;

  if (!path || path.length === 0 || path.some((segment) => segment === '..' || segment.includes('..') || segment.includes('/') || segment.includes('\\'))) {
    return NextResponse.json(
      { success: false, error: 'Invalid path parameter for admin proxy.' },
      { status: 400 },
    );
  }

  const backendPath = `/admin/${path.join('/')}`;
  const config = getAdminApiConfig();
  const baseUrl = config.backendApiBaseUrl.replace(/\/$/, '');
  const url = new URL(`${baseUrl}${backendPath}`);

  const searchParams = request.nextUrl.searchParams;
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  // File uploads (multipart) are forwarded byte-for-byte with their own
  // content type (it carries the multipart boundary); everything else is JSON.
  const requestContentType = request.headers.get('content-type') ?? '';
  const isMultipart = requestContentType.startsWith('multipart/form-data');

  const headers: Record<string, string> = {
    'Content-Type': isMultipart ? requestContentType : 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: string | ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = isMultipart ? await request.arrayBuffer() : await request.text();
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

  // Images (wallet logos, receipts) pass through as binary.
  const responseType = backendResponse.headers.get('content-type') ?? '';
  if (responseType.startsWith('image/')) {
    return new NextResponse(await backendResponse.arrayBuffer(), {
      status: backendResponse.status,
      headers: { 'Content-Type': responseType, 'Cache-Control': 'private, max-age=300' },
    });
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
