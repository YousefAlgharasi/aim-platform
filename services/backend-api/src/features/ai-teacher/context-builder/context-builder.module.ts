// P18-031: Removed PlacementModule import and the placement result, skill
// state, weakness, recommendation, review schedule, and recent mistakes
// adapters from this module's providers/exports. The Phase 18 AI Authority
// Rule forbids AI Teacher from reading those values.

import { Module } from '@nestjs/common';

import { StudentsModule } from '../../students/students.module';
import { AimModule } from '../../aim/aim.module';
import { LessonsModule } from '../../curriculum/lessons/lessons.module';
import { SkillsModule } from '../../curriculum/skills/skills.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { StudentProfileContextAdapter } from './adapters/student-profile-context.adapter';
import { CurrentLessonContextAdapter } from './adapters/current-lesson-context.adapter';
import { CurriculumSkillContextAdapter } from './adapters/curriculum-skill-context.adapter';
import { ContextBuilderService } from './context-builder.service';
import { ContextBudgetPolicyService } from './context-budget-policy.service';

@Module({
  imports: [StudentsModule, AimModule, LessonsModule, SkillsModule, AiChatRepositoriesModule],
  providers: [
    ContextBuilderService,
    ContextBudgetPolicyService,
    StudentProfileContextAdapter,
    CurrentLessonContextAdapter,
    CurriculumSkillContextAdapter,
  ],
  exports: [
    ContextBuilderService,
    ContextBudgetPolicyService,
    StudentProfileContextAdapter,
    CurrentLessonContextAdapter,
    CurriculumSkillContextAdapter,
  ],
})
export class ContextBuilderModule {}
