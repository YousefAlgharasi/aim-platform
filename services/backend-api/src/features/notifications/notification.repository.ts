import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  NotificationTemplateRow,
  NotificationPreferenceRow,
  DeviceTokenRow,
  NotificationEventRow,
  ReminderScheduleRow,
  DeliveryAttemptRow,
  NotificationDigestRow,
  QuietHoursRow,
  NotificationAuditLogRow,
  AdminBroadcastScheduleRow,
  BroadcastUserRow,
} from './notification-repository.types';

@Injectable()
export class NotificationRepository {
  constructor(private readonly db: DatabaseService) {}

  // --- Templates ---

  async findTemplateByKeyChannelLocale(
    key: string,
    channel: string,
    locale: string,
  ): Promise<NotificationTemplateRow | null> {
    const result = await this.db.query<NotificationTemplateRow>(
      `SELECT * FROM notification_templates WHERE key = $1 AND channel = $2 AND locale = $3 AND status = 'active' LIMIT 1`,
      [key, channel, locale],
    );
    return result.rows[0] ?? null;
  }

  async findTemplatesByCategoryAndChannel(
    category: string,
    channel: string,
  ): Promise<NotificationTemplateRow[]> {
    const result = await this.db.query<NotificationTemplateRow>(
      `SELECT * FROM notification_templates WHERE category = $1 AND channel = $2 AND status = 'active' LIMIT 500`,
      [category, channel],
    );
    return result.rows;
  }

  async findAllTemplates(): Promise<NotificationTemplateRow[]> {
    const result = await this.db.query<NotificationTemplateRow>(
      `SELECT * FROM notification_templates ORDER BY key, channel, locale LIMIT 1000`,
    );
    return result.rows;
  }

