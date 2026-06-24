// P18-025: Create AI Teacher Repository Layer
// Backend-only persistence abstraction for ai_teacher_audit_logs. Details
// must never include provider secrets, API keys, or raw provider payloads.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiTeacherAuditLogRow } from './governance-repository.types';

export interface CreateAiTeacherAuditLogInput {
  readonly actorId?: string | null;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId?: string | null;
  readonly details?: Record<string, unknown>;
}

@Injectable()
export class AiTeacherAuditLogRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(input: CreateAiTeacherAuditLogInput): Promise<AiTeacherAuditLogRow> {
    const result = await this.db.query<AiTeacherAuditLogRow>(
      `INSERT INTO ai_teacher_audit_logs (actor_id, action, resource_type, resource_id, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, actor_id, action, resource_type, resource_id, details, created_at`,
      [
        input.actorId ?? null,
        input.action,
        input.resourceType,
        input.resourceId ?? null,
        JSON.stringify(input.details ?? {}),
      ],
    );
    return result.rows[0] ?? null;
  }

  async findByResource(
    resourceType: string,
    resourceId: string,
  ): Promise<AiTeacherAuditLogRow[]> {
    const result = await this.db.query<AiTeacherAuditLogRow>(
      `SELECT id, actor_id, action, resource_type, resource_id, details, created_at
       FROM ai_teacher_audit_logs
       WHERE resource_type = $1 AND resource_id = $2
       ORDER BY created_at DESC`,
      [resourceType, resourceId],
    );
    return result.rows;
  }

  // P18-078: Admin AI Audit UI — recent audit log rows across all
  // resource types, for the admin traceability viewer.
  async listRecent(limit: number): Promise<AiTeacherAuditLogRow[]> {
    const result = await this.db.query<AiTeacherAuditLogRow>(
      `SELECT id, actor_id, action, resource_type, resource_id, details, created_at
       FROM ai_teacher_audit_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );
    return result.rows;
  }
}
