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

  /** Count of published quiz assessments linked to this chapter (assessments.chapter_id). */
  readonly quizCount: number;

  /**
   * Backend-computed: round(completed items / total items * 100), where
   * items = lessons + this chapter's quiz(zes). 0 when there are no items.
   */
  readonly percent: number;

  /**
   * Backend-computed: 'completed' requires every lesson done AND every
   * chapter quiz passed (assessment_results.passed) — not lessons alone.
   * Never derived client-side.
   */
  readonly status: StudentChapterStatus;
}

/** The course's final exam, gated behind every chapter being fully complete. */
export interface StudentFinalExamSummary {
  readonly assessmentId: string;
  readonly title: string;

  /** True once every chapter in the course is fully complete (lessons + quizzes passed). */
  readonly unlocked: boolean;
}

export interface StudentChaptersResponse {
  readonly chapters: StudentChapterSummary[];

  /** Null when the course has no published final exam. */
  readonly finalExam: StudentFinalExamSummary | null;
}
