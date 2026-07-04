import { Injectable, Logger } from '@nestjs/common';

import { AiContextSnapshotRepository } from '../repositories/ai-context-snapshot.repository';
import { StudentProfileContextAdapter } from './adapters/student-profile-context.adapter';
import { CurrentLessonContextAdapter } from './adapters/current-lesson-context.adapter';
import { CurriculumSkillContextAdapter } from './adapters/curriculum-skill-context.adapter';
import { FocusDirectiveContextAdapter } from './adapters/focus-directive-context.adapter';
import { DifficultyDecisionContextAdapter } from './adapters/difficulty-decision-context.adapter';
import { EmotionalStateContextAdapter } from './adapters/emotional-state-context.adapter';
import { AiTeacherContextSnapshot, BuildContextInput } from './context-builder.types';

/**
 * P8-028: AI Teacher Context Builder Skeleton (Group D).
 * P8-029: Student profile context wired in below.
 * P8-030: Current lesson context wired in below.
 * P8-031: Curriculum skill context wired in below.
 * P8-039: Context snapshot persistence wired in below.
 * P20-013: Focus directive context wired in below.
 *
 * P18-031: Removed the placement result, skill state, weakness,
 * recommendation, review schedule, and recent mistakes adapters. The
 * Phase 18 AI Authority Rule forbids AI Teacher from reading those
 * values — they are owned exclusively by the AIM Engine. Only
 * AIM-Engine-chosen identity context (student profile, current lesson,
 * curriculum skill) remains, plus (P20-013) the single pre-computed focus
 * directive string — see context-builder.types.ts for why that one is not
 * a Rule violation.
 *
 * Read-only assembly point for backend-approved AI Teacher prompt context
 * (docs/phase-8/context-sources.md). This never reads the database
 * directly and never computes a learning-decision value; it only
 * assembles read-only context by delegating to existing AIM Engine /
 * curriculum / student-profile services, scoped to the authenticated
 * studentId resolved by the caller.
 *
 * persistSnapshot() stores the already-assembled, already-approved context
 * via AiContextSnapshotRepository (P8-026) for observability/audit only.
 * It is never read back into a prompt and never returned to Flutter; it
 * only records what was fed into the Prompt Builder for a given message.
 */
@Injectable()
export class ContextBuilderService {
  private readonly logger = new Logger(ContextBuilderService.name);

  constructor(
    private readonly studentProfileContext: StudentProfileContextAdapter,
    private readonly currentLessonContext: CurrentLessonContextAdapter,
    private readonly curriculumSkillContext: CurriculumSkillContextAdapter,
    private readonly focusDirectiveContext: FocusDirectiveContextAdapter,
    private readonly difficultyDecisionContext: DifficultyDecisionContextAdapter,
    private readonly emotionalStateContext: EmotionalStateContextAdapter,
    private readonly contextSnapshotRepository: AiContextSnapshotRepository,
  ) {}

  async buildContext(input: BuildContextInput): Promise<AiTeacherContextSnapshot> {
    this.logger.log(`Building AI Teacher context for session ${input.sessionId}`);

    const explicitLessonId = this.parseLessonIdFromContextRef(input.contextRef);
    const studentProfile = await this.studentProfileContext.getProfileContext(input.studentId);
    const currentLesson = await this.currentLessonContext.getCurrentLessonContext(
      input.studentId,
      explicitLessonId,
    );
    const curriculumSkill = await this.curriculumSkillContext.getSkillContext(input.studentId);
    const focusDirective = await this.focusDirectiveContext.getFocusDirectiveContext(
      input.studentId,
    );
    const difficultyDecision = await this.difficultyDecisionContext.getDifficultyDecisionContext(
      input.studentId,
    );
    const emotionalState = await this.emotionalStateContext.getEmotionalStateContext(
      input.studentId,
      input.sessionId,
    );

    return {
      studentId: input.studentId,
      sessionId: input.sessionId,
      studentProfile: studentProfile as unknown as Record<string, unknown> | null,
      currentLesson: currentLesson as unknown as Record<string, unknown> | null,
      curriculumSkill: curriculumSkill as unknown as Record<string, unknown> | null,
      focusDirective: focusDirective as unknown as Record<string, unknown> | null,
      difficultyDecision: difficultyDecision as unknown as Record<string, unknown> | null,
      emotionalState: emotionalState as unknown as Record<string, unknown> | null,
    };
  }

  /**
   * Persists an already-assembled, already-approved context snapshot for
   * audit/observability. messageId is backend-resolved by the caller (the
   * ai_chat_messages row for the ai_teacher reply this snapshot was built
   * for); it is never accepted from client input. Only the read-only
   * context fields are stored as context_data; studentId/sessionId are
   * stored in their own dedicated columns by the repository, not duplicated
   * inside the JSONB payload.
   */
  async persistSnapshot(messageId: string, snapshot: AiTeacherContextSnapshot): Promise<void> {
    const { studentId, sessionId, ...contextData } = snapshot;

    await this.contextSnapshotRepository.create(
      sessionId,
      messageId,
      studentId,
      contextData as unknown as Record<string, unknown>,
    );

    this.logger.log(`Persisted AI Teacher context snapshot for message ${messageId}`);
  }

  /**
   * Extracts a lesson id from a `lesson:<uuid>` contextRef (set when the
   * student opens AI Teacher from a lesson's detail screen), so the current
   * lesson context reflects the specific lesson being viewed rather than
   * only the AIM Engine's top recommendation. Returns null for any other
   * contextRef shape (e.g. "general") or a malformed/non-UUID suffix.
   */
  private parseLessonIdFromContextRef(contextRef: string): string | null {
    const match = /^lesson:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(
      contextRef,
    );
    return match?.[1] ?? null;
  }
}
