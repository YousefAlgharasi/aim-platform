import { CurriculumContentStatus } from '../courses/courses.types';

export interface LevelRow {
  id: string;
  course_id: string;
  title: string;
  code: string | null;
  slug: string | null;
  description: string | null;
  sort_order: number;
  status: CurriculumContentStatus;
  created_at: string;
  updated_at: string;
}

export interface LevelSummary {
  id: string;
  courseId: string;
  title: string;
  code: string | null;
  slug: string | null;
  description: string | null;
  status: CurriculumContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LevelListResponse {
  levels: LevelSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLevelInput {
  courseId: string;
  title: string;
  code?: string | null;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface UpdateLevelInput {
  title?: string;
  code?: string | null;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
}
