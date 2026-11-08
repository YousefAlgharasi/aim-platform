import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export const PLAN_GOALS = ['work', 'study', 'travel', 'fun', 'other'] as const;
export interface StudyPlan { goal: string; dailyMinutes: number; reminderTime: string | null; dailyGoalLessons: number }

/** ~10 minutes per lesson, at least 1, at most 6 — the daily lesson goal the dashboard already understands. */
export function lessonsForMinutes(minutes: number): number {
  return Math.max(1, Math.min(6, Math.round(minutes / 10)));
}

@Injectable()
export class StudyPlanService {
  constructor(private readonly db: DatabaseService) {}

  async get(studentId: string): Promise<StudyPlan | null> {
    const r = await this.db.query<any>(
      `SELECT goal, daily_minutes, to_char(reminder_time, 'HH24:MI') AS reminder_time FROM study_plans WHERE student_id = $1`, [studentId]);
    const x = r.rows[0];
    return x ? { goal: x.goal, dailyMinutes: x.daily_minutes, reminderTime: x.reminder_time, dailyGoalLessons: lessonsForMinutes(x.daily_minutes) } : null;
  }

  async save(studentId: string, body: Record<string, unknown>): Promise<StudyPlan> {
    const goal = String(body.goal ?? '');
    if (!(PLAN_GOALS as readonly string[]).includes(goal)) throw new BadRequestException(`goal must be one of: ${PLAN_GOALS.join(', ')}`);
    const minutes = body.dailyMinutes;
    if (typeof minutes !== 'number' || !Number.isInteger(minutes) || minutes < 5 || minutes > 180) {
      throw new BadRequestException('dailyMinutes must be a whole number from 5 to 180');
    }
    let reminder: string | null = null;
    if (body.reminderTime !== undefined && body.reminderTime !== null && body.reminderTime !== '') {
      if (typeof body.reminderTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.reminderTime)) {
        throw new BadRequestException('reminderTime must be HH:MM (24-hour)');
      }
      reminder = body.reminderTime;
    }
    await this.db.query(
      `INSERT INTO study_plans (student_id, goal, daily_minutes, reminder_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id) DO UPDATE SET goal = $2, daily_minutes = $3, reminder_time = $4, updated_at = now()`,
      [studentId, goal, minutes, reminder]);
    return (await this.get(studentId))!;
  }
}
