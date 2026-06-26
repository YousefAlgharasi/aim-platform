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
