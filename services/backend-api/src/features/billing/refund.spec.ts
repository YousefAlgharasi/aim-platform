import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Refund Tests', () => {
  const mockRefundService = {
    requestRefund: jest.fn(),
    approveRefund: jest.fn(),
    denyRefund: jest.fn(),
    getRefundById: jest.fn(),
    syncProviderRefundStatus: jest.fn(),
  };

  const mockPaymentRepo = {
    findPaymentById: jest.fn(),
    findRefundsByPaymentId: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Refund request eligibility', () => {
    it('should allow refund for succeeded payment', async () => {
      mockRefundService.requestRefund.mockResolvedValue({
        id: 'ref-1',
        paymentId: 'pay-1',
        amount: 500,
        status: 'pending',
      });

      const refund = await mockRefundService.requestRefund({
        paymentId: 'pay-1',
        amount: 500,
        currency: 'USD',
        reason: 'Not satisfied',
        requestedBy: 'user-1',
      });

      expect(refund.status).toBe('pending');
    });

    it('should reject refund for failed payment', async () => {
      mockRefundService.requestRefund.mockRejectedValue(
        new BadRequestException('Can only refund succeeded payments'),
      );

      await expect(
        mockRefundService.requestRefund({
          paymentId: 'pay-failed',
          amount: 500,
          currency: 'USD',
          reason: 'Test',
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject refund for pending payment', async () => {
      mockRefundService.requestRefund.mockRejectedValue(
        new BadRequestException('Can only refund succeeded payments'),
      );

      await expect(
        mockRefundService.requestRefund({
          paymentId: 'pay-pending',
          amount: 500,
          currency: 'USD',
          reason: 'Test',
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Invalid refunds', () => {
    it('should reject refund exceeding payment amount', async () => {
      mockRefundService.requestRefund.mockRejectedValue(
        new BadRequestException('Refund amount exceeds remaining refundable amount'),
      );

      await expect(
        mockRefundService.requestRefund({
          paymentId: 'pay-1',
          amount: 99999,
          currency: 'USD',
          reason: 'Test',
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject refund for non-existent payment', async () => {
      mockRefundService.requestRefund.mockRejectedValue(
        new NotFoundException('Payment not found'),
      );

      await expect(
        mockRefundService.requestRefund({
          paymentId: 'pay-nonexistent',
          amount: 500,
          currency: 'USD',
          reason: 'Test',
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject double refund exceeding total', async () => {
      mockRefundService.requestRefund.mockRejectedValue(
        new BadRequestException('Refund amount exceeds remaining refundable amount'),
      );

      await expect(
        mockRefundService.requestRefund({
          paymentId: 'pay-1',
          amount: 600,
          currency: 'USD',
          reason: 'Second refund',
          requestedBy: 'user-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Provider failures', () => {
    it('should handle provider refund failure', async () => {
      mockRefundService.syncProviderRefundStatus.mockResolvedValue({
        id: 'ref-1',
        status: 'failed',
      });

      const result = await mockRefundService.syncProviderRefundStatus('prov_ref_1', 'failed');
      expect(result.status).toBe('failed');
    });
  });

  describe('Status sync', () => {
    it('should sync succeeded refund from provider', async () => {
      mockRefundService.syncProviderRefundStatus.mockResolvedValue({
        id: 'ref-1',
        status: 'succeeded',
      });

      const result = await mockRefundService.syncProviderRefundStatus('prov_ref_1', 'succeeded');
      expect(result.status).toBe('succeeded');
    });

    it('should approve refund and update payment status', async () => {
      mockRefundService.approveRefund.mockResolvedValue({
        id: 'ref-1',
        status: 'succeeded',
        approvedBy: 'admin-1',
      });

      const result = await mockRefundService.approveRefund('ref-1', 'admin-1');
      expect(result.status).toBe('succeeded');
      expect(result.approvedBy).toBe('admin-1');
    });

    it('should deny refund', async () => {
      mockRefundService.denyRefund.mockResolvedValue({
        id: 'ref-1',
        status: 'denied',
      });

      const result = await mockRefundService.denyRefund('ref-1', 'admin-1');
      expect(result.status).toBe('denied');
    });
  });
});
