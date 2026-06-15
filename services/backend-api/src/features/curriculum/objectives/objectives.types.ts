import { CurriculumContentStatus, CURRICULUM_CONTENT_STATUSES } from '../courses/courses.types';

export const OBJECTIVE_KEY_PATTERN = /^[a-z0-9_]+(\.[a-z0-9_]+)*$/;

export interface ObjectiveRow {
  id: string;
  key: string | null;
  title: string;
  description: string | null;
  status: CurriculumContentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ObjectiveSkillRow {
  objective_id: string;
  skill_id: string;
}

export interface ObjectiveSummary {
  id: string;
  key: string | null;
  title: string;
  description: string | null;
  linkedSkillIds: string[];
  status: CurriculumContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ObjectiveListResponse {
  objectives: (Omit<ObjectiveSummary, 'description' | 'linkedSkillIds'> & { linkedSkillCount: number })[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateObjectiveInput {
  key?: string | null;
  title: string;
  description?: string | null;
  linkedSkillIds?: string[];
}

export interface UpdateObjectiveInput {
  key?: string | null;
  title?: string;
  description?: string | null;
  linkedSkillIds?: string[];
  status?: CurriculumContentStatus;
}
