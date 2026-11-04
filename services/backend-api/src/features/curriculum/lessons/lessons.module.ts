import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles/roles.module';
import { UsersModule } from '../../users/users.module';
import { LocaleModule } from '../../../common/locale/locale.module';
import { LessonTranslationsController } from './lesson-translations.controller';
import { LessonTranslationsService } from './lesson-translations.service';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

import { LessonSkillsModule } from '../lesson-skills/lesson-skills.module';

@Module({
  imports: [AuthModule, DatabaseModule, LocaleModule, RolesModule, UsersModule, LessonSkillsModule],
  controllers: [LessonsController, LessonTranslationsController],
  providers: [LessonsService, LessonTranslationsService],
  exports: [LessonsService, LessonTranslationsService],
})
export class LessonsModule {}
