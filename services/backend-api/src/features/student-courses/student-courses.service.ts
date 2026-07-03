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

import { Injectable } from '@nestjs/common';
import { StudentCoursesRepository } from './student-courses.repository';
import { StudentCourseStatus, StudentCourseSummary, StudentCoursesResponse } from './student-courses.types';

@Injectable()
export class StudentCoursesService {
  constructor(private readonly repository: StudentCoursesRepository) {}

  async getCourses(studentId: string): Promise<StudentCoursesResponse> {
    const rows = await this.repository.findCoursesWithProgress(studentId);

    const courses: StudentCourseSummary[] = rows.map((row) => {
      const lessonCount = parseInt(row.lesson_count, 10) || 0;
      const completedLessonCount = parseInt(row.completed_lesson_count, 10) || 0;
      const percent = lessonCount === 0 ? 0 : Math.round((completedLessonCount / lessonCount) * 100);

      let status: StudentCourseStatus;
      if (lessonCount > 0 && completedLessonCount === lessonCount) {
        status = 'completed';
      } else if (completedLessonCount > 0) {
        status = 'in_progress';
      } else {
        status = 'not_started';
      }

      const maxUnlockedCefrRank = row.max_unlocked_cefr_rank ?? 1;
      const locked = row.cefr_rank !== null && row.cefr_rank > maxUnlockedCefrRank;

      return {
        courseId: row.course_id,
        title: row.title,
        description: row.description,
        levelCode: row.level_code,
        lessonCount,
        completedLessonCount,
        percent,
        status,
        locked,
      };
    });

    return { courses };
  }
}
