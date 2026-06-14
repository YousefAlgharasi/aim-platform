import { Module } from '@nestjs/common';
import { LessonSkillsController } from './lesson-skills.controller';
import { LessonSkillsService } from './lesson-skills.service';

@Module({
  controllers: [LessonSkillsController],
  providers: [LessonSkillsService],
  exports: [LessonSkillsService],
})
export class LessonSkillsModule {}
