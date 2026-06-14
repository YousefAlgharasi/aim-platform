export type CurriculumContentStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'archived';

export const CURRICULUM_CONTENT_STATUSES: readonly CurriculumContentStatus[] = [
  'draft',
  'in_review',
  'approved',
  'published',
  'archived',
];

export interface CourseRow {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  sort_order: number;
  status: CurriculumContentStatus;
  created_at: string;
  updated_at: string;
}

export interface CourseSummary {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  status: CurriculumContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseListResponse {
  courses: CourseSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCourseInput {
  title: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface UpdateCourseInput {
  title?: string;
  slug?: string | null;
  description?: string | null;
  sortOrder?: number;
}
