// AdminStudentPracticeReportService.
//
// Scope: One read-only report for the admin dashboard's student page: how the
// student has been practising — answers right and wrong overall, per practice
// session and per skill — next to the backend-persisted mastery of each skill
// and the focus directive (the "prompt") the AIM pipeline generated for the
// AI Teacher.
//
// This service computes nothing new about learning: correct/wrong are counted
// from lesson_attempts.is_correct (backend-graded), mastery comes from
// student_skill_states (AIM Engine output), and the directive text is read
// from ai_focus_directives exactly as the AIM pipeline wrote it.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

export interface PracticeReportSession {
  readonly sessionId: string;
  readonly sessionType: string;
  readonly skillFocus: readonly string[];
  readonly startedAt: string;
  readonly attempts: number;
  readonly correct: number;
  readonly wrong: number;
}

export interface PracticeReportSkill {
  readonly skillKey: string;
  readonly title: string | null;
  /** 0-100, from student_skill_states (stored 0.000-1.000). Null before the engine has scored the skill. */
  readonly masteryPercent: number | null;
  readonly previousMasteryPercent: number | null;
  readonly trend: string | null;
  readonly attempts: number;
  readonly correct: number;
  readonly wrong: number;
}

export interface PracticeReportDirective {
  readonly skillKey: string;
  readonly text: string;
  readonly source: string;
  readonly generatedAt: string;
  readonly active: boolean;
}

export interface AdminStudentPracticeReport {
  readonly totals: { readonly sessions: number; readonly attempts: number; readonly correct: number; readonly wrong: number; readonly accuracyPercent: number };
  readonly sessions: readonly PracticeReportSession[];
  readonly skills: readonly PracticeReportSkill[];
  readonly focusDirectives: readonly PracticeReportDirective[];
}

const RECENT_SESSIONS = 25;
const DIRECTIVES = 10;

const toPercent = (v: string | null): number | null => (v === null ? null : Math.round(parseFloat(v) * 1000) / 10);

@Injectable()
export class AdminStudentPracticeReportService {
  constructor(private readonly db: DatabaseService) {}

  async getReport(studentId: string): Promise<AdminStudentPracticeReport> {
    const [sessionRows, skillRows, perSkillRows, directiveRows] = await Promise.all([
      this.db.query<{ id: string; session_type: string; skill_focus_ids: unknown; started_at: string; attempts: string; correct: string }>(
        `SELECT ls.id, ls.session_type, ls.skill_focus_ids, ls.started_at,
                count(la.id)::text AS attempts,
                count(la.id) FILTER (WHERE la.is_correct)::text AS correct
           FROM learning_sessions ls
           JOIN lesson_attempts la ON la.learning_session_id = ls.id
          WHERE ls.student_id = $1
          GROUP BY ls.id
          ORDER BY ls.started_at DESC
          LIMIT ${RECENT_SESSIONS}`,
        [studentId],
      ),
      this.db.query<{ skill_id: string; title: string | null; mastery_score: string; previous_mastery_score: string | null; mastery_trend: string | null }>(
        `SELECT sss.skill_id, s.title, sss.mastery_score, sss.previous_mastery_score, sss.mastery_trend
           FROM student_skill_states sss
           LEFT JOIN skills s ON s.key = sss.skill_id
          WHERE sss.student_id = $1
          ORDER BY sss.skill_id ASC`,
        [studentId],
      ),
      this.db.query<{ skill_key: string; attempts: string; correct: string }>(
        `SELECT sk.skill_key, count(*)::text AS attempts, count(*) FILTER (WHERE la.is_correct)::text AS correct
           FROM lesson_attempts la
           CROSS JOIN LATERAL jsonb_array_elements_text(la.skill_ids) AS sk(skill_key)
          WHERE la.student_id = $1
          GROUP BY sk.skill_key`,
        [studentId],
      ),
      this.db.query<{ skill_id: string; directive_text: string; source: string; generated_at: string; active: boolean }>(
        `SELECT skill_id, directive_text, source, generated_at, active
           FROM ai_focus_directives
          WHERE student_id = $1
          ORDER BY active DESC, generated_at DESC
          LIMIT ${DIRECTIVES}`,
        [studentId],
      ),
    ]);

    const sessions: PracticeReportSession[] = sessionRows.rows.map((r) => {
      const attempts = parseInt(r.attempts, 10);
      const correct = parseInt(r.correct, 10);
      return {
        sessionId: r.id,
        sessionType: r.session_type,
        skillFocus: Array.isArray(r.skill_focus_ids) ? (r.skill_focus_ids as string[]) : [],
        startedAt: r.started_at,
        attempts,
        correct,
        wrong: attempts - correct,
      };
    });

    const counts = new Map(perSkillRows.rows.map((r) => [r.skill_key, { attempts: parseInt(r.attempts, 10), correct: parseInt(r.correct, 10) }]));
    const skills: PracticeReportSkill[] = skillRows.rows.map((r) => {
      const c = counts.get(r.skill_id) ?? { attempts: 0, correct: 0 };
      return {
        skillKey: r.skill_id,
        title: r.title,
        masteryPercent: toPercent(r.mastery_score),
        previousMasteryPercent: toPercent(r.previous_mastery_score),
        trend: r.mastery_trend,
        attempts: c.attempts,
        correct: c.correct,
        wrong: c.attempts - c.correct,
      };
    });
    // Skills that were practised but not scored yet still show their answers.
    const scored = new Set(skills.map((s) => s.skillKey));
    for (const [skillKey, c] of counts) {
      if (scored.has(skillKey)) continue;
      skills.push({ skillKey, title: null, masteryPercent: null, previousMasteryPercent: null, trend: null, attempts: c.attempts, correct: c.correct, wrong: c.attempts - c.correct });
    }

    const totalAttempts = sessions.reduce((n, s) => n + s.attempts, 0);
    const totalCorrect = sessions.reduce((n, s) => n + s.correct, 0);
    return {
      totals: {
        sessions: sessions.length,
        attempts: totalAttempts,
        correct: totalCorrect,
        wrong: totalAttempts - totalCorrect,
        accuracyPercent: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      },
      sessions,
      skills,
      focusDirectives: directiveRows.rows.map((r) => ({ skillKey: r.skill_id, text: r.directive_text, source: r.source, generatedAt: r.generated_at, active: r.active })),
    };
  }
}
