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

import { Injectable, Logger } from '@nestjs/common';

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

    const cleaned = replyText.split(LESSON_COMPLETE_MARKER).join('').trim();

    if (session.resolved_lesson_id) {
      try {
        await this.lessonProgressService.markComplete(studentId, session.resolved_lesson_id);
      } catch (error) {
        // A completion-write failure must never surface as a broken chat
        // turn — the student still gets their reply; the lesson simply
        // stays not-yet-unlocked and a future turn (or a client retry of
        // the same "did you get it?" exchange) can complete it.
        this.logger.warn(
          `LessonTeachingStageService: failed to mark lesson ${session.resolved_lesson_id} ` +
            `complete for session=${session.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
        );
      }
      await this.sessionRepository.updateLessonTeachingStage(session.id, 'complete');
    }

    return cleaned;
  }

  private parseLessonIdFromContextRef(contextRef: string): string | null {
    const match = /^lesson:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(
      contextRef,
    );
    return match?.[1] ?? null;
  }
}
