/**
 * P8-046: Hint Generation Prompt Template.
 * Prompt template for the "give me a hint" use case: the student asks
 * for help moving forward on a question without being told the answer
 * outright. This template only renders backend-approved, already-resolved
 * context (currentLesson, curriculumSkill) from AiTeacherContextSnapshot
 * (P8-030, P8-031); it computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never overrides AIM Engine
 * authority (docs/phase-8/no-aim-replacement-rule.md).
 *
 * P18-031: Removed the skillState section. The Phase 18 AI Authority Rule
 * forbids AI Teacher from reading mastery/skill-state data — that value is
 * owned exclusively by the AIM Engine.
 */
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { PromptSection } from '../prompt-builder.types';

export const HINT_GENERATION_PROMPT_TEMPLATE_KEY = 'hint_generation';

export const HINT_GENERATION_PROMPT_INSTRUCTIONS = [
  'The student is asking for a hint, not the final answer.',
  'Give a small nudge toward the correct approach — for example point out',
  'a relevant rule, pattern, or part of the question to focus on — without',
  'stating the correct answer outright.',
  'Only give the direct answer if the student explicitly insists after',
  'already receiving at least one hint, or if the context below already',
  'contains the answer as backend-approved feedback.',
  'Use only the lesson and skill context below; keep hints short and',
  'appropriate for an A1 learner.',
  'Do not state or imply a mastery, level, weakness, difficulty,',
  'recommendation, or review-schedule value — those belong to AIM Engine',
  'and are never provided to you.',
].join(' ');

export function buildHintGenerationPromptSections(
  context: AiTeacherContextSnapshot,
): PromptSection[] {
  const sections: PromptSection[] = [
    { key: 'templateInstructions', content: HINT_GENERATION_PROMPT_INSTRUCTIONS },
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
