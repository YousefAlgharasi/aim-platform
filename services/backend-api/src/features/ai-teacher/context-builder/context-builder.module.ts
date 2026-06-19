import { Module } from '@nestjs/common';

import { StudentsModule } from '../../students/students.module';
import { AimModule } from '../../aim/aim.module';
import { LessonsModule } from '../../curriculum/lessons/lessons.module';
import { SkillsModule } from '../../curriculum/skills/skills.module';
import { PlacementModule } from '../../placement/placement.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { StudentProfileContextAdapter } from './adapters/student-profile-context.adapter';
import { CurrentLessonContextAdapter } from './adapters/current-lesson-context.adapter';
import { CurriculumSkillContextAdapter } from './adapters/curriculum-skill-context.adapter';
import { PlacementResultContextAdapter } from './adapters/placement-result-context.adapter';
import { SkillStateContextAdapter } from './adapters/skill-state-context.adapter';
import { WeaknessContextAdapter } from './adapters/weakness-context.adapter';
import { RecommendationContextAdapter } from './adapters/recommendation-context.adapter';
import { ReviewScheduleContextAdapter } from './adapters/review-schedule-context.adapter';
import { RecentMistakesContextAdapter } from './adapters/recent-mistakes-context.adapter';
import { ContextBuilderService } from './context-builder.service';
import { ContextBudgetPolicyService } from './context-budget-policy.service';

@Module({
  imports: [
    StudentsModule,
    AimModule,
    LessonsModule,
    SkillsModule,
    PlacementModule,
    AiChatRepositoriesModule,
  ],
  providers: [
    ContextBuilderService,
    ContextBudgetPolicyService,
    StudentProfileContextAdapter,
    CurrentLessonContextAdapter,
    CurriculumSkillContextAdapter,
    PlacementResultContextAdapter,
    SkillStateContextAdapter,
    WeaknessContextAdapter,
    RecommendationContextAdapter,
    ReviewScheduleContextAdapter,
    RecentMistakesContextAdapter,
  ],
  exports: [
    ContextBuilderService,
    ContextBudgetPolicyService,
    StudentProfileContextAdapter,
    CurrentLessonContextAdapter,
    CurriculumSkillContextAdapter,
    PlacementResultContextAdapter,
    SkillStateContextAdapter,
    WeaknessContextAdapter,
    RecommendationContextAdapter,
    ReviewScheduleContextAdapter,
    RecentMistakesContextAdapter,
  ],
})
export class ContextBuilderModule {}
