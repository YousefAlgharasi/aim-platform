// Phase 3 — P3-055
// Admin lessons API client.
//
// Scope: Curriculum & Content System — lessons only.
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - Admin dashboard is UX only — backend remains the authorization and status authority.
// - Publish/archive transitions are not implemented here; backend controls status.
// - Lesson-to-skill linking is managed by a dedicated lesson-skills UI/API
//   (P3-058) and is not part of this client. The critical "every published
//   lesson must be linked to at least one skill" rule is enforced by the
//   backend lesson-skills and content-status APIs, not by this admin page.

import { adminApiClient } from './index';

export type LessonStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export type AdminLessonSummary = {
  readonly id: string;
  readonly chapterId: string;
  readonly title: string;
  readonly description: string;
  readonly status: LessonStatus;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminLessonListData = {
  readonly lessons: AdminLessonSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export type CreateLessonPayload = {
  readonly title: string;
  readonly description: string;
  readonly sortOrder?: number | null;
};

export type UpdateLessonPayload = {
  readonly title?: string;
  readonly description?: string;
  readonly sortOrder?: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeLessonSummary(value: unknown): AdminLessonSummary {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    throw new Error('Invalid lesson response shape.');
  }
  return {
    id: value.id,
    chapterId: typeof value.chapterId === 'string' ? value.chapterId : '',
    title: value.title,
    description: typeof value.description === 'string' ? value.description : '',
    status: (value.status ?? 'draft') as LessonStatus,
    sortOrder: typeof value.sortOrder === 'number' ? value.sortOrder : 0,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeLessonListData(value: unknown): AdminLessonListData {
  if (!isObject(value) || !Array.isArray(value.lessons)) {
    throw new Error('Invalid lesson list response shape.');
  }
  return {
    lessons: value.lessons.map(decodeLessonSummary),
    total: typeof value.total === 'number' ? value.total : 0,
    page: typeof value.page === 'number' ? value.page : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

export type FetchAdminLessonsOptions = {
  readonly token: string;
  readonly chapterId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly status?: LessonStatus;
  readonly q?: string;
};

export async function fetchAdminLessons(
  tokenOrOptions: string | FetchAdminLessonsOptions,
  chapterId?: string,
  page = 1,
  limit = 20,
  status?: LessonStatus,
): Promise<AdminLessonListData> {
  const opts: FetchAdminLessonsOptions =
    typeof tokenOrOptions === 'string'
      ? { token: tokenOrOptions, chapterId: chapterId!, page, limit, status }
      : tokenOrOptions;

  const envelope = await adminApiClient.get<AdminLessonListData>(
    '/curriculum/lessons',
    decodeLessonListData,
    {
      headers: { authorization: `Bearer ${opts.token}` },
      query: {
        chapterId: opts.chapterId,
        page: opts.page ?? 1,
        limit: opts.limit ?? 20,
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.q ? { q: opts.q } : {}),
      },
    },
  );
  return envelope.data;
}

export async function createAdminLesson(
  token: string,
  chapterId: string,
  payload: CreateLessonPayload,
): Promise<AdminLessonSummary> {
  const envelope = await adminApiClient.post<AdminLessonSummary>(
    '/curriculum/lessons',
    decodeLessonSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: { chapterId, ...payload },
    },
  );
  return envelope.data;
}

export async function updateAdminLesson(
  token: string,
  lessonId: string,
  payload: UpdateLessonPayload,
): Promise<AdminLessonSummary> {
  const envelope = await adminApiClient.patch<AdminLessonSummary>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}`,
    decodeLessonSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}
