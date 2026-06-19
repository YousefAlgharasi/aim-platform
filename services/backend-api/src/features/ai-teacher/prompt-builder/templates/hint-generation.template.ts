/**
 * P8-046: Hint Generation Prompt Template.
 * Prompt template for the "give me a hint" use case: the student asks
 * for help moving forward on a question without being told the answer
 * outright. This template only renders backend-approved, already-resolved
 * context (currentLesson, curriculumSkill, skillState) from
 * AiTeacherContextSnapshot (P8-030, P8-031, P8-033); it computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * and never overrides AIM Engine authority
 * (docs/phase-8/no-aim-replacement-rule.md). Wiring this template into
 * the prompt renderer's template selection is done by P8-051 (Build
 * Prompt Renderer); this task only defines the template itself.
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
  'Use only the lesson, skill, and skill-state context below; keep hints',
  'short and appropriate for an A1 learner.',
  'Do not state or imply a mastery, level, weakness, difficulty,',
  'recommendation, or review-schedule value beyond what is already given',
  'in the context; those belong to AIM Engine.',
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

  if (context.skillState) {
    sections.push({
      key: 'skillState',
      content: JSON.stringify(context.skillState),
    });
  }

  return sections;
}
