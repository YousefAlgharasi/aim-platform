// P11-026: Admin lesson content blocks API client.
// Backend is final authority for lesson content blocks.

import { adminApiClient } from './index';

export type ContentBlockType = 'text' | 'image' | 'video' | 'audio' | 'exercise' | 'vocabulary';

export type AdminContentBlock = {
  readonly id: string;
  readonly lessonId: string;
  readonly type: ContentBlockType;
  readonly title: string;
  readonly content: string;
  readonly sortOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminContentBlockListData = {
  readonly blocks: AdminContentBlock[];
  readonly total: number;
};

export type CreateContentBlockPayload = {
  readonly type: ContentBlockType;
  readonly title: string;
  readonly content: string;
  readonly sortOrder?: number;
};

export type UpdateContentBlockPayload = {
  readonly title?: string;
  readonly content?: string;
  readonly sortOrder?: number;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeContentBlock(value: unknown): AdminContentBlock {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid content block response shape.');
  }
  return {
    id: value.id,
    lessonId: typeof value.lessonId === 'string' ? value.lessonId : '',
    type: (value.type ?? 'text') as ContentBlockType,
    title: typeof value.title === 'string' ? value.title : '',
    content: typeof value.content === 'string' ? value.content : '',
    sortOrder: typeof value.sortOrder === 'number' ? value.sortOrder : 0,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeContentBlockList(value: unknown): AdminContentBlockListData {
  if (!isObject(value) || !Array.isArray(value.blocks)) {
    throw new Error('Invalid content block list response shape.');
  }
  return {
    blocks: value.blocks.map(decodeContentBlock),
    total: typeof value.total === 'number' ? value.total : 0,
  };
}

export async function fetchLessonContentBlocks(
  token: string,
  lessonId: string,
): Promise<AdminContentBlockListData> {
  const envelope = await adminApiClient.get<AdminContentBlockListData>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}/content-blocks`,
    decodeContentBlockList,
    {
      headers: { authorization: `Bearer ${token}` },
    },
  );
  return envelope.data;
}

export async function createLessonContentBlock(
  token: string,
  lessonId: string,
  payload: CreateContentBlockPayload,
): Promise<AdminContentBlock> {
  const envelope = await adminApiClient.post<AdminContentBlock>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}/content-blocks`,
    decodeContentBlock,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

export async function updateLessonContentBlock(
  token: string,
  lessonId: string,
  blockId: string,
  payload: UpdateContentBlockPayload,
): Promise<AdminContentBlock> {
  const envelope = await adminApiClient.patch<AdminContentBlock>(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}/content-blocks/${encodeURIComponent(blockId)}`,
    decodeContentBlock,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

export async function deleteLessonContentBlock(
  token: string,
  lessonId: string,
  blockId: string,
): Promise<void> {
  await adminApiClient.delete(
    `/curriculum/lessons/${encodeURIComponent(lessonId)}/content-blocks/${encodeURIComponent(blockId)}`,
    (v) => v as Record<string, unknown>,
    {
      headers: { authorization: `Bearer ${token}` },
    },
  );
}
