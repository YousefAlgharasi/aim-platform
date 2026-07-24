// Phase 4 — P4-055
// Admin placement sections API client.
//
// Scope: Placement Test phase only — admin inspection of placement section definitions.
//
// Endpoints consumed:
//   GET /admin/placement/sections?testId=:id   — list sections for a placement test
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never sent to the browser.
// - Backend is the sole authority for section order, question counts, and weights.
// - No placement scoring, CEFR thresholds, or skill maps are computed here.
// - order_index, total_questions, and skill_code are backend-managed — never overridden by UI.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import { adminApiClient } from './index';
import { AdminApiClientError } from './admin-api-client-error';

// ---------------------------------------------------------------------------
// Type definitions — mirrors the backend admin placement sections shape (P4-010 §3).
// Admin sees all fields including placement_test_id, created_at, updated_at.
// ---------------------------------------------------------------------------

export type AdminPlacementSectionSummary = {
  readonly id: string;
  readonly placementTestId: string;
  readonly title: string;
  readonly skillCode: string;
  readonly order: number;
  readonly questionCount: number;
  readonly createdAt: string;
};

export type AdminPlacementSectionsData = {
  readonly sections: AdminPlacementSectionSummary[];
};

// ---------------------------------------------------------------------------
// Decoder helpers — structural validation only, no business logic.
// ---------------------------------------------------------------------------

function decodeSectionSummary(raw: unknown): AdminPlacementSectionSummary {
  const r = raw as Record<string, unknown>;
  return {
    id: typeof r['id'] === 'string' ? r['id'] : '',
    placementTestId: typeof r['placementTestId'] === 'string' ? r['placementTestId'] : '',
    title: typeof r['title'] === 'string' ? r['title'] : '—',
    skillCode: typeof r['skillCode'] === 'string' ? r['skillCode'] : '',
    order: typeof r['order'] === 'number' ? r['order'] : 0,
    questionCount: typeof r['questionCount'] === 'number' ? r['questionCount'] : 0,
    createdAt: typeof r['createdAt'] === 'string' ? r['createdAt'] : '',
  };
}

function decodeSectionsData(raw: unknown): AdminPlacementSectionsData {
  const r = raw as Record<string, unknown>;
  const rawSections = Array.isArray(r['sections']) ? r['sections'] : [];
  return {
    sections: rawSections.map(decodeSectionSummary),
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Fetch all sections for a placement test, ordered by order_index.
 * Requires admin token with placement:admin:sections:manage permission.
 * Backend is the sole authority for section order and question counts.
 */
export async function fetchAdminPlacementSections(
  token: string,
  testId: string,
): Promise<AdminPlacementSectionsData> {
  const envelope = await adminApiClient.get(
    '/admin/placement/sections',
    decodeSectionsData,
    {
      headers: { Authorization: `Bearer ${token}` },
      query: { testId },
    },
  );
  return envelope.data;
}

// Re-export for convenience in pages
export { AdminApiClientError };
