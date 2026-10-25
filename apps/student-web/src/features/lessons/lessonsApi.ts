import { apiClient } from '../../api/client';

// Student lesson endpoints, mirroring the Flutter app
// (apps/mobile/lib/core/networking/backend_api_paths.dart):
//   GET  /curriculum/lessons/:id                              — lesson detail (students hold curriculum.content.read.published)
//   GET  /curriculum/lesson-assets?lessonId=&status=published — lesson content steps
//   GET  /student/lessons?chapterId=                          — lessons with real per-student progress
//   GET  /sessions/lesson-assets/:id/audio                    — synthesized listening audio (204 when no script)
//   POST /lessons/:id/progress  { percent }                   — in-progress percent (backend clamps 0-100, keeps max)
//   POST /lessons/:id/complete                                — the only way a lesson becomes completed
//   GET  /lessons/continue | /lessons/quick-start | /lessons/recommended-course — "continue learning" helpers
// Both progress endpoints enforce the unlock gate server-side: 403 when the
// course is locked or the previous lesson (course order) isn't completed.

export interface LessonDetail {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  status: string;
  sortOrder: number;
  xpValue: number;
  createdAt: string;
  updatedAt: string;
}

export type LessonAssetType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'vocabulary'
  | 'exercise'
  | 'external_reference';

export interface LessonAsset {
  id: string;
  lessonId: string;
  type: LessonAssetType | string;
  title: string;
  description: string | null;
  url: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  durationSeconds: number | null;
  altText: string | null;
  thumbnailUrl: string | null;
  order: number;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface LessonAssetListResponse {
  assets: LessonAsset[];
  total: number;
  page: number;
  limit: number;
}

export interface StudentLessonSummary {
  id: string;
  title: string;
  description: string;
  xpValue: number;
  /** lesson_progress.completed for this student. */
  completed: boolean;
  /** True for exactly the first not-completed lesson in the chapter. */
  current: boolean;
}

export interface ChapterQuizSummary {
  assessmentId: string;
  title: string;
  completed: boolean;
  /** True until every published lesson in the chapter is completed. */
  locked: boolean;
}

export interface StudentLessonsResponse {
  lessons: StudentLessonSummary[];
  quiz: ChapterQuizSummary | null;
}

export interface LessonProgressAck {
  lessonId: string;
  percent: number;
  completed: boolean;
  updatedAt: string;
}

export interface ContinueLearningLesson {
  lessonId: string;
  lessonTitle: string;
  percent: number;
  lastActiveAt: string;
}

export interface QuickStartLesson {
  lessonId: string;
  lessonTitle: string;
  lessonDescription: string;
  skillName: string | null;
}

export interface RecommendedCourse {
  courseId: string;
  courseTitle: string;
  courseDescription: string | null;
  estimatedLevel: string | null;
}

const enc = encodeURIComponent;

export function fetchLessonDetail(lessonId: string): Promise<LessonDetail> {
  return apiClient.get<LessonDetail>(`/curriculum/lessons/${enc(lessonId)}`);
}

export async function fetchLessonAssets(lessonId: string): Promise<LessonAsset[]> {
  const res = await apiClient.get<LessonAssetListResponse>(
    `/curriculum/lesson-assets?lessonId=${enc(lessonId)}&status=published&limit=100`,
  );
  return [...(res?.assets ?? [])].sort((a, b) => a.order - b.order);
}

export async function fetchStudentLessons(chapterId: string): Promise<StudentLessonsResponse> {
  const res = await apiClient.get<StudentLessonsResponse>(`/student/lessons?chapterId=${enc(chapterId)}`);
  return { lessons: res?.lessons ?? [], quiz: res?.quiz ?? null };
}

/** Blob of the synthesized audio; an empty blob means no script is authored yet (backend 204). */
export function fetchLessonAssetAudio(assetId: string): Promise<Blob> {
  return apiClient.getBlob(`/sessions/lesson-assets/${enc(assetId)}/audio`);
}

export function recordLessonProgress(lessonId: string, percent: number): Promise<LessonProgressAck> {
  return apiClient.post<LessonProgressAck>(`/lessons/${enc(lessonId)}/progress`, { percent });
}

export function completeLesson(lessonId: string): Promise<LessonProgressAck> {
  return apiClient.post<LessonProgressAck>(`/lessons/${enc(lessonId)}/complete`);
}

/** Most recently active, incomplete lesson — null when none. */
export async function fetchContinueLearningLesson(): Promise<ContinueLearningLesson | null> {
  return (await apiClient.get<ContinueLearningLesson | null>('/lessons/continue')) ?? null;
}

/** Next lesson to start, derived from the placement result — null when none. */
export async function fetchQuickStartLesson(): Promise<QuickStartLesson | null> {
  return (await apiClient.get<QuickStartLesson | null>('/lessons/quick-start')) ?? null;
}

/** Course recommended from the placement result — null when none. */
export async function fetchRecommendedCourse(): Promise<RecommendedCourse | null> {
  return (await apiClient.get<RecommendedCourse | null>('/lessons/recommended-course')) ?? null;
}
