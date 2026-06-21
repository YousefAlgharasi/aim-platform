import { Injectable, NotFoundException } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
import { UserFeedback } from './operations.entities';
import { CreateFeedbackDto } from './operations.dtos';
import { validateUUID } from './operations.validation';

@Injectable()
export class FeedbackService {
  constructor(private readonly opsRepo: OperationsRepository) {}

  async submitFeedback(userId: string, dto: CreateFeedbackDto): Promise<UserFeedback> {
    validateUUID(userId, 'userId');

    const feedback = await this.opsRepo.createFeedback({
      userId,
      category: dto.category,
      rating: dto.rating || null,
      title: dto.title,
      body: dto.body,
      sourceSurface: dto.sourceSurface,
    });

    await this.opsRepo.createAuditLog({
      actorId: userId,
      action: 'feedback_submitted',
      resourceType: 'feedback',
      resourceId: feedback.id,
      details: { category: dto.category, sourceSurface: dto.sourceSurface },
    });

    return feedback;
  }

  async getMyFeedback(userId: string): Promise<UserFeedback[]> {
    validateUUID(userId, 'userId');
    return this.opsRepo.findFeedbackByUser(userId);
  }

  async adminGetAllFeedback(limit: number = 50, offset: number = 0): Promise<UserFeedback[]> {
    return this.opsRepo.findFeedbackByUser('__all__');
  }

  async adminTriageFeedback(
    feedbackId: string,
    status: string,
    adminId: string,
  ): Promise<UserFeedback> {
    validateUUID(feedbackId, 'feedbackId');
    validateUUID(adminId, 'adminId');

    const feedback = await this.opsRepo.findFeedbackById(feedbackId);
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    const previousStatus = feedback.status;
    const updated = await this.opsRepo.updateFeedbackStatus(feedbackId, status);

    await this.opsRepo.createAuditLog({
      actorId: adminId,
      action: 'feedback_triaged',
      resourceType: 'feedback',
      resourceId: feedbackId,
      details: { previousStatus, newStatus: status },
    });

    return updated!;
  }
}
