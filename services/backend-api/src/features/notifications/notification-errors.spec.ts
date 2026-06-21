import {
  InvalidDeviceTokenError,
  DisabledChannelError,
  NotificationForbiddenError,
  QuietHoursActiveError,
  ProviderDeliveryError,
  NotificationRateLimitedError,
  NotificationNotFoundError,
} from './notification-errors';

describe('Notification Errors', () => {
  it('InvalidDeviceTokenError has 400 status', () => {
    const err = new InvalidDeviceTokenError();
    expect(err.getStatus()).toBe(400);
  });

  it('DisabledChannelError has 400 status', () => {
    const err = new DisabledChannelError('sms');
    expect(err.getStatus()).toBe(400);
    expect(err.message).toContain('sms');
  });

  it('NotificationForbiddenError has 403 status', () => {
    const err = new NotificationForbiddenError();
    expect(err.getStatus()).toBe(403);
  });

  it('QuietHoursActiveError has 422 status', () => {
    const err = new QuietHoursActiveError();
    expect(err.getStatus()).toBe(422);
  });

  it('ProviderDeliveryError has 502 status', () => {
    const err = new ProviderDeliveryError('timeout');
    expect(err.getStatus()).toBe(502);
    expect(err.message).toContain('timeout');
  });

  it('NotificationRateLimitedError has 429 status', () => {
    const err = new NotificationRateLimitedError();
    expect(err.getStatus()).toBe(429);
  });

  it('NotificationNotFoundError has 404 status', () => {
    const err = new NotificationNotFoundError('Notification');
    expect(err.getStatus()).toBe(404);
  });
});
