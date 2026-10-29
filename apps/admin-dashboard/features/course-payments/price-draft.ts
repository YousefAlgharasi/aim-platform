// Form state for a course price and its validation (mirrors the backend rules
// so admins get instant feedback; the backend still validates everything).

import { CoursePrice, CoursePriceInput, Currency, DiscountType } from './api';

export type PriceDraft = {
  amount: string;
  currency: Currency;
  discountType: DiscountType;
  discountValue: string;
  discountStartsAt: string;
  discountEndsAt: string;
  accessDays: string;
};

/** ISO → value for <input type="datetime-local"> in the admin's local time. */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toPriceDraft(p: CoursePrice): PriceDraft {
  return {
    amount: String(p.amount),
    currency: p.currency,
    discountType: p.discountType,
    discountValue: String(p.discountValue),
    discountStartsAt: toLocalInput(p.discountStartsAt),
    discountEndsAt: toLocalInput(p.discountEndsAt),
    accessDays: String(p.accessDays),
  };
}

export function validatePriceDraft(d: PriceDraft): { input?: CoursePriceInput; error?: string } {
  const amount = Number(d.amount);
  if (d.amount.trim() === '' || !Number.isFinite(amount) || amount < 0) return { error: 'Price must be 0 or more.' };
  const accessDays = Number(d.accessDays);
  if (!Number.isInteger(accessDays) || accessDays < 1 || accessDays > 365) {
    return { error: 'Days to finish must be a whole number from 1 to 365.' };
  }
  const discountValue = d.discountType === 'none' ? 0 : Number(d.discountValue);
  if (d.discountType !== 'none') {
    if (!Number.isFinite(discountValue) || discountValue <= 0) return { error: 'Enter a discount greater than 0.' };
    if (d.discountType === 'percent' && discountValue > 100) return { error: 'A percent discount cannot be more than 100.' };
    if (d.discountType === 'fixed' && discountValue > amount) return { error: 'The discount cannot be more than the price.' };
  }
  const startsAt = d.discountType !== 'none' && d.discountStartsAt ? new Date(d.discountStartsAt).toISOString() : null;
  const endsAt = d.discountType !== 'none' && d.discountEndsAt ? new Date(d.discountEndsAt).toISOString() : null;
  if (startsAt && endsAt && endsAt <= startsAt) return { error: 'The discount must end after it starts.' };
  return {
    input: {
      amount,
      currency: d.currency,
      discountType: d.discountType,
      discountValue,
      discountStartsAt: startsAt,
      discountEndsAt: endsAt,
      accessDays,
    },
  };
}

