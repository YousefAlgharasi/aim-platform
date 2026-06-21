import { Injectable, NotFoundException } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
import { FeatureRequest } from './operations.entities';
import { CreateFeatureRequestDto } from './operations.dtos';
import { validateUUID } from './operations.validation';

@Injectable()
export class FeatureRequestService {
  constructor(private readonly opsRepo: OperationsRepository) {}

  async createRequest(userId: string, dto: CreateFeatureRequestDto): Promise<FeatureRequest> {
    validateUUID(userId, 'userId');

    const request = await this.opsRepo.createFeatureRequest({
      submittedBy: userId,
      title: dto.title,
      description: dto.description,
    });

    await this.opsRepo.createAuditLog({
      actorId: userId,
      action: 'feature_request_created',
      resourceType: 'feature_request',
      resourceId: request.id,
      details: { title: dto.title },
    });

    return request;
  }

  async listRequests(limit: number = 50, offset: number = 0): Promise<FeatureRequest[]> {
    return this.opsRepo.findAllFeatureRequests(limit, offset);
  }

  async getById(id: string): Promise<FeatureRequest> {
    validateUUID(id, 'id');
    const request = await this.opsRepo.findFeatureRequestById(id);
    if (!request) {
      throw new NotFoundException('Feature request not found');
    }
    return request;
  }

  async vote(id: string, userId: string): Promise<FeatureRequest> {
    validateUUID(id, 'id');
    validateUUID(userId, 'userId');

    const request = await this.opsRepo.findFeatureRequestById(id);
    if (!request) {
      throw new NotFoundException('Feature request not found');
    }

    const updated = await this.opsRepo.incrementFeatureRequestVote(id);

    await this.opsRepo.createAuditLog({
      actorId: userId,
      action: 'feature_request_voted',
      resourceType: 'feature_request',
      resourceId: id,
      details: { newVoteCount: updated!.voteCount },
    });

    return updated!;
  }

  async adminTriage(
    id: string,
    status: string,
    adminId: string,
    priority?: string,
    triageNotes?: string,
  ): Promise<FeatureRequest> {
    validateUUID(id, 'id');
    validateUUID(adminId, 'adminId');

    const request = await this.opsRepo.findFeatureRequestById(id);
    if (!request) {
      throw new NotFoundException('Feature request not found');
    }

    const previousStatus = request.status;
    const updated = await this.opsRepo.updateFeatureRequestStatus(
      id,
      status,
      priority || null,
      triageNotes || null,
      adminId,
    );

    await this.opsRepo.createAuditLog({
      actorId: adminId,
      action: 'feature_request_triaged',
      resourceType: 'feature_request',
      resourceId: id,
      details: { previousStatus, newStatus: status, priority },
    });

    return updated!;
  }
}