  async findTemplatesPage(limit: number, offset: number): Promise<{ rows: NotificationTemplateRow[]; total: number }> {
    const [dataResult, countResult] = await Promise.all([
      this.db.query<NotificationTemplateRow>(
        `SELECT * FROM notification_templates ORDER BY key, channel, locale LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.query<{ count: string }>(`SELECT COUNT(*) AS count FROM notification_templates`),
    ]);
    return { rows: dataResult.rows, total: parseInt(countResult.rows[0]?.count ?? '0', 10) };
  }

  async findTemplateById(id: string): Promise<NotificationTemplateRow | null> {
    const result = await this.db.query<NotificationTemplateRow>(
      `SELECT * FROM notification_templates WHERE id = $1 LIMIT 1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  // --- Preferences ---

  async findPreferencesByUserId(userId: string): Promise<NotificationPreferenceRow[]> {
    const result = await this.db.query<NotificationPreferenceRow>(
      `SELECT * FROM notification_preferences WHERE user_id = $1 LIMIT 500`,
      [userId],
    );
    return result.rows;
  }

  async findAllPreferences(limit: number, offset: number): Promise<{ rows: NotificationPreferenceRow[]; total: number }> {
    const [dataResult, countResult] = await Promise.all([
      this.db.query<NotificationPreferenceRow>(
        `SELECT * FROM notification_preferences ORDER BY updated_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.query<{ count: string }>(`SELECT COUNT(*) AS count FROM notification_preferences`),
    ]);
    return { rows: dataResult.rows, total: parseInt(countResult.rows[0]?.count ?? '0', 10) };
  }

  async upsertPreference(
    userId: string,
    userType: string,
    channel: string,
    category: string,
    enabled: boolean,
  ): Promise<NotificationPreferenceRow> {
    const result = await this.db.query<NotificationPreferenceRow>(
      `INSERT INTO notification_preferences (user_id, user_type, channel, category, enabled)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, channel, category)
       DO UPDATE SET enabled = $5, updated_at = now()
       RETURNING *`,
      [userId, userType, channel, category, enabled],
    );
    return result.rows[0];
  }

  // --- Device Tokens ---

  async findActiveTokensByUserId(userId: string): Promise<DeviceTokenRow[]> {
    const result = await this.db.query<DeviceTokenRow>(
      `SELECT * FROM device_tokens WHERE user_id = $1 AND status = 'active' LIMIT 100`,
      [userId],
    );
    return result.rows;
  }

  async upsertDeviceToken(
    userId: string,
    platform: string,
    token: string,
    deviceLabel: string | null,
  ): Promise<DeviceTokenRow> {
    const result = await this.db.query<DeviceTokenRow>(
      `INSERT INTO device_tokens (user_id, platform, token, device_label, last_seen_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (token)
       DO UPDATE SET platform = $2, device_label = $4, status = 'active', last_seen_at = now(), updated_at = now()
       RETURNING *`,
      [userId, platform, token, deviceLabel],
    );
    return result.rows[0];
  }

  async disableDeviceToken(tokenId: string, userId: string): Promise<void> {
    await this.db.query(
      `UPDATE device_tokens SET status = 'revoked', updated_at = now() WHERE id = $1 AND user_id = $2`,
      [tokenId, userId],
    );
  }

  async cleanupExpiredTokens(daysOld: number): Promise<number> {
    const result = await this.db.query(
      `UPDATE device_tokens SET status = 'stale', updated_at = now()
       WHERE status = 'active' AND last_seen_at < now() - INTERVAL '1 day' * $1
       RETURNING id`,
      [daysOld],
    );
    return result.rowCount ?? 0;
  }

  // --- Notification Events ---

  async createEvent(
    recipientId: string,
    recipientType: string,
    templateId: string,
    channel: string,
    category: string,
    state: string,
    payload: Record<string, unknown>,
  ): Promise<NotificationEventRow> {
    const result = await this.db.query<NotificationEventRow>(
      `INSERT INTO notification_events (recipient_id, recipient_type, template_id, channel, category, payload, state)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       RETURNING *`,
      [recipientId, recipientType, templateId, channel, category, JSON.stringify(payload), state],
    );
    return result.rows[0];
  }

  async findEventsByUserId(
    recipientId: string,
    channel: string,
    limit: number,
    offset: number,
  ): Promise<NotificationEventRow[]> {
    const result = await this.db.query<NotificationEventRow>(
      `SELECT * FROM notification_events
       WHERE recipient_id = $1 AND channel = $2
       ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [recipientId, channel, limit, offset],
    );
    return result.rows;
  }

  async findInAppEventsByUserId(
    recipientId: string,
    limit: number,
    offset: number,
  ): Promise<NotificationEventRow[]> {
    return this.findEventsByUserId(recipientId, 'in_app', limit, offset);
  }

  async updateEventStatus(
    eventId: string,
    recipientId: string,
    state: string,
  ): Promise<NotificationEventRow | null> {
    const timestampColumns: Record<string, string> = {
      read: 'read_at',
      dismissed: 'dismissed_at',
    };
    const timestampField = timestampColumns[state];
    const extra = timestampField ? `, ${timestampField} = now()` : '';
    const result = await this.db.query<NotificationEventRow>(
      `UPDATE notification_events SET state = $1, updated_at = now()${extra}
       WHERE id = $2 AND recipient_id = $3 RETURNING *`,
      [state, eventId, recipientId],
    );
    return result.rows[0] ?? null;
  }

  async findQueuedEvents(limit: number): Promise<NotificationEventRow[]> {
    const result = await this.db.query<NotificationEventRow>(
      `SELECT * FROM notification_events
       WHERE state = 'queued'
       ORDER BY created_at ASC LIMIT $1`,
      [limit],
    );
    return result.rows;
  }

  async findQueuedEventsPage(limit: number, offset: number): Promise<{ rows: NotificationEventRow[]; total: number }> {
    const [dataResult, countResult] = await Promise.all([
      this.db.query<NotificationEventRow>(
        `SELECT * FROM notification_events WHERE state IN ('scheduled', 'queued')
         ORDER BY created_at ASC LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM notification_events WHERE state IN ('scheduled', 'queued')`,
      ),
    ]);
    return { rows: dataResult.rows, total: parseInt(countResult.rows[0]?.count ?? '0', 10) };
  }

  async countUnreadByUserId(recipientId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notification_events
       WHERE recipient_id = $1 AND channel = 'in_app' AND state NOT IN ('read', 'dismissed')`,
      [recipientId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  // --- Reminder Schedules ---

  async createReminderSchedule(
    ownerId: string,
    ownerType: string,
    kind: string,
    cadence: string,
    nextRunAt: string,
  ): Promise<ReminderScheduleRow> {
    const result = await this.db.query<ReminderScheduleRow>(
      `INSERT INTO reminder_schedules (owner_id, owner_type, kind, cadence, next_run_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [ownerId, ownerType, kind, cadence, nextRunAt],
    );
    return result.rows[0];
  }

  async findActiveSchedulesByUserId(ownerId: string): Promise<ReminderScheduleRow[]> {
    const result = await this.db.query<ReminderScheduleRow>(
      `SELECT * FROM reminder_schedules WHERE owner_id = $1 AND status = 'active' ORDER BY next_run_at ASC`,
      [ownerId],
    );
    return result.rows;
  }

  async findSchedulesPage(
    limit: number,
    offset: number,
    status?: string,
  ): Promise<{ rows: ReminderScheduleRow[]; total: number }> {
    const where = status ? `WHERE status = $3` : '';
    const dataParams = status ? [limit, offset, status] : [limit, offset];
    const countParams = status ? [status] : [];
    const [dataResult, countResult] = await Promise.all([
      this.db.query<ReminderScheduleRow>(
        `SELECT * FROM reminder_schedules ${where} ORDER BY next_run_at ASC LIMIT $1 OFFSET $2`,
        dataParams,
      ),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM reminder_schedules ${status ? 'WHERE status = $1' : ''}`,
        countParams,
      ),
    ]);
    return { rows: dataResult.rows, total: parseInt(countResult.rows[0]?.count ?? '0', 10) };
  }

  async findDueSchedules(limit: number): Promise<ReminderScheduleRow[]> {
    const result = await this.db.query<ReminderScheduleRow>(
      `SELECT * FROM reminder_schedules
       WHERE status = 'active' AND next_run_at <= now()
       ORDER BY next_run_at ASC LIMIT $1`,
      [limit],
    );
    return result.rows;
  }

  async updateScheduleStatus(
    scheduleId: string,
    ownerId: string,
    status: string,
  ): Promise<ReminderScheduleRow | null> {
    const result = await this.db.query<ReminderScheduleRow>(
      `UPDATE reminder_schedules SET status = $1, updated_at = now()
       WHERE id = $2 AND owner_id = $3 RETURNING *`,
      [status, scheduleId, ownerId],
    );
    return result.rows[0] ?? null;
  }

  async updateScheduleNextRun(scheduleId: string, nextRunAt: string): Promise<void> {
    await this.db.query(
      `UPDATE reminder_schedules SET next_run_at = $1, updated_at = now()
       WHERE id = $2`,
      [nextRunAt, scheduleId],
    );
  }

  // --- Delivery Attempts ---

  async createDeliveryAttempt(
    notificationEventId: string,
    channel: string,
    provider: string,
    status: string,
    attemptNumber: number,
    errorCode: string | null,
  ): Promise<DeliveryAttemptRow> {
    const result = await this.db.query<DeliveryAttemptRow>(
      `INSERT INTO notification_delivery_attempts (notification_event_id, channel, provider, status, attempt_number, error_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [notificationEventId, channel, provider, status, attemptNumber, errorCode],
    );
    return result.rows[0];
  }

  async findAttemptsByEventId(eventId: string): Promise<DeliveryAttemptRow[]> {
    const result = await this.db.query<DeliveryAttemptRow>(
      `SELECT * FROM notification_delivery_attempts WHERE notification_event_id = $1 ORDER BY attempt_number ASC LIMIT 100`,
      [eventId],
    );
    return result.rows;
  }

  // --- Digests ---

  async createDigest(
    recipientId: string,
    recipientType: string,
    period: string,
    periodStart: string,
    periodEnd: string,
    eventIds: string[],
  ): Promise<NotificationDigestRow> {
    const result = await this.db.query<NotificationDigestRow>(
      `INSERT INTO notification_digests (recipient_id, recipient_type, period, period_start, period_end, event_ids)
       VALUES ($1, $2, $3, $4, $5, $6::uuid[]) RETURNING *`,
      [recipientId, recipientType, period, periodStart, periodEnd, eventIds],
    );
    return result.rows[0];
  }

  async updateDigestState(digestId: string, state: string): Promise<void> {
    await this.db.query(
      `UPDATE notification_digests SET state = $1 WHERE id = $2`,
      [state, digestId],
    );
  }

  // --- Quiet Hours ---

  async findQuietHoursByUserId(userId: string): Promise<QuietHoursRow | null> {
    const result = await this.db.query<QuietHoursRow>(
      `SELECT * FROM notification_quiet_hours WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    return result.rows[0] ?? null;
  }

  // A row's mere existence means quiet hours are enabled (the table has no
  // `enabled` column) -- disabling deletes the row.
  async upsertQuietHours(
    userId: string,
    userType: string,
    enabled: boolean,
    startTime: string,
    endTime: string,
    timezone: string,
  ): Promise<QuietHoursRow | null> {
    if (!enabled) {
      await this.db.query(`DELETE FROM notification_quiet_hours WHERE user_id = $1`, [userId]);
      return null;
    }
    const result = await this.db.query<QuietHoursRow>(
      `INSERT INTO notification_quiet_hours (user_id, user_type, start_time, end_time, timezone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET start_time = $3, end_time = $4, timezone = $5, updated_at = now()
       RETURNING *`,
      [userId, userType, startTime, endTime, timezone],
    );
    return result.rows[0];
  }

  // --- Audit Logs ---

  async createAuditLog(
    actorId: string | null,
    actorType: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown> | null,
  ): Promise<NotificationAuditLogRow> {
    const result = await this.db.query<NotificationAuditLogRow>(
      `INSERT INTO notification_audit_logs (actor_id, actor_type, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING *`,
      [actorId, actorType, action, entityType, entityId, JSON.stringify(metadata ?? {})],
    );
    return result.rows[0];
  }

  async findAuditLogsByUserId(
    actorId: string,
    limit: number,
    offset: number,
  ): Promise<NotificationAuditLogRow[]> {
    const result = await this.db.query<NotificationAuditLogRow>(
      `SELECT * FROM notification_audit_logs WHERE actor_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [actorId, limit, offset],
    );
    return result.rows;
  }

  async findAuditLogsByEventType(
    action: string,
    limit: number,
    offset: number,
  ): Promise<NotificationAuditLogRow[]> {
    const result = await this.db.query<NotificationAuditLogRow>(
      `SELECT * FROM notification_audit_logs WHERE action = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [action, limit, offset],
    );
    return result.rows;
  }

  async findAllAuditLogsPage(limit: number, offset: number): Promise<{ rows: NotificationAuditLogRow[]; total: number }> {
    const [dataResult, countResult] = await Promise.all([
      this.db.query<NotificationAuditLogRow>(
        `SELECT * FROM notification_audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.query<{ count: string }>(`SELECT COUNT(*) AS count FROM notification_audit_logs`),
    ]);
    return { rows: dataResult.rows, total: parseInt(countResult.rows[0]?.count ?? '0', 10) };
  }

  // --- Admin Broadcast Schedules ---

  async createBroadcastSchedule(data: {
    title: string;
    body: string;
    channel: string;
    audience: string;
    schedule: string;
    nextRunAt: string | null;
    createdBy: string | null;
  }): Promise<AdminBroadcastScheduleRow> {
    const result = await this.db.query<AdminBroadcastScheduleRow>(
      `INSERT INTO admin_broadcast_schedules (title, body, channel, audience, schedule, next_run_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.title, data.body, data.channel, data.audience, data.schedule, data.nextRunAt, data.createdBy],
    );
    return result.rows[0];
  }

  async findBroadcastSchedulesPage(limit: number, offset: number): Promise<{ rows: AdminBroadcastScheduleRow[]; total: number }> {
    const [dataResult, countResult] = await Promise.all([
      this.db.query<AdminBroadcastScheduleRow>(
        `SELECT * FROM admin_broadcast_schedules ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.query<{ count: string }>(`SELECT COUNT(*) AS count FROM admin_broadcast_schedules`),
    ]);
    return { rows: dataResult.rows, total: parseInt(countResult.rows[0]?.count ?? '0', 10) };
  }

  async findDueBroadcastSchedules(): Promise<AdminBroadcastScheduleRow[]> {
    const result = await this.db.query<AdminBroadcastScheduleRow>(
      `SELECT * FROM admin_broadcast_schedules
       WHERE status = 'active' AND schedule != 'once' AND next_run_at IS NOT NULL AND next_run_at <= now()
       ORDER BY next_run_at ASC LIMIT 50`,
    );
    return result.rows;
  }

  async updateBroadcastAfterRun(id: string, sentCount: number, nextRunAt: string | null): Promise<void> {
    await this.db.query(
      `UPDATE admin_broadcast_schedules
       SET last_run_at = now(), sent_count = sent_count + $2, next_run_at = $3,
           status = CASE WHEN $3 IS NULL THEN 'sent' ELSE status END,
           updated_at = now()
       WHERE id = $1`,
      [id, sentCount, nextRunAt],
    );
  }

  async setBroadcastStatus(id: string, status: string): Promise<AdminBroadcastScheduleRow | null> {
    const result = await this.db.query<AdminBroadcastScheduleRow>(
      `UPDATE admin_broadcast_schedules SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return result.rows[0] ?? null;
  }

  async deleteBroadcastSchedule(id: string): Promise<void> {
    await this.db.query(`DELETE FROM admin_broadcast_schedules WHERE id = $1`, [id]);
  }

  async findUsersByAudience(audience: 'all' | 'free' | 'students' | 'parents'): Promise<BroadcastUserRow[]> {
    if (audience === 'students') {
      const r = await this.db.query<BroadcastUserRow>(
        `SELECT id, user_type FROM users WHERE status = 'active' AND user_type = 'student' LIMIT 10000`,
      );
      return r.rows;
    }
    if (audience === 'parents') {
      const r = await this.db.query<BroadcastUserRow>(
        `SELECT id, user_type FROM users WHERE status = 'active' AND user_type = 'parent' LIMIT 10000`,
      );
      return r.rows;
    }
    if (audience === 'free') {
      const r = await this.db.query<BroadcastUserRow>(
        `SELECT u.id, u.user_type FROM users u
         WHERE u.status = 'active' AND u.user_type IN ('student', 'parent')
           AND NOT EXISTS (
             SELECT 1 FROM subscriptions s
             JOIN billing_plans bp ON bp.id = s.plan_id
             WHERE s.user_id = u.id AND s.status = 'active' AND bp.plan_type != 'free'
           )
         LIMIT 10000`,
      );
      return r.rows;
    }
    const r = await this.db.query<BroadcastUserRow>(
      `SELECT id, user_type FROM users WHERE status = 'active' AND user_type IN ('student', 'parent') LIMIT 10000`,
    );
    return r.rows;
  }
}
