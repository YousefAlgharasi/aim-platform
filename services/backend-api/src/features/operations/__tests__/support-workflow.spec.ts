import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupportTicketService } from '../support-ticket.service';
import { SupportTicket, SupportTicketComment } from '../operations.entities';

const mockTicket: SupportTicket = {
  id: 'ticket-1',
  requesterId: 'user-1',
  category: 'bug_report',
  severity: 'medium',
  status: 'open',
  assignedTo: null,
  subject: 'Test ticket',
  description: 'Test description',
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockComment: SupportTicketComment = {
  id: 'comment-1',
  ticketId: 'ticket-1',
  authorId: 'user-1',
  body: 'Test comment',
  visibility: 'public',
  createdAt: new Date(),
};

const mockOpsRepo = {
  createTicket: jest.fn(),
  findTicketsByRequester: jest.fn(),
  findTicketById: jest.fn(),
  createComment: jest.fn(),
  updateTicketStatus: jest.fn(),
  assignTicketTo: jest.fn(),
  createAuditLog: jest.fn(),
};

describe('SupportTicketService', () => {
  let service: SupportTicketService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupportTicketService(mockOpsRepo as any);
  });

  describe('createTicket', () => {
    it('should create a ticket and log an audit entry', async () => {
      mockOpsRepo.createTicket.mockResolvedValue(mockTicket);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.createTicket('00000000-0000-0000-0000-000000000001', {
        category: 'bug_report',
        severity: 'medium',
        subject: 'Test ticket',
        description: 'Test description',
      });

      expect(result).toEqual(mockTicket);
      expect(mockOpsRepo.createTicket).toHaveBeenCalledWith({
        requesterId: '00000000-0000-0000-0000-000000000001',
        category: 'bug_report',
        severity: 'medium',
        subject: 'Test ticket',
        description: 'Test description',
      });
      expect(mockOpsRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ticket_created',
          resourceType: 'support_ticket',
        }),
      );
    });
  });

  describe('getMyTickets', () => {
    it('should return tickets for the requesting user', async () => {
      mockOpsRepo.findTicketsByRequester.mockResolvedValue([mockTicket]);

      const result = await service.getMyTickets('00000000-0000-0000-0000-000000000001');

      expect(result).toEqual([mockTicket]);
      expect(mockOpsRepo.findTicketsByRequester).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001',
      );
    });
  });

  describe('getTicketById', () => {
    it('should return a ticket if user is the owner', async () => {
      const ticket = { ...mockTicket, requesterId: '00000000-0000-0000-0000-000000000001' };
      mockOpsRepo.findTicketById.mockResolvedValue(ticket);

      const result = await service.getTicketById(
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000010',
      );

      expect(result).toEqual(ticket);
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockOpsRepo.findTicketById.mockResolvedValue(null);

      await expect(
        service.getTicketById(
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000099',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockOpsRepo.findTicketById.mockResolvedValue(mockTicket);

      await expect(
        service.getTicketById(
          '00000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000010',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addComment', () => {
    it('should add a comment to an existing ticket', async () => {
      mockOpsRepo.findTicketById.mockResolvedValue(mockTicket);
      mockOpsRepo.createComment.mockResolvedValue(mockComment);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.addComment(
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000010',
        { body: 'Test comment' },
      );

      expect(result).toEqual(mockComment);
      expect(mockOpsRepo.createComment).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Test comment',
          visibility: 'public',
        }),
      );
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockOpsRepo.findTicketById.mockResolvedValue(null);

      await expect(
        service.addComment(
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000099',
          { body: 'Test comment' },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminUpdateStatus', () => {
    it('should update ticket status and log audit', async () => {
      mockOpsRepo.findTicketById.mockResolvedValue(mockTicket);
      const updatedTicket = { ...mockTicket, status: 'in_progress' as const };
      mockOpsRepo.updateTicketStatus.mockResolvedValue(updatedTicket);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.adminUpdateStatus(
        '00000000-0000-0000-0000-000000000010',
        'in_progress',
        '00000000-0000-0000-0000-000000000099',
      );

      expect(result.status).toBe('in_progress');
      expect(mockOpsRepo.updateTicketStatus).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000010',
        'in_progress',
      );
      expect(mockOpsRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ticket_status_updated',
          details: expect.objectContaining({
            previousStatus: 'open',
            newStatus: 'in_progress',
          }),
        }),
      );
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockOpsRepo.findTicketById.mockResolvedValue(null);

      await expect(
        service.adminUpdateStatus(
          '00000000-0000-0000-0000-000000000099',
          'resolved',
          '00000000-0000-0000-0000-000000000001',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminAssign', () => {
    it('should assign a ticket and log audit', async () => {
      mockOpsRepo.findTicketById.mockResolvedValue(mockTicket);
      const assignedTicket = {
        ...mockTicket,
        assignedTo: '00000000-0000-0000-0000-000000000005',
      };
      mockOpsRepo.assignTicketTo.mockResolvedValue(assignedTicket);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.adminAssign(
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000099',
      );

      expect(result.assignedTo).toBe('00000000-0000-0000-0000-000000000005');
      expect(mockOpsRepo.assignTicketTo).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000005',
      );
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockOpsRepo.findTicketById.mockResolvedValue(null);

      await expect(
        service.adminAssign(
          '00000000-0000-0000-0000-000000000099',
          '00000000-0000-0000-0000-000000000005',
          '00000000-0000-0000-0000-000000000001',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
