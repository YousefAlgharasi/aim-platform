// Phase 3 — P3-058
// Admin skills API client for the lesson-skill linker skill picker.
//
// Critical rule: Always use stable skill keys (e.g. grammar.past_simple.forms)
// as identifiers — never display labels.

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

export type AdminSkillSummary = {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly domain: SkillDomain;
  readonly status: string;
};

export type AdminSkillListData = {
  readonly skills: AdminSkillSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
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
    status: String(value.status ?? 'draft'),
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
    limit: typeof value.limit === 'number' ? value.limit : 100,
  };
}

export async function fetchAdminSkillsForPicker(
  token: string,
  page = 1,
  limit = 100,
): Promise<AdminSkillListData> {
  const envelope = await adminApiClient.get<AdminSkillListData>(
    '/curriculum/skills',
    decodeSkillListData,
    {
      headers: { authorization: `Bearer ${token}` },
      query: { page, limit, status: 'published' },
    },
  );
  return envelope.data;
}
