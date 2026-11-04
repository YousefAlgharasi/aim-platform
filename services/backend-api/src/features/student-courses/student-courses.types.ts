import { CourseAccessState, CoursePriceQuote } from '../course-billing/course-billing.types';

export type StudentCourseStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudentCourseSummary {
  readonly courseId: string;
  readonly title: string;
  readonly description: string | null;

  /** Language of the title and description actually served (English when the requested translation is missing). */
  readonly locale: string;

  /** Representative level code for the course (e.g. 'A1', 'B1'), or null if the course has no published level. */
  readonly levelCode: string | null;

  /** Count of published lessons under the course's published levels/chapters. */
  readonly lessonCount: number;

  /** Count of those lessons the student has completed (lesson_progress.completed = true). */
  readonly completedLessonCount: number;

  /** Count of published quiz assessments across the course's chapters. */
  readonly quizCount: number;

  /** Count of published final-exam assessments for the course (0 or 1). */
  readonly examCount: number;

  /**
   * Backend-computed: round(completed items / total items * 100), where
   * items = lessons + chapter quizzes + the final exam. 0 when there are no items.
   */
  readonly percent: number;

  /**
   * Backend-computed: 'completed' requires every lesson done, every chapter
   * quiz passed, AND the final exam passed (if the course has one) — not
   * lessons alone. Never derived client-side.
   */
  readonly status: StudentCourseStatus;

  /**
   * True when the course's cefr_rank exceeds the student's max_unlocked_cefr_rank
   * for its track (courses with no track_slug/cefr_rank mapping are never locked).
   * Backend-computed; the client must not infer this from anything else.
   */
  readonly locked: boolean;

  /**
   * The course the student is on: their active enrollment, or — with no
   * enrollment — the first unlocked course they haven't completed.
   * Exactly one course is current when any course is available.
   */
  readonly current: boolean;

  /**
   * Set once the current course is completed: the first unlocked,
   * not-yet-completed course after it in curriculum order. At most one.
   */
  readonly next: boolean;

  /** Backend price quote (free courses have isFree = true). */
  readonly price?: CoursePriceQuote;

  /** Whether the student may use the course and why (paid access, pending payment, …). */
  readonly access?: CourseAccessState;
}

export interface StudentCoursesResponse {
  readonly courses: StudentCourseSummary[];
}
