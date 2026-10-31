// StudentCoursesService.
//
// Scope: Compute the mobile Courses screen's per-course progress summary
// (percent complete, status) from real lesson_progress data. This is a
// straightforward count-based percentage, not an AIM mastery/level
// computation — it never touches skill_states, weakness_records, or any
// AIM-owned table, so it is not subject to the "no client-side AIM logic"
// rule (the computation itself lives here, backend-side, not in Flutter).
//
// Course/level gating (P20-010): a course with a track_slug/cefr_rank is
// locked when its cefr_rank exceeds the student's max_unlocked_cefr_rank for
// that track. A student with no student_level_state row yet has only
// rank-1 courses unlocked in each track. Courses with no track_slug/cefr_rank
// mapping are never locked (gating doesn't apply to them).

import { Injectable, Optional } from '@nestjs/common';
import { CourseAccessService } from '../course-billing/course-access.service';
import { SupportedLocale } from '../../common/locale/locale.constants';
import { StudentCoursesRepository } from './student-courses.repository';
import { StudentCourseStatus, StudentCourseSummary, StudentCoursesResponse } from './student-courses.types';

@Injectable()
export class StudentCoursesService {
  constructor(
    private readonly repository: StudentCoursesRepository,
    @Optional() private readonly courseAccess?: CourseAccessService,
  ) {}

  async getCourses(studentId: string, locale: SupportedLocale = 'en'): Promise<StudentCoursesResponse> {
    // Billing first: settling an expired paid window resets that course's
    // progress, which the progress query below must already reflect.
    const billing = this.courseAccess
      ? await this.courseAccess.getBillingForCourses(
          studentId,
          await this.repository.findPublishedCourseIds(),
        )
      : null;

    const [rows, enrolledCourseId] = await Promise.all([
      this.repository.findCoursesWithProgress(studentId, locale),
      this.repository.findActiveEnrollmentCourseId(studentId),
    ]);

    const highestCompletedRankByTrack = new Map<string, number>();
    for (const row of rows) {
      if (row.cefr_rank === null) continue;
      const trackSlug = row.track_slug || 'general_english';
      const lessonCount = parseInt(row.lesson_count, 10) || 0;
      const completedLessonCount = parseInt(row.completed_lesson_count, 10) || 0;
      const lessonsComplete = lessonCount > 0 && completedLessonCount === lessonCount;
      const fullyComplete = lessonsComplete && (row.quizzes_passed ?? true) && (row.exam_passed ?? true);
      if (fullyComplete || lessonsComplete) {
        const currentMax = highestCompletedRankByTrack.get(trackSlug) ?? 0;
        if (row.cefr_rank > currentMax) {
          highestCompletedRankByTrack.set(trackSlug, row.cefr_rank);
        }
      }
    }

    const summaries = rows.map((row) => {
      const trackSlug = row.track_slug || 'general_english';
      const lessonCount = parseInt(row.lesson_count, 10) || 0;
      const completedLessonCount = parseInt(row.completed_lesson_count, 10) || 0;
      const quizCount = parseInt(row.quiz_count, 10) || 0;
      const examCount = parseInt(row.exam_count, 10) || 0;

      const lessonsComplete = lessonCount > 0 && completedLessonCount === lessonCount;
      const fullyComplete = lessonsComplete && (row.quizzes_passed ?? true) && (row.exam_passed ?? true);

      const totalItems = lessonCount + quizCount + examCount;
      const completedItems =
        completedLessonCount +
        (quizCount > 0 && row.quizzes_passed ? quizCount : 0) +
        (examCount > 0 && row.exam_passed ? examCount : 0);
      const percent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

      let status: StudentCourseStatus;
      if (fullyComplete || lessonsComplete) {
        status = 'completed';
      } else if (completedItems > 0) {
        status = 'in_progress';
      } else {
        status = 'not_started';
      }

      const maxUnlockedFromState = row.max_unlocked_cefr_rank ?? 1;
      const highestCompleted = highestCompletedRankByTrack.get(trackSlug) ?? 0;
      const effectiveMaxUnlockedRank = Math.max(
        maxUnlockedFromState,
        highestCompleted > 0 ? highestCompleted + 1 : 1,
      );

      const locked = row.cefr_rank !== null && row.cefr_rank > effectiveMaxUnlockedRank;

      return {
        courseId: row.course_id,
        title: row.title,
        description: row.description,
        locale: row.locale,
        levelCode: row.level_code,
        lessonCount,
        completedLessonCount,
        quizCount,
        examCount,
        percent,
        status,
        locked,
        cefrRank: row.cefr_rank,
        ...(billing?.has(row.course_id)
          ? { price: billing.get(row.course_id)!.price, access: billing.get(row.course_id)!.access }
          : {}),
      };
    });

    // Current course: the active enrollment, else the first unlocked course
    // not completed yet (list order is curriculum order).
    let currentIndex = summaries.findIndex((c) => c.courseId === enrolledCourseId);
    if (currentIndex < 0) {
      currentIndex = summaries.findIndex((c) => !c.locked && c.status !== 'completed');
    }
    if (currentIndex < 0) {
      // Everything available is completed: the last completed course is current.
      currentIndex = summaries.map((c) => c.status).lastIndexOf('completed');
    }

    // Next course: only once the current one is finished — the first
    // curriculum course after it that's unlocked and not completed.
    let nextIndex = -1;
    if (currentIndex >= 0 && summaries[currentIndex].status === 'completed') {
      nextIndex = summaries.findIndex(
        (c, i) => i > currentIndex && c.cefrRank !== null && !c.locked && c.status !== 'completed',
      );
    }

    const courses: StudentCourseSummary[] = summaries.map(({ cefrRank: _cefrRank, ...course }, i) => ({
      ...course,
      current: i === currentIndex,
      next: i === nextIndex,
    }));

    return { courses };
  }
}
