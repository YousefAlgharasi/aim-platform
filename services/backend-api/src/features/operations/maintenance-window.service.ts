import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OperationsAuditService } from './operations-audit.service';
import { MaintenanceWindow } from './operations.entities';

export interface CreateMaintenanceWindowDto {
  title: string;
  description?: string;
  type: MaintenanceWindow['type'];
  affectedServices: string[];
  scheduledStart: Date;
  scheduledEnd: Date;
  userMessage?: string;
}

export interface UpdateMaintenanceWindowStatusDto {
  status: MaintenanceWindow['status'];
}

export interface MaintenanceWindowFilters {
  status?: MaintenanceWindow['status'];
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class MaintenanceWindowService {
  private readonly logger = new Logger(MaintenanceWindowService.name);

  constructor(private readonly auditService: OperationsAuditService) {}

  async createWindow(
    dto: CreateMaintenanceWindowDto,
    adminId: string,
  ): Promise<MaintenanceWindow> {
    const window: MaintenanceWindow = {
      id: crypto.randomUUID(),
      title: dto.title,
      description: dto.description || null,
      type: dto.type,
      status: 'scheduled',
      affectedServices: dto.affectedServices,
      scheduledStart: dto.scheduledStart,
      scheduledEnd: dto.scheduledEnd,
      actualStart: null,
      actualEnd: null,
      userMessage: dto.userMessage || null,
      createdBy: adminId,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.log(`Maintenance window created: ${window.id} by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'maintenance_window.created',
      'maintenance_window',
      window.id,
      { title: dto.title, scheduledStart: dto.scheduledStart, scheduledEnd: dto.scheduledEnd },
    );

    // TODO: Persist to database when operations repository is implemented
    return window;
  }

  async getWindows(filters?: MaintenanceWindowFilters): Promise<MaintenanceWindow[]> {
    this.logger.debug('Fetching maintenance windows with filters', filters);

    // TODO: Query from database when operations repository is implemented
    return [];
  }

  async getWindowById(id: string): Promise<MaintenanceWindow> {
    this.logger.debug(`Fetching maintenance window: ${id}`);

    // TODO: Query from database when operations repository is implemented
    throw new NotFoundException(`Maintenance window ${id} not found`);
  }

  async updateWindowStatus(
    id: string,
    dto: UpdateMaintenanceWindowStatusDto,
    adminId: string,
  ): Promise<MaintenanceWindow> {
    const window = await this.getWindowById(id);

    const updated: MaintenanceWindow = {
      ...window,
      status: dto.status,
      updatedAt: new Date(),
    };

    this.logger.log(
      `Maintenance window ${id} status updated to ${dto.status} by admin ${adminId}`,
    );

    await this.auditService.logAction(
      adminId,
      'maintenance_window.status_updated',
      'maintenance_window',
      id,
      { previousStatus: window.status, newStatus: dto.status },
    );

    // TODO: Persist to database when operations repository is implemented
    return updated;
  }

  async getActiveMaintenanceWindows(): Promise<MaintenanceWindow[]> {
    this.logger.debug('Fetching active maintenance windows');

    // TODO: Query from database filtering for status in_progress or scheduled
    return [];
  }
}
