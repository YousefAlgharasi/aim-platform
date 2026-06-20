# Phase 11 — Admin Error Handling UX Guide

**Task:** P11-011
**Components:** `components/error-handling/`
**Utility:** `lib/resolve-admin-api-error.ts`

---

## 1. Error State Components

| Component | Usage |
|---|---|
| `AdminApiErrorState` | Full-page error when a backend API call fails. Shows status-aware title and description. Accepts optional retry action. |
| `AdminValidationErrors` | Inline list of form validation errors above a form. Renders nothing if `errors` is empty. |
| `AdminPageErrorBoundary` | Next.js `error.tsx` client component. Catches unhandled errors in route segments. Shows "Try again" button that calls `reset()`. |
| `AdminNotFoundState` | 404 state for detail pages when a resource is not found. |

All four from `components/layout/` are also available:
- `AdminLoadingSkeleton` — data-fetching loading state
- `AdminEmptyState` — zero-results state
- `AdminErrorBanner` — inline alert (error/warning/info/success)
- `AdminForbiddenState` — 403 state (role insufficient)

---

## 2. Error Resolution Utility

```typescript
import { resolveAdminApiError } from '@/lib/resolve-admin-api-error';

let data = null;
let errorInfo = null;

try {
  data = await fetchAdminUsers(token, page, limit);
} catch (err) {
  errorInfo = resolveAdminApiError(err);
}
```

`resolveAdminApiError` returns `AdminApiErrorInfo`:
```typescript
{
  status:        number | undefined;  // HTTP status code
  message:       string;              // Safe, user-friendly message
  isForbidden:   boolean;             // true if 403
  isNotFound:    boolean;             // true if 404
  isUnavailable: boolean;             // true if 502/503
}
```

**Security:** Raw backend error messages are only shown for 4xx validation errors. Auth errors (401/403), 404s, and 5xx errors return safe, generic strings. Stack traces are never surfaced.

---

## 3. Standard Page Pattern

Every admin list/detail page must follow this pattern:

```tsx
export default async function AdminSomePage() {
  const token = await getAdminToken();
  let data = null;
  let errorInfo: AdminApiErrorInfo | null = null;

  try {
    data = await fetchAdminSomething(token);
  } catch (err) {
    errorInfo = resolveAdminApiError(err);
  }

  // 1. Forbidden
  if (errorInfo?.isForbidden) {
    return <AdminForbiddenState />;
  }

  // 2. Not found (detail pages)
  if (errorInfo?.isNotFound) {
    return <AdminNotFoundState resource="Thing" backAction={<Link href="/admin/things">← Back</Link>} />;
  }

  // 3. Other API error
  if (errorInfo) {
    return <AdminApiErrorState status={errorInfo.status} message={errorInfo.message} />;
  }

  // 4. Empty
  if (!data || data.data.length === 0) {
    return <AdminEmptyState title="No items found" />;
  }

  // 5. Data
  return <AdminTable ... />;
}
```

---

## 4. Form Validation Pattern

```tsx
const [errors, setErrors] = useState<string[]>([]);

// On submit failure:
setErrors(['Title is required.', 'Due date must be in the future.']);

// In JSX:
<AdminValidationErrors errors={errors} id="form-errors" />
<form aria-describedby="form-errors">
  ...
</form>
```

---

## 5. Next.js Error Boundary (error.tsx)

Create `error.tsx` in any route segment:

```tsx
'use client';
import { AdminPageErrorBoundary } from '@/components/error-handling';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AdminPageErrorBoundary error={error} reset={reset} />;
}
```

---

## 6. Rules

- Never show raw error messages, stack traces, or backend internals in the UI
- Always use `resolveAdminApiError` in catch blocks — never format error strings inline
- Always handle 403 with `AdminForbiddenState`, not with a generic error
- Always handle 404 with `AdminNotFoundState` on detail pages
- Never log sensitive data (tokens, user PII, backend payloads) in error handlers
