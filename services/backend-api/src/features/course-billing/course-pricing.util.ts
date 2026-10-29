// Price calculation for a course at a given moment. Backend-only: clients
// display the quote they receive and never compute prices themselves.

import { CoursePriceQuote, CoursePriceRow } from './course-billing.types';

export const DEFAULT_ACCESS_DAYS = 30;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function discountIsLive(row: CoursePriceRow, now: Date): boolean {
  if (row.discount_type === 'none' || Number(row.discount_value) <= 0) return false;
  if (row.discount_starts_at && now < new Date(row.discount_starts_at)) return false;
  if (row.discount_ends_at && now >= new Date(row.discount_ends_at)) return false;
  return true;
}

/** Quote for [row]; a missing row means the course is free. */
export function quoteCoursePrice(row: CoursePriceRow | undefined, now = new Date()): CoursePriceQuote {
  if (!row) {
    return {
      isFree: true,
      currency: 'YER',
      originalAmount: 0,
      discountAmount: 0,
      amount: 0,
      discountActive: false,
      discountType: 'none',
      discountValue: 0,
      discountEndsAt: null,
      accessDays: DEFAULT_ACCESS_DAYS,
    };
  }

  const original = round2(Number(row.amount));
  const value = Number(row.discount_value);
  const live = discountIsLive(row, now);
  let discount = 0;
  if (live && row.discount_type === 'percent') discount = round2((original * value) / 100);
  if (live && row.discount_type === 'fixed') discount = round2(Math.min(value, original));
  const amount = round2(Math.max(original - discount, 0));

  return {
    isFree: amount <= 0,
    currency: row.currency,
    originalAmount: original,
    discountAmount: discount,
    amount,
    discountActive: live && discount > 0,
    discountType: row.discount_type,
    discountValue: value,
    discountEndsAt: live && row.discount_ends_at ? new Date(row.discount_ends_at).toISOString() : null,
    accessDays: row.access_days,
  };
}
