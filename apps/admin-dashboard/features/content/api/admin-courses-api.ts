// Phase 3 — P3-052
// Admin courses API client.
//
// Scope: Curriculum & Content System — courses only.
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - Admin dashboard is UX only — backend remains the authorization and status authority.
// - Publish/archive transitions are not implemented here; backend controls status.

import { adminApiClient } from '../../../core/api';

export type CourseStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export type AdminCourseSummary = {
  readonly id: string;
  readonly slug: string | null;
  readonly title: string;
  readonly description: string | null;
  readonly status: CourseStatus;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly availableLocales?: readonly string[];
};

export type AdminCourseListData = {
  readonly courses: AdminCourseSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export type CreateCoursePayload = {
  readonly title: string;
  readonly slug?: string | null;
  readonly description?: string | null;
  readonly sortOrder?: number | null;
};

export type UpdateCoursePayload = {
  readonly title?: string;
  readonly slug?: string | null;
  readonly description?: string | null;
  readonly sortOrder?: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeCourseSummary(value: unknown): AdminCourseSummary {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    throw new Error('Invalid course response shape.');
  }
  return {
    id: value.id,
    slug: typeof value.slug === 'string' ? value.slug : null,
    title: value.title,
    description: typeof value.description === 'string' ? value.description : null,
    status: (value.status ?? 'draft') as CourseStatus,
    sortOrder: typeof value.sortOrder === 'number' ? value.sortOrder : 0,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
    availableLocales: Array.isArray(value.availableLocales)
      ? value.availableLocales.filter((l): l is string => typeof l === 'string')
      : [],
  };
}

function decodeCourseListData(value: unknown): AdminCourseListData {
  if (!isObject(value) || !Array.isArray(value.courses)) {
    throw new Error('Invalid course list response shape.');
  }
  return {
    courses: value.courses.map(decodeCourseSummary),
    total: typeof value.total === 'number' ? value.total : 0,
    page: typeof value.page === 'number' ? value.page : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

export type FetchAdminCoursesOptions = {
  readonly token: string;
  readonly page?: number;
  readonly limit?: number;
  readonly status?: CourseStatus;
  readonly q?: string;
};

export async function fetchAdminCourses(
  tokenOrOptions: string | FetchAdminCoursesOptions,
  page = 1,
  limit = 20,
  status?: CourseStatus,
): Promise<AdminCourseListData> {
  const opts: FetchAdminCoursesOptions =
    typeof tokenOrOptions === 'string'
      ? { token: tokenOrOptions, page, limit, status }
      : tokenOrOptions;

  const envelope = await adminApiClient.get<AdminCourseListData>(
    '/curriculum/courses',
    decodeCourseListData,
    {
      headers: { authorization: `Bearer ${opts.token}` },
      query: {
        page: opts.page ?? 1,
        limit: opts.limit ?? 20,
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.q ? { q: opts.q } : {}),
      },
    },
  );
  return envelope.data;
}

export async function createAdminCourse(
  token: string,
  payload: CreateCoursePayload,
): Promise<AdminCourseSummary> {
  const envelope = await adminApiClient.post<AdminCourseSummary>(
    '/curriculum/courses',
    decodeCourseSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

export async function updateAdminCourse(
  token: string,
  id: string,
  payload: UpdateCoursePayload,
): Promise<AdminCourseSummary> {
  const envelope = await adminApiClient.patch<AdminCourseSummary>(
    `/curriculum/courses/${encodeURIComponent(id)}`,
    decodeCourseSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

import {
  deleteTranslation,
  fetchTranslations,
  saveTranslation,
  saveTranslations,
  type SaveTranslationsResult,
  type TranslationEntry,
  type TranslationInput,
} from './admin-translations-api';

export type CourseTranslationEntry = TranslationEntry;

export type CourseTranslationsData = {
  readonly courseId: string;
  readonly supportedLocales: readonly string[];
  readonly missingLocales: readonly string[];
  readonly translations: readonly CourseTranslationEntry[];
};

export type CourseTranslationInput = TranslationInput;

export async function fetchCourseTranslations(
  token: string,
  courseId: string,
): Promise<CourseTranslationsData> {
  const { entityId, ...rest } = await fetchTranslations('courses', token, courseId);
  return { courseId: entityId, ...rest };
}

export function saveCourseTranslation(
  token: string,
  courseId: string,
  locale: string,
  payload: CourseTranslationInput,
): Promise<CourseTranslationEntry> {
  return saveTranslation('courses', token, courseId, locale, payload);
}

export function deleteCourseTranslation(token: string, courseId: string, locale: string): Promise<void> {
  return deleteTranslation('courses', token, courseId, locale);
}

export function saveCourseTranslations(
  token: string,
  courseId: string,
  translations: Readonly<Record<string, CourseTranslationInput>>,
): Promise<SaveTranslationsResult> {
  return saveTranslations('courses', token, courseId, translations);
}
