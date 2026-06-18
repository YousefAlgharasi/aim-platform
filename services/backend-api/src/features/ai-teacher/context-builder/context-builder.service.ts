import { Injectable, Logger } from '@nestjs/common';

import { AiTeacherContextSnapshot, BuildContextInput } from './context-builder.types';

/**
 * P8-028: AI Teacher Context Builder Skeleton (Group D).
 *
 * Read-only assembly point for backend-approved AI Teacher prompt context
 * (docs/phase-8/context-sources.md). This skeleton never reads the
 * database directly and never computes a learning-decision value; it only
 * defines the assembly contract that later tasks (P8-029..P8-037) fill in
 * by delegating to existing AIM Engine / curriculum / student-profile
 * services, scoped to the authenticated studentId resolved by the caller.
 */
@Injectable()
export class ContextBuilderService {
  private readonly logger = new Logger(ContextBuilderService.name);

  async buildContext(input: BuildContextInput): Promise<AiTeacherContextSnapshot> {
    this.logger.log(`Building AI Teacher context for session ${input.sessionId}`);

    return {
      studentId: input.studentId,
      sessionId: input.sessionId,
      studentProfile: null,
      currentLesson: null,
      curriculumSkill: null,
      placementResult: null,
      skillState: null,
      weakness: null,
      recommendation: null,
      reviewSchedule: null,
      recentMistakes: [],
    };
  }
}
