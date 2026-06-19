/**
 * P8-047: Answer Explanation Prompt Template.
 * Prompt template for the "explain this answer" use case: the student
 * asks AI Teacher to explain backend-approved feedback on a specific
 * answer attempt. This template only renders backend-approved,
 * already-resolved context (recentMistakes, skillState, curriculumSkill)
 * from AiTeacherContextSnapshot (P8-031, P8-033, P8-037); it computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * and never overrides AIM Engine authority
 * (docs/phase-8/no-aim-replacement-rule.md). Wiring this template into
 * the prompt renderer's template selection is done by P8-051 (Build
 * Prompt Renderer); this task only defines the template itself.
 */
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { PromptSection } from '../prompt-builder.types';

export const ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY = 'answer_explanation';

export const ANSWER_EXPLANATION_PROMPT_INSTRUCTIONS = [
  'The student is asking why their answer was marked right or wrong, or',
  'wants the feedback on an answer explained.',
  'Use only the skill, curriculum, and recent-mistake context below to',
  'explain the feedback in simple terms appropriate for an A1 learner.',
  'Treat all skill state and feedback values below as already decided by',
  'AIM Engine; never recompute, contradict, or restate them differently.',
  'Do not state or imply a mastery, level, weakness, difficulty,',
  'recommendation, or review-schedule value beyond what is already given',
  'in the context.',
  'If no relevant context is available for the answer the student is',
  'asking about, ask them to specify which question or answer they mean',
  'instead of guessing.',
].join(' ');

export function buildAnswerExplanationPromptSections(
  context: AiTeacherContextSnapshot,
): PromptSection[] {
  const sections: PromptSection[] = [
    { key: 'templateInstructions', content: ANSWER_EXPLANATION_PROMPT_INSTRUCTIONS },
  ];

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

  if (context.recentMistakes && context.recentMistakes.length > 0) {
    sections.push({
      key: 'recentMistakes',
      content: JSON.stringify(context.recentMistakes),
    });
  }

  return sections;
}
