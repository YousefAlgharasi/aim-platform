import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
import { OperationsAuditService } from './operations-audit.service';
import { OperationalStatus } from './operations.entities';

export interface UpdateComponentStatusDto {
  status: string;
  description?: string;
}

@Injectable()
export class OperationalStatusService {
  private readonly logger = new Logger(OperationalStatusService.name);

  constructor(
    private readonly opsRepo: OperationsRepository,
    private readonly auditService: OperationsAuditService,
  ) {}

  async getStatus(): Promise<OperationalStatus[]> {
    this.logger.debug('Fetching all component statuses');
    return this.opsRepo.findAllOperationalStatuses();
  }

  async getComponentStatus(component: string): Promise<OperationalStatus> {
    this.logger.debug(`Fetching status for component: ${component}`);
    const status = await this.opsRepo.findOperationalStatusByComponent(component);
    if (!status) {
      throw new NotFoundException(`Component '${component}' not found`);
    }
    return status;
  }

  async updateComponentStatus(
    component: string,
    dto: UpdateComponentStatusDto,
    adminId: string,
  ): Promise<OperationalStatus> {
    const updated = await this.opsRepo.upsertOperationalStatus(
      component,
      dto.status,
      dto.description || null,
      adminId,
    );

    this.logger.log(
      `Component '${component}' status updated to '${dto.status}' by admin ${adminId}`,
    );

    await this.auditService.logAction(
      adminId,
      'operational_status.updated',
      'operational_status',
      component,
      { status: dto.status, description: dto.description },
    );

    return updated;
  }
}
