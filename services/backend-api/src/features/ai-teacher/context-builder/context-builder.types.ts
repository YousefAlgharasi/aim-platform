/**
 * P8-028: AI Teacher Context Builder Skeleton.
 * Shape of the assembled, backend-approved context for a single AI Teacher
 * chat turn (Group D, docs/phase-8/ai-teacher-architecture.md).
 *
 * P18-031: Removed placementResult/skillState/weakness/recommendation/
 * reviewSchedule/recentMistakes fields. The Phase 18 AI Authority Rule
 * forbids AI Teacher from reading mastery, weakness, difficulty,
 * recommendations, review schedules, progress, or assessment/placement
 * results — those values are owned exclusively by the AIM Engine.
 * studentProfile/currentLesson/curriculumSkill remain because they only
 * surface AIM-Engine-chosen identity fields (e.g. lesson title, skill key),
 * never mastery/level/weakness/difficulty values.
 *
 * P20-013: Added focusDirective. Unlike the fields removed in P18-031, this
 * is not raw weakness/recommendation/difficulty data — it is a single,
 * already-generated directive_text string (ai_focus_directives, P20-003)
 * that the backend wrote via AimFocusDirectiveService. AI Teacher only ever
 * restates this pre-computed sentence verbatim, per the Authority Rule's
 * explicit allowance to "restate backend-approved recommendations verbatim,
 * never generate new ones."
 *
 * P20-018: Added difficultyDecision. Same shape of allowance as
 * focusDirective above — a single, already-generated rationale string
 * (difficulty_decisions, P5-059) that the backend wrote via
 * DifficultyDecisionService. AI Teacher only ever restates this
 * pre-computed rationale, never computes a difficulty value itself.
 */
export interface AiTeacherContextSnapshot {
  studentId: string;
  sessionId: string;

  studentProfile: Record<string, unknown> | null;
  currentLesson: Record<string, unknown> | null;
  curriculumSkill: Record<string, unknown> | null;
  focusDirective: Record<string, unknown> | null;
  difficultyDecision: Record<string, unknown> | null;
}

export interface BuildContextInput {
  studentId: string;
  sessionId: string;
  contextRef: string;
}
