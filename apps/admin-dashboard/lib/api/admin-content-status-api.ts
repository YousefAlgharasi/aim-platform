// Phase 3 — P3-060
// Admin content status workflow API client.
//
// Calls backend-owned status transition endpoints.
// Backend is the sole authority for status transitions — this client
// does not implement any transition logic itself.
//
// Endpoint conventions (per curriculum-api-map.md):
//   POST /curriculum/:entityType/:entityId/publish
//   POST /curriculum/:entityType/:entityId/archive
//   POST /curriculum/:entityType/:entityId/restore
//
// Permission guards enforced on backend:
//   publish  → curriculum.content.publish
//   archive  → curriculum.content.archive
//   restore  → curriculum.content.restore  (SUPER_ADMIN only)

import { adminApiClient } from './index';

export type ContentEntityType =
  | 'courses'
  | 'levels'
  | 'chapters'
  | 'lessons'
  | 'skills'
  | 'objectives'
  | 'questions';

export type ContentStatus = 'draft' | 'published' | 'archived';

export type StatusTransitionResult = {
  readonly id: string;
  readonly status: ContentStatus;
};

export type AllowedTransition = {
  readonly action: 'publish' | 'archive' | 'restore';
  readonly label: string;
  readonly targetStatus: ContentStatus;
  readonly permissionRequired: string;
  readonly superAdminOnly: boolean;
};

export const ALLOWED_TRANSITIONS: Record<ContentStatus, AllowedTransition[]> = {
  draft: [
    {
      action: 'publish',
      label: 'Publish',
      targetStatus: 'published',
      permissionRequired: 'curriculum.content.publish',
      superAdminOnly: false,
    },
    {
      action: 'archive',
      label: 'Archive',
      targetStatus: 'archived',
      permissionRequired: 'curriculum.content.archive',
      superAdminOnly: false,
    },
  ],
  published: [
    {
      action: 'archive',
      label: 'Archive',
      targetStatus: 'archived',
      permissionRequired: 'curriculum.content.archive',
      superAdminOnly: false,
    },
  ],
  archived: [
    {
      action: 'restore',
      label: 'Restore to Draft',
      targetStatus: 'draft',
      permissionRequired: 'curriculum.content.restore',
      superAdminOnly: true,
    },
  ],
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeTransitionResult(value: unknown): StatusTransitionResult {
  if (!isObject(value) || typeof value.id !== 'string') {
    throw new Error('Invalid status transition response shape.');
  }
  return {
    id: value.id,
    status: (value.status ?? 'draft') as ContentStatus,
  };
}

async function postTransition(
  token: string,
  entityType: ContentEntityType,
  entityId: string,
  action: 'publish' | 'archive' | 'restore',
): Promise<StatusTransitionResult> {
  const path = entityType === 'questions'
    ? `/curriculum/question-bank/questions/${encodeURIComponent(entityId)}/${action}`
    : `/curriculum/${entityType}/${encodeURIComponent(entityId)}/${action}`;

  const envelope = await adminApiClient.post<StatusTransitionResult>(
    path,
    decodeTransitionResult,
    { headers: { authorization: `Bearer ${token}` }, body: {} },
  );
  return envelope.data;
}

export async function publishContent(
  token: string,
  entityType: ContentEntityType,
  entityId: string,
): Promise<StatusTransitionResult> {
  return postTransition(token, entityType, entityId, 'publish');
}

export async function archiveContent(
  token: string,
  entityType: ContentEntityType,
  entityId: string,
): Promise<StatusTransitionResult> {
  return postTransition(token, entityType, entityId, 'archive');
}

export async function restoreContent(
  token: string,
  entityType: ContentEntityType,
  entityId: string,
): Promise<StatusTransitionResult> {
  return postTransition(token, entityType, entityId, 'restore');
}
