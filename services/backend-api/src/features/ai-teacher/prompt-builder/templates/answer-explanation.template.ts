/**
 * P8-047: Answer Explanation Prompt Template.
 * Prompt template for the "explain this answer" use case: the student
 * asks AI Teacher to explain backend-approved feedback on a specific
 * answer attempt. This template only renders backend-approved,
 * already-resolved context (curriculumSkill) from AiTeacherContextSnapshot
 * (P8-031); it computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never overrides AIM Engine
 * authority (docs/phase-8/no-aim-replacement-rule.md).
 *
 * P18-031: Removed the skillState and recentMistakes sections. The Phase
 * 18 AI Authority Rule forbids AI Teacher from reading mastery/skill-state
 * or assessment-derived mistake data — those values are owned exclusively
 * by the AIM Engine.
 */
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { PromptSection } from '../prompt-builder.types';

export const ANSWER_EXPLANATION_PROMPT_TEMPLATE_KEY = 'answer_explanation';

export const ANSWER_EXPLANATION_PROMPT_INSTRUCTIONS = [
  'The student is asking why their answer was marked right or wrong, or',
  'wants the feedback on an answer explained.',
  'Use only the skill and curriculum context below to explain the',
  'feedback in simple terms appropriate for an A1 learner.',
  'Do not state or imply a mastery, level, weakness, difficulty,',
  'recommendation, or review-schedule value — those belong to AIM Engine',
  'and are never provided to you.',
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

  return sections;
}
