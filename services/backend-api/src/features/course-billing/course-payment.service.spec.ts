import { BadRequestException, ConflictException } from '@nestjs/common';
import { CoursePaymentService } from './course-payment.service';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2]);
const quote = { isFree: false, currency: 'YER', originalAmount: 10000, discountAmount: 2000, amount: 8000, discountActive: true, discountType: 'percent', discountValue: 20, discountEndsAt: null, accessDays: 30 };

function setup(opts: { accessStatus?: string; isFree?: boolean; duplicate?: boolean; requestStatus?: string } = {}) {
  const requestRow = {
    id: 'r1', student_id: 'u1', course_id: 'c1', course_title: 'Starter', wallet_id: 'w1', wallet_name: 'Jawali',
    transaction_number: 'TX1', receipt_image_id: 'img1', original_amount: '10000', discount_amount: '2000', amount: '8000',
    currency: 'YER', status: opts.requestStatus ?? 'pending', admin_note: null, reviewed_at: null, created_at: new Date(),
  };
  const db = {
    query: jest.fn(async (sql: string, _params?: unknown[]) => {
      if (sql.includes('FROM courses WHERE')) return { rows: [{ id: 'c1' }] };
      if (sql.includes('SELECT 1 FROM course_payment_requests')) return { rows: opts.duplicate ? [{}] : [], rowCount: opts.duplicate ? 1 : 0 };
      if (sql.includes('INSERT INTO course_payment_requests')) return { rows: [{ id: 'r1' }] };
      if (sql.includes('UPDATE course_payment_requests')) return { rows: [], rowCount: 1 };
      if (sql.includes('FROM course_payment_requests r')) return { rows: [requestRow] };
      return { rows: [] };
    }),
  };
  const access = {
    getBilling: jest.fn().mockResolvedValue({ courseId: 'c1', price: { ...quote, isFree: opts.isFree ?? false }, access: { status: opts.accessStatus ?? 'none' } }),
    resolveStudent: jest.fn().mockResolvedValue({ userId: 'u1', forms: ['u1'] }),
    getPriceRows: jest.fn().mockResolvedValue(new Map([['c1', { course_id: 'c1', amount: '10000', currency: 'YER', discount_type: 'none', discount_value: '0', discount_starts_at: null, discount_ends_at: null, access_days: 45 }]])),
    grantAccess: jest.fn().mockResolvedValue(undefined),
  };
  const wallets = { getActive: jest.fn().mockResolvedValue({ id: 'w1', name: 'Jawali' }) };
  const images = { store: jest.fn().mockResolvedValue('img1') };
  const svc = new CoursePaymentService(db as any, access as any, wallets as any, images as any);
  return { svc, db, access, wallets, images };
}

const receipt = { buffer: PNG, size: PNG.length };

describe('CoursePaymentService.submit', () => {
  it('stores the backend quote, not anything from the client', async () => {
    const { svc, db } = setup();
    const view = await svc.submit('u1', 'c1', { walletId: 'w1', transactionNumber: ' TX1 ' }, receipt);
    const insert = db.query.mock.calls.find(([sql]) => sql.includes('INSERT INTO course_payment_requests'))!;
    expect(insert[1]).toEqual(['u1', 'c1', 'w1', 'TX1', 'img1', 10000, 2000, 8000, 'YER']);
    expect(view).toMatchObject({ id: 'r1', status: 'pending', amount: 8000, receiptUrl: '/student/payment-requests/r1/receipt' });
  });

  it('requires a transaction number and wallet', async () => {
    const { svc } = setup();
    await expect(svc.submit('u1', 'c1', { walletId: 'w1', transactionNumber: '  ' }, receipt)).rejects.toThrow(BadRequestException);
    await expect(svc.submit('u1', 'c1', { transactionNumber: 'TX1' }, receipt)).rejects.toThrow(BadRequestException);
  });

  it('rejects free courses, existing access and a second pending payment', async () => {
    await expect(setup({ isFree: true }).svc.submit('u1', 'c1', { walletId: 'w1', transactionNumber: 'TX1' }, receipt)).rejects.toThrow('free');
    await expect(setup({ accessStatus: 'active' }).svc.submit('u1', 'c1', { walletId: 'w1', transactionNumber: 'TX1' }, receipt)).rejects.toThrow(ConflictException);
    await expect(setup({ accessStatus: 'pending' }).svc.submit('u1', 'c1', { walletId: 'w1', transactionNumber: 'TX1' }, receipt)).rejects.toThrow('waiting for review');
  });

  it('allows paying again after failing (retake)', async () => {
    const { svc } = setup({ accessStatus: 'failed' });
    await expect(svc.submit('u1', 'c1', { walletId: 'w1', transactionNumber: 'TX2' }, receipt)).resolves.toMatchObject({ id: 'r1' });
  });

  it('rejects a transaction number already used on the wallet', async () => {
    const { svc, images } = setup({ duplicate: true });
    await expect(svc.submit('u1', 'c1', { walletId: 'w1', transactionNumber: 'TX1' }, receipt)).rejects.toThrow('already submitted');
    expect(images.store).not.toHaveBeenCalled();
  });
});

describe('CoursePaymentService review', () => {
  it('approve grants access for the course access days', async () => {
    const { svc, access } = setup();
    const now = new Date('2026-11-01T00:00:00Z');
    await svc.approve('r1', 'admin1', undefined, now);
    expect(access.grantAccess).toHaveBeenCalledWith('u1', 'c1', 45, 'r1', now);
  });

  it('reject needs a note and never grants access', async () => {
    const { svc, access } = setup();
    await expect(svc.reject('r1', 'admin1', '')).rejects.toThrow(BadRequestException);
    await svc.reject('r1', 'admin1', 'Amount does not match');
    expect(access.grantAccess).not.toHaveBeenCalled();
  });

  it('cannot review a payment twice', async () => {
    const { svc } = setup({ requestStatus: 'approved' });
    await expect(svc.approve('r1', 'admin1')).rejects.toThrow('already approved');
    await expect(svc.reject('r1', 'admin1', 'x')).rejects.toThrow('already approved');
  });
});
