/**
 * P8-028: AI Teacher Context Builder Skeleton.
 * Shape of the assembled, backend-approved context for a single AI Teacher
 * chat turn (Group D, docs/phase-8/ai-teacher-architecture.md). Individual
 * fields below are populated by later Phase 8 tasks (P8-029..P8-037); this
 * skeleton defines the contract only.
 *
 * Every field is read-only context sourced per
 * docs/phase-8/context-sources.md. No field here is computed by AI Teacher;
 * AIM Engine remains the sole writer of mastery/level/weakness/difficulty/
 * recommendation/review-schedule values (docs/phase-8/no-aim-replacement-rule.md).
 */
export interface AiTeacherContextSnapshot {
  studentId: string;
  sessionId: string;

  studentProfile: Record<string, unknown> | null;
  currentLesson: Record<string, unknown> | null;
  curriculumSkill: Record<string, unknown> | null;
  placementResult: Record<string, unknown> | null;
  skillState: Record<string, unknown> | null;
  weakness: Record<string, unknown> | null;
  recommendation: Record<string, unknown> | null;
  reviewSchedule: Record<string, unknown> | null;
  recentMistakes: Record<string, unknown>[];
}

export interface BuildContextInput {
  studentId: string;
  sessionId: string;
  contextRef: string;
}
