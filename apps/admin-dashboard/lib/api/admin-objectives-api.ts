// Phase 3 — P3-056
// Admin objectives API client.
//
// Scope: Curriculum & Content System — objectives only.
//
// Security rules:
// - Token is read server-side from the HTTP-only cookie; never exposed to the browser.
// - Admin dashboard is UX only — backend remains the authorization and status authority.
// - Publish/archive transitions are not implemented here; backend controls status.

import { adminApiClient } from './index';

export type ObjectiveStatus = 'draft' | 'published' | 'archived';

export type AdminObjectiveSummary = {
  readonly id: string;
  readonly key: string | null;
  readonly title: string;
  readonly description: string | null;
  readonly status: ObjectiveStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminObjectiveListData = {
  readonly objectives: AdminObjectiveSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export type CreateObjectivePayload = {
  readonly title: string;
  readonly key?: string | null;
  readonly description?: string | null;
};

export type UpdateObjectivePayload = {
  readonly title?: string;
  readonly key?: string | null;
  readonly description?: string | null;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeObjectiveSummary(value: unknown): AdminObjectiveSummary {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    throw new Error('Invalid objective response shape.');
  }
  return {
    id: value.id,
    key: typeof value.key === 'string' ? value.key : null,
    title: value.title,
    description: typeof value.description === 'string' ? value.description : null,
    status: (value.status ?? 'draft') as ObjectiveStatus,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeObjectiveListData(value: unknown): AdminObjectiveListData {
  if (!isObject(value) || !Array.isArray(value.objectives)) {
    throw new Error('Invalid objective list response shape.');
  }
  return {
    objectives: value.objectives.map(decodeObjectiveSummary),
    total: typeof value.total === 'number' ? value.total : 0,
    page: typeof value.page === 'number' ? value.page : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

export async function fetchAdminObjectives(
  token: string,
  page = 1,
  limit = 20,
  status?: ObjectiveStatus,
): Promise<AdminObjectiveListData> {
  const envelope = await adminApiClient.get<AdminObjectiveListData>(
    '/curriculum/objectives',
    decodeObjectiveListData,
    {
      headers: { authorization: `Bearer ${token}` },
      query: { page, limit, ...(status ? { status } : {}) },
    },
  );
  return envelope.data;
}

export async function createAdminObjective(
  token: string,
  payload: CreateObjectivePayload,
): Promise<AdminObjectiveSummary> {
  const envelope = await adminApiClient.post<AdminObjectiveSummary>(
    '/curriculum/objectives',
    decodeObjectiveSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

export async function updateAdminObjective(
  token: string,
  id: string,
  payload: UpdateObjectivePayload,
): Promise<AdminObjectiveSummary> {
  const envelope = await adminApiClient.patch<AdminObjectiveSummary>(
    `/curriculum/objectives/${encodeURIComponent(id)}`,
    decodeObjectiveSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}
