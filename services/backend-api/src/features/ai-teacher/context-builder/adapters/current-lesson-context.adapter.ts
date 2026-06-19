// P8-030: Add Current Lesson Context
// Backend-approved, read-only adapter that resolves the student's current
// lesson for AI Teacher prompt context.
//
// There is no dedicated "current lesson" pointer anywhere in the schema
// (SessionsService only tracks skill_focus_ids/current_level). The closest
// backend-approved signal is the student's top-ranked active recommendation
// (RecommendationReadService.getActiveForStudent), which already carries a
// nullable targetLessonId chosen by the AIM Engine. This adapter resolves
// that lesson id via LessonsService.getLesson and surfaces only safe,
// lesson-identity fields.
//
// Authority boundary:
//   - This adapter only reads the AIM-Engine-chosen targetLessonId; it does
//     not pick a lesson itself and does not compute mastery/level/weakness/
//     difficulty/recommendation/review-schedule values.
//   - Recommendation-adjacent fields (reason, kind, basedOnWeaknessId, rank,
//     status) are deliberately discarded — only lesson identity fields are
//     surfaced.
//   - Returns null when the student has no active recommendation, the
//     top recommendation has no targetLessonId, or the referenced lesson no
//     longer exists (stale id) — current-lesson context is optional for an
//     AI Teacher turn, so this never throws.

import { Injectable } from '@nestjs/common';

import { RecommendationReadService } from '../../../aim/result/recommendation-read.service';
import { LessonsService } from '../../../curriculum/lessons/lessons.service';

export interface CurrentLessonContext {
  readonly lessonId: string;
  readonly title: string;
  readonly description: string;
}

@Injectable()
export class CurrentLessonContextAdapter {
  constructor(
    private readonly recommendations: RecommendationReadService,
    private readonly lessons: LessonsService,
  ) {}

  async getCurrentLessonContext(studentId: string): Promise<CurrentLessonContext | null> {
    const { recommendations } = await this.recommendations.getActiveForStudent(studentId);
    const targetLessonId = recommendations[0]?.targetLessonId;

    if (!targetLessonId) {
      return null;
    }

    try {
      const lesson = await this.lessons.getLesson(targetLessonId);
      return {
        lessonId: lesson.id,
        title: lesson.title,
        description: lesson.description,
      };
    } catch {
      return null;
    }
  }
}
