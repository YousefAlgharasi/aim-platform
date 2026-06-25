import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
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

  constructor(
    private readonly opsRepo: OperationsRepository,
    private readonly auditService: OperationsAuditService,
  ) {}

  async createWindow(
    dto: CreateMaintenanceWindowDto,
    adminId: string,
  ): Promise<MaintenanceWindow> {
    const window = await this.opsRepo.createMaintenanceWindow({
      title: dto.title,
      description: dto.description || null,
      type: dto.type,
      affectedServices: dto.affectedServices,
      scheduledStart: dto.scheduledStart,
      scheduledEnd: dto.scheduledEnd,
      userMessage: dto.userMessage || null,
      createdBy: adminId,
      metadata: {},
    });

    this.logger.log(`Maintenance window created: ${window.id} by admin ${adminId}`);

    await this.auditService.logAction(
      adminId,
      'maintenance_window.created',
      'maintenance_window',
      window.id,
      { title: dto.title, scheduledStart: dto.scheduledStart, scheduledEnd: dto.scheduledEnd },
    );

    return window;
  }

  async getWindows(filters?: MaintenanceWindowFilters): Promise<MaintenanceWindow[]> {
    this.logger.debug('Fetching maintenance windows with filters');
    return this.opsRepo.findAllMaintenanceWindows(
      filters?.limit ?? 50,
      filters?.offset ?? 0,
    );
  }

  async getWindowById(id: string): Promise<MaintenanceWindow> {
    this.logger.debug(`Fetching maintenance window: ${id}`);
    const window = await this.opsRepo.findMaintenanceWindowById(id);
    if (!window) {
      throw new NotFoundException(`Maintenance window ${id} not found`);
    }
    return window;
  }

  async updateWindowStatus(
    id: string,
    dto: UpdateMaintenanceWindowStatusDto,
    adminId: string,
  ): Promise<MaintenanceWindow> {
    const window = await this.getWindowById(id);

    const updated = await this.opsRepo.updateMaintenanceWindowStatus(id, dto.status);
    if (!updated) {
      throw new NotFoundException(`Maintenance window ${id} not found`);
    }

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

    return updated;
  }

  async getActiveMaintenanceWindows(): Promise<MaintenanceWindow[]> {
    this.logger.debug('Fetching active maintenance windows');
    const all = await this.opsRepo.findAllMaintenanceWindows(100, 0);
    return all.filter(
      (w) => w.status === 'scheduled' || w.status === 'in_progress',
    );
  }
}
