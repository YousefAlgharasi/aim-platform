// Phase 4 — P4-054
// Admin placement tests API client.
//
// Scope: Placement Test phase only — admin inspection of placement test definitions.
//
// Endpoints consumed:
//   GET /admin/placement/tests          — paginated list of all placement tests
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never sent to the browser.
// - Backend is the sole authority for placement test status, section counts, and scoring.
// - No placement scoring, CEFR thresholds, or skill maps are computed here.
// - status transitions (draft → published → archived) are enforced by the backend only.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import { adminApiClient } from './index';
import { AdminApiClientError } from './admin-api-client-error';

// ---------------------------------------------------------------------------
// Type definitions — mirrors the backend admin placement test shape (P4-009 §3).
// Fields never exposed to admins: version, published_at (internal backend fields).
// ---------------------------------------------------------------------------

export type PlacementTestStatus = 'draft' | 'published' | 'archived';

export type AdminPlacementTestSummary = {
  readonly id: string;
  readonly title: string;
  readonly status: PlacementTestStatus;
  readonly estimatedMinutes: number;
  readonly totalSections: number;
  readonly createdAt: string;
};

export type AdminPlacementTestListData = {
  readonly tests: AdminPlacementTestSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

// ---------------------------------------------------------------------------
// Decoder helpers — light structural validation only, no business logic.
// ---------------------------------------------------------------------------

function decodeStatus(raw: unknown): PlacementTestStatus {
  if (raw === 'draft' || raw === 'published' || raw === 'archived') return raw;
  return 'draft';
}

function decodeTestSummary(raw: unknown): AdminPlacementTestSummary {
  const r = raw as Record<string, unknown>;
  return {
    id: typeof r['id'] === 'string' ? r['id'] : '',
    title: typeof r['title'] === 'string' ? r['title'] : '—',
    status: decodeStatus(r['status']),
    estimatedMinutes: typeof r['estimatedMinutes'] === 'number' ? r['estimatedMinutes'] : 0,
    totalSections: typeof r['totalSections'] === 'number' ? r['totalSections'] : 0,
    createdAt: typeof r['createdAt'] === 'string' ? r['createdAt'] : '',
  };
}

function decodeListData(raw: unknown): AdminPlacementTestListData {
  const r = raw as Record<string, unknown>;
  const rawTests = Array.isArray(r['tests']) ? r['tests'] : [];
  return {
    tests: rawTests.map(decodeTestSummary),
    total: typeof r['total'] === 'number' ? r['total'] : 0,
    page: typeof r['page'] === 'number' ? r['page'] : 1,
    limit: typeof r['limit'] === 'number' ? r['limit'] : 20,
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Fetch paginated list of all placement tests.
 * Requires admin token with placement:admin:tests:read permission.
 * Backend is the sole authority for test status and section counts.
 */
export async function fetchAdminPlacementTests(
  token: string,
  page: number = 1,
  limit: number = 20,
): Promise<AdminPlacementTestListData> {
  const envelope = await adminApiClient.get(
    '/admin/placement/tests',
    decodeListData,
    {
      headers: { Authorization: `Bearer ${token}` },
      query: { page, limit },
    },
  );
  return envelope.data;
}

// Re-export for convenience in pages
export { AdminApiClientError };
