// Phase 3 — P3-053
// Admin levels API client.
//
// Scope: Curriculum & Content System — levels only.
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - Admin dashboard is UX only — backend remains the authorization and status authority.
// - Publish/archive transitions are not implemented here; backend controls status.

import { adminApiClient } from './index';

export type LevelStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export type AdminLevelSummary = {
  readonly id: string;
  readonly courseId: string;
  readonly title: string;
  readonly code: string | null;
  readonly slug: string | null;
  readonly description: string | null;
  readonly status: LevelStatus;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminLevelListData = {
  readonly levels: AdminLevelSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export type CreateLevelPayload = {
  readonly title: string;
  readonly code?: string | null;
  readonly slug?: string | null;
  readonly description?: string | null;
  readonly sortOrder?: number | null;
};

export type UpdateLevelPayload = {
  readonly title?: string;
  readonly code?: string | null;
  readonly slug?: string | null;
  readonly description?: string | null;
  readonly sortOrder?: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeLevelSummary(value: unknown): AdminLevelSummary {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    throw new Error('Invalid level response shape.');
  }
  return {
    id: value.id,
    courseId: typeof value.courseId === 'string' ? value.courseId : '',
    title: value.title,
    code: typeof value.code === 'string' ? value.code : null,
    slug: typeof value.slug === 'string' ? value.slug : null,
    description: typeof value.description === 'string' ? value.description : null,
    status: (value.status ?? 'draft') as LevelStatus,
    sortOrder: typeof value.sortOrder === 'number' ? value.sortOrder : 0,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeLevelListData(value: unknown): AdminLevelListData {
  if (!isObject(value) || !Array.isArray(value.levels)) {
    throw new Error('Invalid level list response shape.');
  }
  return {
    levels: value.levels.map(decodeLevelSummary),
    total: typeof value.total === 'number' ? value.total : 0,
    page: typeof value.page === 'number' ? value.page : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

export async function fetchAdminLevels(
  token: string,
  courseId: string,
  page = 1,
  limit = 20,
  status?: LevelStatus,
): Promise<AdminLevelListData> {
  const envelope = await adminApiClient.get<AdminLevelListData>(
    `/curriculum/courses/${encodeURIComponent(courseId)}/levels`,
    decodeLevelListData,
    {
      headers: { authorization: `Bearer ${token}` },
      query: { page, limit, ...(status ? { status } : {}) },
    },
  );
  return envelope.data;
}

export async function createAdminLevel(
  token: string,
  courseId: string,
  payload: CreateLevelPayload,
): Promise<AdminLevelSummary> {
  const envelope = await adminApiClient.post<AdminLevelSummary>(
    `/curriculum/courses/${encodeURIComponent(courseId)}/levels`,
    decodeLevelSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

export async function updateAdminLevel(
  token: string,
  courseId: string,
  levelId: string,
  payload: UpdateLevelPayload,
): Promise<AdminLevelSummary> {
  const envelope = await adminApiClient.patch<AdminLevelSummary>(
    `/curriculum/courses/${encodeURIComponent(courseId)}/levels/${encodeURIComponent(levelId)}`,
    decodeLevelSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}
