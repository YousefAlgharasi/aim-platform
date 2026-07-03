export type StudentChapterStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudentChapterSummary {
  readonly chapterId: string;
  readonly title: string;
  readonly description: string | null;

  /** Code of the chapter's parent level (e.g. 'A1', 'B1'), or null if the level has no code. */
  readonly levelCode: string | null;

  /** Count of published lessons under this chapter. */
  readonly lessonCount: number;

  /** Count of those lessons the student has completed (lesson_progress.completed = true). */
  readonly completedLessonCount: number;

  /** Backend-computed: round(completedLessonCount / lessonCount * 100), 0 when lessonCount is 0. */
  readonly percent: number;

  /** Backend-computed from completedLessonCount vs lessonCount. Never derived client-side. */
  readonly status: StudentChapterStatus;
}

export interface StudentChaptersResponse {
  readonly chapters: StudentChapterSummary[];
}
