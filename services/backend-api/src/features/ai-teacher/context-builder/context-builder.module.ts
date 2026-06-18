import { Module } from '@nestjs/common';

import { StudentsModule } from '../../students/students.module';
import { AimModule } from '../../aim/aim.module';
import { LessonsModule } from '../../curriculum/lessons/lessons.module';
import { StudentProfileContextAdapter } from './adapters/student-profile-context.adapter';
import { CurrentLessonContextAdapter } from './adapters/current-lesson-context.adapter';
import { ContextBuilderService } from './context-builder.service';

@Module({
  imports: [StudentsModule, AimModule, LessonsModule],
  providers: [ContextBuilderService, StudentProfileContextAdapter, CurrentLessonContextAdapter],
  exports: [ContextBuilderService, StudentProfileContextAdapter, CurrentLessonContextAdapter],
})
export class ContextBuilderModule {}
