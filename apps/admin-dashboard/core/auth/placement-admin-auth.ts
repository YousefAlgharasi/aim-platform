// Phase 4 — P4-060
// Admin placement permission helper.
//
// Scope: Placement Test phase only — verifies that admin placement UI pages
// respect backend-enforced permissions before rendering sensitive content.
//
// How this works:
// - All admin placement pages read the admin JWT server-side from the HTTP-only cookie.
// - Each page sends the token to the backend, which enforces the required permission.
// - This helper provides a consistent pattern for surfacing 401/403 responses as
//   structured UI states rather than raw errors — preventing accidental data leakage.
// - The backend is the sole authority for all permission decisions.
//   This helper NEVER grants or denies access itself; it only interprets the backend's response.
//
// Permission map (from P4-051 — placement.permissions.ts):
//   placement:admin:tests:read       → GET /admin/placement/tests (P4-054 list page)
//   placement:admin:tests:manage     → PATCH /placement/admin/tests/:id/status (P4-058 status page)
//   placement:admin:sections:manage  → GET /admin/placement/sections (P4-055 sections page)
//   placement:admin:questions:manage → GET /admin/placement/questions (P4-056 questions page)
//   placement:admin:skill-links:manage → placement question skill links (P4-057 skill linking page)
//   placement:admin:results:read     → GET /admin/placement/results (P4-059 results page)
//
// Security rules:
// - Token is always read server-side; never sent to the browser or exposed in props.
// - This helper does not store or log tokens.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.
//
// Dependencies: P4-051 (placement permission constants), P4-053–P4-059 (admin UI pages)

import { AdminApiClientError } from '../api/admin-api-client-error';

// ---------------------------------------------------------------------------
// Permission state types — returned to calling pages for structured rendering
// ---------------------------------------------------------------------------

export type PlacementAdminPermissionState =
  | { readonly status: 'authorized' }
  | { readonly status: 'unauthorized'; readonly requiredPermission: string }
  | { readonly status: 'unauthenticated' }
  | { readonly status: 'unavailable' };

// ---------------------------------------------------------------------------
// Known admin placement permissions (mirrors P4-051 placement.permissions.ts)
// ---------------------------------------------------------------------------

export const PLACEMENT_ADMIN_PERMISSIONS = {
  TESTS_READ: 'placement:admin:tests:read',
  TESTS_MANAGE: 'placement:admin:tests:manage',
  SECTIONS_MANAGE: 'placement:admin:sections:manage',
  QUESTIONS_MANAGE: 'placement:admin:questions:manage',
  SKILL_LINKS_MANAGE: 'placement:admin:skill-links:manage',
  RESULTS_READ: 'placement:admin:results:read',
} as const;

export type PlacementAdminPermission =
  (typeof PLACEMENT_ADMIN_PERMISSIONS)[keyof typeof PLACEMENT_ADMIN_PERMISSIONS];

// ---------------------------------------------------------------------------
// Error interpreter — maps backend HTTP status codes to permission states.
// Called by placement admin pages in their catch blocks.
// ---------------------------------------------------------------------------

/**
 * Interpret a backend error from a placement admin API call and return
 * a structured permission state. Pages use this to render appropriate UI
 * (unauthorized notice, auth required notice, etc.) instead of raw errors.
 *
 * The backend is the sole authority — this function only translates its response.
 */
export function interpretPlacementAdminError(
  error: unknown,
  requiredPermission: PlacementAdminPermission,
): PlacementAdminPermissionState {
  if (error instanceof AdminApiClientError) {
    const e = error as { status?: number };
    if (e.status === 401) {
      return { status: 'unauthenticated' };
    }
    if (e.status === 403) {
      return { status: 'unauthorized', requiredPermission };
    }
    if (e.status === 503 || e.status === 502 || e.status === 0) {
      return { status: 'unavailable' };
    }
  }
  // Non-permission errors (404, 500, etc.) are not permission failures —
  // callers should handle those separately.
  return { status: 'authorized' };
}

/**
 * Return true if a backend error indicates a permission problem (401 or 403).
 * Pages can use this to distinguish permission failures from data errors.
 */
export function isPlacementPermissionError(error: unknown): boolean {
  if (error instanceof AdminApiClientError) {
    const e = error as { status?: number };
    return e.status === 401 || e.status === 403;
  }
  return false;
}

/**
 * Build a human-readable permission error message for display in the admin UI.
 * Never reveals token values, internal user IDs, or backend credentials.
 */
export function placementPermissionErrorMessage(
  state: PlacementAdminPermissionState,
): string {
  switch (state.status) {
    case 'unauthenticated':
      return 'Your session has expired or you are not logged in. Please sign in again.';
    case 'unauthorized':
      return `Access denied. This action requires the "${state.requiredPermission}" permission. Contact your administrator.`;
    case 'unavailable':
      return 'The backend is temporarily unavailable. Please try again shortly.';
    case 'authorized':
      return '';
  }
}
