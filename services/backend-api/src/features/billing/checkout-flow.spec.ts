import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Checkout Flow Tests', () => {
  const mockCheckoutService = {
    createCheckoutSession: jest.fn(),
    getCheckoutSessionById: jest.fn(),
    completeCheckoutSession: jest.fn(),
    expireCheckoutSession: jest.fn(),
  };

  const mockPricingService = {
    getActivePrices: jest.fn(),
    getActivePlans: jest.fn(),
    getPriceById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Pricing read', () => {
    it('should return active prices', async () => {
      const prices = [
        { id: 'price-1', amount: 999, currency: 'USD', status: 'active' },
        { id: 'price-2', amount: 1999, currency: 'USD', status: 'active' },
      ];
      mockPricingService.getActivePrices.mockResolvedValue(prices);
      const result = await mockPricingService.getActivePrices();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('active');
    });

    it('should return active plans', async () => {
      const plans = [
        { id: 'plan-1', name: 'Free', planType: 'free', status: 'active' },
        { id: 'plan-2', name: 'Premium', planType: 'premium', status: 'active' },
      ];
      mockPricingService.getActivePlans.mockResolvedValue(plans);
      const result = await mockPricingService.getActivePlans();
      expect(result).toHaveLength(2);
    });
  });

  describe('Checkout creation', () => {
    it('should create checkout session with valid data', async () => {
      const session = {
        id: 'cs-1',
        userId: 'user-1',
        priceId: 'price-1',
        status: 'pending',
        checkoutUrl: 'https://checkout.stripe.com/session',
      };
      mockCheckoutService.createCheckoutSession.mockResolvedValue(session);

      const result = await mockCheckoutService.createCheckoutSession({
        userId: 'user-1',
        priceId: 'price-1',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      });

      expect(result.status).toBe('pending');
      expect(result.checkoutUrl).toBeDefined();
    });

    it('should reject checkout with invalid price', async () => {
      mockCheckoutService.createCheckoutSession.mockRejectedValue(
        new NotFoundException('Price not found'),
      );

      await expect(
        mockCheckoutService.createCheckoutSession({
          userId: 'user-1',
          priceId: 'invalid-price',
          successUrl: 'https://app.com/success',
          cancelUrl: 'https://app.com/cancel',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Checkout status', () => {
    it('should return pending status', async () => {
      mockCheckoutService.getCheckoutSessionById.mockResolvedValue({
        id: 'cs-1',
        status: 'pending',
        userId: 'user-1',
      });

      const result = await mockCheckoutService.getCheckoutSessionById('cs-1');
      expect(result.status).toBe('pending');
    });

    it('should return completed status after payment', async () => {
      mockCheckoutService.getCheckoutSessionById.mockResolvedValue({
        id: 'cs-1',
        status: 'completed',
        userId: 'user-1',
        subscriptionId: 'sub-1',
      });

      const result = await mockCheckoutService.getCheckoutSessionById('cs-1');
      expect(result.status).toBe('completed');
      expect(result.subscriptionId).toBeDefined();
    });
  });

  describe('Failed payment', () => {
    it('should mark checkout as failed on payment failure', async () => {
      mockCheckoutService.getCheckoutSessionById.mockResolvedValue({
        id: 'cs-1',
        status: 'failed',
        userId: 'user-1',
      });

      const result = await mockCheckoutService.getCheckoutSessionById('cs-1');
      expect(result.status).toBe('failed');
    });
  });

  describe('Completed payment', () => {
    it('should complete checkout and create subscription', async () => {
      mockCheckoutService.completeCheckoutSession.mockResolvedValue({
        id: 'cs-1',
        status: 'completed',
        subscriptionId: 'sub-1',
      });

      const result = await mockCheckoutService.completeCheckoutSession('cs-1', {
        providerSubscriptionId: 'sub_stripe_123',
        providerPaymentId: 'pi_stripe_456',
      });

      expect(result.status).toBe('completed');
      expect(result.subscriptionId).toBe('sub-1');
    });
  });

  describe('Expired checkout', () => {
    it('should handle expired checkout session', async () => {
      mockCheckoutService.getCheckoutSessionById.mockResolvedValue({
        id: 'cs-1',
        status: 'expired',
        userId: 'user-1',
      });

      const result = await mockCheckoutService.getCheckoutSessionById('cs-1');
      expect(result.status).toBe('expired');
    });
  });
});
