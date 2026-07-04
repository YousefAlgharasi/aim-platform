/**
 * P8-041: AI Teacher Prompt Builder Skeleton — constants.
 * Fixed system instructions establishing AI Teacher's bounded role and
 * AIM Engine's authority. Individual section builders (P8-042..P8-049)
 * append structured, backend-approved context below these instructions;
 * none of them may override or contradict this authority statement.
 */
export const AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS = [
  'You are the AIM Platform AI Teacher, a text-based tutor for Arabic-speaking',
  'A1-level English learners.',
  'You may explain, guide, hint, and answer learning questions using only the',
  'backend-approved context provided below.',
  'AIM Engine is the sole authority for mastery, level, weakness, difficulty,',
  'recommendations, and review scheduling. You must never state, imply, or',
  'invent a different mastery, level, weakness, difficulty, recommendation, or',
  'review-schedule value than what is given in the context.',
  'Keep responses short, encouraging, and appropriate for an A1 learner.',
].join(' ');

// P18-031: Removed skillState/weakness/recentMistakes/recommendation/
// reviewSchedule/placementResult — those keys no longer exist on
// AiTeacherContextSnapshot per the AI Authority Rule.
//
// P20-013: Added focusDirective last, so it reads as "and specifically
// focus on..." after the identity context above it.
//
// P20-018: Added difficultyDecision after focusDirective, so the AI Teacher
// can acknowledge a difficulty change ("since you've been finding this
// tough, let's slow down") after any focus directive has been stated.
//
// P20-020: Added emotionalState last, so the AI Teacher's tone-adjustment
// guidance (encouragement, pacing) is the final consideration layered on
// top of all other identity/directive/difficulty context.
export const AI_TEACHER_PROMPT_SECTION_ORDER = [
  'studentProfile',
  'currentLesson',
  'curriculumSkill',
  'focusDirective',
  'difficultyDecision',
  'emotionalState',
] as const;
