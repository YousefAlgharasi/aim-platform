// AdminStudentProfileService.
//
// Scope: One aggregated, read-only "everything about this student" view for
// the admin dashboard — placement result, course history (with each
// course's quiz/exam results and certificate, if any), skill weaknesses,
// subscription status, and recent AI Teacher session activity.
//
// This service does not compute or decide anything new:
// - Course completion is CourseCompletionService's call, not this file's.
// - Placement level/skill signals come from PlacementResultReadService,
//   unchanged.
// - Subscription status comes from SubscriptionService, unchanged.
// - Certificates are issued by CertificateService (idempotent — see that
//   file) as a side effect of building this profile, never invented here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { DatabaseService } from '../../../database/database.service';
import { CourseCompletionService } from '../../lessons/course-completion.service';
import { PlacementResultReadService } from '../../placement/placement-result-read.service';
import { SubscriptionService } from '../../billing/subscription.service';
import { CertificateService } from '../../certificates/certificate.service';

interface StudentRow {
  id: string;
  email: string | null;
  status: string;
  created_at: string;
  display_name: string | null;
}

interface EnrollmentRow {
  id: string;
  course_id: string;
  course_title: string;
  status: string;
  enrolled_at: string;
}

interface LessonCountRow {
  total: string;
  completed_count: string;
}

interface WeaknessRow {
  id: string;
  skill_id: string;
  skill_title: string | null;
  severity: string;
  status: string;
  detected_at: string;
  resolved_at: string | null;
}

interface AiSessionRow {
  id: string;
  context_ref: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStudentCourseAssessment {
  readonly assessmentId: string;
  readonly title: string;
  readonly type: 'quiz' | 'exam';
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
}

export interface AdminStudentCourse {
  readonly enrollmentId: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly enrollmentStatus: 'active' | 'switched';
  readonly enrolledAt: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly completionPct: number;
  readonly completed: boolean;
  readonly assessments: AdminStudentCourseAssessment[];
  readonly certificate: { readonly id: string; readonly issuedAt: string } | null;
}

export interface AdminStudentProfile {
  readonly student: {
    readonly id: string;
    readonly email: string | null;
    readonly displayName: string | null;
    readonly status: string;
    readonly createdAt: string;
  };
  readonly placement: {
    readonly estimatedLevel: string;
    readonly completedAt: string;
    readonly skillSummary: Array<{ skillCode: string; signal: string }>;
  } | null;
  readonly subscription: {
    readonly planId: string;
    readonly status: string;
    readonly currentPeriodEnd: string | Date | null;
  } | null;
  readonly courses: AdminStudentCourse[];
  readonly weaknesses: Array<{
    readonly id: string;
    readonly skillId: string;
    readonly skillTitle: string | null;
    readonly severity: string;
    readonly status: string;
    readonly detectedAt: string;
    readonly resolvedAt: string | null;
  }>;
  readonly aiTeacherSessions: Array<{
    readonly id: string;
    readonly contextRef: string;
    readonly status: string;
    readonly createdAt: string;
    readonly updatedAt: string;
  }>;
}

const RECENT_AI_SESSIONS_LIMIT = 10;

@Injectable()
export class AdminStudentProfileService {
  constructor(
    private readonly db: DatabaseService,
    private readonly courseCompletion: CourseCompletionService,
    private readonly placementResultRead: PlacementResultReadService,
    private readonly subscriptionService: SubscriptionService,
    private readonly certificateService: CertificateService,
  ) {}

  async getProfile(studentId: string): Promise<AdminStudentProfile> {
    const studentResult = await this.db.query<StudentRow>(
      `SELECT u.id, u.email, u.status, u.created_at, sp.display_name
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id = $1 AND u.user_type = 'student'`,
      [studentId],
    );
    const studentRow = studentResult.rows[0];
    if (!studentRow) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Student not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const [placement, subscriptions, courses, weaknesses, aiSessions] = await Promise.all([
      this.getPlacementSummary(studentId),
      this.subscriptionService.getUserSubscriptions(studentId),
      this.getCourseHistory(studentId),
      this.getWeaknesses(studentId),
      this.getRecentAiSessions(studentId),
    ]);

    const activeSubscription = subscriptions.find((s) => s.status === 'active') ?? subscriptions[0];

    return {
      student: {
        id: studentRow.id,
        email: studentRow.email,
        displayName: studentRow.display_name,
        status: studentRow.status,
        createdAt: studentRow.created_at,
      },
      placement,
      subscription: activeSubscription
        ? {
            planId: activeSubscription.planId,
            status: activeSubscription.status,
            currentPeriodEnd: activeSubscription.currentPeriodEnd ?? null,
          }
        : null,
      courses,
      weaknesses,
      aiTeacherSessions: aiSessions,
    };
  }

