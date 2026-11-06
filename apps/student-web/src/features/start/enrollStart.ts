import { enrollInCourse, fetchCurrentEnrollment, fetchStudentCourses, needsPayment } from '../curriculum/curriculumApi';

/**
 * Makes sure a student who has just finished setup has a course to learn from, so the dashboard roadmap is never empty.
 * Does nothing when they already started a course. Uses `preferredCourseId` (e.g. the placement recommendation) when
 * given, otherwise the first course in the catalog that is open and free to start (the beginner course).
 * Best effort: a failure must never block the student from reaching the dashboard.
 */
export async function ensureStartingCourse(preferredCourseId?: string | null): Promise<void> {
  try {
    const current = await fetchCurrentEnrollment().catch(() => null);
    if (current?.found) return;
    let id = preferredCourseId ?? null;
    if (!id) {
      const courses = await fetchStudentCourses();
      id = courses.find((c) => !c.locked && !needsPayment(c))?.courseId ?? null;
    }
    if (id) await enrollInCourse(id);
  } catch {
    // Enrolment is a convenience here; the student can still start a course from the Courses page.
  }
}
