import { Injectable, Logger } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
import { OperationsAuditLog } from './operations.entities';

@Injectable()
export class OperationsAuditService {
  private readonly logger = new Logger(OperationsAuditService.name);

  constructor(private readonly opsRepo: OperationsRepository) {}

  async logAction(
    actorId: string,
    action: string,
    resourceType: OperationsAuditLog['resourceType'],
    resourceId: string,
    details?: Record<string, unknown>,
  ): Promise<OperationsAuditLog> {
    this.logger.log(
      `Audit: actor=${actorId} action=${action} resource=${resourceType}:${resourceId}`,
    );

    return this.opsRepo.createAuditLog({
      actorId,
      action,
      resourceType,
      resourceId,
      details: details || {},
    });
  }

  async getByResource(
    resourceType: OperationsAuditLog['resourceType'],
    resourceId: string,
  ): Promise<OperationsAuditLog[]> {
    this.logger.debug(
      `Fetching audit logs for resource=${resourceType}:${resourceId}`,
    );
    return this.opsRepo.findAuditLogsByResource(resourceType, resourceId);
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
    return this.opsRepo.findAuditLogsByActor(actorId, limit, offset);
  }
}
