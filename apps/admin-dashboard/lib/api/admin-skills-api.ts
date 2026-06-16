import { adminApiClient } from './index';

export type SkillDomain =
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'pronunciation'
  | 'functional_language';

export type SkillStatus = 'draft' | 'published' | 'archived';

export type AdminSkillSummary = {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly domain: SkillDomain;
  readonly status: SkillStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type AdminSkillListData = {
  readonly skills: AdminSkillSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export type CreateSkillPayload = {
  readonly key: string;
  readonly title: string;
  readonly domain: SkillDomain;
};

export type UpdateSkillPayload = {
  readonly title?: string;
  readonly domain?: SkillDomain;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeSkillSummary(value: unknown): AdminSkillSummary {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.key !== 'string') {
    throw new Error('Invalid skill response shape.');
  }
  return {
    id: value.id,
    key: value.key,
    title: typeof value.title === 'string' ? value.title : value.key,
    domain: (value.domain ?? 'grammar') as SkillDomain,
    status: (value.status ?? 'draft') as SkillStatus,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  };
}

function decodeSkillListData(value: unknown): AdminSkillListData {
  if (!isObject(value) || !Array.isArray(value.skills)) {
    throw new Error('Invalid skill list response shape.');
  }
  return {
    skills: value.skills.map(decodeSkillSummary),
    total: typeof value.total === 'number' ? value.total : 0,
    page: typeof value.page === 'number' ? value.page : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

export async function fetchAdminSkills(
  token: string,
  page = 1,
  limit = 20,
  status?: SkillStatus,
): Promise<AdminSkillListData> {
  const envelope = await adminApiClient.get<AdminSkillListData>(
    '/curriculum/skills',
    decodeSkillListData,
    {
      headers: { authorization: `Bearer ${token}` },
      query: { page, limit, ...(status ? { status } : {}) },
    },
  );
  return envelope.data;
}

export async function fetchAdminSkillsForPicker(
  token: string,
  page = 1,
  limit = 100,
): Promise<AdminSkillListData> {
  return fetchAdminSkills(token, page, limit, 'published');
}

export async function createAdminSkill(
  token: string,
  payload: CreateSkillPayload,
): Promise<AdminSkillSummary> {
  const envelope = await adminApiClient.post<AdminSkillSummary>(
    '/curriculum/skills',
    decodeSkillSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}

export async function updateAdminSkill(
  token: string,
  id: string,
  payload: UpdateSkillPayload,
): Promise<AdminSkillSummary> {
  const envelope = await adminApiClient.patch<AdminSkillSummary>(
    `/curriculum/skills/${encodeURIComponent(id)}`,
    decodeSkillSummary,
    {
      headers: { authorization: `Bearer ${token}` },
      body: payload,
    },
  );
  return envelope.data;
}
