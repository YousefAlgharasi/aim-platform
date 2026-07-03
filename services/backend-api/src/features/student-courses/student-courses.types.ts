export type StudentCourseStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudentCourseSummary {
  readonly courseId: string;
  readonly title: string;
  readonly description: string | null;

  /** Representative level code for the course (e.g. 'A1', 'B1'), or null if the course has no published level. */
  readonly levelCode: string | null;

  /** Count of published lessons under the course's published levels/chapters. */
  readonly lessonCount: number;

  /** Count of those lessons the student has completed (lesson_progress.completed = true). */
  readonly completedLessonCount: number;

  /** Backend-computed: round(completedLessonCount / lessonCount * 100), 0 when lessonCount is 0. */
  readonly percent: number;

  /** Backend-computed from completedLessonCount vs lessonCount. Never derived client-side. */
  readonly status: StudentCourseStatus;

  /**
   * True when the course's cefr_rank exceeds the student's max_unlocked_cefr_rank
   * for its track (courses with no track_slug/cefr_rank mapping are never locked).
   * Backend-computed; the client must not infer this from anything else.
   */
  readonly locked: boolean;
}

export interface StudentCoursesResponse {
  readonly courses: StudentCourseSummary[];
}
