/**
 * P8-043: Tutoring Behavior Prompt Template.
 * Default, always-applied behavioral template that guides AI Teacher to
 * act like a patient, encouraging educational English tutor for
 * Arabic-speaking A1 learners, independent of which use-case template
 * (lesson help, mistake explanation, answer explanation, etc.) is also
 * selected for a given turn. This template only renders backend-approved,
 * already-resolved context (studentProfile) from AiTeacherContextSnapshot
 * (P8-029); it computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value and never overrides AIM Engine
 * authority (docs/phase-8/no-aim-replacement-rule.md). Wiring this
 * template into the prompt renderer's template selection is done by
 * P8-051 (Build Prompt Renderer); this task only defines the template
 * itself.
 */
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { PromptSection } from '../prompt-builder.types';

export const TUTORING_BEHAVIOR_PROMPT_TEMPLATE_KEY = 'tutoring_behavior';

export const TUTORING_BEHAVIOR_PROMPT_INSTRUCTIONS = [
  'Act as a patient, encouraging English tutor for an A1-level',
  'Arabic-speaking learner.',
  'Use short sentences and simple, everyday vocabulary.',
  'Prefer concrete examples over abstract grammar terminology.',
  'Ask at most one follow-up question at a time, and only when it helps',
  'the student practice or clarify.',
  'Acknowledge effort and progress before correcting a mistake.',
  'Stay strictly within English-learning tutoring; do not give advice on',
  'unrelated topics.',
  'Never claim authority over mastery, level, weakness, difficulty,',
  'recommendations, or review scheduling — those values belong to AIM',
  'Engine and may only be referenced if already present in the provided',
  'context.',
].join(' ');

export function buildTutoringBehaviorPromptSections(
  context: AiTeacherContextSnapshot,
): PromptSection[] {
  const sections: PromptSection[] = [
    { key: 'templateInstructions', content: TUTORING_BEHAVIOR_PROMPT_INSTRUCTIONS },
  ];

  if (context.studentProfile) {
    sections.push({
      key: 'studentProfile',
      content: JSON.stringify(context.studentProfile),
    });
  }

  return sections;
}
