import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonProgressService } from './lesson-progress.service';
import { CourseCompletionService } from './course-completion.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [LessonsController],
  providers: [LessonsService, LessonProgressService, CourseCompletionService],
  exports: [LessonsService, LessonProgressService, CourseCompletionService],
})
export class LessonsModule {}
