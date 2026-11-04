export interface CourseTranslationRow {
  locale: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseTranslation {
  locale: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseTranslationsResponse {
  courseId: string;
  supportedLocales: string[];
  missingLocales: string[];
  translations: CourseTranslation[];
}

export interface UpsertCourseTranslationInput {
  title: string;
  description?: string | null;
}

export interface DeleteCourseTranslationResponse {
  courseId: string;
  locale: string;
  deleted: true;
}
