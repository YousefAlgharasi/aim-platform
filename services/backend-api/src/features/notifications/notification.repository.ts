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
      `SELECT * FROM notification_templates WHERE category = $1 AND channel = $2 AND status = 'active'`,
      [category, channel],
    );
    return result.rows;
  }

  async findAllTemplates(): Promise<NotificationTemplateRow[]> {
    const result = await this.db.query<NotificationTemplateRow>(
      `SELECT * FROM notification_templates ORDER BY key, channel, locale`,
    );
    return result.rows;
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
      `SELECT * FROM notification_preferences WHERE user_id = $1`,
      [userId],
    );
    return result.rows;
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
      `SELECT * FROM device_tokens WHERE user_id = $1 AND status = 'active'`,
      [userId],
    );
    return result.rows;
  }

  async upsertDeviceToken(
    userId: string,
    platform: string,
    token: string,
    deviceName: string | null,
  ): Promise<DeviceTokenRow> {
    const result = await this.db.query<DeviceTokenRow>(
      `INSERT INTO device_tokens (user_id, platform, token, device_name, last_seen_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (user_id, token)
       DO UPDATE SET platform = $2, device_name = $4, status = 'active', last_seen_at = now(), updated_at = now()
       RETURNING *`,
      [userId, platform, token, deviceName],
    );
    return result.rows[0];
  }

  async disableDeviceToken(tokenId: string, userId: string): Promise<void> {
    await this.db.query(
      `UPDATE device_tokens SET status = 'disabled', updated_at = now() WHERE id = $1 AND user_id = $2`,
      [tokenId, userId],
    );
  }

  async cleanupExpiredTokens(daysOld: number): Promise<number> {
    const result = await this.db.query(
      `UPDATE device_tokens SET status = 'expired', updated_at = now()
       WHERE status = 'active' AND last_seen_at < now() - INTERVAL '1 day' * $1
       RETURNING id`,
      [daysOld],
    );
    return result.rowCount ?? 0;
  }

  // --- Notification Events ---

  async createEvent(
    userId: string,
    templateId: string,
    channel: string,
    category: string,
    status: string,
    title: string,
    body: string,
    scheduledAt: string | null,
  ): Promise<NotificationEventRow> {
    const result = await this.db.query<NotificationEventRow>(
      `INSERT INTO notification_events (user_id, template_id, channel, category, status, title, body, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, templateId, channel, category, status, title, body, scheduledAt],
    );
    return result.rows[0];
  }

  async findEventsByUserId(
    userId: string,
    channel: string,
    limit: number,
    offset: number,
  ): Promise<NotificationEventRow[]> {
    const result = await this.db.query<NotificationEventRow>(
      `SELECT * FROM notification_events
       WHERE user_id = $1 AND channel = $2
       ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [userId, channel, limit, offset],
    );
    return result.rows;
  }

  async findInAppEventsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<NotificationEventRow[]> {
    return this.findEventsByUserId(userId, 'in_app', limit, offset);
  }

  async updateEventStatus(
    eventId: string,
    userId: string,
    status: string,
  ): Promise<NotificationEventRow | null> {
    const timestampField =
      status === 'read' ? 'read_at' : status === 'dismissed' ? 'dismissed_at' : status === 'sent' ? 'sent_at' : null;
    const extra = timestampField ? `, ${timestampField} = now()` : '';
    const result = await this.db.query<NotificationEventRow>(
      `UPDATE notification_events SET status = $1, updated_at = now()${extra}
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, eventId, userId],
    );
    return result.rows[0] ?? null;
  }

  async findQueuedEvents(limit: number): Promise<NotificationEventRow[]> {
    const result = await this.db.query<NotificationEventRow>(
      `SELECT * FROM notification_events
       WHERE status = 'queued' AND (scheduled_at IS NULL OR scheduled_at <= now())
       ORDER BY created_at ASC LIMIT $1`,
      [limit],
    );
    return result.rows;
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notification_events
       WHERE user_id = $1 AND channel = 'in_app' AND status NOT IN ('read', 'dismissed')`,
      [userId],
    );
    return parseInt(result.rows[0].count, 10);
  }

  // --- Reminder Schedules ---

  async createReminderSchedule(
    userId: string,
    reminderType: string,
    cronExpression: string,
    referenceId: string | null,
    nextFireAt: string | null,
    endsAt: string | null,
  ): Promise<ReminderScheduleRow> {
    const result = await this.db.query<ReminderScheduleRow>(
      `INSERT INTO reminder_schedules (user_id, reminder_type, cron_expression, reference_id, next_fire_at, ends_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, reminderType, cronExpression, referenceId, nextFireAt, endsAt],
    );
    return result.rows[0];
  }

  async findActiveSchedulesByUserId(userId: string): Promise<ReminderScheduleRow[]> {
    const result = await this.db.query<ReminderScheduleRow>(
      `SELECT * FROM reminder_schedules WHERE user_id = $1 AND status = 'active' ORDER BY next_fire_at ASC`,
      [userId],
    );
    return result.rows;
  }

  async findDueSchedules(limit: number): Promise<ReminderScheduleRow[]> {
    const result = await this.db.query<ReminderScheduleRow>(
      `SELECT * FROM reminder_schedules
       WHERE status = 'active' AND next_fire_at <= now()
       ORDER BY next_fire_at ASC LIMIT $1`,
      [limit],
    );
    return result.rows;
  }

  async updateScheduleStatus(
    scheduleId: string,
    userId: string,
    status: string,
  ): Promise<ReminderScheduleRow | null> {
    const result = await this.db.query<ReminderScheduleRow>(
      `UPDATE reminder_schedules SET status = $1, updated_at = now()
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, scheduleId, userId],
    );
    return result.rows[0] ?? null;
  }

  async updateScheduleNextFire(
    scheduleId: string,
    nextFireAt: string,
    lastFiredAt: string,
  ): Promise<void> {
    await this.db.query(
      `UPDATE reminder_schedules SET next_fire_at = $1, last_fired_at = $2, updated_at = now()
       WHERE id = $3`,
      [nextFireAt, lastFiredAt, scheduleId],
    );
  }

  // --- Delivery Attempts ---

  async createDeliveryAttempt(
    notificationEventId: string,
    channel: string,
    status: string,
    attemptNumber: number,
    errorCode: string | null,
    errorMessage: string | null,
  ): Promise<DeliveryAttemptRow> {
    const result = await this.db.query<DeliveryAttemptRow>(
      `INSERT INTO notification_delivery_attempts (notification_event_id, channel, status, attempt_number, error_code, error_message, attempted_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       RETURNING *`,
      [notificationEventId, channel, status, attemptNumber, errorCode, errorMessage],
    );
    return result.rows[0];
  }

  async findAttemptsByEventId(eventId: string): Promise<DeliveryAttemptRow[]> {
    const result = await this.db.query<DeliveryAttemptRow>(
      `SELECT * FROM notification_delivery_attempts WHERE notification_event_id = $1 ORDER BY attempt_number ASC`,
      [eventId],
    );
    return result.rows;
  }

  // --- Digests ---

  async createDigest(
    userId: string,
    frequency: string,
    periodStart: string,
    periodEnd: string,
    eventCount: number,
  ): Promise<NotificationDigestRow> {
    const result = await this.db.query<NotificationDigestRow>(
      `INSERT INTO notification_digests (user_id, frequency, period_start, period_end, event_count)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, frequency, periodStart, periodEnd, eventCount],
    );
    return result.rows[0];
  }

  async updateDigestStatus(digestId: string, status: string): Promise<void> {
    const extra = status === 'sent' ? ', sent_at = now()' : '';
    await this.db.query(
      `UPDATE notification_digests SET status = $1, updated_at = now()${extra} WHERE id = $2`,
      [status, digestId],
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

  async upsertQuietHours(
    userId: string,
    enabled: boolean,
    startTime: string,
    endTime: string,
    timezone: string,
  ): Promise<QuietHoursRow> {
    const result = await this.db.query<QuietHoursRow>(
      `INSERT INTO notification_quiet_hours (user_id, enabled, start_time, end_time, timezone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET enabled = $2, start_time = $3, end_time = $4, timezone = $5, updated_at = now()
       RETURNING *`,
      [userId, enabled, startTime, endTime, timezone],
    );
    return result.rows[0];
  }

  // --- Audit Logs ---

  async createAuditLog(
    userId: string,
    eventType: string,
    resourceId: string | null,
    resourceType: string | null,
    metadata: Record<string, unknown> | null,
  ): Promise<NotificationAuditLogRow> {
    const result = await this.db.query<NotificationAuditLogRow>(
      `INSERT INTO notification_audit_logs (user_id, event_type, resource_id, resource_type, metadata)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, eventType, resourceId, resourceType, metadata ? JSON.stringify(metadata) : null],
    );
    return result.rows[0];
  }

  async findAuditLogsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<NotificationAuditLogRow[]> {
    const result = await this.db.query<NotificationAuditLogRow>(
      `SELECT * FROM notification_audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return result.rows;
  }

  async findAuditLogsByEventType(
    eventType: string,
    limit: number,
    offset: number,
  ): Promise<NotificationAuditLogRow[]> {
    const result = await this.db.query<NotificationAuditLogRow>(
      `SELECT * FROM notification_audit_logs WHERE event_type = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [eventType, limit, offset],
    );
    return result.rows;
  }
}
