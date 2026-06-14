import { CurriculumContentStatus } from '../courses/courses.types';

export const SKILL_DOMAINS = [
  'grammar',
  'vocabulary',
  'reading',
  'listening',
  'speaking',
  'writing',
  'pronunciation',
  'functional_language',
] as const;

export type SkillDomain = (typeof SKILL_DOMAINS)[number];

export const SKILL_KEY_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export interface SkillRow {
  id: string;
  key: string;
  title: string;
  description: string | null;
  domain: SkillDomain;
  parent_skill_id: string | null;
  status: CurriculumContentStatus;
  created_at: string;
  updated_at: string;
}

export interface SkillSummary {
  id: string;
  key: string;
  title: string;
  description: string | null;
  domain: SkillDomain;
  parentSkillId: string | null;
  status: CurriculumContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SkillListResponse {
  skills: SkillSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateSkillInput {
  key: string;
  title: string;
  description?: string | null;
  domain: SkillDomain;
  parentSkillId?: string | null;
}

export interface UpdateSkillInput {
  title?: string;
  description?: string | null;
}
