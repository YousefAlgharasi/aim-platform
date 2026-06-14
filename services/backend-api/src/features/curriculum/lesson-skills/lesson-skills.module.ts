import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles/roles.module';
import { UsersModule } from '../../users/users.module';
import { LessonSkillsController } from './lesson-skills.controller';
import { LessonSkillsService } from './lesson-skills.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [LessonSkillsController],
  providers: [LessonSkillsService],
  exports: [LessonSkillsService],
})
export class LessonSkillsModule {}
