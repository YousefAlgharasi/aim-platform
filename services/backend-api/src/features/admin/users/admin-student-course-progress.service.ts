// AdminStudentCourseProgressService.
//
// Scope: Read-only, per-course "actual progress" view of one student for the
// admin dashboard: every enrolled course with its chapters and lessons
// (completed or not, percent, when), the student's practice results per lesson
// (right/wrong, accuracy), the course's quizzes/exams, and the certificate if
// one was issued. Also returns student-wide extras: speaking/writing practice,
// open and fixed mistakes, achievements and the engine's level state.
//
// Nothing is computed that the engine/backend does not already decide:
// - lesson completion is lesson_progress.completed;
// - right/wrong is lesson_attempts.is_correct (backend-graded);
// - assessment results come from CertificateService.getCourseAssessmentResults;
// - certificates are only READ here, never issued (issuing stays with the
//   profile/certificate services).

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { CertificateService } from '../../certificates/certificate.service';

type Json = Record<string, unknown>;

export interface CourseProgressLesson {
  readonly lessonId: string;
  readonly title: string;
  readonly sortOrder: number;
  readonly completed: boolean;
  readonly percent: number;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly lastActiveAt: string | null;
  readonly practice: { readonly attempts: number; readonly correct: number; readonly wrong: number; readonly accuracyPercent: number | null; readonly lastPracticedAt: string | null };
}

export interface CourseProgressChapter {
  readonly chapterId: string;
  readonly title: string;
  readonly levelTitle: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly lessons: readonly CourseProgressLesson[];
}

export interface CourseProgressCourse {
  readonly courseId: string;
  readonly title: string;
  readonly enrollmentStatus: string;
  readonly enrolledAt: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly completionPct: number;
  readonly lastActiveAt: string | null;
  readonly practice: { readonly attempts: number; readonly correct: number; readonly wrong: number; readonly accuracyPercent: number | null };
  readonly chapters: readonly CourseProgressChapter[];
  readonly assessments: readonly {
    readonly assessmentId: string;
    readonly title: string;
    readonly type: string;
    readonly scorePercent: number;
    readonly passed: boolean;
  }[];
  readonly certificate: null | {
    readonly id: string;
    readonly issuedAt: string;
    readonly totalPoints: number | null;
    readonly maxPoints: number | null;
  };
}

export interface AdminStudentCourseProgress {
  readonly courses: readonly CourseProgressCourse[];
  /** Practice answers that are not tied to a lesson (drills, reviews, skill practice). */
  readonly otherPractice: { readonly attempts: number; readonly correct: number; readonly wrong: number; readonly accuracyPercent: number | null };
  readonly speakingWriting: readonly {
    readonly id: string;
    readonly kind: string;
    readonly levelCode: string | null;
    readonly status: string;
    readonly score: number | null;
    readonly xpAwarded: number;
    readonly startedAt: string;
    readonly completedAt: string | null;
  }[];
  readonly mistakes: { readonly open: number; readonly resolved: number; readonly topOpenSkills: readonly { readonly skillKey: string; readonly title: string | null; readonly count: number }[] };
  readonly achievements: readonly { readonly key: string; readonly title: string; readonly unlockedAt: string }[];
  readonly levelState: readonly { readonly track: string; readonly currentRank: number; readonly maxUnlockedRank: number }[];
  readonly xpTotal: number;
}

const pct = (correct: number, attempts: number): number | null => (attempts > 0 ? Math.round((correct / attempts) * 100) : null);
const num = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));

@Injectable()
export class AdminStudentCourseProgressService {
  constructor(
    private readonly db: DatabaseService,
    private readonly certificates: CertificateService,
  ) {}

