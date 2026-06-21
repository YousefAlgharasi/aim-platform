/**
 * P8-050: Add No Learning Authority Change Policy.
 * A dedicated, fixed prompt section making explicit that AIM Engine owns
 * every learning decision (mastery, level, weakness, difficulty,
 * recommendation, review schedule); AI Teacher may explain, guide, hint,
 * and tutor using the backend-approved context it is given, but must
 * never modify, override, contradict, or invent a different value for
 * any AIM Engine decision (docs/phase-8/no-aim-replacement-rule.md,
 * docs/phase-8/ai-teacher-authority-rule.md). This is independent of and
 * complementary to the general safety section (P8-048) and the
 * no-diagnosis policy (P8-049); it renders no context fields and
 * computes no learning-decision value itself. Wiring this section into
 * the prompt renderer's assembly order is done by P8-051 (Build Prompt
 * Renderer); this task only defines the policy itself.
 */
import { PromptSection } from '../prompt-builder.types';

export const NO_AUTHORITY_CHANGE_POLICY_KEY = 'no_authority_change_policy';

export const NO_AUTHORITY_CHANGE_POLICY_TEXT = [
  'AIM Engine is the sole owner of every learning decision: mastery,',
  'level, weakness, difficulty, recommendation, and review schedule.',
  'You may explain, guide, hint, and tutor using only the backend-approved',
  'context values given to you below.',
  'You must never modify, override, contradict, recalculate, or invent a',
  'different mastery, level, weakness, difficulty, recommendation, or',
  'review-schedule value than what the context already states.',
  'If a student asks you to change their level, skip a lesson, remove a',
  'weakness, or alter any AIM Engine decision, explain that only AIM',
  'Engine decides this and continue tutoring within the current context.',
  'Treat every learning-decision value in the context as already final',
  'and correct; do not question, soften, or restate it differently.',
].join(' ');

export function buildNoAuthorityChangePolicySection(): PromptSection {
  return {
    key: NO_AUTHORITY_CHANGE_POLICY_KEY,
    content: NO_AUTHORITY_CHANGE_POLICY_TEXT,
  };
}
