// AdminStudentProgressService.
//
// Scope: Admin read-only access to per-student lesson progress.
//
// Security rules:
// - Read-only — no writes to lesson_progress here.
// - Backend computes completedLessons/totalLessons/completionPct;
//   never recalculated by the client.
// - supabase_auth_uid is never returned to the client.

import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { DatabaseService } from '../../../database/database.service';
import { UserRow } from '../../users/users.types';
import {
  StudentLessonProgressItem,
  StudentLessonProgressListResponse,
  StudentProgressSummary,
} from '../../lessons/lesson-progress.types';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

interface ProgressSummaryRow {
  completed_lessons: string;
  last_active_at: string | null;
}

interface CountRow {
  count: string;
}

interface LessonProgressJoinRow {
  lesson_id: string;
  lesson_title: string;
  completed: boolean;
  completed_at: string | null;
}

@Injectable()
export class AdminStudentProgressService {
  constructor(private readonly db: DatabaseService) {}

  async getProgressSummary(studentId: string): Promise<StudentProgressSummary> {
    const studentUid = await this.resolveStudentUid(studentId);

    const [progressResult, totalLessonsResult] = await Promise.all([
      this.db.query<ProgressSummaryRow>(
        `SELECT COUNT(*) FILTER (WHERE completed) AS completed_lessons,
                MAX(last_active_at) AS last_active_at
           FROM lesson_progress
          WHERE student_id = $1`,
        [studentUid],
      ),
      this.db.query<CountRow>(`SELECT COUNT(*) AS count FROM lessons WHERE status = 'published'`),
    ]);

    const completedLessons = parseInt(progressResult.rows[0]?.completed_lessons ?? '0', 10);
    const totalLessons = parseInt(totalLessonsResult.rows[0]?.count ?? '0', 10);

    return {
      studentId,
      completedLessons,
      totalLessons,
      completionPct: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      lastActiveAt: progressResult.rows[0]?.last_active_at ?? null,
    };
  }

  async getLessonProgressList(
    studentId: string,
    page = 1,
    limit = DEFAULT_LIMIT,
  ): Promise<StudentLessonProgressListResponse> {
    const studentUid = await this.resolveStudentUid(studentId);

    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    const [rowsResult, countResult] = await Promise.all([
      this.db.query<LessonProgressJoinRow>(
        `SELECT l.id AS lesson_id, l.title AS lesson_title,
                COALESCE(lp.completed, FALSE) AS completed,
                lp.completed_at AS completed_at
           FROM lessons l
           LEFT JOIN lesson_progress lp
             ON lp.lesson_id = l.id AND lp.student_id = $1
          WHERE l.status = 'published'
          ORDER BY l.sort_order ASC
          LIMIT $2 OFFSET $3`,
        [studentUid, safeLimit, offset],
      ),
      this.db.query<CountRow>(`SELECT COUNT(*) AS count FROM lessons WHERE status = 'published'`),
    ]);

    const lessons: StudentLessonProgressItem[] = rowsResult.rows.map((row) => ({
      lessonId: row.lesson_id,
      lessonTitle: row.lesson_title,
      completed: row.completed,
      completedAt: row.completed_at,
    }));

    return {
      data: lessons,
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
      page: safePage,
      limit: safeLimit,
    };
  }

  private async resolveStudentUid(studentId: string): Promise<string> {
    const result = await this.db.query<UserRow>(
      `SELECT id, supabase_auth_uid, email, phone, user_type, status, created_at, updated_at
         FROM users
        WHERE id = $1 AND user_type = 'student'`,
      [studentId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Student not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result.rows[0].supabase_auth_uid;
  }
}
