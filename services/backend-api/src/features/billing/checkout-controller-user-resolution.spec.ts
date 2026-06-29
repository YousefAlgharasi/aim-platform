import { CheckoutController } from './checkout.controller';
import { CheckoutStatusController } from './checkout-status.controller';
import { AuthenticatedUser } from '../../auth/authenticated-user';

const SUPABASE_AUTH_UID = '11111111-1111-1111-1111-111111111111';
const INTERNAL_USER_ID = '22222222-2222-2222-2222-222222222222';

describe('Billing controllers resolve internal user id from Supabase UID', () => {
  const user: AuthenticatedUser = { id: SUPABASE_AUTH_UID, expiresAt: 0 };

  const mockUsersService = {
    getBySupabaseUid: jest.fn().mockResolvedValue({ id: INTERNAL_USER_ID }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsersService.getBySupabaseUid.mockResolvedValue({ id: INTERNAL_USER_ID });
  });

  it('createCheckoutSession passes the internal user id, not the raw Supabase UID', async () => {
    const mockCheckoutService = {
      createCheckoutSession: jest.fn().mockResolvedValue({ id: 'cs-1' }),
    };
    const controller = new CheckoutController(
      mockCheckoutService as never,
      mockUsersService as never,
    );

    await controller.createCheckoutSession(user, {
      priceId: 'price-1',
      successUrl: 'aim://billing/checkout/success',
      cancelUrl: 'aim://billing/checkout/cancel',
    });

    expect(mockUsersService.getBySupabaseUid).toHaveBeenCalledWith(SUPABASE_AUTH_UID);
    expect(mockCheckoutService.createCheckoutSession).toHaveBeenCalledWith(
      INTERNAL_USER_ID,
      expect.objectContaining({ priceId: 'price-1' }),
    );
  });

  it('getCheckoutStatus and getRecentCheckouts pass the internal user id', async () => {
    const mockCheckoutService = {
      getCheckoutSession: jest.fn().mockResolvedValue({ id: 'cs-1', status: 'pending' }),
      getUserCheckoutSessions: jest.fn().mockResolvedValue([]),
    };
    const mockPaymentService = {};
    const controller = new CheckoutStatusController(
      mockCheckoutService as never,
      mockPaymentService as never,
      mockUsersService as never,
    );

    await controller.getCheckoutStatus('cs-1', user);
    expect(mockCheckoutService.getCheckoutSession).toHaveBeenCalledWith('cs-1', INTERNAL_USER_ID);

    await controller.getRecentCheckouts(user);
    expect(mockCheckoutService.getUserCheckoutSessions).toHaveBeenCalledWith(INTERNAL_USER_ID);
  });
});
