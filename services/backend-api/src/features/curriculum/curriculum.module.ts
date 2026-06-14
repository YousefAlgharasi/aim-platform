import { Module } from '@nestjs/common';
import { ChaptersModule } from './chapters/chapters.module';
import { CoursesModule } from './courses/courses.module';
import { LevelsModule } from './levels/levels.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [CoursesModule, LevelsModule, ChaptersModule, SkillsModule],
  exports: [CoursesModule, LevelsModule, ChaptersModule, SkillsModule],
})
export class CurriculumModule {}
