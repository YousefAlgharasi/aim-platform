import {
  CURRICULUM_CONTENT_STATUSES,
  CurriculumContentStatus,
} from '../courses/courses.types';

export { CURRICULUM_CONTENT_STATUSES, CurriculumContentStatus };

export interface LessonExplanationExample {
  text: string;
  note?: string;
}

export interface LessonExplanationSection {
  heading: string;
  /** Markdown. */
  body: string;
  examples?: LessonExplanationExample[];
}

export interface LessonExplanationMistake {
  wrong: string;
  right: string;
  why: string;
}

/** Student-facing teaching content for a lesson (lessons.explanation JSONB). */
export interface LessonExplanation {
  overview: string;
  sections: LessonExplanationSection[];
  keyPoints: string[];
  commonMistakes?: LessonExplanationMistake[];
  recap?: string;
}

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
  /** Optional admin-authored checklist of discrete points the AI Teacher must cover. */
  teaching_outline: string[] | null;
  explanation?: LessonExplanation | null;
  created_at: string;
  updated_at: string;
  locale: string;
  available_locales: string[];
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
  /** Optional admin-authored checklist of discrete points the AI Teacher must cover. */
  teachingOutline: string[] | null;
  /** Student-facing explanation of the lesson; null until written. */
  explanation?: LessonExplanation | null;
  createdAt: string;
  updatedAt: string;
  locale: string;
  availableLocales: string[];
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
  teachingOutline?: string[] | null;
  explanation?: LessonExplanation | null;
}
