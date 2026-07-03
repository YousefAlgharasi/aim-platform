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

export interface StudentLessonsResponse {
  readonly lessons: StudentLessonSummary[];
}
