import { Module } from '@nestjs/common';
import { ChaptersModule } from './chapters/chapters.module';
import { CoursesModule } from './courses/courses.module';
import { LessonAssetsModule } from './lesson-assets/lesson-assets.module';
import { LevelsModule } from './levels/levels.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [CoursesModule, LevelsModule, ChaptersModule, SkillsModule, LessonAssetsModule],
  exports: [CoursesModule, LevelsModule, ChaptersModule, SkillsModule, LessonAssetsModule],
})
export class CurriculumModule {}
