import { Injectable, Logger } from '@nestjs/common';

import { StudentProfileContextAdapter } from './adapters/student-profile-context.adapter';
import { CurrentLessonContextAdapter } from './adapters/current-lesson-context.adapter';
import { CurriculumSkillContextAdapter } from './adapters/curriculum-skill-context.adapter';
import { AiTeacherContextSnapshot, BuildContextInput } from './context-builder.types';

/**
 * P8-028: AI Teacher Context Builder Skeleton (Group D).
 * P8-029: Student profile context wired in below.
 * P8-030: Current lesson context wired in below.
 * P8-031: Curriculum skill context wired in below.
 *
 * Read-only assembly point for backend-approved AI Teacher prompt context
 * (docs/phase-8/context-sources.md). This never reads the database
 * directly and never computes a learning-decision value; it only
 * assembles read-only context by delegating to existing AIM Engine /
 * curriculum / student-profile services, scoped to the authenticated
 * studentId resolved by the caller. Remaining fields are filled in by
 * later tasks (P8-032..P8-037).
 */
@Injectable()
export class ContextBuilderService {
  private readonly logger = new Logger(ContextBuilderService.name);

  constructor(
    private readonly studentProfileContext: StudentProfileContextAdapter,
    private readonly currentLessonContext: CurrentLessonContextAdapter,
    private readonly curriculumSkillContext: CurriculumSkillContextAdapter,
  ) {}

  async buildContext(input: BuildContextInput): Promise<AiTeacherContextSnapshot> {
    this.logger.log(`Building AI Teacher context for session ${input.sessionId}`);

    const studentProfile = await this.studentProfileContext.getProfileContext(input.studentId);
    const currentLesson = await this.currentLessonContext.getCurrentLessonContext(input.studentId);
    const curriculumSkill = await this.curriculumSkillContext.getSkillContext(input.studentId);

    return {
      studentId: input.studentId,
      sessionId: input.sessionId,
      studentProfile: studentProfile as unknown as Record<string, unknown> | null,
      currentLesson: currentLesson as unknown as Record<string, unknown> | null,
      curriculumSkill: curriculumSkill as unknown as Record<string, unknown> | null,
      placementResult: null,
      skillState: null,
      weakness: null,
      recommendation: null,
      reviewSchedule: null,
      recentMistakes: [],
    };
  }
}
