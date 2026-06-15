// Phase 3 — P3-055
// Admin chapters API client.
//
// Scope: Curriculum & Content System — chapters, read/create access needed
// only to support the chapter selector on the Admin Lessons page.
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - Admin dashboard is UX only — backend remains the authorization and status authority.
// - Publish/archive transitions are not implemented here; backend controls status.

import { adminApiClient } from './index';

export type ChapterStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export type AdminChapterSummary = {
  readonly id: string;
  readonly levelId: string;
  readonly title: string;
  readonly slug: string | null;
  readonly description: string | null;
  readonly status: ChapterStatus;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminChapterListData = {
  readonly chapters: AdminChapterSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeChapterSummary(value: unknown): AdminChapterSummary {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    throw new Error('Invalid chapter response shape.');
  }
  return {
    id: value.id,
    levelId: typeof value.levelId === 'string' ? value.levelId : '',
    title: value.title,
    slug: typeof value.slug === 'string' ? value.slug : null,
    description: typeof value.description === 'string' ? value.description : null,
    status: (value.status ?? 'draft') as ChapterStatus,
    sortOrder: typeof value.sortOrder === 'number' ? value.sortOrder : 0,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeChapterListData(value: unknown): AdminChapterListData {
  if (!isObject(value) || !Array.isArray(value.chapters)) {
    throw new Error('Invalid chapter list response shape.');
  }
  return {
    chapters: value.chapters.map(decodeChapterSummary),
    total: typeof value.total === 'number' ? value.total : 0,
    page: typeof value.page === 'number' ? value.page : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

export async function fetchAdminChapters(
  token: string,
  levelId: string,
  page = 1,
  limit = 100,
  status?: ChapterStatus,
): Promise<AdminChapterListData> {
  const envelope = await adminApiClient.get<AdminChapterListData>(
    '/curriculum/chapters',
    decodeChapterListData,
    {
      headers: { authorization: `Bearer ${token}` },
      query: { levelId, page, limit, ...(status ? { status } : {}) },
    },
  );
  return envelope.data;
}
