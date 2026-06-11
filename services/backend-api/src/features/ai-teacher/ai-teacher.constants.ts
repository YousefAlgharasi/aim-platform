export const AI_TEACHER_HOOK_TYPE = {
  EXPLAIN_MORE: 'explain_more',
  GIVE_EXAMPLE: 'give_example',
  EXPLAIN_STEP: 'explain_step',
  EXPLAIN_WHY: 'explain_why',
  RETRY_WITH_HELP: 'retry_with_help',
} as const;

export type AiTeacherHookType =
  (typeof AI_TEACHER_HOOK_TYPE)[keyof typeof AI_TEACHER_HOOK_TYPE];

export const AI_TEACHER_MAX_RESPONSE_WORDS = 150;

export const AI_TEACHER_MAX_INVOCATIONS_PER_SESSION = 5;
