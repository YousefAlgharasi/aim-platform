import {
  CURRICULUM_CONTENT_STATUSES,
  CurriculumContentStatus,
} from '../courses/courses.types';

export { CURRICULUM_CONTENT_STATUSES, CurriculumContentStatus };

export interface ChapterRow {
  id: string;
  level_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  sort_order: number;
  status: CurriculumContentStatus;
  created_at: string;
  updated_at: string;
}

export interface ChapterSummary {
  id: string;
  levelId: string;
  title: string;
  slug: string | null;
  description: string | null;
  status: CurriculumContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterListResponse {
  chapters: ChapterSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateChapterInput {
  levelId: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface UpdateChapterInput {
  title?: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
}
