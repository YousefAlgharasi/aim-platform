import { Module } from '@nestjs/common';
import { ChaptersModule } from './chapters/chapters.module';
import { CoursesModule } from './courses/courses.module';
import { LessonSkillsModule } from './lesson-skills/lesson-skills.module';
import { LevelsModule } from './levels/levels.module';
import { LessonsModule } from './lessons/lessons.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [CoursesModule, LevelsModule, ChaptersModule, LessonsModule, LessonSkillsModule, SkillsModule],
  exports: [CoursesModule, LevelsModule, ChaptersModule, LessonsModule, LessonSkillsModule, SkillsModule],
})
export class CurriculumModule {}
