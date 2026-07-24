// Phase 4 — P4-056
// Admin placement questions API client.
//
// Scope: Placement Test phase only — admin inspection of placement question bank.
//
// Endpoints consumed:
//   GET /admin/placement/questions?sectionId=:id  — list questions for a section
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never sent to the browser.
// - Backend is the sole authority for question data, order, and skill attribution.
// - correct_answer is NEVER fetched or displayed in this UI (admin inspection only shows metadata).
// - question_type, prompt, media_url, order_index, skill_code displayed as-is from backend.
// - No placement scoring, CEFR thresholds, or mastery values here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import { adminApiClient } from './index';
import { AdminApiClientError } from './admin-api-client-error';

// ---------------------------------------------------------------------------
// Type definitions — mirrors the backend admin placement questions shape (P4-011 §3).
// correct_answer is intentionally excluded — must never be rendered in the UI.
// ---------------------------------------------------------------------------

export type PlacementQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'listening_choice';

export type AdminPlacementQuestionSummary = {
  readonly id: string;
  readonly placementSectionId: string;
  readonly questionType: PlacementQuestionType;
  readonly prompt: string;
  readonly mediaUrl: string | null;
  readonly orderIndex: number;
  readonly skillCode: string;
  readonly createdAt: string;
  // correct_answer intentionally absent — never returned to the admin UI
};

export type AdminPlacementQuestionsData = {
  readonly questions: AdminPlacementQuestionSummary[];
};

// ---------------------------------------------------------------------------
// Decoder helpers — structural validation only, no business logic.
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set<string>([
  'multiple_choice',
  'true_false',
  'fill_blank',
  'listening_choice',
]);

function decodeQuestionType(raw: unknown): PlacementQuestionType {
  if (typeof raw === 'string' && ALLOWED_TYPES.has(raw)) {
    return raw as PlacementQuestionType;
  }
  return 'multiple_choice';
}

function decodeQuestionSummary(raw: unknown): AdminPlacementQuestionSummary {
  const r = raw as Record<string, unknown>;
  return {
    id: typeof r['id'] === 'string' ? r['id'] : '',
    placementSectionId: typeof r['placementSectionId'] === 'string' ? r['placementSectionId'] : '',
    questionType: decodeQuestionType(r['questionType']),
    prompt: typeof r['prompt'] === 'string' ? r['prompt'] : '—',
    mediaUrl: typeof r['mediaUrl'] === 'string' ? r['mediaUrl'] : null,
    orderIndex: typeof r['orderIndex'] === 'number' ? r['orderIndex'] : 0,
    skillCode: typeof r['skillCode'] === 'string' ? r['skillCode'] : '',
    createdAt: typeof r['createdAt'] === 'string' ? r['createdAt'] : '',
  };
}

function decodeQuestionsData(raw: unknown): AdminPlacementQuestionsData {
  const r = raw as Record<string, unknown>;
  const rawQuestions = Array.isArray(r['questions']) ? r['questions'] : [];
  return {
    questions: rawQuestions.map(decodeQuestionSummary),
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Fetch all questions for a placement section, ordered by order_index.
 * Requires admin token with placement:admin:questions:manage permission.
 * correct_answer is never included in this response.
 */
export async function fetchAdminPlacementQuestions(
  token: string,
  sectionId: string,
): Promise<AdminPlacementQuestionsData> {
  const envelope = await adminApiClient.get(
    '/admin/placement/questions',
    decodeQuestionsData,
    {
      headers: { Authorization: `Bearer ${token}` },
      query: { sectionId },
    },
  );
  return envelope.data;
}

// Re-export for convenience in pages
export { AdminApiClientError };
