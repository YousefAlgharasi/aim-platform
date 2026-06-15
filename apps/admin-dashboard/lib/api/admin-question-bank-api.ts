// Phase 3 — P3-059
// Admin question bank API client.
//
// Scope: Curriculum & Content System — question bank only.
// This client does NOT implement learner practice, sessions, or AIM runtime.
//
// Endpoints:
//   GET    /curriculum/questions
//   GET    /curriculum/questions/:id
//   POST   /curriculum/questions
//   PATCH  /curriculum/questions/:id

import { adminApiClient } from './index';

export const QUESTION_TYPES = [
  'multiple_choice',
  'multiple_select',
  'true_false',
  'fill_in_the_blank',
  'short_answer',
  'ordering',
  'matching',
] as const;

export const QUESTION_DIFFICULTIES = [
  'beginner',
  'elementary',
  'intermediate',
  'upper_intermediate',
  'advanced',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];
export type QuestionStatus = 'draft' | 'published' | 'archived';

export type AdminQuestionSummary = {
  readonly id: string;
  readonly type: QuestionType;
  readonly stem: string;
  readonly difficulty: QuestionDifficulty;
  readonly tags: string[];
  readonly status: QuestionStatus;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminQuestionListData = {
  readonly questions: AdminQuestionSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export type CreateQuestionPayload = {
  readonly type: QuestionType;
  readonly stem: string;
  readonly difficulty: QuestionDifficulty;
  readonly explanation?: string | null;
  readonly hint?: string | null;
  readonly tags?: string[];
};

export type UpdateQuestionPayload = {
  readonly stem?: string;
  readonly difficulty?: QuestionDifficulty;
  readonly explanation?: string | null;
  readonly hint?: string | null;
  readonly tags?: string[];
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeQuestionSummary(value: unknown): AdminQuestionSummary {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.stem !== 'string') {
    throw new Error('Invalid question response shape.');
  }
  return {
    id: value.id,
    type: (value.type ?? 'multiple_choice') as QuestionType,
    stem: value.stem,
    difficulty: (value.difficulty ?? 'beginner') as QuestionDifficulty,
    tags: Array.isArray(value.tags) ? (value.tags as string[]) : [],
    status: (value.status ?? 'draft') as QuestionStatus,
    createdBy: String(value.createdBy ?? ''),
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeQuestionListData(value: unknown): AdminQuestionListData {
  if (!isObject(value) || !Array.isArray(value.questions)) {
    throw new Error('Invalid question list response shape.');
  }
  return {
    questions: value.questions.map(decodeQuestionSummary),
    total: typeof value.total === 'number' ? value.total : 0,
    page: typeof value.page === 'number' ? value.page : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

export async function fetchAdminQuestions(
  token: string,
  page = 1,
  limit = 20,
  filters: { type?: string; difficulty?: string; status?: string } = {},
): Promise<AdminQuestionListData> {
  const query: Record<string, string | number | boolean | undefined> = { page, limit };
  if (filters.type) query.type = filters.type;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.status) query.status = filters.status;

  const envelope = await adminApiClient.get<AdminQuestionListData>(
    '/curriculum/questions',
    decodeQuestionListData,
    { headers: { authorization: `Bearer ${token}` }, query },
  );
  return envelope.data;
}

export async function createAdminQuestion(
  token: string,
  payload: CreateQuestionPayload,
): Promise<AdminQuestionSummary> {
  const envelope = await adminApiClient.post<AdminQuestionSummary>(
    '/curriculum/questions',
    decodeQuestionSummary,
    { headers: { authorization: `Bearer ${token}` }, body: payload },
  );
  return envelope.data;
}

export async function updateAdminQuestion(
  token: string,
  id: string,
  payload: UpdateQuestionPayload,
): Promise<AdminQuestionSummary> {
  const envelope = await adminApiClient.patch<AdminQuestionSummary>(
    `/curriculum/questions/${encodeURIComponent(id)}`,
    decodeQuestionSummary,
    { headers: { authorization: `Bearer ${token}` }, body: payload },
  );
  return envelope.data;
}
