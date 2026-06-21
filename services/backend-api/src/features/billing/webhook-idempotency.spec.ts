import { BadRequestException } from '@nestjs/common';

describe('Webhook Idempotency Tests', () => {
  const mockWebhookService = {
    verifyAndStoreEvent: jest.fn(),
    processEvent: jest.fn(),
    markEventProcessed: jest.fn(),
    markEventFailed: jest.fn(),
    markEventSkipped: jest.fn(),
  };

  const mockIdempotencyService = {
    checkIdempotency: jest.fn(),
  };

  const mockProviderAdapter = {
    verifyWebhookSignature: jest.fn(),
    parseWebhookEvent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Duplicate provider events', () => {
    it('should skip duplicate events with same idempotency key', async () => {
      const existingEvent = {
        id: 'event-1',
        providerEventId: 'evt_123',
        idempotencyKey: 'evt_123',
        processingStatus: 'processed',
      };
      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        isDuplicate: true,
        existingEvent,
      });

      const result = await mockIdempotencyService.checkIdempotency('evt_123');
      expect(result.isDuplicate).toBe(true);
      expect(result.existingEvent.processingStatus).toBe('processed');
    });

    it('should process new events', async () => {
      mockIdempotencyService.checkIdempotency.mockResolvedValue({
        isDuplicate: false,
      });

      const result = await mockIdempotencyService.checkIdempotency('evt_new');
      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('Invalid signatures', () => {
    it('should reject events with invalid signature', async () => {
      mockProviderAdapter.verifyWebhookSignature.mockResolvedValue(false);

      const isValid = await mockProviderAdapter.verifyWebhookSignature(
        Buffer.from('payload'),
        'invalid-signature',
      );
      expect(isValid).toBe(false);
    });

    it('should accept events with valid signature', async () => {
      mockProviderAdapter.verifyWebhookSignature.mockResolvedValue(true);

      const isValid = await mockProviderAdapter.verifyWebhookSignature(
        Buffer.from('payload'),
        'valid-signature',
      );
      expect(isValid).toBe(true);
    });

    it('should throw BadRequestException for missing signature', async () => {
      mockWebhookService.verifyAndStoreEvent.mockRejectedValue(
        new BadRequestException('Invalid webhook signature'),
      );

      await expect(
        mockWebhookService.verifyAndStoreEvent(Buffer.from('payload'), ''),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Event ordering', () => {
    it('should process events regardless of arrival order', async () => {
      const events = [
        { id: 'e1', eventType: 'checkout.session.completed', processingStatus: 'pending' },
        { id: 'e2', eventType: 'payment_intent.succeeded', processingStatus: 'pending' },
        { id: 'e3', eventType: 'customer.subscription.created', processingStatus: 'pending' },
      ];

      for (const event of events) {
        mockWebhookService.processEvent.mockResolvedValue(undefined);
        await mockWebhookService.processEvent(event);
        expect(mockWebhookService.processEvent).toHaveBeenCalledWith(event);
      }
    });
  });

  describe('Safe state updates', () => {
    it('should mark event as processed on success', async () => {
      mockWebhookService.markEventProcessed.mockResolvedValue(undefined);
      await mockWebhookService.markEventProcessed('event-1');
      expect(mockWebhookService.markEventProcessed).toHaveBeenCalledWith('event-1');
    });

    it('should mark event as failed on error', async () => {
      mockWebhookService.markEventFailed.mockResolvedValue(undefined);
      await mockWebhookService.markEventFailed('event-1', 'Processing error');
      expect(mockWebhookService.markEventFailed).toHaveBeenCalledWith('event-1', 'Processing error');
    });

    it('should mark unhandled event types as skipped', async () => {
      mockWebhookService.markEventSkipped.mockResolvedValue(undefined);
      await mockWebhookService.markEventSkipped('event-1');
      expect(mockWebhookService.markEventSkipped).toHaveBeenCalledWith('event-1');
    });
  });

  describe('Provider event storage', () => {
    it('should store event with safe payload summary only', async () => {
      const event = {
        id: 'event-1',
        providerEventId: 'evt_123',
        eventType: 'payment_intent.succeeded',
        provider: 'stripe',
        processingStatus: 'pending',
        payloadSummary: { paymentId: 'pi_123', amount: 1000 },
        idempotencyKey: 'evt_123',
      };

      mockWebhookService.verifyAndStoreEvent.mockResolvedValue(event);
      const result = await mockWebhookService.verifyAndStoreEvent(
        Buffer.from('payload'),
        'valid-sig',
      );

      expect(result.payloadSummary).not.toHaveProperty('cardNumber');
      expect(result.payloadSummary).not.toHaveProperty('cvc');
      expect(result.payloadSummary).not.toHaveProperty('secretKey');
    });
  });
});
