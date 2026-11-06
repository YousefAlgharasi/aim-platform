import type { StudentCourse } from './curriculumApi';

/** Used when the course list is not at hand (it should always be, so this is only a safe fallback). */
export const COURSE_LOCKED_MESSAGE = 'Finish the courses before this one to unlock it.';

type T = (key: string, params?: Record<string, string | number>) => string;

/**
 * Why a course is locked, in terms the student can act on. The path opens one course at a time: the highest open
 * course must be finished, and then each locked course before this one. `courses` is in path order.
 * One thing in the way → name it. Several → say how many and what to do next.
 */
export function lockedReason(course: Pick<StudentCourse, 'courseId'>, courses: StudentCourse[], t: T): string {
  const idx = courses.findIndex((c) => c.courseId === course.courseId);
  if (idx < 0) return t(COURSE_LOCKED_MESSAGE);
  const before = courses.slice(0, idx);
  const lockedBefore = before.filter((c) => c.locked).length;
  // The furthest open course is the one the student has to complete to move the path forward.
  const frontier = [...before].reverse().find((c) => !c.locked) ?? null;
  const frontierBlocks = !!frontier && frontier.status !== 'completed';
  const n = lockedBefore + (frontierBlocks ? 1 : 0);
  if (!frontier || n === 0) return t(COURSE_LOCKED_MESSAGE);
  return n === 1
    ? t('Finish {course} to unlock this course.', { course: frontier.title })
    : t('Courses to finish first: {n}. Next up: {course}.', { n, course: frontier.title });
}
