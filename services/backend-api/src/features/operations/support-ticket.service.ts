import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';
import { SupportTicket, SupportTicketComment } from './operations.entities';
import { CreateSupportTicketDto, CreateTicketCommentDto } from './operations.dtos';
import { validateUUID, validateTicketStatus } from './operations.validation';

@Injectable()
export class SupportTicketService {
  constructor(private readonly opsRepo: OperationsRepository) {}

  async createTicket(userId: string, dto: CreateSupportTicketDto): Promise<SupportTicket> {
    validateUUID(userId, 'userId');

    const ticket = await this.opsRepo.createTicket({
      requesterId: userId,
      category: dto.category,
      severity: dto.severity,
      subject: dto.subject,
      description: dto.description,
    });

    await this.opsRepo.createAuditLog({
      actorId: userId,
      action: 'ticket_created',
      resourceType: 'support_ticket',
      resourceId: ticket.id,
      details: { category: dto.category, severity: dto.severity },
    });

    return ticket;
  }

  async getMyTickets(userId: string): Promise<SupportTicket[]> {
    validateUUID(userId, 'userId');
    return this.opsRepo.findTicketsByRequester(userId);
  }

  async getTicketById(userId: string, ticketId: string): Promise<SupportTicket> {
    validateUUID(userId, 'userId');
    validateUUID(ticketId, 'ticketId');

    const ticket = await this.opsRepo.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }
    if (ticket.requesterId !== userId) {
      throw new ForbiddenException('Not authorized to access this ticket');
    }
    return ticket;
  }

  async addComment(
    userId: string,
    ticketId: string,
    dto: CreateTicketCommentDto,
  ): Promise<SupportTicketComment> {
    validateUUID(userId, 'userId');
    validateUUID(ticketId, 'ticketId');

    const ticket = await this.opsRepo.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    const comment = await this.opsRepo.createComment({
      ticketId,
      authorId: userId,
      body: dto.body,
      visibility: dto.visibility || 'public',
    });

    await this.opsRepo.createAuditLog({
      actorId: userId,
      action: 'comment_added',
      resourceType: 'support_ticket',
      resourceId: ticketId,
      details: { commentId: comment.id, visibility: comment.visibility },
    });

    return comment;
  }

  async adminUpdateStatus(
    ticketId: string,
    status: string,
    adminId: string,
  ): Promise<SupportTicket> {
    validateUUID(ticketId, 'ticketId');
    validateUUID(adminId, 'adminId');
    validateTicketStatus(status);

    const ticket = await this.opsRepo.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    const previousStatus = ticket.status;
    const updated = await this.opsRepo.updateTicketStatus(ticketId, status);

    await this.opsRepo.createAuditLog({
      actorId: adminId,
      action: 'ticket_status_updated',
      resourceType: 'support_ticket',
      resourceId: ticketId,
      details: { previousStatus, newStatus: status },
    });

    return updated!;
  }

  async adminAssign(
    ticketId: string,
    assigneeId: string,
    adminId: string,
  ): Promise<SupportTicket> {
    validateUUID(ticketId, 'ticketId');
    validateUUID(assigneeId, 'assigneeId');
    validateUUID(adminId, 'adminId');

    const ticket = await this.opsRepo.findTicketById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    const updated = await this.opsRepo.assignTicketTo(ticketId, assigneeId);

    await this.opsRepo.createAuditLog({
      actorId: adminId,
      action: 'ticket_assigned',
      resourceType: 'support_ticket',
      resourceId: ticketId,
      details: { assigneeId, previousAssignee: ticket.assignedTo },
    });

    return updated!;
  }
}
