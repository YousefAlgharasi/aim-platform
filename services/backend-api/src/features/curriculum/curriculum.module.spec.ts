import { CurriculumModule } from './curriculum.module';
import { CoursesModule } from './courses/courses.module';
import { LevelsModule } from './levels/levels.module';
import { ChaptersModule } from './chapters/chapters.module';
import { ContentStatusWorkflowModule } from './content-status-workflow/content-status-workflow.module';
import { SkillsModule } from './skills/skills.module';
import { LessonsModule } from './lessons/lessons.module';
import { LessonAssetsModule } from './lesson-assets/lesson-assets.module';
import { LessonObjectivesModule } from './lesson-objectives/lesson-objectives.module';
import { LessonSkillsModule } from './lesson-skills/lesson-skills.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { QuestionSkillsModule } from './question-skills/question-skills.module';

// Phase 3 — P3-042
//
// Regression test for the fix described in curriculum.module.ts: every
// curriculum sub-module must be registered in BOTH `imports` and `exports`
// of CurriculumModule, or its controllers are never wired into Nest's DI
// graph and its HTTP routes are unreachable. LessonsModule (P3-037),
// QuestionBankModule (P3-041), and LessonSkillsModule (P3-038) were
// previously missing from these arrays.

const EXPECTED_MODULES = [
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
  ContentStatusWorkflowModule,
];

describe('CurriculumModule registration', () => {
  it('imports every curriculum sub-module', () => {
    const imports: unknown[] = Reflect.getMetadata('imports', CurriculumModule) ?? [];

    for (const mod of EXPECTED_MODULES) {
      expect(imports).toContain(mod);
    }
  });

  it('exports every curriculum sub-module', () => {
    const exportsList: unknown[] = Reflect.getMetadata('exports', CurriculumModule) ?? [];

    for (const mod of EXPECTED_MODULES) {
      expect(exportsList).toContain(mod);
    }
  });
});
