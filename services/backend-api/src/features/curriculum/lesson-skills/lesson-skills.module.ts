import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { CurriculumAuditLogModule } from '../curriculum-audit-log/curriculum-audit-log.module';
import { LessonSkillsController } from './lesson-skills.controller';
import { LessonSkillsService } from './lesson-skills.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule, CurriculumAuditLogModule],
  controllers: [LessonSkillsController],
  providers: [LessonSkillsService],
  exports: [LessonSkillsService],
})
export class LessonSkillsModule {}
