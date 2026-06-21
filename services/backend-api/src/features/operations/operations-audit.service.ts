import { Injectable, Logger } from '@nestjs/common';
import { OperationsAuditLog } from './operations.entities';

@Injectable()
export class OperationsAuditService {
  private readonly logger = new Logger(OperationsAuditService.name);

  async logAction(
    actorId: string,
    action: string,
    resourceType: OperationsAuditLog['resourceType'],
    resourceId: string,
    details?: Record<string, unknown>,
  ): Promise<OperationsAuditLog> {
    const entry: OperationsAuditLog = {
      id: crypto.randomUUID(),
      actorId,
      action,
      resourceType,
      resourceId,
      details: details || {},
      createdAt: new Date(),
    };

    this.logger.log(
      `Audit: actor=${actorId} action=${action} resource=${resourceType}:${resourceId}`,
    );

    // TODO: Persist to database when operations repository is implemented
    return entry;
  }

  async getByResource(
    resourceType: OperationsAuditLog['resourceType'],
    resourceId: string,
  ): Promise<OperationsAuditLog[]> {
    this.logger.debug(
      `Fetching audit logs for resource=${resourceType}:${resourceId}`,
    );

    // TODO: Query from database when operations repository is implemented
    return [];
  }

  async getByActor(
    actorId: string,
    pagination?: { limit?: number; offset?: number },
  ): Promise<OperationsAuditLog[]> {
    const limit = pagination?.limit ?? 50;
    const offset = pagination?.offset ?? 0;

    this.logger.debug(
      `Fetching audit logs for actor=${actorId} limit=${limit} offset=${offset}`,
    );

    // TODO: Query from database when operations repository is implemented
    return [];
  }
}
