// Phase 3 — P3-052
// Admin courses API client.
//
// Scope: Curriculum & Content System — courses only.
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - Admin dashboard is UX only — backend remains the authorization and status authority.
// - Publish/archive transitions are not implemented here; backend controls status.

import { adminApiClient } from './index';

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

export async function fetchAdminCourses(
  token: string,
  page = 1,
  limit = 20,
  status?: CourseStatus,
): Promise<AdminCourseListData> {
  const envelope = await adminApiClient.get<AdminCourseListData>(
    '/curriculum/courses',
    decodeCourseListData,
    {
      headers: { authorization: `Bearer ${token}` },
      query: { page, limit, ...(status ? { status } : {}) },
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
