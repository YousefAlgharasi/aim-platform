// P8-030: Add Current Lesson Context
// Backend-approved, read-only adapter that resolves the AI Teacher's
// current-lesson prompt context.
//
// Two ways this can be resolved:
//   1. Explicit — the chat session's contextRef names a specific lesson
//      (e.g. "lesson:<uuid>", set when the student opens AI Teacher from a
//      lesson's detail screen). This is authoritative: the student is
//      looking at that lesson, so its content should drive the context.
//   2. Fallback — no explicit lesson id is given (general AI Teacher chat).
//      The closest backend-approved signal is the student's top-ranked
//      active recommendation (RecommendationReadService.getActiveForStudent),
//      which already carries a nullable targetLessonId chosen by the AIM
//      Engine.
//
// Either way, the lesson id is resolved via LessonsService.getLesson and
// only safe, lesson-identity fields (plus the admin-authored systemPrompt,
// if any) are surfaced.
//
// Authority boundary:
//   - This adapter only reads an explicitly-given lesson id or the
//     AIM-Engine-chosen targetLessonId; it does not pick a lesson itself and
//     does not compute mastery/level/weakness/difficulty/recommendation/
//     review-schedule values.
//   - Recommendation-adjacent fields (reason, kind, basedOnWeaknessId, rank,
//     status) are deliberately discarded — only lesson identity fields are
//     surfaced.
//   - Returns null when no lesson id can be resolved, or the referenced
//     lesson no longer exists (stale id) — current-lesson context is
//     optional for an AI Teacher turn, so this never throws.

import { Injectable } from '@nestjs/common';

import { RecommendationReadService } from '../../../aim/result/recommendation-read.service';
import { LessonsService } from '../../../curriculum/lessons/lessons.service';

export interface CurrentLessonContext {
  readonly lessonId: string;
  readonly title: string;
  readonly description: string;
  /** Optional admin-authored AI Teacher instructions specific to this lesson. */
  readonly systemPrompt: string | null;
}

@Injectable()
export class CurrentLessonContextAdapter {
  constructor(
    private readonly recommendations: RecommendationReadService,
    private readonly lessons: LessonsService,
  ) {}

  async getCurrentLessonContext(
    studentId: string,
    explicitLessonId?: string | null,
  ): Promise<CurrentLessonContext | null> {
    const targetLessonId = explicitLessonId ?? (await this.resolveRecommendedLessonId(studentId));

    if (!targetLessonId) {
      return null;
    }

    try {
      const lesson = await this.lessons.getLesson(targetLessonId);
      return {
        lessonId: lesson.id,
        title: lesson.title,
        description: lesson.description,
        systemPrompt: lesson.systemPrompt,
      };
    } catch {
      return null;
    }
  }

  private async resolveRecommendedLessonId(studentId: string): Promise<string | null> {
    const { recommendations } = await this.recommendations.getActiveForStudent(studentId);
    return recommendations[0]?.targetLessonId ?? null;
  }
}
