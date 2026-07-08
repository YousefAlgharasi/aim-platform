import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonProgressService } from './lesson-progress.service';
import { CourseCompletionService } from './course-completion.service';
import { ChapterCompletionService } from './chapter-completion.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule, NotificationsModule],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonProgressService,
    CourseCompletionService,
    ChapterCompletionService,
  ],
  exports: [
    LessonsService,
    LessonProgressService,
    CourseCompletionService,
    ChapterCompletionService,
  ],
})
export class LessonsModule {}
