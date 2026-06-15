import { Module } from '@nestjs/common';
import { ChaptersModule } from './chapters/chapters.module';
import { ContentStatusWorkflowModule } from './content-status-workflow/content-status-workflow.module';
import { CoursesModule } from './courses/courses.module';
import { LessonAssetsModule } from './lesson-assets/lesson-assets.module';
import { LessonObjectivesModule } from './lesson-objectives/lesson-objectives.module';
import { LessonSkillsModule } from './lesson-skills/lesson-skills.module';
import { LevelsModule } from './levels/levels.module';
import { LessonsModule } from './lessons/lessons.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { QuestionSkillsModule } from './question-skills/question-skills.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    CoursesModule,
    LevelsModule,
    ChaptersModule,
    SkillsModule,
    ObjectivesModule,
    LessonsModule,
    LessonAssetsModule,
    LessonObjectivesModule,
    LessonSkillsModule,
    QuestionBankModule,
    QuestionSkillsModule,
    ContentStatusWorkflowModule,
  ],
  exports: [
    CoursesModule,
    LevelsModule,
    ChaptersModule,
    SkillsModule,
    ObjectivesModule,
    LessonsModule,
    LessonAssetsModule,
    LessonObjectivesModule,
    LessonSkillsModule,
    QuestionBankModule,
    QuestionSkillsModule,
    ContentStatusWorkflowModule,
  ],
})
export class CurriculumModule {}
