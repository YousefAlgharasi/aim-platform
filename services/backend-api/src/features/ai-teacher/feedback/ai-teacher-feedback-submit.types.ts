/**
 * P8-068: Build AI Teacher Feedback Service (Group G — AI Teacher Backend
 * Pipeline). Input/output contract for a student rating an AI Teacher
 * reply as helpful/not helpful. `studentId` must already be resolved by
 * the caller from the authenticated JWT (e.g. in the later API task,
 * P8-075); this service never validates ownership itself beyond checking
 * that the referenced message belongs to the given studentId. Feedback is
 * advisory only — it is never read by the AIM Engine and never affects
 * mastery/level/weakness/difficulty/recommendation/review-schedule values
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
export type AiTeacherFeedbackRating = 'helpful' | 'not_helpful';

export interface SubmitTeacherFeedbackInput {
  readonly studentId: string;
  readonly messageId: string;
  readonly rating: AiTeacherFeedbackRating;
}

export interface SubmitTeacherFeedbackResult {
  readonly feedbackId: string;
  readonly messageId: string;
  readonly rating: AiTeacherFeedbackRating;
  readonly createdAt: string;
}
