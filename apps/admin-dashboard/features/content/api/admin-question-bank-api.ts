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
//   GET    /curriculum/questions/:questionId/choices
//   POST   /curriculum/questions/:questionId/choices
//   PATCH  /curriculum/questions/:questionId/choices/:choiceId
//   DELETE /curriculum/questions/:questionId/choices/:choiceId
//   PUT    /curriculum/questions/:questionId/choices/reorder

import { adminApiClient } from '../../../core/api';

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

export type AdminQuestionDetail = AdminQuestionSummary & {
  readonly richStem: unknown | null;
  readonly explanation: string | null;
  readonly hint: string | null;
};

function decodeQuestionDetail(value: unknown): AdminQuestionDetail {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.stem !== 'string') {
    throw new Error('Invalid question detail response shape.');
  }
  return {
    ...decodeQuestionSummary(value),
    richStem: value.richStem ?? null,
    explanation: typeof value.explanation === 'string' ? value.explanation : null,
    hint: typeof value.hint === 'string' ? value.hint : null,
  };
}

export async function fetchAdminQuestion(
  token: string,
  id: string,
): Promise<AdminQuestionDetail> {
  const envelope = await adminApiClient.get<AdminQuestionDetail>(
    `/curriculum/questions/${encodeURIComponent(id)}`,
    decodeQuestionDetail,
    { headers: { authorization: `Bearer ${token}` } },
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

// ---------------------------------------------------------------------------
// Answer choices
// ---------------------------------------------------------------------------

export type AdminQuestionChoice = {
  readonly id: string;
  readonly questionId: string;
  readonly text: string;
  readonly richText: unknown | null;
  readonly isCorrect: boolean;
  readonly order: number;
  readonly explanation: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminQuestionChoiceListData = {
  readonly choices: AdminQuestionChoice[];
  readonly total: number;
};

export type CreateQuestionChoicePayload = {
  readonly text: string;
  readonly isCorrect: boolean;
  readonly order: number;
  readonly explanation?: string | null;
};

export type UpdateQuestionChoicePayload = {
  readonly text?: string;
  readonly isCorrect?: boolean;
  readonly order?: number;
  readonly explanation?: string | null;
};

function decodeQuestionChoice(value: unknown): AdminQuestionChoice {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.text !== 'string') {
    throw new Error('Invalid question choice response shape.');
  }
  return {
    id: value.id,
    questionId: String(value.questionId ?? ''),
    text: value.text,
    richText: value.richText ?? null,
    isCorrect: Boolean(value.isCorrect),
    order: typeof value.order === 'number' ? value.order : 0,
    explanation: typeof value.explanation === 'string' ? value.explanation : null,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeQuestionChoiceListData(value: unknown): AdminQuestionChoiceListData {
  if (!isObject(value) || !Array.isArray(value.choices)) {
    throw new Error('Invalid question choice list response shape.');
  }
  return {
    choices: value.choices.map(decodeQuestionChoice),
    total: typeof value.total === 'number' ? value.total : 0,
  };
}

export async function fetchAdminQuestionChoices(
  token: string,
  questionId: string,
): Promise<AdminQuestionChoiceListData> {
  const envelope = await adminApiClient.get<AdminQuestionChoiceListData>(
    `/curriculum/questions/${encodeURIComponent(questionId)}/choices`,
    decodeQuestionChoiceListData,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export async function createAdminQuestionChoice(
  token: string,
  questionId: string,
  payload: CreateQuestionChoicePayload,
): Promise<AdminQuestionChoice> {
  const envelope = await adminApiClient.post<AdminQuestionChoice>(
    `/curriculum/questions/${encodeURIComponent(questionId)}/choices`,
    decodeQuestionChoice,
    { headers: { authorization: `Bearer ${token}` }, body: payload },
  );
  return envelope.data;
}

export async function updateAdminQuestionChoice(
  token: string,
  questionId: string,
  choiceId: string,
  payload: UpdateQuestionChoicePayload,
): Promise<AdminQuestionChoice> {
  const envelope = await adminApiClient.patch<AdminQuestionChoice>(
    `/curriculum/questions/${encodeURIComponent(questionId)}/choices/${encodeURIComponent(choiceId)}`,
    decodeQuestionChoice,
    { headers: { authorization: `Bearer ${token}` }, body: payload },
  );
  return envelope.data;
}

function decodeVoid(_value: unknown): null {
  return null;
}

export async function deleteAdminQuestionChoice(
  token: string,
  questionId: string,
  choiceId: string,
): Promise<void> {
  await adminApiClient.delete<null>(
    `/curriculum/questions/${encodeURIComponent(questionId)}/choices/${encodeURIComponent(choiceId)}`,
    decodeVoid,
    { headers: { authorization: `Bearer ${token}` } },
  );
}

export async function reorderAdminQuestionChoices(
  token: string,
  questionId: string,
  orderedChoiceIds: string[],
): Promise<AdminQuestionChoiceListData> {
  const envelope = await adminApiClient.put<AdminQuestionChoiceListData>(
    `/curriculum/questions/${encodeURIComponent(questionId)}/choices/reorder`,
    decodeQuestionChoiceListData,
    { headers: { authorization: `Bearer ${token}` }, body: { orderedChoiceIds } },
  );
  return envelope.data;
}
