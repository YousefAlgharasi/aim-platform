import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import {
  AuditLogEntry,
  AuditLogInput,
  AuditLogListResponse,
  AuditLogRow,
} from './curriculum-audit-log.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function toEntry(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    eventType: row.event_type,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

@Injectable()
export class CurriculumAuditLogService {
  private readonly logger = new Logger(CurriculumAuditLogService.name);

  constructor(private readonly db: DatabaseService) {}

  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO curriculum_audit_logs
           (actor_user_id, entity_type, entity_id, event_type, previous_status, new_status, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          input.actorUserId ?? null,
          input.entityType,
          input.entityId,
          input.eventType,
          input.previousStatus ?? null,
          input.newStatus ?? null,
          input.metadata ? JSON.stringify(input.metadata) : null,
        ],
      );
    } catch (err) {
      this.logger.error(
        `Audit log write failed: ${input.eventType} on ${input.entityType}:${input.entityId}`,
        err,
      );
    }
  }

  async listLogs(
    page: number,
    limit: number,
    entityType?: string,
    entityId?: string,
    eventType?: string,
    actorUserId?: string,
  ): Promise<AuditLogListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (entityType) {
      conditions.push(`entity_type = $${idx++}`);
      values.push(entityType);
    }
    if (entityId) {
      conditions.push(`entity_id = $${idx++}`);
      values.push(entityId);
    }
    if (eventType) {
      conditions.push(`event_type = $${idx++}`);
      values.push(eventType);
    }
    if (actorUserId) {
      conditions.push(`actor_user_id = $${idx++}`);
      values.push(actorUserId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM curriculum_audit_logs ${where}`,
      values,
    );
    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<AuditLogRow>(
      `SELECT id, actor_user_id, entity_type, entity_id, event_type,
              previous_status, new_status, metadata, created_at
         FROM curriculum_audit_logs
         ${where}
         ORDER BY created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      logs: dataResult.rows.map(toEntry),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }
}
