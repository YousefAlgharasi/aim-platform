// StudentLessonsService.
//
// Scope: Compute the mobile Lesson List screen's per-lesson completion and
// "current lesson" marker from real lesson_progress data. `current` is
// derived here — the first lesson (by the already sort_order-ordered rows)
// that is not completed — so Flutter never computes it client-side.

import { Injectable } from '@nestjs/common';
import { StudentLessonsRepository } from './student-lessons.repository';
import { StudentLessonSummary, StudentLessonsResponse } from './student-lessons.types';

@Injectable()
export class StudentLessonsService {
  constructor(private readonly repository: StudentLessonsRepository) {}

  async getLessons(studentId: string, chapterId: string): Promise<StudentLessonsResponse> {
    const rows = await this.repository.findLessonsWithProgress(studentId, chapterId);

    const firstIncompleteIndex = rows.findIndex((row) => !row.completed);

    const lessons: StudentLessonSummary[] = rows.map((row, index) => ({
      id: row.lesson_id,
      title: row.title,
      description: row.description,
      xpValue: row.xp_value,
      completed: row.completed,
      current: index === firstIncompleteIndex,
    }));

    return { lessons };
  }
}
