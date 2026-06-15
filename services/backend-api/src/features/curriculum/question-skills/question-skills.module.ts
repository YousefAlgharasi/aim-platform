import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles/roles.module';
import { UsersModule } from '../../users/users.module';
import { QuestionSkillsController } from './question-skills.controller';
import { QuestionSkillsService } from './question-skills.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [QuestionSkillsController],
  providers: [QuestionSkillsService],
  exports: [QuestionSkillsService],
})
export class QuestionSkillsModule {}
