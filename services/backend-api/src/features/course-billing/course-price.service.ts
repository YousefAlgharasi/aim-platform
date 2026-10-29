// CoursePriceService — admin management of per-course prices and discounts.

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  AdminCoursePriceView,
  CURRENCIES,
  Currency,
  CoursePriceRow,
  DISCOUNT_TYPES,
  DiscountType,
} from './course-billing.types';
import { DEFAULT_ACCESS_DAYS, quoteCoursePrice } from './course-pricing.util';

interface CourseWithPriceRow extends Partial<CoursePriceRow> {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly cefr_code: string | null;
}

export interface CoursePriceInput {
  amount: number;
  currency: Currency;
  discountType?: DiscountType;
  discountValue?: number;
  discountStartsAt?: string | null;
  discountEndsAt?: string | null;
  accessDays?: number;
}

function iso(value: Date | null | undefined): string | null {
  return value ? new Date(value).toISOString() : null;
}

function parseDate(value: string | null | undefined, field: string): Date | null {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new BadRequestException(`${field} must be a valid date`);
  return date;
}

@Injectable()
export class CoursePriceService {
  constructor(private readonly db: DatabaseService) {}

  async list(now = new Date()): Promise<AdminCoursePriceView[]> {
    const result = await this.db.query<CourseWithPriceRow>(
      `SELECT co.id, co.title, co.status, co.cefr_code,
              cp.course_id, cp.amount, cp.currency, cp.discount_type, cp.discount_value,
              cp.discount_starts_at, cp.discount_ends_at, cp.access_days
       FROM courses co
       LEFT JOIN course_prices cp ON cp.course_id = co.id
       WHERE co.status <> 'archived'
       ORDER BY co.cefr_rank ASC NULLS LAST, co.sort_order ASC, co.created_at ASC`,
    );
    return result.rows.map((row) => this.toView(row, now));
  }

  private toView(row: CourseWithPriceRow, now: Date): AdminCoursePriceView {
    const priceRow = row.course_id ? (row as CoursePriceRow) : undefined;
    return {
      courseId: row.id,
      courseTitle: row.title,
      courseStatus: row.status,
      cefrCode: row.cefr_code,
      amount: priceRow ? Number(priceRow.amount) : 0,
      currency: priceRow?.currency ?? 'YER',
      discountType: priceRow?.discount_type ?? 'none',
      discountValue: priceRow ? Number(priceRow.discount_value) : 0,
      discountStartsAt: iso(priceRow?.discount_starts_at),
      discountEndsAt: iso(priceRow?.discount_ends_at),
      accessDays: priceRow?.access_days ?? DEFAULT_ACCESS_DAYS,
      quote: quoteCoursePrice(priceRow, now),
    };
  }

  async upsert(courseId: string, input: CoursePriceInput, adminId: string): Promise<AdminCoursePriceView> {
    const course = await this.db.query<{ id: string }>(`SELECT id FROM courses WHERE id::text = $1`, [courseId]);
    if (!course.rows[0]) throw new NotFoundException('Course not found');

    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount < 0) throw new BadRequestException('amount must be 0 or more');
    if (!(CURRENCIES as readonly string[]).includes(input.currency)) {
      throw new BadRequestException(`currency must be one of: ${CURRENCIES.join(', ')}`);
    }
    const discountType = input.discountType ?? 'none';
    if (!(DISCOUNT_TYPES as readonly string[]).includes(discountType)) {
      throw new BadRequestException(`discountType must be one of: ${DISCOUNT_TYPES.join(', ')}`);
    }
    const discountValue = discountType === 'none' ? 0 : Number(input.discountValue ?? 0);
    if (!Number.isFinite(discountValue) || discountValue < 0) {
      throw new BadRequestException('discountValue must be 0 or more');
    }
    if (discountType === 'percent' && discountValue > 100) {
      throw new BadRequestException('A percent discount cannot be more than 100');
    }
    if (discountType === 'fixed' && discountValue > amount) {
      throw new BadRequestException('A fixed discount cannot be more than the price');
    }
    const startsAt = discountType === 'none' ? null : parseDate(input.discountStartsAt, 'discountStartsAt');
    const endsAt = discountType === 'none' ? null : parseDate(input.discountEndsAt, 'discountEndsAt');
    if (startsAt && endsAt && endsAt <= startsAt) {
      throw new BadRequestException('The discount must end after it starts');
    }
    const accessDays = input.accessDays ?? DEFAULT_ACCESS_DAYS;
    if (!Number.isInteger(accessDays) || accessDays < 1 || accessDays > 365) {
      throw new BadRequestException('accessDays must be a whole number from 1 to 365');
    }

    await this.db.query(
      `INSERT INTO course_prices
         (course_id, amount, currency, discount_type, discount_value, discount_starts_at, discount_ends_at, access_days, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (course_id) DO UPDATE SET
         amount = EXCLUDED.amount,
         currency = EXCLUDED.currency,
         discount_type = EXCLUDED.discount_type,
         discount_value = EXCLUDED.discount_value,
         discount_starts_at = EXCLUDED.discount_starts_at,
         discount_ends_at = EXCLUDED.discount_ends_at,
         access_days = EXCLUDED.access_days,
         updated_by = EXCLUDED.updated_by`,
      [course.rows[0].id, amount, input.currency, discountType, discountValue, startsAt, endsAt, accessDays, adminId],
    );
    const views = await this.list();
    return views.find((v) => v.courseId === course.rows[0].id)!;
  }
}
