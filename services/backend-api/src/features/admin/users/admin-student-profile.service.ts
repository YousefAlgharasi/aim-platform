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
import { computeCourseScorePercent, toScorePercent } from '../../certificates/course-score.util';

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

interface PlanRow {
  name: string;
}

interface AllAssessmentResultRow {
  id: string;
  assessment_id: string;
  title: string;
  type: string;
  score: string;
  max_score: string;
  passed: boolean;
  attempted_at: string;
  course_title: string | null;
}

export interface AdminStudentCourseAssessment {
  readonly assessmentId: string;
  readonly title: string;
  readonly type: 'quiz' | 'exam';
  readonly score: number;
  readonly maxScore: number;
  /** score/maxScore normalized to a 0-100 percent, for a consistent "out of 100" display. */
  readonly scorePercent: number;
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
  /** Weighted quiz/exam rollup (see course-score.util.ts). Null if nothing to score yet. */
  readonly overallScorePercent: number | null;
  readonly certificate: { readonly id: string; readonly issuedAt: string } | null;
}

export interface AdminStudentAssessmentResult {
  readonly id: string;
  readonly assessmentId: string;
  readonly title: string;
  readonly type: 'quiz' | 'exam';
  readonly score: number;
  readonly maxScore: number;
  /** score/maxScore normalized to a 0-100 percent, for a consistent "out of 100" display. */
  readonly scorePercent: number;
  readonly passed: boolean;
  readonly attemptedAt: string;
  /** Null when this assessment isn't linked to a course/chapter yet. */
  readonly courseTitle: string | null;
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
    /** Average of the backend-computed per-skill mastery scores, as a 0-100 percent. Never a raw/recomputed value — a straight rollup of what's already stored. */
    readonly scorePercent: number | null;
    readonly recommendedCourseId: string | null;
    readonly recommendedCourseTitle: string | null;
  } | null;
  readonly subscription: {
    readonly planId: string;
    readonly planName: string | null;
    readonly status: string;
    readonly currentPeriodEnd: string | Date | null;
  } | null;
  readonly courses: AdminStudentCourse[];
  readonly assessmentResults: AdminStudentAssessmentResult[];
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

    const [placement, subscriptions, courses, assessmentResults, weaknesses, aiSessions] = await Promise.all([
      this.getPlacementSummary(studentId),
      this.subscriptionService.getUserSubscriptions(studentId),
      this.getCourseHistory(studentId),
      this.getAllAssessmentResults(studentId),
      this.getWeaknesses(studentId),
      this.getRecentAiSessions(studentId),
    ]);

    const activeSubscription = subscriptions.find((s) => s.status === 'active') ?? subscriptions[0];
    const planName = activeSubscription ? await this.getPlanName(activeSubscription.planId) : null;

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
            planName,
            status: activeSubscription.status,
            currentPeriodEnd: activeSubscription.currentPeriodEnd ?? null,
          }
        : null,
      courses,
      assessmentResults,
      weaknesses,
      aiTeacherSessions: aiSessions,
    };
  }

  private async getPlanName(planId: string): Promise<string | null> {
    const result = await this.db.query<PlanRow>(`SELECT name FROM billing_plans WHERE id = $1`, [planId]);
    return result.rows[0]?.name ?? null;
  }

  private async getPlacementSummary(studentId: string): Promise<AdminStudentProfile['placement']> {
    const result = await this.placementResultRead.getLatestResultForStudent(studentId);
    if (!result) return null;

    const masteryEntries = Object.entries(result.skill_mastery_map ?? {});
    const skillSummary = masteryEntries.map(([skillCode, entry]) => ({
      skillCode,
      signal: (entry as { signal?: string })?.signal ?? 'emerging',
    }));

    // Straight average of the mastery scores the backend already computed and
    // persisted per skill — not a new calculation, just a rollup for display.
    const scorePercent =
      masteryEntries.length > 0
        ? Math.round(
            (masteryEntries.reduce(
              (sum, [, entry]) => sum + ((entry as { mastery_score?: number })?.mastery_score ?? 0),
              0,
            ) /
              masteryEntries.length) *
              100,
          )
        : null;

    const recommendedCourseTitle = result.recommended_course_id
      ? await this.getCourseTitle(result.recommended_course_id)
      : null;

    return {
      estimatedLevel: result.estimated_level,
      completedAt: result.created_at,
      skillSummary,
      scorePercent,
      recommendedCourseId: result.recommended_course_id,
      recommendedCourseTitle,
    };
  }

  private async getCourseTitle(courseId: string): Promise<string | null> {
    const result = await this.db.query<{ title: string }>(`SELECT title FROM courses WHERE id = $1`, [courseId]);
    return result.rows[0]?.title ?? null;
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
          overallScorePercent: computeCourseScorePercent(assessments),
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

  /**
   * Every assessment result for this student, regardless of whether the
   * assessment is linked to a course/chapter yet — course.assessments in
   * getCourseHistory only shows results for assessments that ARE linked, so
   * without this a student's quiz/exam history could look empty just
   * because nobody has assigned those assessments to a course.
   */
  private async getAllAssessmentResults(studentId: string): Promise<AdminStudentAssessmentResult[]> {
    const result = await this.db.query<AllAssessmentResultRow>(
      `SELECT ar.id, ar.assessment_id, a.title, a.type, ar.score, ar.max_score, ar.passed,
              ar.created_at AS attempted_at,
              COALESCE(co.title, co2.title) AS course_title
       FROM assessment_results ar
       JOIN assessments a ON a.id = ar.assessment_id
       LEFT JOIN courses co ON co.id = a.course_id
       LEFT JOIN chapters c ON c.id = a.chapter_id
       LEFT JOIN levels lv ON lv.id = c.level_id
       LEFT JOIN courses co2 ON co2.id = lv.course_id
       WHERE ar.student_id = $1
       ORDER BY ar.created_at DESC`,
      [studentId],
    );
    return result.rows.map((r) => {
      const score = Number(r.score);
      const maxScore = Number(r.max_score);
      return {
        id: r.id,
        assessmentId: r.assessment_id,
        title: r.title,
        type: r.type === 'exam' ? 'exam' : 'quiz',
        score,
        maxScore,
        scorePercent: toScorePercent(score, maxScore),
        passed: r.passed,
        attemptedAt: r.attempted_at,
        courseTitle: r.course_title,
      };
    });
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
