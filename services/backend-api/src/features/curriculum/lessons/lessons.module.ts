import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles/roles.module';
import { UsersModule } from '../../users/users.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

import { LessonSkillsModule } from '../lesson-skills/lesson-skills.module';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule, LessonSkillsModule],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
