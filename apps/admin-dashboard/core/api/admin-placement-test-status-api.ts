// Phase 4 — P4-058
// Admin placement test status API client.
//
// Scope: Placement Test phase only — admin control of placement test draft/published status.
//
// Endpoints consumed (P4-006 API map, endpoint #10):
//   PATCH /placement/admin/tests/:id/status
//         body: { status: 'draft' | 'published' }
//         → updates placement test status; returns updated test summary
//
// Valid status transitions (backend-enforced):
//   draft     → published   (activates the test; backend enforces ACTIVE_TEST_EXISTS guard)
//   published → draft       (deactivates; only one published test may exist at a time)
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never sent to the browser.
// - Backend is the sole authority for status transitions and active-test enforcement.
// - Only values 'draft' and 'published' are accepted by the backend (no 'archived' via this UI).
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.
//
// Dependencies: P4-038 (placement test read API), P4-054 (admin tests list UI)

import { adminApiClient } from './index';
import { AdminApiClientError } from './admin-api-client-error';
import type { PlacementTestStatus, AdminPlacementTestSummary } from './admin-placement-tests-api';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type PlacementTestStatusTransition = 'draft' | 'published';

export type UpdatePlacementTestStatusPayload = {
  readonly status: PlacementTestStatusTransition;
};

// ---------------------------------------------------------------------------
// Decoder helpers — structural validation only, no business logic.
// ---------------------------------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeStatus(raw: unknown): PlacementTestStatus {
  if (raw === 'draft' || raw === 'published' || raw === 'archived') return raw;
  return 'draft';
}

function decodeTestSummary(raw: unknown): AdminPlacementTestSummary {
  if (!isObject(raw)) throw new Error('Invalid placement test summary shape.');
  return {
    id: typeof raw['id'] === 'string' ? raw['id'] : '',
    title: typeof raw['title'] === 'string' ? raw['title'] : '—',
    status: decodeStatus(raw['status']),
    estimatedMinutes: typeof raw['estimatedMinutes'] === 'number' ? raw['estimatedMinutes'] : 0,
    totalSections: typeof raw['totalSections'] === 'number' ? raw['totalSections'] : 0,
    createdAt: typeof raw['createdAt'] === 'string' ? raw['createdAt'] : '',
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Update a placement test's status (draft ↔ published).
 * Requires admin token with placement:admin:tests:manage permission.
 *
 * Backend enforces:
 * - Only one test may have status 'published' at a time (409 ACTIVE_TEST_EXISTS).
 * - Status 'archived' is not a valid target via this endpoint.
 * - All scoring, CEFR thresholds, and result generation remain backend-only.
 */
export async function updatePlacementTestStatus(
  token: string,
  testId: string,
  payload: UpdatePlacementTestStatusPayload,
): Promise<AdminPlacementTestSummary> {
  const envelope = await adminApiClient.patch(
    `/placement/admin/tests/${encodeURIComponent(testId)}/status`,
    decodeTestSummary,
    {
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

// Re-export for convenience in pages
export { AdminApiClientError };
