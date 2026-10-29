/**
 * Client-side helper that routes requests through the Next.js API proxy
 * at /api/admin/proxy/[...path] to avoid CORS issues.
 *
 * Example: backendFetch('/admin/feature-flags') → GET /api/admin/proxy/feature-flags
 */

function toProxyPath(backendPath: string): string {
  const normalized = backendPath.startsWith('/') ? backendPath : `/${backendPath}`;
  const withoutAdmin = normalized.replace(/^\/admin\//, '/');
  return `/api/admin/proxy${withoutAdmin}`;
}

/** URL for a backend file (e.g. an image) served through the admin proxy. */
export function backendAssetUrl(path: string): string {
  return toProxyPath(path);
}

/** Sends multipart form data (file uploads) through the admin proxy. */
export async function backendUpload(path: string, form: FormData, method = 'POST'): Promise<Response> {
  // No Content-Type header: the browser sets multipart/form-data with its boundary.
  return fetch(toProxyPath(path), { method, body: form, credentials: 'include' });
}

export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(toProxyPath(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });
}

export async function backendGet<T>(path: string): Promise<T> {
  const res = await backendFetch(path);
  if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return (json?.data ?? json) as T;
}

export async function backendFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await backendFetch(path, init);
  if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return (json?.data ?? json) as T;
}
