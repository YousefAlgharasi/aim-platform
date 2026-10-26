// Assessments API — mirrors Flutter AssessmentRemoteDatasourceImpl and the
// backend AssessmentController (`/student/assessments`). Deadline status,
// eligibility, grading and scores are all backend-computed; displayed as-is.

import { apiClient } from '../../api/client';
import { t } from '../../i18n';

export type DeadlineStatus = 'upcoming' | 'open' | 'closed' | 'missed' | 'late' | 'extended' | 'expired';

/** GET /student/assessments, GET /student/assessments/next */
export interface AssessmentListItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  deadlineStatus: DeadlineStatus | null;
}

export interface AssessmentDeadline {
  deadlineId: string;
  opensAt: string;
  closesAt: string;
  extendedClosesAt: string | null;
  status: DeadlineStatus;
}

/** GET /student/assessments/:id */
export interface AssessmentDetail {
  id: string;
  type: string;
  title: string;
  description: string | null;
  sections: Array<{ id: string; title: string; order: number; questionCount: number }>;
  maxAttempts: number;
  timeLimitSeconds: number | null;
  deadline: AssessmentDeadline | null;
}

/** GET /student/assessments/deadlines */
export interface StudentDeadlineItem {
  assessmentId: string;
  assessmentTitle: string;
  deadlineId: string;
  opensAt: string;
  closesAt: string;
  extendedClosesAt: string | null;
  status: DeadlineStatus;
}

export interface StudentDeadlines {
  upcoming: StudentDeadlineItem[];
  active: StudentDeadlineItem[];
  late: StudentDeadlineItem[];
  missed: StudentDeadlineItem[];
  closed: StudentDeadlineItem[];
}

/** GET /student/assessments/:id/history */
export interface ResultHistoryItem {
  resultId: string;
  attemptId: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  passed: boolean;
  latePenaltyApplied: boolean;
  gradedAt: string;
  submittedAt: string | null;
}

export interface ResultHistory {
  assessmentId: string;
  totalAttempts: number;
  results: ResultHistoryItem[];
}

/** POST /student/assessments/:id/attempts (returns the existing open attempt if any) */
export interface StartAttemptResult {
  attemptId: string;
  assessmentId: string;
  attemptNumber: number;
  status: 'started';
  startedAt: string;
  expiresAt: string | null;
}

/** GET /student/assessments/attempts/:attemptId/resume */
export interface ResumeAttemptResult {
  attemptId: string;
  status: 'in_progress';
  expiresAt: string | null;
}

/** GET /student/assessments/attempts/:attemptId/questions */
export interface AttemptQuestion {
  id: string;
  assessmentQuestionLinkId: string;
  sectionId: string | null;
  order: number;
  type: string;
  prompt: string;
  options: Array<{ id: string; label: string; text: string }>;
}

/** POST /student/assessments/attempts/:attemptId/answers */
export interface SubmittedAnswer {
  answerId: string;
  assessmentQuestionLinkId: string;
  submittedAt: string;
}

/** POST /student/assessments/attempts/:attemptId/submit */
export interface SubmitAttemptResult {
  attemptId: string;
  status: 'graded';
  submittedAt: string;
  resultId: string;
}

/** GET /student/assessments/attempts/:attemptId/result */
export interface AttemptResult {
  resultId: string;
  attemptId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  latePenaltyApplied: boolean;
  gradedAt: string;
  feedbackAllowed: boolean;
  breakdown: Array<{
    assessmentQuestionLinkId: string;
    sectionId: string | null;
    pointsAwarded: number;
    pointsPossible: number;
    isCorrect?: boolean;
  }>;
}

// ---------------------------------------------------------------------------

export function fetchAssessments(): Promise<AssessmentListItem[]> {
  return apiClient.get<AssessmentListItem[]>('/student/assessments');
}

/** The oldest unlocked, not-yet-attempted assessment, or null when none is due. */
export function fetchNextAssessment(): Promise<AssessmentListItem | null> {
  return apiClient.get<AssessmentListItem | null>('/student/assessments/next');
}

export async function fetchAssessmentDeadlines(): Promise<StudentDeadlines> {
  const d = await apiClient.get<Partial<StudentDeadlines> | null>('/student/assessments/deadlines');
  return {
    upcoming: d?.upcoming ?? [],
    active: d?.active ?? [],
    late: d?.late ?? [],
    missed: d?.missed ?? [],
    closed: d?.closed ?? [],
  };
}

export function fetchAssessmentDetail(assessmentId: string): Promise<AssessmentDetail> {
  return apiClient.get<AssessmentDetail>(`/student/assessments/${assessmentId}`);
}

export function fetchAssessmentHistory(assessmentId: string): Promise<ResultHistory> {
  return apiClient.get<ResultHistory>(`/student/assessments/${assessmentId}/history`);
}

export function startAssessmentAttempt(assessmentId: string): Promise<StartAttemptResult> {
  return apiClient.post<StartAttemptResult>(`/student/assessments/${assessmentId}/attempts`);
}

export function resumeAssessmentAttempt(attemptId: string): Promise<ResumeAttemptResult> {
  return apiClient.get<ResumeAttemptResult>(`/student/assessments/attempts/${attemptId}/resume`);
}

export async function fetchAttemptQuestions(attemptId: string): Promise<AttemptQuestion[]> {
  const list = await apiClient.get<AttemptQuestion[]>(`/student/assessments/attempts/${attemptId}/questions`);
  return [...(list ?? [])].sort((a, b) => a.order - b.order);
}

export function submitAssessmentAnswer(
  attemptId: string,
  assessmentQuestionLinkId: string,
  responseValue: string,
): Promise<SubmittedAnswer> {
  return apiClient.post<SubmittedAnswer>(`/student/assessments/attempts/${attemptId}/answers`, {
    assessmentQuestionLinkId,
    responseValue,
  });
}

export function submitAssessmentAttempt(attemptId: string): Promise<SubmitAttemptResult> {
  return apiClient.post<SubmitAttemptResult>(`/student/assessments/attempts/${attemptId}/submit`);
}

export function fetchAttemptResult(attemptId: string): Promise<AttemptResult> {
  return apiClient.get<AttemptResult>(`/student/assessments/attempts/${attemptId}/result`);
}

/** Listening audio for a question (`AttemptQuestion.id`). Null on 204 (no script authored yet). */
export async function fetchAssessmentQuestionAudio(questionId: string): Promise<Blob | null> {
  const blob = await apiClient.getBlob(`/student/assessments/questions/${questionId}/audio`);
  return blob.size > 0 ? blob : null;
}

// ---------------------------------------------------------------------------

export const DEADLINE_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  open: 'Open',
  extended: 'Extended',
  late: 'Late',
  missed: 'Missed',
  closed: 'Closed',
  expired: 'Closed',
};

export function deadlineStatusLabel(status: string | null | undefined): string {
  if (!status) return '';
  const label = DEADLINE_STATUS_LABELS[status];
  return label ? t(label) : status;
}
