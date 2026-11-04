// StudentLessonsService.
//
// Scope: Compute the mobile Lesson List screen's per-lesson completion and
// "current lesson" marker from real lesson_progress data. `current` is
// derived here — the first lesson (by the already sort_order-ordered rows)
// that is not completed — so Flutter never computes it client-side.

import { Injectable } from '@nestjs/common';
import { StudentLessonsRepository } from './student-lessons.repository';
import { StudentLessonSummary, StudentLessonsResponse } from './student-lessons.types';
import { DEFAULT_LOCALE, SupportedLocale } from '../../common/locale/locale.constants';

@Injectable()
export class StudentLessonsService {
  constructor(private readonly repository: StudentLessonsRepository) {}

  async getLessons(
    studentId: string,
    chapterId: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<StudentLessonsResponse> {
    const rows = await this.repository.findLessonsWithProgress(studentId, chapterId, locale);

    const firstIncompleteIndex = rows.findIndex((row) => !row.completed);

    const lessons: StudentLessonSummary[] = rows.map((row, index) => ({
      id: row.lesson_id,
      title: row.title,
      description: row.description,
      locale: row.locale,
      xpValue: row.xp_value,
      completed: row.completed,
      current: index === firstIncompleteIndex,
    }));

    const quizRow = await this.repository.findQuizForChapter(chapterId);
    let quiz = null;
    if (quizRow) {
      const allLessonsComplete = lessons.length > 0 && lessons.every((l) => l.completed);
      const [completed, scorePercent] = await Promise.all([
        this.repository.hasPassingResult(studentId, quizRow.assessment_id),
        this.repository.findBestScorePercent(studentId, quizRow.assessment_id),
      ]);
      quiz = {
        assessmentId: quizRow.assessment_id,
        title: quizRow.title,
        completed,
        locked: !allLessonsComplete,
        scorePercent,
      };
    }

    return { lessons, quiz };
  }
}
