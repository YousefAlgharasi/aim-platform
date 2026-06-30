import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { NotificationQueueService } from './notification-queue.service';
import { AdminBroadcastScheduleRow } from './notification-repository.types';

function nextRunAt(schedule: string): string | null {
  if (schedule === 'once') return null;
  const d = new Date();
  if (schedule === 'daily') {
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(9, 0, 0, 0);
    return d.toISOString();
  }
  if (schedule === 'weekly') {
    const daysUntilMonday = (8 - d.getUTCDay()) % 7 || 7;
    d.setUTCDate(d.getUTCDate() + daysUntilMonday);
    d.setUTCHours(9, 0, 0, 0);
    return d.toISOString();
  }
  if (schedule === 'monthly') {
    const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 9, 0, 0, 0));
    return first.toISOString();
  }
  return null;
}

export interface CreateBroadcastPayload {
  title: string;
  body: string;
  channel: 'in_app' | 'push' | 'email';
  audience: 'all' | 'free' | 'students' | 'parents';
  schedule: 'once' | 'daily' | 'weekly' | 'monthly';
  createdBy: string | null;
}

@Injectable()
export class AdminBroadcastService {
  private readonly logger = new Logger(AdminBroadcastService.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly queueService: NotificationQueueService,
  ) {}

  async createAndSend(payload: CreateBroadcastPayload): Promise<AdminBroadcastScheduleRow> {
    const broadcast = await this.repo.createBroadcastSchedule({
      title: payload.title,
      body: payload.body,
      channel: payload.channel,
      audience: payload.audience,
      schedule: payload.schedule,
      nextRunAt: nextRunAt(payload.schedule),
      createdBy: payload.createdBy,
    });

    // Fire immediately for 'once' schedules; recurring schedules start on next_run_at.
    if (payload.schedule === 'once') {
      const sent = await this.fireBroadcast(broadcast.id, payload.title, payload.body, payload.channel, payload.audience);
      await this.repo.updateBroadcastAfterRun(broadcast.id, sent, null);
    }

    return broadcast;
  }

  async fireBroadcastById(id: string): Promise<{ sent: number }> {
    const rows = await this.repo.findBroadcastSchedulesPage(1, 0);
    const broadcast = rows.rows.find((r) => r.id === id);
    if (!broadcast) throw new Error(`Broadcast ${id} not found`);
    const sent = await this.fireBroadcast(broadcast.id, broadcast.title, broadcast.body, broadcast.channel, broadcast.audience);
    const next = nextRunAt(broadcast.schedule);
    await this.repo.updateBroadcastAfterRun(id, sent, next);
    return { sent };
  }

  async processDue(): Promise<void> {
    const due = await this.repo.findDueBroadcastSchedules();
    for (const b of due) {
      try {
        const sent = await this.fireBroadcast(b.id, b.title, b.body, b.channel, b.audience);
        const next = nextRunAt(b.schedule);
        await this.repo.updateBroadcastAfterRun(b.id, sent, next);
        this.logger.log(`Broadcast ${b.id} fired: ${sent} notifications queued`);
      } catch (err) {
        this.logger.error(`Failed to fire broadcast ${b.id}`, err as Error);
      }
    }
  }

  async disable(id: string): Promise<AdminBroadcastScheduleRow | null> {
    return this.repo.setBroadcastStatus(id, 'disabled');
  }

  async enable(id: string): Promise<AdminBroadcastScheduleRow | null> {
    return this.repo.setBroadcastStatus(id, 'active');
  }

  async delete(id: string): Promise<void> {
    return this.repo.deleteBroadcastSchedule(id);
  }

  async list(page: number, limit: number) {
    return this.repo.findBroadcastSchedulesPage(limit, (page - 1) * limit);
  }

  private async fireBroadcast(
    id: string,
    title: string,
    body: string,
    channel: string,
    audience: string,
  ): Promise<number> {
    const users = await this.repo.findUsersByAudience(audience as 'all' | 'free' | 'students' | 'parents');
    let sent = 0;
    for (const user of users) {
      if (user.user_type !== 'student' && user.user_type !== 'parent') continue;
      try {
        const event = await this.queueService.enqueue({
          userId: user.id,
          recipientType: user.user_type,
          templateKey: 'system_broadcast',
          channel,
          category: 'system_alert',
          locale: 'en',
          variables: { broadcast_title: title, broadcast_body: body },
        });
        if (event) sent++;
      } catch (err) {
        this.logger.warn(`Failed to queue broadcast ${id} for user ${user.id}`, err as Error);
      }
    }
    return sent;
  }
}
