import { Injectable, NotFoundException } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
import { IncidentRecord } from './operations.entities';
import { CreateIncidentDto, UpdateIncidentStatusDto } from './operations.dtos';
import { validateUUID } from './operations.validation';

@Injectable()
export class IncidentService {
  constructor(private readonly opsRepo: OperationsRepository) {}

  async createIncident(adminId: string, dto: CreateIncidentDto): Promise<IncidentRecord> {
    validateUUID(adminId, 'adminId');

    const incident = await this.opsRepo.createIncident({
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      startedAt: new Date(dto.startedAt),
      ownerId: adminId,
    });

    await this.opsRepo.createAuditLog({
      actorId: adminId,
      action: 'incident_created',
      resourceType: 'incident',
      resourceId: incident.id,
      details: { title: dto.title, severity: dto.severity },
    });

    return incident;
  }

  async listIncidents(limit: number = 50, offset: number = 0): Promise<IncidentRecord[]> {
    return this.opsRepo.findAllIncidents(limit, offset);
  }

  async getById(id: string): Promise<IncidentRecord> {
    validateUUID(id, 'id');
    const incident = await this.opsRepo.findIncidentById(id);
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }
    return incident;
  }

  async updateStatus(
    id: string,
    adminId: string,
    dto: UpdateIncidentStatusDto,
  ): Promise<IncidentRecord> {
    validateUUID(id, 'id');
    validateUUID(adminId, 'adminId');

    const incident = await this.opsRepo.findIncidentById(id);
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    const previousStatus = incident.status;
    const resolvedAt = dto.resolvedAt ? new Date(dto.resolvedAt) : null;

    const updated = await this.opsRepo.updateIncidentStatus(
      id,
      dto.status,
      resolvedAt,
      dto.postmortemUrl || null,
    );

    await this.opsRepo.createAuditLog({
      actorId: adminId,
      action: 'incident_status_updated',
      resourceType: 'incident',
      resourceId: id,
      details: {
        previousStatus,
        newStatus: dto.status,
        resolvedAt: dto.resolvedAt || null,
        postmortemUrl: dto.postmortemUrl || null,
      },
    });

    return updated!;
  }
}