  async getCourseProgress(studentId: string): Promise<AdminStudentCourseProgress> {
    const [enrollments, lessonRows, attemptRows, otherRows, certRows, practiceRows, mistakeRows, openSkillRows, achievementRows, levelRows] =
      await Promise.all([
        this.db.query<{ course_id: string; title: string; status: string; enrolled_at: string }>(
          `SELECT ce.course_id, co.title, ce.status, ce.enrolled_at
             FROM course_enrollments ce JOIN courses co ON co.id = ce.course_id
            WHERE ce.student_id = $1 ORDER BY ce.enrolled_at DESC`,
          [studentId],
        ),
        this.db.query<{
          course_id: string; level_title: string; level_order: number; chapter_id: string; chapter_title: string; chapter_order: number;
          lesson_id: string; lesson_title: string; lesson_order: number; completed: boolean | null; percent: number | null;
          started_at: string | null; completed_at: string | null; last_active_at: string | null;
        }>(
          `SELECT lv.course_id, lv.title AS level_title, lv.sort_order AS level_order,
                  c.id AS chapter_id, c.title AS chapter_title, c.sort_order AS chapter_order,
                  l.id AS lesson_id, l.title AS lesson_title, l.sort_order AS lesson_order,
                  lp.completed, lp.percent, lp.started_at, lp.completed_at, lp.last_active_at
             FROM lessons l
             JOIN chapters c ON c.id = l.chapter_id
             JOIN levels lv ON lv.id = c.level_id
             LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = $1
            WHERE l.status = 'published' AND c.status = 'published' AND lv.status = 'published'
              AND lv.course_id IN (SELECT course_id FROM course_enrollments WHERE student_id = $1)
            ORDER BY lv.sort_order, c.sort_order, l.sort_order`,
          [studentId],
        ),
        this.db.query<{ lesson_id: string; attempts: string; correct: string; last_at: string | null }>(
          `SELECT sq.lesson_id, count(*)::text AS attempts, count(*) FILTER (WHERE la.is_correct)::text AS correct,
                  max(la.submitted_at) AS last_at
             FROM lesson_attempts la
             JOIN (SELECT DISTINCT session_id, question_id, lesson_id FROM session_questions) sq
               ON sq.session_id = la.learning_session_id AND sq.question_id = la.item_id
            WHERE la.student_id = $1 AND sq.lesson_id IS NOT NULL
            GROUP BY sq.lesson_id`,
          [studentId],
        ),
        this.db.query<{ attempts: string; correct: string }>(
          `SELECT count(*)::text AS attempts, count(*) FILTER (WHERE la.is_correct)::text AS correct
             FROM lesson_attempts la
            WHERE la.student_id = $1
              AND NOT EXISTS (SELECT 1 FROM session_questions sq
                               WHERE sq.session_id = la.learning_session_id AND sq.question_id = la.item_id AND sq.lesson_id IS NOT NULL)`,
          [studentId],
        ),
        this.db.query<{ id: string; course_id: string; issued_at: string; score_snapshot: Json | null }>(
          `SELECT id, course_id, issued_at, score_snapshot FROM certificates WHERE student_id = $1`,
          [studentId],
        ),
        this.db.query<{ id: string; kind: string; level_code: string | null; status: string; score: number | null; xp_awarded: number; created_at: string; completed_at: string | null }>(
          `SELECT pa.id, pa.kind, pt.level_code, pa.status, pa.score, pa.xp_awarded, pa.created_at, pa.completed_at
             FROM practice_attempts pa LEFT JOIN practice_topics pt ON pt.id = pa.topic_id
            WHERE pa.student_id = $1 ORDER BY pa.created_at DESC LIMIT 50`,
          [studentId],
        ),
        this.db.query<{ resolved: boolean; n: string }>(
          `SELECT is_resolved AS resolved, count(*)::text AS n FROM mistakes WHERE student_id = $1 GROUP BY is_resolved`,
          [studentId],
        ),
        this.db.query<{ skill_id: string; title: string | null; n: string }>(
          `SELECT m.skill_id, s.title, count(*)::text AS n
             FROM mistakes m LEFT JOIN skills s ON s.key = m.skill_id
            WHERE m.student_id = $1 AND NOT m.is_resolved
            GROUP BY m.skill_id, s.title ORDER BY count(*) DESC LIMIT 5`,
          [studentId],
        ),
        this.db.query<{ key: string; title: string; unlocked_at: string }>(
          `SELECT d.key, d.title, sa.unlocked_at
             FROM student_achievements sa JOIN achievement_definitions d ON d.id = sa.achievement_id
            WHERE sa.student_id = $1 ORDER BY sa.unlocked_at DESC`,
          [studentId],
        ),
        this.db.query<{ track_slug: string; current_cefr_rank: number; max_unlocked_cefr_rank: number }>(
          `SELECT track_slug, current_cefr_rank, max_unlocked_cefr_rank FROM student_level_state WHERE student_id = $1`,
          [studentId],
        ),
      ]);

    const attemptsByLesson = new Map(attemptRows.rows.map((r) => [r.lesson_id, r]));
    const certByCourse = new Map(certRows.rows.map((r) => [r.course_id, r]));

    const courses: CourseProgressCourse[] = [];
    for (const e of enrollments.rows) {
      const rows = lessonRows.rows.filter((r) => r.course_id === e.course_id);
      const chapterMap = new Map<string, { title: string; levelTitle: string; lessons: CourseProgressLesson[] }>();
      let cAttempts = 0;
      let cCorrect = 0;
      let lastActive: string | null = null;
      for (const r of rows) {
        const a = attemptsByLesson.get(r.lesson_id);
        const attempts = a ? parseInt(a.attempts, 10) : 0;
        const correct = a ? parseInt(a.correct, 10) : 0;
        cAttempts += attempts;
        cCorrect += correct;
        if (r.last_active_at && (!lastActive || r.last_active_at > lastActive)) lastActive = r.last_active_at;
        const ch = chapterMap.get(r.chapter_id) ?? { title: r.chapter_title, levelTitle: r.level_title, lessons: [] };
        ch.lessons.push({
          lessonId: r.lesson_id,
          title: r.lesson_title,
          sortOrder: r.lesson_order,
          completed: r.completed === true,
          percent: r.completed ? 100 : num(r.percent),
          startedAt: r.started_at,
          completedAt: r.completed_at,
          lastActiveAt: r.last_active_at,
          practice: { attempts, correct, wrong: attempts - correct, accuracyPercent: pct(correct, attempts), lastPracticedAt: a?.last_at ?? null },
        });
        chapterMap.set(r.chapter_id, ch);
      }
      const chapters: CourseProgressChapter[] = [...chapterMap.entries()].map(([chapterId, ch]) => ({
        chapterId,
        title: ch.title,
        levelTitle: ch.levelTitle,
        completedLessons: ch.lessons.filter((l) => l.completed).length,
        totalLessons: ch.lessons.length,
        lessons: ch.lessons,
      }));
      const total = rows.length;
      const done = rows.filter((r) => r.completed === true).length;

      const assessments = await this.certificates.getCourseAssessmentResults(studentId, e.course_id).catch(() => []);
      const cert = certByCourse.get(e.course_id);
      const breakdown = (cert?.score_snapshot?.breakdown ?? null) as Json | null;

      courses.push({
        courseId: e.course_id,
        title: e.title,
        enrollmentStatus: e.status === 'active' ? 'active' : 'switched',
        enrolledAt: e.enrolled_at,
        completedLessons: done,
        totalLessons: total,
        completionPct: total > 0 ? Math.round((done / total) * 100) : 0,
        lastActiveAt: lastActive,
        practice: { attempts: cAttempts, correct: cCorrect, wrong: cAttempts - cCorrect, accuracyPercent: pct(cCorrect, cAttempts) },
        chapters,
        assessments: assessments.map((a) => ({
          assessmentId: String((a as unknown as Json).assessmentId ?? ''),
          title: String((a as unknown as Json).title ?? ''),
          type: String((a as unknown as Json).type ?? ''),
          scorePercent: num((a as unknown as Json).scorePercent),
          passed: (a as unknown as Json).passed === true,
        })),
        certificate: cert
          ? {
              id: cert.id,
              issuedAt: cert.issued_at,
              totalPoints: breakdown && breakdown.totalPoints !== undefined ? num(breakdown.totalPoints) : null,
              maxPoints: breakdown && breakdown.maxPoints !== undefined ? num(breakdown.maxPoints) : null,
            }
          : null,
      });
    }

    const oa = parseInt(otherRows.rows[0]?.attempts ?? '0', 10);
    const oc = parseInt(otherRows.rows[0]?.correct ?? '0', 10);
    const mistakeCount = (resolved: boolean) => parseInt(mistakeRows.rows.find((r) => r.resolved === resolved)?.n ?? '0', 10);
    const xpTotal = practiceRows.rows.reduce((n, r) => n + num(r.xp_awarded), 0);

    return {
      courses,
      otherPractice: { attempts: oa, correct: oc, wrong: oa - oc, accuracyPercent: pct(oc, oa) },
      speakingWriting: practiceRows.rows.map((r) => ({
        id: r.id, kind: r.kind, levelCode: r.level_code, status: r.status,
        score: r.score === null ? null : num(r.score), xpAwarded: num(r.xp_awarded), startedAt: r.created_at, completedAt: r.completed_at,
      })),
      mistakes: {
        open: mistakeCount(false),
        resolved: mistakeCount(true),
        topOpenSkills: openSkillRows.rows.map((r) => ({ skillKey: r.skill_id, title: r.title, count: parseInt(r.n, 10) })),
      },
      achievements: achievementRows.rows.map((r) => ({ key: r.key, title: r.title, unlockedAt: r.unlocked_at })),
      levelState: levelRows.rows.map((r) => ({ track: r.track_slug, currentRank: r.current_cefr_rank, maxUnlockedRank: r.max_unlocked_cefr_rank })),
      xpTotal,
    };
  }
}
