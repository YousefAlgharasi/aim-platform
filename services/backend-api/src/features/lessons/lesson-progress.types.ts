export interface RecordLessonProgressInput {
  readonly studentId: string;
  readonly lessonId: string;
  readonly percent: number;
}

export interface LessonProgressAckResponse {
  readonly lessonId: string;
  readonly percent: number;
  readonly completed: boolean;
  readonly updatedAt: string;
}

export interface StudentProgressSummary {
  readonly studentId: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly completionPct: number;
  readonly lastActiveAt: string | null;
}

export interface StudentLessonProgressItem {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly completed: boolean;
  readonly completedAt: string | null;
}

export interface StudentLessonProgressListResponse {
  readonly data: StudentLessonProgressItem[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}
