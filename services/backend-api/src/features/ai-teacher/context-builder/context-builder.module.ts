import { Module } from '@nestjs/common';

import { StudentsModule } from '../../students/students.module';
import { AimModule } from '../../aim/aim.module';
import { LessonsModule } from '../../curriculum/lessons/lessons.module';
import { SkillsModule } from '../../curriculum/skills/skills.module';
import { PlacementModule } from '../../placement/placement.module';
import { StudentProfileContextAdapter } from './adapters/student-profile-context.adapter';
import { CurrentLessonContextAdapter } from './adapters/current-lesson-context.adapter';
import { CurriculumSkillContextAdapter } from './adapters/curriculum-skill-context.adapter';
import { PlacementResultContextAdapter } from './adapters/placement-result-context.adapter';
import { SkillStateContextAdapter } from './adapters/skill-state-context.adapter';
import { ContextBuilderService } from './context-builder.service';

@Module({
  imports: [StudentsModule, AimModule, LessonsModule, SkillsModule, PlacementModule],
  providers: [
    ContextBuilderService,
    StudentProfileContextAdapter,
    CurrentLessonContextAdapter,
    CurriculumSkillContextAdapter,
    PlacementResultContextAdapter,
    SkillStateContextAdapter,
  ],
  exports: [
    ContextBuilderService,
    StudentProfileContextAdapter,
    CurrentLessonContextAdapter,
    CurriculumSkillContextAdapter,
    PlacementResultContextAdapter,
    SkillStateContextAdapter,
  ],
})
export class ContextBuilderModule {}
