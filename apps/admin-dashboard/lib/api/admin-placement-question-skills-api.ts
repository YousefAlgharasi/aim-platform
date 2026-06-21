// Phase 4 — P4-057
// Admin placement question-skills API client.
//
// Scope: Placement Test phase only — admin management of placement question → skill links.
//
// Endpoints consumed (declared in P4-006 API map):
//   GET    /admin/placement/questions/:questionId/skills
//          → lists all skill links for a placement question
//   POST   /admin/placement/questions/:questionId/skills
//          body: { skillId, isPrimary }  → creates a new skill link
//   DELETE /admin/placement/questions/:questionId/skills/:skillId
//          → removes a skill link
//   PATCH  /admin/placement/questions/:questionId/skills/:skillId
//          body: { isPrimary: true }  → sets a linked skill as primary
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never sent to the browser.
// - Backend is the sole authority for placement question-to-skill mappings.
// - Clients must not compute placement scores, CEFR thresholds, skill maps, or weakness maps.
// - correct_answer is NEVER fetched, stored, or rendered by this client.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.
// - is_primary constraint (exactly one per question before activation) is enforced by the backend.
//
// Dependencies: P4-020 (placement_question_skills table), P4-056 (placement questions UI)

import { adminApiClient } from './index';
import { AdminApiClientError } from './admin-api-client-error';

// ---------------------------------------------------------------------------
// Type definitions — mirrors the backend placement question-skills shape (P4-020 schema)
// ---------------------------------------------------------------------------

export type PlacementQuestionSkillLink = {
  readonly placementQuestionId: string;
  readonly skillId: string;
  readonly isPrimary: boolean;
  readonly createdAt: string;
};

export type PlacementQuestionSkillLinksData = {
  readonly links: PlacementQuestionSkillLink[];
};

export type CreatePlacementQuestionSkillPayload = {
  readonly skillId: string;
  readonly isPrimary: boolean;
};

// ---------------------------------------------------------------------------
// Decoder helpers — structural validation only, no business logic.
// ---------------------------------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodePlacementQuestionSkillLink(raw: unknown): PlacementQuestionSkillLink {
  if (!isObject(raw)) {
    throw new Error('Invalid placement question skill link shape.');
  }
  return {
    placementQuestionId:
      typeof raw['placementQuestionId'] === 'string' ? raw['placementQuestionId'] : '',
    skillId: typeof raw['skillId'] === 'string' ? raw['skillId'] : '',
    isPrimary: raw['isPrimary'] === true,
    createdAt: typeof raw['createdAt'] === 'string' ? raw['createdAt'] : '',
  };
}

function decodePlacementQuestionSkillLinksData(raw: unknown): PlacementQuestionSkillLinksData {
  const r = isObject(raw) ? raw : {};
  const rawLinks = Array.isArray(r['links']) ? r['links'] : [];
  return {
    links: rawLinks.map(decodePlacementQuestionSkillLink),
  };
}

function decodeVoid(_raw: unknown): null {
  return null;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Fetch all skill links for a placement question.
 * Requires admin token with placement:admin:questions:manage permission.
 */
export async function fetchPlacementQuestionSkillLinks(
  token: string,
  questionId: string,
): Promise<PlacementQuestionSkillLinksData> {
  const envelope = await adminApiClient.get(
    `/admin/placement/questions/${encodeURIComponent(questionId)}/skills`,
    decodePlacementQuestionSkillLinksData,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

/**
 * Add a skill link to a placement question.
 * Requires admin token with placement:admin:questions:manage permission.
 * isPrimary = true sets this as the primary skill for scoring.
 * Backend enforces that at most one primary link exists per question.
 */
export async function addPlacementQuestionSkillLink(
  token: string,
  questionId: string,
  payload: CreatePlacementQuestionSkillPayload,
): Promise<PlacementQuestionSkillLink> {
  const envelope = await adminApiClient.post(
    `/admin/placement/questions/${encodeURIComponent(questionId)}/skills`,
    decodePlacementQuestionSkillLink,
    {
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

/**
 * Remove a skill link from a placement question.
 * Requires admin token with placement:admin:questions:manage permission.
 * Backend will reject removal if it would leave the question with no primary skill
 * and the question is currently active in a live placement test.
 */
export async function removePlacementQuestionSkillLink(
  token: string,
  questionId: string,
  skillId: string,
): Promise<void> {
  await adminApiClient.delete(
    `/admin/placement/questions/${encodeURIComponent(questionId)}/skills/${encodeURIComponent(skillId)}`,
    decodeVoid,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

/**
 * Set an existing skill link as primary for this placement question.
 * Backend enforces the partial unique constraint (at most one primary per question).
 */
export async function setPrimaryPlacementQuestionSkillLink(
  token: string,
  questionId: string,
  skillId: string,
): Promise<PlacementQuestionSkillLink> {
  const envelope = await adminApiClient.patch(
    `/admin/placement/questions/${encodeURIComponent(questionId)}/skills/${encodeURIComponent(skillId)}`,
    decodePlacementQuestionSkillLink,
    {
      headers: { Authorization: `Bearer ${token}` },
      body: { isPrimary: true },
    },
  );
  return envelope.data;
}

// Re-export for convenience in pages
export { AdminApiClientError };
