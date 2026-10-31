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

export type CourseTranslationEntry = {
  readonly locale: string;
  readonly title: string;
  readonly description: string | null;
};

export type CourseTranslationsData = {
  readonly courseId: string;
  readonly supportedLocales: readonly string[];
  readonly missingLocales: readonly string[];
  readonly translations: readonly CourseTranslationEntry[];
};

export type CourseTranslationInput = {
  readonly title: string;
  readonly description: string | null;
};

function decodeTranslationEntry(value: unknown): CourseTranslationEntry {
  if (!isObject(value) || typeof value.locale !== 'string' || typeof value.title !== 'string') {
    throw new Error('Invalid course translation response shape.');
  }
  return {
    locale: value.locale,
    title: value.title,
    description: typeof value.description === 'string' ? value.description : null,
  };
}

function decodeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function decodeCourseTranslations(value: unknown): CourseTranslationsData {
  if (!isObject(value) || typeof value.courseId !== 'string' || !Array.isArray(value.translations)) {
    throw new Error('Invalid course translations response shape.');
  }
  return {
    courseId: value.courseId,
    supportedLocales: decodeStringArray(value.supportedLocales),
    missingLocales: decodeStringArray(value.missingLocales),
    translations: value.translations.map(decodeTranslationEntry),
  };
}

function decodeDeletedTranslation(value: unknown): { readonly locale: string } {
  if (!isObject(value) || typeof value.locale !== 'string') {
    throw new Error('Invalid course translation delete response shape.');
  }
  return { locale: value.locale };
}

function translationsPath(courseId: string, locale?: string): string {
  const base = `/curriculum/courses/${encodeURIComponent(courseId)}/translations`;
  return locale ? `${base}/${encodeURIComponent(locale)}` : base;
}

export async function fetchCourseTranslations(
  token: string,
  courseId: string,
): Promise<CourseTranslationsData> {
  const envelope = await adminApiClient.get<CourseTranslationsData>(
    translationsPath(courseId),
    decodeCourseTranslations,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export async function saveCourseTranslation(
  token: string,
  courseId: string,
  locale: string,
  payload: CourseTranslationInput,
): Promise<CourseTranslationEntry> {
  const envelope = await adminApiClient.put<CourseTranslationEntry>(
    translationsPath(courseId, locale),
    decodeTranslationEntry,
    { headers: { authorization: `Bearer ${token}` }, body: payload },
  );
  return envelope.data;
}

export async function deleteCourseTranslation(
  token: string,
  courseId: string,
  locale: string,
): Promise<void> {
  await adminApiClient.delete<{ readonly locale: string }>(
    translationsPath(courseId, locale),
    decodeDeletedTranslation,
    { headers: { authorization: `Bearer ${token}` } },
  );
}

export type SaveTranslationsResult = {
  readonly failures: readonly { readonly locale: string; readonly message: string }[];
};

export async function saveCourseTranslations(
  token: string,
  courseId: string,
  translations: Readonly<Record<string, CourseTranslationInput>>,
): Promise<SaveTranslationsResult> {
  const failures: { locale: string; message: string }[] = [];
  for (const [locale, payload] of Object.entries(translations)) {
    try {
      await saveCourseTranslation(token, courseId, locale, payload);
    } catch (err) {
      failures.push({ locale, message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
  return { failures };
}
