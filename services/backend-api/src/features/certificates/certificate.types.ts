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
  readonly isFinalExam?: boolean;
  readonly score: number;
  readonly maxScore: number;
  /** score/maxScore normalized to a 0-100 percent, for a consistent "out of 100" display. */
  readonly scorePercent: number;
  readonly passed: boolean;
}

export interface CertificateScoreBreakdown {
  readonly practicePoints: number;       // 0 - 200
  readonly practiceMaxPoints: number;    // 200
  readonly quizPoints: number;           // 0 - 200
  readonly quizMaxPoints: number;        // 200
  readonly chapterExamPoints: number;    // 0 - 200
  readonly chapterExamMaxPoints: number; // 200
  readonly finalExamPoints: number;      // 0 - 400
  readonly finalExamMaxPoints: number;   // 400
  readonly totalPoints: number;          // 0 - 1000
  readonly maxPoints: number;            // 1000
  readonly overallPercent: number;       // 0 - 100 %
}

export interface Certificate {
  readonly id: string;
  readonly studentId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly studentName: string | null;
  readonly issuedAt: string;
  readonly scoreSnapshot: readonly CertificateScoreSnapshotEntry[];
  readonly breakdown: CertificateScoreBreakdown;
  readonly totalPoints: number; // out of 1000
  /** Overall course grade out of 100% (totalPoints / 10). */
  readonly overallScorePercent: number | null;
  readonly verificationUrl?: string;
}
