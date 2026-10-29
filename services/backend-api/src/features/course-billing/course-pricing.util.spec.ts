import { quoteCoursePrice } from './course-pricing.util';
import { CoursePriceRow } from './course-billing.types';

const row = (over: Partial<CoursePriceRow> = {}): CoursePriceRow => ({
  course_id: 'c1',
  amount: '10000.00',
  currency: 'YER',
  discount_type: 'none',
  discount_value: '0',
  discount_starts_at: null,
  discount_ends_at: null,
  access_days: 30,
  ...over,
});

describe('quoteCoursePrice', () => {
  const now = new Date('2026-11-01T12:00:00Z');

  it('treats a course with no price row as free', () => {
    const q = quoteCoursePrice(undefined, now);
    expect(q.isFree).toBe(true);
    expect(q.amount).toBe(0);
    expect(q.accessDays).toBe(30);
  });

  it('treats a price of 0 as free', () => {
    expect(quoteCoursePrice(row({ amount: '0' }), now).isFree).toBe(true);
  });

  it('returns the full price without a discount', () => {
    const q = quoteCoursePrice(row(), now);
    expect(q).toMatchObject({ isFree: false, originalAmount: 10000, discountAmount: 0, amount: 10000, discountActive: false });
  });

  it('applies a percent discount', () => {
    const q = quoteCoursePrice(row({ discount_type: 'percent', discount_value: '25' }), now);
    expect(q).toMatchObject({ discountAmount: 2500, amount: 7500, discountActive: true });
  });

  it('applies a fixed discount, never below zero', () => {
    expect(quoteCoursePrice(row({ discount_type: 'fixed', discount_value: '3000' }), now).amount).toBe(7000);
    const full = quoteCoursePrice(row({ discount_type: 'fixed', discount_value: '10000' }), now);
    expect(full.amount).toBe(0);
    expect(full.isFree).toBe(true);
  });

  it('ignores a discount outside its window', () => {
    const notYet = quoteCoursePrice(
      row({ discount_type: 'percent', discount_value: '50', discount_starts_at: new Date('2026-11-05T00:00:00Z') }),
      now,
    );
    expect(notYet).toMatchObject({ amount: 10000, discountActive: false });
    const ended = quoteCoursePrice(
      row({ discount_type: 'percent', discount_value: '50', discount_ends_at: new Date('2026-10-31T00:00:00Z') }),
      now,
    );
    expect(ended.amount).toBe(10000);
  });

  it('reports when a live discount ends', () => {
    const ends = new Date('2026-11-10T00:00:00Z');
    const q = quoteCoursePrice(row({ discount_type: 'percent', discount_value: '10', discount_ends_at: ends }), now);
    expect(q.discountEndsAt).toBe(ends.toISOString());
    expect(q.amount).toBe(9000);
  });
});
