import { NotFoundException } from '@nestjs/common';
import { FeedbackService } from '../feedback.service';
import { FeatureRequestService } from '../feature-request.service';
import { UserFeedback, FeatureRequest } from '../operations.entities';

const mockFeedback: UserFeedback = {
  id: 'feedback-1',
  userId: 'user-1',
  category: 'suggestion',
  rating: 4,
  title: 'Great feature idea',
  body: 'It would be nice to have dark mode',
  sourceSurface: 'mobile_app',
  status: 'new',
  metadata: {},
  createdAt: new Date(),
};

const mockFeatureRequest: FeatureRequest = {
  id: 'request-1',
  submittedBy: 'user-1',
  title: 'Dark mode support',
  description: 'Please add dark mode',
  status: 'new',
  priority: null,
  voteCount: 0,
  triageNotes: null,
  triagedBy: null,
  triagedAt: null,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOpsRepo = {
  createFeedback: jest.fn(),
  findFeedbackByUser: jest.fn(),
  findFeedbackById: jest.fn(),
  updateFeedbackStatus: jest.fn(),
  createFeatureRequest: jest.fn(),
  findAllFeatureRequests: jest.fn(),
  findFeatureRequestById: jest.fn(),
  incrementFeatureRequestVote: jest.fn(),
  updateFeatureRequestStatus: jest.fn(),
  createAuditLog: jest.fn(),
};

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeedbackService(mockOpsRepo as any);
  });

  describe('submitFeedback', () => {
    it('should create feedback and log an audit entry', async () => {
      mockOpsRepo.createFeedback.mockResolvedValue(mockFeedback);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.submitFeedback('00000000-0000-0000-0000-000000000001', {
        category: 'suggestion',
        rating: 4,
        title: 'Great feature idea',
        body: 'It would be nice to have dark mode',
        sourceSurface: 'mobile_app',
      });

      expect(result).toEqual(mockFeedback);
      expect(mockOpsRepo.createFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '00000000-0000-0000-0000-000000000001',
          category: 'suggestion',
          title: 'Great feature idea',
        }),
      );
      expect(mockOpsRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'feedback_submitted',
          resourceType: 'feedback',
        }),
      );
    });
  });

  describe('getMyFeedback', () => {
    it('should return feedback for the requesting user', async () => {
      mockOpsRepo.findFeedbackByUser.mockResolvedValue([mockFeedback]);

      const result = await service.getMyFeedback('00000000-0000-0000-0000-000000000001');

      expect(result).toEqual([mockFeedback]);
      expect(mockOpsRepo.findFeedbackByUser).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001',
      );
    });

    it('should return empty array if no feedback exists', async () => {
      mockOpsRepo.findFeedbackByUser.mockResolvedValue([]);

      const result = await service.getMyFeedback('00000000-0000-0000-0000-000000000001');

      expect(result).toEqual([]);
    });
  });

  describe('adminTriageFeedback', () => {
    it('should update feedback status and log audit', async () => {
      mockOpsRepo.findFeedbackById.mockResolvedValue(mockFeedback);
      const updatedFeedback = { ...mockFeedback, status: 'under_review' as const };
      mockOpsRepo.updateFeedbackStatus.mockResolvedValue(updatedFeedback);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.adminTriageFeedback(
        '00000000-0000-0000-0000-000000000010',
        'under_review',
        '00000000-0000-0000-0000-000000000099',
      );

      expect(result.status).toBe('under_review');
      expect(mockOpsRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'feedback_triaged',
          details: expect.objectContaining({
            previousStatus: 'new',
            newStatus: 'under_review',
          }),
        }),
      );
    });

    it('should throw NotFoundException if feedback does not exist', async () => {
      mockOpsRepo.findFeedbackById.mockResolvedValue(null);

      await expect(
        service.adminTriageFeedback(
          '00000000-0000-0000-0000-000000000099',
          'under_review',
          '00000000-0000-0000-0000-000000000001',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

describe('FeatureRequestService', () => {
  let service: FeatureRequestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeatureRequestService(mockOpsRepo as any);
  });

  describe('createRequest', () => {
    it('should create a feature request and log audit', async () => {
      mockOpsRepo.createFeatureRequest.mockResolvedValue(mockFeatureRequest);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.createRequest('00000000-0000-0000-0000-000000000001', {
        title: 'Dark mode support',
        description: 'Please add dark mode',
      });

      expect(result).toEqual(mockFeatureRequest);
      expect(mockOpsRepo.createFeatureRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          submittedBy: '00000000-0000-0000-0000-000000000001',
          title: 'Dark mode support',
        }),
      );
    });
  });

  describe('listRequests', () => {
    it('should return feature requests with default pagination', async () => {
      mockOpsRepo.findAllFeatureRequests.mockResolvedValue([mockFeatureRequest]);

      const result = await service.listRequests();

      expect(result).toEqual([mockFeatureRequest]);
      expect(mockOpsRepo.findAllFeatureRequests).toHaveBeenCalledWith(50, 0);
    });

    it('should pass custom pagination parameters', async () => {
      mockOpsRepo.findAllFeatureRequests.mockResolvedValue([]);

      await service.listRequests(10, 20);

      expect(mockOpsRepo.findAllFeatureRequests).toHaveBeenCalledWith(10, 20);
    });
  });

  describe('getById', () => {
    it('should return a feature request by ID', async () => {
      mockOpsRepo.findFeatureRequestById.mockResolvedValue(mockFeatureRequest);

      const result = await service.getById('00000000-0000-0000-0000-000000000010');

      expect(result).toEqual(mockFeatureRequest);
    });

    it('should throw NotFoundException if request does not exist', async () => {
      mockOpsRepo.findFeatureRequestById.mockResolvedValue(null);

      await expect(
        service.getById('00000000-0000-0000-0000-000000000099'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('vote', () => {
    it('should increment vote count and log audit', async () => {
      mockOpsRepo.findFeatureRequestById.mockResolvedValue(mockFeatureRequest);
      const votedRequest = { ...mockFeatureRequest, voteCount: 1 };
      mockOpsRepo.incrementFeatureRequestVote.mockResolvedValue(votedRequest);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.vote(
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000001',
      );

      expect(result.voteCount).toBe(1);
      expect(mockOpsRepo.incrementFeatureRequestVote).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000010',
      );
    });

    it('should throw NotFoundException if request does not exist', async () => {
      mockOpsRepo.findFeatureRequestById.mockResolvedValue(null);

      await expect(
        service.vote(
          '00000000-0000-0000-0000-000000000099',
          '00000000-0000-0000-0000-000000000001',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminTriage', () => {
    it('should triage a feature request and log audit', async () => {
      mockOpsRepo.findFeatureRequestById.mockResolvedValue(mockFeatureRequest);
      const triagedRequest = { ...mockFeatureRequest, status: 'planned' as const, priority: 'high' as const };
      mockOpsRepo.updateFeatureRequestStatus.mockResolvedValue(triagedRequest);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.adminTriage(
        '00000000-0000-0000-0000-000000000010',
        'planned',
        '00000000-0000-0000-0000-000000000099',
        'high',
        'This is important',
      );

      expect(result.status).toBe('planned');
      expect(mockOpsRepo.updateFeatureRequestStatus).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000010',
        'planned',
        'high',
        'This is important',
        '00000000-0000-0000-0000-000000000099',
      );
    });

    it('should throw NotFoundException if request does not exist', async () => {
      mockOpsRepo.findFeatureRequestById.mockResolvedValue(null);

      await expect(
        service.adminTriage(
          '00000000-0000-0000-0000-000000000099',
          'planned',
          '00000000-0000-0000-0000-000000000001',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
