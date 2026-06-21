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
 */
export interface AiTeacherContextSnapshot {
  studentId: string;
  sessionId: string;

  studentProfile: Record<string, unknown> | null;
  currentLesson: Record<string, unknown> | null;
  curriculumSkill: Record<string, unknown> | null;
}

export interface BuildContextInput {
  studentId: string;
  sessionId: string;
  contextRef: string;
}
