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

import { DatabaseService } from '../../../../database/database.service';
import { RecommendationReadService } from '../../../aim/result/recommendation-read.service';
import { LessonsService } from '../../../curriculum/lessons/lessons.service';

export interface CurrentLessonContext {
  readonly lessonId: string;
  readonly title: string;
  readonly description: string;
  /** Optional admin-authored AI Teacher instructions specific to this lesson. */
  readonly systemPrompt: string | null;
  /** The lesson's chapter/level/course — identity fields only (titles/codes), never mastery. */
  readonly chapterTitle: string | null;
  readonly levelCode: string | null;
  readonly levelTitle: string | null;
  readonly courseTitle: string | null;
  readonly cefrCode: string | null;
}

interface CourseContextRow {
  readonly chapter_title: string;
  readonly level_code: string;
  readonly level_title: string;
  readonly course_title: string;
  readonly cefr_code: string | null;
}

@Injectable()
export class CurrentLessonContextAdapter {
  constructor(
    private readonly recommendations: RecommendationReadService,
    private readonly lessons: LessonsService,
    private readonly db: DatabaseService,
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
      const courseContext = await this.getCourseContext(lesson.chapterId);
      return {
        lessonId: lesson.id,
        title: lesson.title,
        description: lesson.description,
        systemPrompt: lesson.systemPrompt,
        chapterTitle: courseContext?.chapter_title ?? null,
        levelCode: courseContext?.level_code ?? null,
        levelTitle: courseContext?.level_title ?? null,
        courseTitle: courseContext?.course_title ?? null,
        cefrCode: courseContext?.cefr_code ?? null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Course/level/chapter identity fields for a lesson's chapter — titles
   * and the course's CEFR code only, the same kind of AIM-Engine-chosen
   * identity context as lesson title/description above, never a
   * mastery/level *value* the AI Teacher would be computing itself.
   * Returns null (never throws) if the chapter/level/course chain is
   * incomplete — this context is optional for a teaching turn.
   */
  private async getCourseContext(chapterId: string): Promise<CourseContextRow | null> {
    const result = await this.db.query<CourseContextRow>(
      `SELECT ch.title AS chapter_title, lv.code AS level_code, lv.title AS level_title,
              co.title AS course_title, co.cefr_code
       FROM chapters ch
       JOIN levels lv ON lv.id = ch.level_id
       JOIN courses co ON co.id = lv.course_id
       WHERE ch.id = $1`,
      [chapterId],
    );
    return result.rows[0] ?? null;
  }

  private async resolveRecommendedLessonId(studentId: string): Promise<string | null> {
    const { recommendations } = await this.recommendations.getActiveForStudent(studentId);
    return recommendations[0]?.targetLessonId ?? null;
  }
}
