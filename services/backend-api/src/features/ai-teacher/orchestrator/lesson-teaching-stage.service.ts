// LessonTeachingStageService.
//
// Scope: Backend-enforced lesson-delivery state machine for AI Teacher /
// Voice Teacher sessions (shared ai_chat_sessions row — see
// ChatSessionStartService). Stages: greeting -> teaching -> complete.
//
// This is the actual enforcement point for "practice stays locked until
// the AI finishes teaching the lesson": the AI's reply text may say
// anything, but the only thing that unlocks a lesson's practice
// (lesson_progress.completed, read by the mobile course-path/lesson-detail
// screens) is this service parsing the literal LESSON_COMPLETE_MARKER out
// of a reply and calling LessonProgressService.markComplete — a real
// database write, not a claim the client or the model makes on its own.
// The marker itself is stripped before the reply is ever persisted to
// ai_chat_messages or shown to the student.
//
// Security rules:
//   - studentId is always the caller's backend-resolved, authenticated
//     studentId — never re-derived here.
//   - No mastery/level/weakness/difficulty/recommendation/review-schedule
//     value is computed here — lesson identity resolution mirrors
//     ContextBuilderService's own (contextRef -> explicit lesson, else the
//     AIM Engine's top recommendation's targetLessonId).

import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';
import { AiChatSessionRow } from '../repositories/ai-chat-repository.types';
import { CurrentLessonContextAdapter } from '../context-builder/adapters/current-lesson-context.adapter';
import { LessonProgressService } from '../../lessons/lesson-progress.service';

export type LessonTeachingStage = 'greeting' | 'teaching' | 'complete';

/**
 * Backend-only protocol marker. The prompt instructs the model to append
 * this to the very end of its reply if and only if it has just finished
 * teaching the entire lesson — never mid-explanation, never speculatively.
 * Never shown to the student and never spoken by TTS: handleReply() always
 * strips it before the reply is persisted/returned.
 */
export const LESSON_COMPLETE_MARKER = '[[LESSON_COMPLETE]]';

@Injectable()
export class LessonTeachingStageService {
  private readonly logger = new Logger(LessonTeachingStageService.name);

  constructor(
    private readonly sessionRepository: AiChatSessionRepository,
    private readonly currentLessonContext: CurrentLessonContextAdapter,
    private readonly lessonProgressService: LessonProgressService,
  ) {}

  /**
   * Resolves this session's lesson (same rule as
   * ContextBuilderService/CurrentLessonContextAdapter: an explicit
   * `lesson:<uuid>` contextRef, else the student's top active AIM
   * recommendation) and persists it once. setResolvedLessonId() itself is
   * a no-op once resolved_lesson_id is already set, so calling this again
   * on a later turn (e.g. for sessions created before this existed) is
   * always safe.
   */
  async resolveAndPersistLesson(
    studentId: string,
    sessionId: string,
    contextRef: string,
  ): Promise<void> {
    const explicitLessonId = this.parseLessonIdFromContextRef(contextRef);
    const lessonContext = await this.currentLessonContext.getCurrentLessonContext(
      studentId,
      explicitLessonId,
    );

    if (lessonContext) {
      await this.sessionRepository.setResolvedLessonId(sessionId, lessonContext.lessonId);
    }
  }

  /**
   * A real student turn just arrived for a session still in 'greeting' —
   * that turn is the student's answer to "shall we start?", so move into
   * 'teaching'. No-op (returns the existing stage) once already
   * teaching/complete.
   */
  async advanceFromGreetingIfNeeded(session: AiChatSessionRow): Promise<LessonTeachingStage> {
    if (session.lesson_teaching_stage !== 'greeting') {
      return session.lesson_teaching_stage;
    }
    await this.sessionRepository.updateLessonTeachingStage(session.id, 'teaching');
    return 'teaching';
  }

  /**
   * Strips LESSON_COMPLETE_MARKER from a just-generated reply before it is
   * ever persisted or shown to the student. Only when the marker was
   * actually present does this write lesson_progress.completed (via
   * LessonProgressService.markComplete — the same single hook point every
   * other completion path already uses) and flip the session to
   * 'complete'. Returns the (possibly unmodified) reply text to persist.
   */
  async handleReply(
    studentId: string,
    session: AiChatSessionRow,
    replyText: string,
  ): Promise<string> {
    if (!replyText.includes(LESSON_COMPLETE_MARKER)) {
      return replyText;
    }

    let cleaned = replyText.split(LESSON_COMPLETE_MARKER).join('').trim();

    if (session.resolved_lesson_id) {
      // Bugfix: the session's stage must only ever flip to 'complete' when
      // the completion write actually lands. It previously flipped
      // unconditionally, so a legitimate policy rejection (e.g.
      // LessonProgressService's sequential-lesson-order gate — this lesson
      // isn't actually next for this student yet) left the session
      // permanently claiming "this lesson is done" with no
      // lesson_progress row to back it up: practice never unlocked, and
      // every later turn used the 'complete' stage prompt ("this lesson
      // has already been marked finished") even though it hadn't been.
      // Leaving the stage at 'teaching' on failure means a later
      // completion attempt (a future marker) can still succeed once the
      // real blocker is resolved.
      try {
        await this.lessonProgressService.markComplete(studentId, session.resolved_lesson_id);
        await this.sessionRepository.updateLessonTeachingStage(session.id, 'complete');
      } catch (error) {
        this.logger.warn(
          `LessonTeachingStageService: failed to mark lesson ${session.resolved_lesson_id} ` +
            `complete for session=${session.id} — stage left at 'teaching': ${
              error instanceof Error ? error.message : String(error)
            }`,
        );
        // Improvement: a ForbiddenException here means a known, expected
        // content-gating rule (course locked / previous lesson not done)
        // blocked completion — tell the student honestly instead of
        // silently leaving them wondering why practice never unlocked.
        if (error instanceof ForbiddenException) {
          const note = this.explanationForGateFailure(this.forbiddenMessage(error));
          if (note) {
            cleaned = `${cleaned}\n\n${note}`;
          }
        }
      }
    }

    return cleaned;
  }

  private forbiddenMessage(error: ForbiddenException): string {
    const response = error.getResponse();
    if (typeof response === 'string') {
      return response;
    }
    if (response && typeof response === 'object' && 'message' in response) {
      const message = (response as { message?: unknown }).message;
      if (typeof message === 'string') {
        return message;
      }
    }
    return error.message;
  }

  private explanationForGateFailure(message: string): string | null {
    if (message === 'Complete the previous lesson before starting this one') {
      return (
        "By the way — I can't officially mark this lesson complete yet " +
        "because an earlier lesson in your course isn't finished. Once " +
        "that one's done, come back here and I'll mark this one complete too."
      );
    }
    if (message === 'This course is locked for this student') {
      return (
        "By the way — I can't officially mark this lesson complete yet " +
        'because this course is currently locked for your account. Please ' +
        'check with your course access before we continue.'
      );
    }
    return null;
  }

  private parseLessonIdFromContextRef(contextRef: string): string | null {
    const match = /^lesson:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(
      contextRef,
    );
    return match?.[1] ?? null;
  }
}
