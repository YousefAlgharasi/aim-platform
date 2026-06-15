import { Module } from '@nestjs/common';
import { ChaptersModule } from './chapters/chapters.module';
import { CoursesModule } from './courses/courses.module';
import { LessonAssetsModule } from './lesson-assets/lesson-assets.module';
import { LessonObjectivesModule } from './lesson-objectives/lesson-objectives.module';
import { LessonSkillsModule } from './lesson-skills/lesson-skills.module';
import { LevelsModule } from './levels/levels.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { QuestionSkillsModule } from './question-skills/question-skills.module';
import { SkillsModule } from './skills/skills.module';

// Phase 3 — P3-042
// Registers all curriculum sub-modules.
//
// Fix: LessonsModule (P3-037), QuestionBankModule (P3-041), and
// LessonSkillsModule (P3-038) were previously implemented but never added to
// this module's `imports`/`exports` arrays (LessonSkillsModule was not even
// imported), so their controllers were never registered with Nest's DI graph
// and their HTTP routes were unreachable. Fixed here alongside adding the new
// QuestionSkillsModule for this task. See P3-042 completion notes.

@Module({
  imports: [
    CoursesModule,
    LevelsModule,
    ChaptersModule,
    SkillsModule,
    LessonsModule,
    LessonAssetsModule,
    LessonObjectivesModule,
    LessonSkillsModule,
    QuestionBankModule,
    QuestionSkillsModule,
  ],
  exports: [
    CoursesModule,
    LevelsModule,
    ChaptersModule,
    SkillsModule,
    LessonsModule,
    LessonAssetsModule,
    LessonObjectivesModule,
    LessonSkillsModule,
    QuestionBankModule,
    QuestionSkillsModule,
  ],
})
export class CurriculumModule {}
