import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OperationsAuditService } from './operations-audit.service';
import { OperationalStatus } from './operations.entities';

export interface UpdateComponentStatusDto {
  status: string;
  description?: string;
}

@Injectable()
export class OperationalStatusService {
  private readonly logger = new Logger(OperationalStatusService.name);

  constructor(private readonly auditService: OperationsAuditService) {}

  async getStatus(): Promise<OperationalStatus[]> {
    this.logger.debug('Fetching all component statuses');

    // TODO: Query from database when operations repository is implemented
    return [];
  }

  async getComponentStatus(component: string): Promise<OperationalStatus> {
    this.logger.debug(`Fetching status for component: ${component}`);

    // TODO: Query from database when operations repository is implemented
    throw new NotFoundException(`Component '${component}' not found`);
  }

  async updateComponentStatus(
    component: string,
    dto: UpdateComponentStatusDto,
    adminId: string,
  ): Promise<OperationalStatus> {
    this.logger.log(
      `Component '${component}' status updated to '${dto.status}' by admin ${adminId}`,
    );

    const updated: OperationalStatus = {
      id: crypto.randomUUID(),
      component,
      status: dto.status,
      description: dto.description || null,
      updatedBy: adminId,
      metadata: {},
      updatedAt: new Date(),
    };

    await this.auditService.logAction(
      adminId,
      'operational_status.updated',
      'operational_status',
      component,
      { status: dto.status, description: dto.description },
    );

    // TODO: Persist to database when operations repository is implemented
    return updated;
  }
}
