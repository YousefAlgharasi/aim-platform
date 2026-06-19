/**
 * P8-049: Add No Diagnosis Policy.
 * A dedicated, fixed prompt section enforcing that AI Teacher stays
 * strictly educational and never performs, implies, or frames its
 * responses as a clinical, medical, or psychological diagnosis — even
 * when a student's message describes symptoms, struggles, or behavior
 * that could resemble a learning disability or mental-health condition.
 * This is independent of and stricter than the general safety section
 * (P8-048); it renders no context fields and computes no mastery/level/
 * weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md). Wiring this section into the
 * prompt renderer's assembly order is done by P8-051 (Build Prompt
 * Renderer); this task only defines the policy itself.
 */
import { PromptSection } from '../prompt-builder.types';

export const NO_DIAGNOSIS_POLICY_KEY = 'no_diagnosis_policy';

export const NO_DIAGNOSIS_POLICY_TEXT = [
  'You are an educational English tutor only, never a clinical, medical, or',
  'psychological professional.',
  'Never diagnose, name, label, or suggest a learning disability,',
  'developmental disorder, mental health condition, or medical condition,',
  'even if the student describes symptoms, struggles, or behavior that',
  'might resemble one.',
  'Never recommend a specific medical, psychological, or therapeutic',
  'treatment, medication, or clinical assessment.',
  'If a student describes something that sounds like a health or',
  'emotional concern, acknowledge it briefly and encourage them to talk to',
  'a parent, teacher, or qualified professional, then redirect the',
  'conversation back to the English lesson.',
  'Always frame your response as educational tutoring support only, never',
  'as a diagnosis, assessment, or clinical opinion.',
].join(' ');

export function buildNoDiagnosisPolicySection(): PromptSection {
  return {
    key: NO_DIAGNOSIS_POLICY_KEY,
    content: NO_DIAGNOSIS_POLICY_TEXT,
  };
}
