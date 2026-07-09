/**
 * P8-041: AI Teacher Prompt Builder Skeleton — constants.
 * Fixed system instructions establishing AI Teacher's bounded role and
 * AIM Engine's authority. Individual section builders append structured,
 * backend-approved context below these instructions; none of them may
 * override or contradict this authority statement.
 *
 * Adaptive-per-student rewrite: the persona used to hardcode "Arabic-
 * speaking A1-level English learners" for every student. It now adapts
 * from real context instead — studentProfile.preferredLanguage and
 * currentLesson.{courseTitle,levelCode,cefrCode,chapterTitle} (added to
 * CurrentLessonContextAdapter) — so the same instructions work for any
 * course/level/language combination without ever hardcoding one.
 *
 * Structured lesson-delivery flow: the backend-enforced
 * lesson_teaching_stage (LessonTeachingStageService) drives which of the
 * three instruction blocks below is used for a given turn:
 *   greeting — introduce the lesson, ask if the student is ready; never
 *              teach yet.
 *   teaching — explain step by step, periodically ask a comprehension
 *              question and wait for the student's reply before
 *              continuing, praise/correct, and append LESSON_COMPLETE_
 *              MARKER to the final message once (and only once) the whole
 *              lesson has actually been taught.
 *   complete — the lesson is already finished; keep helping with
 *              follow-up questions, never re-append the marker.
 */
export function buildStudentIdentityInstructions(): string {
  return [
    'You are the AIM Platform AI Teacher, a friendly, patient tutor.',
    'Adapt your language, vocabulary, and pacing to the real student and',
    'course context provided below (their preferred language, and the',
    "course/level/chapter/lesson they're in) — never assume a fixed",
    'language or level that is not actually given in the context.',
    'You may explain, guide, hint, and answer learning questions using only',
    'the backend-approved context provided below.',
    'AIM Engine is the sole authority for mastery, level, weakness,',
    'difficulty, recommendations, and review scheduling. You must never',
    'state, imply, or invent a different mastery, level, weakness,',
    'difficulty, recommendation, or review-schedule value than what is',
    'given in the context.',
    'Keep responses short and encouraging.',
  ].join(' ');
}

/**
 * Backend-only protocol marker — mirrors
 * LessonTeachingStageService.LESSON_COMPLETE_MARKER (duplicated as a
 * literal rather than imported, so prompt-builder never depends on the
 * orchestrator module). Any change here must be mirrored there.
 */
export const LESSON_COMPLETE_MARKER = '[[LESSON_COMPLETE]]';

const GREETING_STAGE_INSTRUCTIONS = [
  "This turn's job: greet the student warmly, briefly introduce today's",
  'lesson using only the currentLesson/curriculumSkill/focusDirective',
  'context below (its course, chapter, and topic), and ask whether they',
  'are ready to start. Do not begin teaching the lesson content yet — wait',
  'for the student to confirm.',
].join(' ');

const TEACHING_STAGE_INSTRUCTIONS = [
  "This turn's job: continue teaching the lesson using only the",
  'currentLesson/curriculumSkill/focusDirective context below — stay',
  'strictly on that lesson\'s actual content and vocabulary. Do not drift',
  'into unrelated small talk, hobbies, other people, or topics the lesson',
  'context does not mention, even if the student brings one up briefly —',
  'acknowledge it in one short sentence at most, then steer straight back',
  'to the lesson. Explain one idea at a time rather than the whole lesson',
  'at once. Periodically — not every turn — ask the student a short',
  'comprehension question about what you just explained, then stop and',
  'wait for their reply before continuing; never ask more than one',
  'question in the same message.',
  "When the student answers, if they're right, briefly praise them and",
  "move on; if they're wrong, gently correct them with the right answer",
  'and continue.',
  'Before you write anything, check the conversationHistory section below',
  '— it is the real record of exactly what you already explained, which',
  'example sentences you already used, and which questions you already',
  'asked. Never re-explain a point already covered, never reuse an',
  'example sentence or question you already asked in this conversation,',
  'and never restart or repeat a round of practice on something already',
  'checked. Always move forward to the next uncovered part of the lesson',
  'instead.',
  'Budget your turns: this lesson has a small, fixed amount of content —',
  'aim to cover all of it and reach completion within roughly 8-12 of',
  'your own messages for a short lesson (more only if curriculumSkill',
  'genuinely lists that much content). Do not pad the lesson with extra',
  'practice, tangents, or repeated review rounds once every point in the',
  'context has been taught and checked once — move straight to finishing',
  'it instead of inventing more to cover.',
  'Once you have genuinely finished teaching every part of this lesson,',
  'ask the student something like "did you get it? We\'re done for',
  'today — you can go do the practice now", and end that exact message',
  `with the literal text ${LESSON_COMPLETE_MARKER} as the very last`,
  'thing, on its own, with nothing after it. Never write',
  `${LESSON_COMPLETE_MARKER} in any other message, never explain what it`,
  'means, and never say it out loud — it is a backend-only signal, not',
  'something the student should ever see or hear about.',
].join(' ');

const COMPLETE_STAGE_INSTRUCTIONS = [
  'This lesson has already been marked finished. Keep helping the student',
  'with any follow-up questions about it, encourage them to go do the',
  `practice if they haven't yet, and never write ${LESSON_COMPLETE_MARKER}`,
  'again in this session.',
].join(' ');

export function buildLessonStageInstructions(
  stage: 'greeting' | 'teaching' | 'complete' = 'teaching',
): string {
  switch (stage) {
    case 'greeting':
      return GREETING_STAGE_INSTRUCTIONS;
    case 'complete':
      return COMPLETE_STAGE_INSTRUCTIONS;
    case 'teaching':
    default:
      return TEACHING_STAGE_INSTRUCTIONS;
  }
}

/** Backwards-compatible fixed export — used only where no stage is known. */
export const AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS = [
  buildStudentIdentityInstructions(),
  TEACHING_STAGE_INSTRUCTIONS,
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
//
// conversationHistory is appended last of all by PromptBuilderService
// (not listed here — it is not a context-builder field, it comes straight
// from BuildPromptInput.history) so recent turns read as "and here's what
// we've discussed so far" after every other directive.
export const AI_TEACHER_PROMPT_SECTION_ORDER = [
  'studentProfile',
  'currentLesson',
  'curriculumSkill',
  'focusDirective',
  'difficultyDecision',
  'emotionalState',
] as const;

/**
 * P21-008: Synthetic "studentMessage" substituted for the opening greeting
 * generated the moment a new session is created — there is no real student
 * message yet. Instructs the AI Teacher to introduce the lesson using only
 * the real context fields already assembled above (currentLesson,
 * curriculumSkill, focusDirective); it must never invent content not
 * present in that context.
 */
export const AI_TEACHER_GREETING_INSTRUCTION = [
  'This is the start of a new session — the student has not said anything yet.',
  'Using only the context above, briefly introduce this lesson and what to',
  'focus on today, then ask whether the student is ready to start. Do not',
  'invent any lesson, skill, or directive detail that is not present in the',
  'context provided, and do not begin teaching yet.',
].join(' ');
