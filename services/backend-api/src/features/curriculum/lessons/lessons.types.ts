import {
  CURRICULUM_CONTENT_STATUSES,
  CurriculumContentStatus,
} from '../courses/courses.types';

export { CURRICULUM_CONTENT_STATUSES, CurriculumContentStatus };

export interface LessonRow {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  sort_order: number;
  status: CurriculumContentStatus;
  xp_value: number;
  /** Optional admin-authored AI Teacher instructions specific to this lesson. */
  system_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonSummary {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  status: CurriculumContentStatus;
  sortOrder: number;
  /** Gamification points awarded on completion. Display-only — never read by the AIM Engine. */
  xpValue: number;
  /** Optional admin-authored AI Teacher instructions specific to this lesson. */
  systemPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonListResponse {
  lessons: LessonSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateLessonInput {
  chapterId: string;
  title: string;
  description: string;
  sortOrder?: number | null;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  sortOrder?: number;
  systemPrompt?: string | null;
}
