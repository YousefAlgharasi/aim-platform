export interface StudentLessonSummary {
  readonly id: string;
  readonly title: string;
  readonly description: string;

  /** Gamification points awarded on completion. Display-only — never read by the AIM Engine. */
  readonly xpValue: number;

  /** From lesson_progress.completed for this student; false if no row exists. */
  readonly completed: boolean;

  /**
   * True for exactly the first lesson (by sort_order) that is not completed;
   * false for every other lesson. Backend-computed — never derived client-side.
   */
  readonly current: boolean;
}

export interface ChapterQuizSummary {
  readonly assessmentId: string;
  readonly title: string;

  /** True when the student has a passing assessment_results row for this quiz. */
  readonly completed: boolean;

  /** True until every published lesson in the chapter is completed. */
  readonly locked: boolean;
}

export interface StudentLessonsResponse {
  readonly lessons: StudentLessonSummary[];

  /** The chapter's quiz, if it has one — null otherwise. */
  readonly quiz: ChapterQuizSummary | null;
}
