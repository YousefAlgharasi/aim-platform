import { Module } from '@nestjs/common';
import { ChaptersModule } from './chapters/chapters.module';
import { CoursesModule } from './courses/courses.module';
import { LessonAssetsModule } from './lesson-assets/lesson-assets.module';
import { LessonObjectivesModule } from './lesson-objectives/lesson-objectives.module';
import { LessonSkillsModule } from './lesson-skills/lesson-skills.module';
import { LessonsModule } from './lessons/lessons.module';
import { LevelsModule } from './levels/levels.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    CoursesModule,
    LevelsModule,
    ChaptersModule,
    LessonsModule,
    LessonSkillsModule,
    LessonAssetsModule,
    LessonObjectivesModule,
    ObjectivesModule,
    SkillsModule,
    QuestionBankModule,
  ],
  exports: [
    CoursesModule,
    LevelsModule,
    ChaptersModule,
    LessonsModule,
    LessonSkillsModule,
    LessonAssetsModule,
    LessonObjectivesModule,
    ObjectivesModule,
    SkillsModule,
    QuestionBankModule,
  ],
})
export class CurriculumModule {}
