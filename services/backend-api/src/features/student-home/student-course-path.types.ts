import type { StudentChapterSummary, StudentFinalExamSummary } from '../student-chapters/student-chapters.types';
import type { ChapterQuizSummary, StudentLessonSummary } from '../student-lessons/student-lessons.types';

export interface StudentCoursePathLevel {
  readonly levelId: string;
  readonly title: string;
  readonly code: string | null;
  readonly sortOrder: number;
  readonly chapters: StudentChapterSummary[];
}

/** The chapter a student should work on next, with its lessons and quiz. */
export interface StudentCoursePathActiveChapter {
  readonly chapterId: string;
  /** 1-based position among the course's chapters across all levels. */
  readonly chapterNumber: number;
  readonly lessons: StudentLessonSummary[];
  readonly quiz: ChapterQuizSummary | null;
}

/**
 * A course's learning path in one response: every published level with its
 * chapters (backend-computed progress/status), the course's final exam, and
 * the active chapter with its lessons. Replaces the levels -> chapters ->
 * lessons chain of requests. Chapter status, lock state and the active-chapter
 * choice are all decided here; clients render them.
 */
export interface StudentCoursePathResponse {
  readonly levels: StudentCoursePathLevel[];
  /** Null when the course has no published final exam. */
  readonly finalExam: StudentFinalExamSummary | null;
  /** Null when every chapter is completed (or the course has no chapters). */
  readonly activeChapter: StudentCoursePathActiveChapter | null;
}
