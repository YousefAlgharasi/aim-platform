/**
 * P8-044: Lesson Help Prompt Template.
 * Prompt template for the "lesson help" use case: the student asks AI
 * Teacher to explain or help with the lesson they are currently on. This
 * template only renders backend-approved, already-resolved context
 * (currentLesson, curriculumSkill) from AiTeacherContextSnapshot
 * (P8-028..P8-037); it computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never overrides AIM Engine
 * authority (docs/phase-8/no-aim-replacement-rule.md). Wiring this
 * template into the prompt renderer's template selection is done by
 * P8-051 (Build Prompt Renderer); this task only defines the template
 * itself.
 */
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { PromptSection } from '../prompt-builder.types';

export const LESSON_HELP_PROMPT_TEMPLATE_KEY = 'lesson_help';

export const LESSON_HELP_PROMPT_INSTRUCTIONS = [
  'The student is asking for help with their current lesson.',
  'Use only the lesson and skill context below to explain the relevant',
  'concept in simple terms appropriate for an A1 learner.',
  'Do not state or imply a mastery, level, weakness, difficulty,',
  'recommendation, or review-schedule value; those belong to AIM Engine.',
  'If the lesson or skill context is missing, ask the student to specify',
  'which lesson they need help with instead of guessing.',
].join(' ');

export function buildLessonHelpPromptSections(
  context: AiTeacherContextSnapshot,
): PromptSection[] {
  const sections: PromptSection[] = [
    { key: 'templateInstructions', content: LESSON_HELP_PROMPT_INSTRUCTIONS },
  ];

  if (context.currentLesson) {
    sections.push({
      key: 'currentLesson',
      content: JSON.stringify(context.currentLesson),
    });
  }

  if (context.curriculumSkill) {
    sections.push({
      key: 'curriculumSkill',
      content: JSON.stringify(context.curriculumSkill),
    });
  }

  return sections;
}