  private async getPlacementSummary(studentId: string): Promise<AdminStudentProfile['placement']> {
    const result = await this.placementResultRead.getLatestResultForStudent(studentId);
    if (!result) return null;

    const skillSummary = Object.entries(result.skill_mastery_map ?? {}).map(([skillCode, entry]) => ({
      skillCode,
      signal: (entry as { signal?: string })?.signal ?? 'emerging',
    }));

    return {
      estimatedLevel: result.estimated_level,
      completedAt: result.created_at,
      skillSummary,
    };
  }

  private async getCourseHistory(studentId: string): Promise<AdminStudentCourse[]> {
    const enrollments = await this.db.query<EnrollmentRow>(
      `SELECT ce.id, ce.course_id, co.title AS course_title, ce.status, ce.enrolled_at
       FROM course_enrollments ce
       JOIN courses co ON co.id = ce.course_id
       WHERE ce.student_id = $1
       ORDER BY ce.enrolled_at DESC`,
      [studentId],
    );

    return Promise.all(
      enrollments.rows.map(async (row) => {
        const [lessonCounts, assessments] = await Promise.all([
          this.getCourseLessonCounts(studentId, row.course_id),
          this.certificateService.getCourseAssessmentResults(studentId, row.course_id),
        ]);

        const completed = lessonCounts.total > 0 && lessonCounts.completed === lessonCounts.total;
        const certificate = completed
          ? await this.certificateService.issueIfCompleted(studentId, row.course_id)
          : null;

        return {
          enrollmentId: row.id,
          courseId: row.course_id,
          courseTitle: row.course_title,
          enrollmentStatus: row.status === 'active' ? 'active' : 'switched',
          enrolledAt: row.enrolled_at,
          completedLessons: lessonCounts.completed,
          totalLessons: lessonCounts.total,
          completionPct:
            lessonCounts.total > 0 ? Math.round((lessonCounts.completed / lessonCounts.total) * 100) : 0,
          completed,
          assessments,
          certificate: certificate ? { id: certificate.id, issuedAt: certificate.issuedAt } : null,
        } satisfies AdminStudentCourse;
      }),
    );
  }

  private async getCourseLessonCounts(
    studentId: string,
    courseId: string,
  ): Promise<{ total: number; completed: number }> {
    const result = await this.db.query<LessonCountRow>(
      `WITH course_lessons AS (
         SELECT l.id
         FROM lessons l
         JOIN chapters c ON c.id = l.chapter_id
         JOIN levels lv ON lv.id = c.level_id
         WHERE lv.course_id = $2
           AND l.status = 'published'
           AND c.status = 'published'
           AND lv.status = 'published'
       )
       SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE lp.completed) AS completed_count
       FROM course_lessons cl
       LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.student_id = $1`,
      [studentId, courseId],
    );
    const row = result.rows[0];
    return {
      total: parseInt(row?.total ?? '0', 10),
      completed: parseInt(row?.completed_count ?? '0', 10),
    };
  }

  private async getWeaknesses(studentId: string): Promise<AdminStudentProfile['weaknesses']> {
    const result = await this.db.query<WeaknessRow>(
      `SELECT wr.id, wr.skill_id, s.title AS skill_title, wr.severity, wr.status,
              wr.detected_at, wr.resolved_at
       FROM weakness_records wr
       LEFT JOIN skills s ON s.key = wr.skill_id
       WHERE wr.student_id = $1
       ORDER BY wr.detected_at DESC`,
      [studentId],
    );
    return result.rows.map((r) => ({
      id: r.id,
      skillId: r.skill_id,
      skillTitle: r.skill_title,
      severity: r.severity,
      status: r.status,
      detectedAt: r.detected_at,
      resolvedAt: r.resolved_at,
    }));
  }

  private async getRecentAiSessions(studentId: string): Promise<AdminStudentProfile['aiTeacherSessions']> {
    const result = await this.db.query<AiSessionRow>(
      `SELECT id, context_ref, status, created_at, updated_at
       FROM ai_chat_sessions
       WHERE student_id = $1
       ORDER BY updated_at DESC
       LIMIT $2`,
      [studentId, RECENT_AI_SESSIONS_LIMIT],
    );
    return result.rows.map((r) => ({
      id: r.id,
      contextRef: r.context_ref,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }
}
