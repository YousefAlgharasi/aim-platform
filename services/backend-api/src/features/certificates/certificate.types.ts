// Certificates feature — types.
//
// Scope: Admin/read-only record that a student completed a course, with a
// point-in-time snapshot of their quiz/exam scores for that course. This is
// a display/record feature only — it never decides course completion itself
// (CourseCompletionService remains the sole authority for that) and never
// recomputes a score.

export interface CertificateScoreSnapshotEntry {
  readonly assessmentId: string;
  readonly title: string;
  readonly type: 'quiz' | 'exam';
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
}

export interface Certificate {
  readonly id: string;
  readonly studentId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly studentName: string | null;
  readonly issuedAt: string;
  readonly scoreSnapshot: readonly CertificateScoreSnapshotEntry[];
}
