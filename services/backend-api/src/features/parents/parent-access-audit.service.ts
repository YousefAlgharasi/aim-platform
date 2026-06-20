// P12-024: Create Parent Access Audit Service
// Records safe, append-only metadata whenever a parent accesses child
// information or performs a link action (link create/accept/revoke,
// consent grant/revoke, report/dashboard reads, etc.).
//
// This service only ever writes parent_id, child_id, an action label, a
// resource type label, and connection metadata (ip/user agent) — it never
// logs request bodies, tokens, credentials, or any progress/assessment/
// AIM content. It never computes mastery, weakness, score, correctness,
// recommendations, or any AIM/assessment output.

import { Injectable } from '@nestjs/common';

import { ParentAccessAuditLogRow } from './parent-repository.types';
import { ParentRepository } from './parent.repository';

export interface ParentAccessAuditLogEntry {
  id: string;
  parentId: string;
  childId: string;
  action: string;
  resourceType: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

@Injectable()
export class ParentAccessAuditService {
  constructor(private readonly parentRepository: ParentRepository) {}

  async recordAccess(
    parentId: string,
    childId: string,
    action: string,
    resourceType: string,
    ipAddress: string | null = null,
    userAgent: string | null = null,
  ): Promise<ParentAccessAuditLogEntry> {
    const row = await this.parentRepository.recordAccess(
      parentId,
      childId,
      action,
      resourceType,
      ipAddress,
      userAgent,
    );

    return this.toEntry(row);
  }

  async listForParent(parentId: string): Promise<ParentAccessAuditLogEntry[]> {
    const rows = await this.parentRepository.findAuditLogsByParent(parentId);

    return rows.map((row) => this.toEntry(row));
  }

  async listForChild(childId: string): Promise<ParentAccessAuditLogEntry[]> {
    const rows = await this.parentRepository.findAuditLogsByChild(childId);

    return rows.map((row) => this.toEntry(row));
  }

  private toEntry(row: ParentAccessAuditLogRow): ParentAccessAuditLogEntry {
    return {
      id: row.id,
      parentId: row.parent_id,
      childId: row.child_id,
      action: row.action,
      resourceType: row.resource_type,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at.toISOString(),
    };
  }
}
