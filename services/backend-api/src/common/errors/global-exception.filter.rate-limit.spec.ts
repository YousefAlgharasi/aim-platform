import { HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter rate limiting', () => {
  it('shows a friendly message instead of "ThrottlerException: Too Many Requests"', () => {
    let sent: any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn((b) => (sent = b)) };
    const host = {
      switchToHttp: () => ({ getResponse: () => res, getRequest: () => ({ url: '/x', method: 'POST', headers: {} }) }),
    };
    new GlobalExceptionFilter().catch(
      new HttpException('ThrottlerException: Too Many Requests', HttpStatus.TOO_MANY_REQUESTS),
      host as any,
    );
    expect(res.status).toHaveBeenCalledWith(429);
    expect(sent.error.message).toBe('Too many requests. Please wait a moment and try again.');
    expect(sent.error.message).not.toMatch(/Throttler/);
  });
});
