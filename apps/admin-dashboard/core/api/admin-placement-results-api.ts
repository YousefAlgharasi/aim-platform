// Phase 4 — P4-059
// Admin placement results API client.
//
// Scope: Placement Test phase only — admin inspection of placement outcomes.
//
// Endpoints consumed:
//   GET /admin/placement/results          — paginated list of all student results
//   GET /admin/placement/results/:id      — single result detail
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never sent to the browser.
// - Backend is the sole authority for placement scoring, CEFR level, and skill maps.
// - No placement scoring, raw mastery values, or CEFR thresholds are computed here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import { adminApiClient } from './index';
import { AdminApiClientError } from './admin-api-client-error';

// ---------------------------------------------------------------------------
// Type definitions — mirrors the backend admin placement results shape.
// Raw scores and internal keys are stripped by the backend (P4-048).
// ---------------------------------------------------------------------------

export type PlacementAttemptStatus =
  | 'active'
  | 'submitted'
  | 'completed'
  | 'expired'
  | 'abandoned';

export type SkillSignal = 'strong' | 'developing' | 'emerging';

export type AdminSkillSummaryEntry = {
  readonly skillCode: string;
  readonly skillName: string;
  /** Backend-assigned signal. Never a raw correctness ratio. */
  readonly signal: SkillSignal;
};

export type AdminPlacementResultSummary = {
  readonly resultId: string;
  readonly attemptId: string;
  readonly studentId: string;
  /** Backend-assigned CEFR level. Admin dashboard displays as-is; never recalculates. */
  readonly estimatedLevel: string;
  readonly completedAt: string;
  readonly initialPathReady: boolean;
};

export type AdminPlacementResultDetail = AdminPlacementResultSummary & {
  readonly skillSummary: AdminSkillSummaryEntry[];
};

export type AdminPlacementResultListData = {
  readonly results: AdminPlacementResultSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

// ---------------------------------------------------------------------------
// Decoder helpers — light structural validation only, no business logic.
// ---------------------------------------------------------------------------

function decodeSkillSignal(raw: unknown): SkillSignal {
  if (raw === 'strong' || raw === 'developing' || raw === 'emerging') return raw;
  return 'emerging';
}

function decodeSkillSummaryEntry(raw: unknown): AdminSkillSummaryEntry {
  const r = raw as Record<string, unknown>;
  return {
    skillCode: typeof r['skillCode'] === 'string' ? r['skillCode'] : '',
    skillName: typeof r['skillName'] === 'string' ? r['skillName'] : '',
    signal: decodeSkillSignal(r['signal']),
  };
}

function decodeResultSummary(raw: unknown): AdminPlacementResultSummary {
  const r = raw as Record<string, unknown>;
  return {
    resultId: typeof r['resultId'] === 'string' ? r['resultId'] : '',
    attemptId: typeof r['attemptId'] === 'string' ? r['attemptId'] : '',
    studentId: typeof r['studentId'] === 'string' ? r['studentId'] : '',
    estimatedLevel: typeof r['estimatedLevel'] === 'string' ? r['estimatedLevel'] : '—',
    completedAt: typeof r['completedAt'] === 'string' ? r['completedAt'] : '',
    initialPathReady: r['initialPathReady'] === true,
  };
}

function decodeResultDetail(raw: unknown): AdminPlacementResultDetail {
  const r = raw as Record<string, unknown>;
  const summary = decodeResultSummary(raw);
  const rawSkills = Array.isArray(r['skillSummary']) ? r['skillSummary'] : [];
  return {
    ...summary,
    skillSummary: rawSkills.map(decodeSkillSummaryEntry),
  };
}

function decodeListData(raw: unknown): AdminPlacementResultListData {
  const r = raw as Record<string, unknown>;
  const rawResults = Array.isArray(r['results']) ? r['results'] : [];
  return {
    results: rawResults.map(decodeResultSummary),
    total: typeof r['total'] === 'number' ? r['total'] : 0,
    page: typeof r['page'] === 'number' ? r['page'] : 1,
    limit: typeof r['limit'] === 'number' ? r['limit'] : 20,
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Fetch paginated list of all student placement results.
 * Requires admin token with placement:admin:results:read permission.
 */
export async function fetchAdminPlacementResults(
  token: string,
  page: number = 1,
  limit: number = 20,
): Promise<AdminPlacementResultListData> {
  const envelope = await adminApiClient.get(
    '/admin/placement/results',
    decodeListData,
    {
      headers: { Authorization: `Bearer ${token}` },
      query: { page, limit },
    },
  );
  return envelope.data;
}

/**
 * Fetch a single placement result by result ID.
 * Requires admin token with placement:admin:results:read permission.
 */
export async function fetchAdminPlacementResultDetail(
  token: string,
  resultId: string,
): Promise<AdminPlacementResultDetail> {
  const envelope = await adminApiClient.get(
    `/admin/placement/results/${resultId}`,
    decodeResultDetail,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return envelope.data;
}

// Re-export for convenience in pages
export { AdminApiClientError };
