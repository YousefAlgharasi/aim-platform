import { apiClient } from '../../api/client';
import type { CourseAccess, CoursePriceQuote } from '../course-billing/courseBillingApi';

// Student course/enrollment/chapter endpoints, mirroring the Flutter app:
//   GET  /student/courses                                   — published courses + real progress
//   POST /courses/:id/enroll                                — make a course the active one
//   GET  /enrollment/current                                — active enrollment (found:false if none)
//   GET  /curriculum/courses/:id/levels?status=published    — levels (no /student equivalent exists;
//                                                             students hold curriculum.content.read.published)
//   GET  /student/chapters?levelId=                         — chapters + real progress + final exam

export type StudentProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudentCourse {
  courseId: string;
  title: string;
  description: string | null;
  levelCode: string | null;
  lessonCount: number;
  completedLessonCount: number;
  quizCount: number;
  examCount: number;
  percent: number;
  status: StudentProgressStatus;
  locked: boolean;
  /** Backend price quote (absent on older backends: treated as free). */
  price?: CoursePriceQuote;
  /** Backend access decision (absent on older backends: treated as open). */
  access?: CourseAccess;
}

/** The student has to pay (or wait for approval) before opening the course. */
export function needsPayment(course: StudentCourse): boolean {
  return course.access ? !course.access.hasAccess : false;
}

export interface CurrentEnrollment {
  found: boolean;
  courseId: string | null;
  courseTitle: string | null;
  enrolledAt: string | null;
}

export interface EnrollResponse {
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
}

export interface Level {
  id: string;
  courseId: string;
  title: string;
  code: string | null;
  description: string | null;
  status: string;
  sortOrder: number;
}

export interface StudentChapter {
  chapterId: string;
  title: string;
  description: string | null;
  levelCode: string | null;
  lessonCount: number;
  completedLessonCount: number;
  quizCount: number;
  percent: number;
  status: StudentProgressStatus;
}

export interface FinalExamSummary {
  assessmentId: string;
  title: string;
  unlocked: boolean;
  passed?: boolean;
  score?: number | null;
}

export interface StudentChaptersResponse {
  chapters: StudentChapter[];
  finalExam: FinalExamSummary | null;
}

export interface LevelWithChapters {
  level: Level;
  chapters: StudentChapter[];
}

const enc = encodeURIComponent;

export async function fetchStudentCourses(): Promise<StudentCourse[]> {
  const res = await apiClient.get<{ courses: StudentCourse[] }>('/student/courses');
  return res?.courses ?? [];
}

export function fetchCurrentEnrollment(): Promise<CurrentEnrollment> {
  return apiClient.get<CurrentEnrollment>('/enrollment/current');
}

export function enrollInCourse(courseId: string): Promise<EnrollResponse> {
  return apiClient.post<EnrollResponse>(`/courses/${enc(courseId)}/enroll`);
}

export async function fetchCourseLevels(courseId: string): Promise<Level[]> {
  const res = await apiClient.get<{ levels: Level[] }>(
    `/curriculum/courses/${enc(courseId)}/levels?status=published&limit=100`,
  );
  return [...(res?.levels ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchStudentChapters(levelId: string): Promise<StudentChaptersResponse> {
  const res = await apiClient.get<StudentChaptersResponse>(`/student/chapters?levelId=${enc(levelId)}`);
  return { chapters: res?.chapters ?? [], finalExam: res?.finalExam ?? null };
}
