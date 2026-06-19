import { Injectable, Logger } from '@nestjs/common';

import { AiContextSnapshotRepository } from '../repositories/ai-context-snapshot.repository';
import { StudentProfileContextAdapter } from './adapters/student-profile-context.adapter';
import { CurrentLessonContextAdapter } from './adapters/current-lesson-context.adapter';
import { CurriculumSkillContextAdapter } from './adapters/curriculum-skill-context.adapter';
import { PlacementResultContextAdapter } from './adapters/placement-result-context.adapter';
import { SkillStateContextAdapter } from './adapters/skill-state-context.adapter';
import { WeaknessContextAdapter } from './adapters/weakness-context.adapter';
import { RecommendationContextAdapter } from './adapters/recommendation-context.adapter';
import { ReviewScheduleContextAdapter } from './adapters/review-schedule-context.adapter';
import { RecentMistakesContextAdapter } from './adapters/recent-mistakes-context.adapter';
import { AiTeacherContextSnapshot, BuildContextInput } from './context-builder.types';

/**
 * P8-028: AI Teacher Context Builder Skeleton (Group D).
 * P8-029: Student profile context wired in below.
 * P8-030: Current lesson context wired in below.
 * P8-031: Curriculum skill context wired in below.
 * P8-032: Placement result context wired in below.
 * P8-033: AIM skill state context wired in below.
 * P8-034: Weakness context wired in below.
 * P8-035: Recommendation context wired in below.
 * P8-036: Review schedule context wired in below.
 * P8-037: Recent mistakes context wired in below.
 *
 * P8-039: Context snapshot persistence wired in below.
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
    private readonly placementResultContext: PlacementResultContextAdapter,
    private readonly skillStateContext: SkillStateContextAdapter,
    private readonly weaknessContext: WeaknessContextAdapter,
    private readonly recommendationContext: RecommendationContextAdapter,
    private readonly reviewScheduleContext: ReviewScheduleContextAdapter,
    private readonly recentMistakesContext: RecentMistakesContextAdapter,
    private readonly contextSnapshotRepository: AiContextSnapshotRepository,
  ) {}

  async buildContext(input: BuildContextInput): Promise<AiTeacherContextSnapshot> {
    this.logger.log(`Building AI Teacher context for session ${input.sessionId}`);

    const studentProfile = await this.studentProfileContext.getProfileContext(input.studentId);
    const currentLesson = await this.currentLessonContext.getCurrentLessonContext(input.studentId);
    const curriculumSkill = await this.curriculumSkillContext.getSkillContext(input.studentId);
    const placementResult = await this.placementResultContext.getPlacementResultContext(
      input.studentId,
    );
    const skillState = await this.skillStateContext.getSkillStateContext(input.studentId);
    const weakness = await this.weaknessContext.getWeaknessContext(input.studentId);
    const recommendation = await this.recommendationContext.getRecommendationContext(
      input.studentId,
    );
    const reviewSchedule = await this.reviewScheduleContext.getReviewScheduleContext(
      input.studentId,
    );
    const recentMistakes = await this.recentMistakesContext.getRecentMistakesContext(
      input.studentId,
    );

    return {
      studentId: input.studentId,
      sessionId: input.sessionId,
      studentProfile: studentProfile as unknown as Record<string, unknown> | null,
      currentLesson: currentLesson as unknown as Record<string, unknown> | null,
      curriculumSkill: curriculumSkill as unknown as Record<string, unknown> | null,
      placementResult: placementResult as unknown as Record<string, unknown> | null,
      skillState: skillState as unknown as Record<string, unknown> | null,
      weakness: weakness as unknown as Record<string, unknown> | null,
      recommendation: recommendation as unknown as Record<string, unknown> | null,
      reviewSchedule: reviewSchedule as unknown as Record<string, unknown> | null,
      recentMistakes: recentMistakes as unknown as Record<string, unknown>[],
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
}
