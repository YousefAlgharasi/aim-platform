import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../../database/database.service';
import { JobLockService } from '../../database/job-lock.service';
import { NotificationQueueService } from '../notifications/notification-queue.service';
import { GroupKey, RECOVERY_COOLDOWN_DAYS, RecoveryService, RecoverySkill } from './recovery.service';

/**
 * "Your retry is ready" nudge.
 *
 * Sends ONE in-app notification (the bell + notification centre) to a student who has a weak skill whose
 * 3-day wait is over and who still has unfixed mistakes on it. It is deliberately quiet:
 *   - at most one per student every RECOVERY_COOLDOWN_DAYS, so it can never pile up;
 *   - only around NUDGE_LOCAL_HOUR in the student's own timezone (default zone below until they set one);
 *   - skipped when they already practised in the last 24h;
 *   - the normal notification rules still apply: learning-reminder preference and quiet hours (the queue service).
 * It names the weakest ready skill and counts the rest. Nothing here reads or writes mastery.
 */

export const NUDGE_TEMPLATE_KEY = 'recovery_retry_ready';
export const NUDGE_LOCAL_HOUR = 18;
const DEFAULT_TIMEZONE = process.env.RECOVERY_NUDGE_DEFAULT_TZ || 'Asia/Riyadh';
const MAX_PER_RUN = 500;

const GROUP_LABEL: Record<'en' | 'ar', Record<GroupKey, string>> = {
  en: { grammar: 'Grammar', vocabulary: 'Vocabulary', reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' },
  ar: { grammar: 'القواعد', vocabulary: 'المفردات', reading: 'القراءة', listening: 'الاستماع', writing: 'الكتابة', speaking: 'المحادثة' },
};

export interface NudgeText { group: string; skill: string; extra: string }

/** Pure: the skills that justify a nudge, weakest first. Exported for tests. */
export function readySkills(skills: readonly RecoverySkill[]): RecoverySkill[] {
  return skills
    .filter((s) => s.unlocked && s.openMistakes > 0)
    .sort((a, b) => (a.masteryScore ?? 0.5) - (b.masteryScore ?? 0.5) || b.openMistakes - a.openMistakes);
}

/** Pure: the words that fill the template. Exported for tests. */
export function nudgeText(ready: readonly RecoverySkill[], locale: 'en' | 'ar'): NudgeText {
  const top = ready[0];
  const more = ready.length - 1;
  const extra = more <= 0 ? '' : locale === 'ar' ? ` (و${more} أخرى)` : ` (+${more} more)`;
  return { group: GROUP_LABEL[locale][top.group], skill: top.title, extra };
}

interface Candidate { user_id: string; auth_uid: string; lang: string | null }

@Injectable()
export class RecoveryNudgeService {
  private readonly logger = new Logger(RecoveryNudgeService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly recovery: RecoveryService,
    private readonly queue: NotificationQueueService,
    private readonly jobLock: JobLockService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async hourly(): Promise<void> {
    await this.jobLock.runExclusive('recovery.nudge-hourly', async () => {
      const r = await this.run();
      if (r.checked > 0) this.logger.log(`recovery_nudge checked=${r.checked} sent=${r.sent}`);
    });
  }

  /** `dryRun` lists who would be nudged without sending anything. */
  async run(opts: { dryRun?: boolean } = {}): Promise<{ checked: number; sent: number; wouldSend: string[] }> {
    // Students whose local time is the nudge hour, who made a mistake in the last 45 days, have not been nudged
    // in the last cooldown window, and have not practised in the last 24h. An unknown/blank timezone uses the default.
    const c = await this.db.query<Candidate>(
      `SELECT u.id AS user_id, u.supabase_auth_uid AS auth_uid, sp.preferred_language AS lang
         FROM users u
         JOIN student_profiles sp ON sp.user_id = u.id
         LEFT JOIN pg_timezone_names z ON z.name = sp.timezone
        WHERE u.supabase_auth_uid IS NOT NULL
          AND EXTRACT(HOUR FROM (now() AT TIME ZONE COALESCE(z.name, $1))) = $2
          AND EXISTS (SELECT 1 FROM lesson_attempts la
                       WHERE la.student_id = ANY(ARRAY[u.id, u.supabase_auth_uid]) AND NOT la.is_correct
                         AND la.submitted_at > now() - interval '45 days')
          AND NOT EXISTS (SELECT 1 FROM lesson_attempts la
                           WHERE la.student_id = ANY(ARRAY[u.id, u.supabase_auth_uid]) AND la.submitted_at > now() - interval '24 hours')
          AND NOT EXISTS (SELECT 1 FROM notification_events e
                           WHERE e.recipient_id = u.id AND e.payload->>'kind' = $3
                             AND e.created_at > now() - make_interval(days => $4))
        LIMIT $5`,
      [DEFAULT_TIMEZONE, NUDGE_LOCAL_HOUR, NUDGE_TEMPLATE_KEY, RECOVERY_COOLDOWN_DAYS, MAX_PER_RUN],
    );

    let sent = 0;
    const wouldSend: string[] = [];
    for (const row of c.rows) {
      try {
        const { skills } = await this.recovery.overview([row.user_id, row.auth_uid]);
        const ready = readySkills(skills);
        if (ready.length === 0) continue;
        if (opts.dryRun) { wouldSend.push(`${row.user_id}: ${ready[0].skillKey} (+${ready.length - 1})`); continue; }
        const locale: 'en' | 'ar' = row.lang === 'ar' ? 'ar' : 'en';
        const text = nudgeText(ready, locale);
        const event = await this.queue.enqueue({
          userId: row.user_id,
          recipientType: 'student',
          templateKey: NUDGE_TEMPLATE_KEY,
          channel: 'in_app',
          category: 'learning_reminder',
          locale,
          // kind = dedupe marker; link = where the notification centre sends the student.
          variables: { ...text, kind: NUDGE_TEMPLATE_KEY, link: '/improve' },
        });
        if (event) sent++;
      } catch (e: unknown) {
        this.logger.warn(`recovery_nudge_failed user=${row.user_id}: ${e instanceof Error ? e.message : 'unknown error'}`);
      }
    }
    return { checked: c.rows.length, sent, wouldSend };
  }
}
