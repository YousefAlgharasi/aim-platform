// Course coupons: buy (guest or student) -> admin approves the wallet payment -> a single-use code for one course is
// issued -> the student redeems it and keeps that course for good (no deadline).
import { randomBytes } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { runInTransaction } from '../curriculum/translations/entity-translations.helpers';
import { CourseAccessService } from './course-access.service';
import { CoursePriceQuote, CoursePriceRow } from './course-billing.types';
import { quoteCoursePrice } from './course-pricing.util';
import { PaymentImageService } from './payment-image.service';
import { PaymentWalletService } from './payment-wallet.service';
import { UploadedImage } from './course-billing.types';

/** A course bought with a coupon never expires: ~1000 years. */
export const LIFETIME_DAYS = 365_000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Access this far in the future is shown as "Lifetime". */
export const LIFETIME_THRESHOLD_DAYS = 36_500;

// No 0/O/1/I/L so codes can be read out loud or typed from a screenshot.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomCode(): string {
  const bytes = randomBytes(12);
  let out = '';
  for (let i = 0; i < 12; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `AIM-${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}

export function normalizeCode(raw: string): string {
  const compact = (raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = compact.startsWith('AIM') ? compact.slice(3) : compact;
  return body.length === 12 ? `AIM-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}` : compact;
}

export interface PublicCourse {
  id: string;
  title: string;
  description: string | null;
  cefrCode: string | null;
  cefrRank: number | null;
  lessonCount: number;
  price: Pick<CoursePriceQuote, 'isFree' | 'currency' | 'originalAmount' | 'discountAmount' | 'amount' | 'discountActive' | 'discountEndsAt'>;
}

export interface PurchaseStatusView {
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  courseTitle: string;
  amount: number;
  currency: string;
  buyerName: string;
  createdAt: string;
  adminNote: string | null;
  /** Only present once approved. */
  couponCode: string | null;
}

export interface AdminPurchaseView {
  id: string;
  courseId: string;
  courseTitle: string;
  buyerName: string;
  buyerContact: string;
  buyerUserId: string | null;
  walletName: string;
  transactionNumber: string;
  amount: number;
  originalAmount: number;
  discountAmount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string | null;
  couponCode: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface AdminCouponView {
  id: string;
  code: string;
  courseId: string;
  courseTitle: string;
  status: 'issued' | 'redeemed' | 'void';
  source: 'purchase' | 'admin';
  note: string | null;
  buyerName: string | null;
  redeemedByName: string | null;
  redeemedByEmail: string | null;
  redeemedAt: string | null;
  createdAt: string;
}

export interface MyCourseView {
  courseId: string;
  title: string;
  cefrCode: string | null;
  status: 'active' | 'completed' | 'free';
  lifetime: boolean;
  lessonCount: number;
  completedLessons: number;
  progressPercent: number;
  startedAt: string | null;
}

const num = (v: unknown): number => Number(v ?? 0);

@Injectable()
export class CourseCouponService {
  constructor(
    private readonly db: DatabaseService,
    private readonly access: CourseAccessService,
    private readonly images: PaymentImageService,
    private readonly wallets: PaymentWalletService,
  ) {}

  // ───────────────────────── public (no account needed) ─────────────────────────

  async listPublicCourses(): Promise<PublicCourse[]> {
    const courses = await this.db.query<{
      id: string; title: string; description: string | null; cefr_code: string | null; cefr_rank: number | null; lesson_count: string;
    }>(
      `SELECT c.id, c.title, c.description, c.cefr_code, c.cefr_rank,
              (SELECT COUNT(*) FROM levels lv JOIN chapters ch ON ch.level_id = lv.id JOIN lessons l ON l.chapter_id = ch.id
                WHERE lv.course_id = c.id AND l.status = 'published')::text AS lesson_count
         FROM courses c
        WHERE c.status = 'published'
        ORDER BY c.cefr_rank NULLS LAST, c.title`,
    );
    const prices = await this.access.getPriceRows(courses.rows.map((c) => c.id));
    return courses.rows.map((c) => {
      const q = quoteCoursePrice(prices.get(c.id));
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        cefrCode: c.cefr_code,
        cefrRank: c.cefr_rank,
        lessonCount: num(c.lesson_count),
        price: {
          isFree: q.isFree,
          currency: q.currency,
          originalAmount: q.originalAmount,
          discountAmount: q.discountAmount,
          amount: q.amount,
          discountActive: q.discountActive,
          discountEndsAt: q.discountEndsAt,
        },
      };
    });
  }

  async submitPurchase(
    input: { courseId: string; buyerName: string; buyerContact: string; walletId: string; transactionNumber: string; buyerUserId?: string | null },
    receipt: UploadedImage | undefined,
  ): Promise<{ publicToken: string }> {
    const buyerName = (input.buyerName ?? '').trim();
    const buyerContact = (input.buyerContact ?? '').trim();
    const tx = (input.transactionNumber ?? '').trim();
    if (buyerName.length < 2 || buyerName.length > 80) throw new BadRequestException('Please enter your name');
    if (buyerContact.length < 5 || buyerContact.length > 120) throw new BadRequestException('Please enter your phone number or email');
    if (tx.length < 3 || tx.length > 60) throw new BadRequestException('Please enter the transaction number from your payment');

    const course = await this.db.query<{ id: string }>(`SELECT id FROM courses WHERE id::text = $1 AND status = 'published'`, [input.courseId]);
    if (!course.rows[0]) throw new NotFoundException('Course not found');
    const prices = await this.access.getPriceRows([course.rows[0].id]);
    const quote = quoteCoursePrice(prices.get(course.rows[0].id));
    if (quote.isFree) throw new BadRequestException('This course is free - no coupon is needed');

    const wallet = await this.wallets.getActive(input.walletId);
    const receiptId = await this.images.store(receipt, 'receipt', null);
    const token = randomBytes(24).toString('base64url');
    try {
      await this.db.query(
        `INSERT INTO coupon_purchases
           (public_token, course_id, buyer_name, buyer_contact, buyer_user_id, wallet_id, transaction_number, receipt_image_id,
            original_amount, discount_amount, amount, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [token, course.rows[0].id, buyerName, buyerContact, input.buyerUserId ?? null, wallet.id, tx, receiptId,
         quote.originalAmount, quote.discountAmount, quote.amount, quote.currency],
      );
    } catch (error) {
      await this.images.delete(receiptId).catch(() => undefined);
      const code = (error as { code?: string; constraint?: string })?.code;
      const constraint = (error as { constraint?: string })?.constraint ?? '';
      if (code === '23505' && constraint.includes('tx')) throw new ConflictException('This transaction number was already used');
      if (code === '23505') throw new ConflictException('You already have a pending purchase for this course. Please wait for approval.');
      throw error;
    }
    return { publicToken: token };
  }

  async purchaseStatus(token: string): Promise<PurchaseStatusView> {
    const r = await this.db.query<{
      course_id: string; status: 'pending' | 'approved' | 'rejected'; title: string; amount: string; currency: string; buyer_name: string;
      created_at: Date; admin_note: string | null; code: string | null;
    }>(
      `SELECT p.course_id, p.status, c.title, p.amount, p.currency, p.buyer_name, p.created_at, p.admin_note, k.code
         FROM coupon_purchases p
         JOIN courses c ON c.id = p.course_id
         LEFT JOIN course_coupons k ON k.id = p.coupon_id
        WHERE p.public_token = $1`,
      [token],
    );
    const row = r.rows[0];
    if (!row) throw new NotFoundException('Purchase not found');
    return {
      courseId: row.course_id,
      status: row.status,
      courseTitle: row.title,
      amount: num(row.amount),
      currency: row.currency,
      buyerName: row.buyer_name,
      createdAt: new Date(row.created_at).toISOString(),
      adminNote: row.admin_note,
      couponCode: row.status === 'approved' ? row.code : null,
    };
  }

  // ───────────────────────── student ─────────────────────────

  /** Redeem a coupon: the student gets the coupon's course for good. */
  async redeem(studentId: string, rawCode: string, courseId?: string): Promise<{ courseId: string; courseTitle: string }> {
    const code = normalizeCode(rawCode);
    if (!/^AIM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) throw new BadRequestException('That coupon code is not valid');
    const student = await this.access.resolveStudent(studentId);

    return runInTransaction(
      (cb) => this.db.withClient(cb),
      async (client) => {
        const k = await client.query<{ id: string; course_id: string; status: string; title: string }>(
          `SELECT k.id, k.course_id, k.status, c.title FROM course_coupons k JOIN courses c ON c.id = k.course_id WHERE k.code = $1 FOR UPDATE OF k`,
          [code],
        );
        const coupon = k.rows[0];
        if (!coupon) throw new NotFoundException('That coupon code was not found');
        if (coupon.status === 'redeemed') throw new ConflictException('This coupon was already used');
        if (coupon.status !== 'issued') throw new BadRequestException('This coupon is no longer valid');
        if (courseId && coupon.course_id !== courseId) {
          throw new BadRequestException(`This coupon is for "${coupon.title}", not this course`);
        }
        const existing = await client.query(
          `SELECT 1 FROM course_access WHERE student_id = $1 AND course_id = $2 AND status IN ('active', 'completed')`,
          [student.userId, coupon.course_id],
        );
        if (existing.rowCount) throw new ConflictException('You already own this course');

        const now = new Date();
        await client.query(
          `INSERT INTO course_access (student_id, course_id, payment_request_id, status, starts_at, expires_at)
           VALUES ($1, $2, NULL, 'active', $3, $4)`,
          [student.userId, coupon.course_id, now, new Date(now.getTime() + LIFETIME_DAYS * DAY_MS)],
        );
        await client.query(
          `UPDATE course_coupons SET status = 'redeemed', redeemed_by = $2, redeemed_at = $3 WHERE id = $1`,
          [coupon.id, student.userId, now],
        );
        return { courseId: coupon.course_id, courseTitle: coupon.title };
      },
    );
  }

  /** A free course becomes "enrolled": the same lifetime access record a coupon creates. Paid courses are refused. */
  async enrollFree(studentId: string, courseId: string): Promise<{ enrolled: boolean }> {
    const student = await this.access.resolveStudent(studentId);
    const course = await this.db.query<{ id: string }>(`SELECT id FROM courses WHERE id::text = $1 AND status = 'published'`, [courseId]);
    if (!course.rows[0]) throw new NotFoundException('Course not found');
    const prices = await this.access.getPriceRows([course.rows[0].id]);
    if (!quoteCoursePrice(prices.get(course.rows[0].id)).isFree) {
      throw new BadRequestException('This course needs a coupon');
    }
    const existing = await this.db.query(
      `SELECT 1 FROM course_access WHERE student_id = $1 AND course_id = $2 AND status IN ('active', 'completed')`,
      [student.userId, course.rows[0].id],
    );
    if (existing.rowCount) return { enrolled: true };
    const now = new Date();
    await this.db.query(
      `INSERT INTO course_access (student_id, course_id, payment_request_id, status, starts_at, expires_at)
       VALUES ($1, $2, NULL, 'active', $3, $4)
       ON CONFLICT DO NOTHING`,
      [student.userId, course.rows[0].id, now, new Date(now.getTime() + LIFETIME_DAYS * DAY_MS)],
    );
    return { enrolled: true };
  }

  /** Courses the student owns (coupon / payment / free enrolment) plus free courses they have started. */
  async myCourses(studentId: string): Promise<MyCourseView[]> {
    const student = await this.access.resolveStudent(studentId);
    const r = await this.db.query<{
      course_id: string; title: string; cefr_code: string | null; access_status: string | null; starts_at: Date | null;
      expires_at: Date | null; lesson_count: string; done: string; is_free: boolean;
    }>(
      `WITH owned AS (
         SELECT DISTINCT ON (course_id) course_id, status, starts_at, expires_at
           FROM course_access WHERE student_id = $1 AND status IN ('active', 'completed')
          ORDER BY course_id, created_at DESC
       ),
       touched AS (
         SELECT DISTINCT lv.course_id
           FROM lesson_progress lp
           JOIN lessons l ON l.id = lp.lesson_id
           JOIN chapters ch ON ch.id = l.chapter_id
           JOIN levels lv ON lv.id = ch.level_id
          WHERE lp.student_id::text = ANY($2)
       ),
       ids AS (SELECT course_id FROM owned UNION SELECT course_id FROM touched)
       SELECT c.id AS course_id, c.title, c.cefr_code, o.status AS access_status, o.starts_at, o.expires_at,
              (SELECT COUNT(*) FROM levels lv JOIN chapters ch ON ch.level_id = lv.id JOIN lessons l ON l.chapter_id = ch.id
                WHERE lv.course_id = c.id AND l.status = 'published')::text AS lesson_count,
              (SELECT COUNT(*) FROM levels lv JOIN chapters ch ON ch.level_id = lv.id JOIN lessons l ON l.chapter_id = ch.id
                JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.completed = true AND lp.student_id::text = ANY($2)
                WHERE lv.course_id = c.id AND l.status = 'published')::text AS done,
              COALESCE((SELECT p.amount = 0 FROM course_prices p WHERE p.course_id = c.id), true) AS is_free
         FROM ids
         JOIN courses c ON c.id = ids.course_id AND c.status = 'published'
         LEFT JOIN owned o ON o.course_id = c.id
        ORDER BY c.cefr_rank NULLS LAST, c.title`,
      [student.userId, student.forms],
    );
    return r.rows
      // A touched course only counts as "enrolled" when it is free; a paid one needs the student to actually own it.
      .filter((x) => x.access_status !== null || x.is_free)
      .map((x) => {
        const lessons = num(x.lesson_count);
        const done = Math.min(num(x.done), lessons);
        const lifetime = !!x.expires_at && new Date(x.expires_at).getTime() - Date.now() > LIFETIME_THRESHOLD_DAYS * DAY_MS;
        return {
          courseId: x.course_id,
          title: x.title,
          cefrCode: x.cefr_code,
          status: x.access_status === 'completed' ? ('completed' as const) : x.access_status ? ('active' as const) : ('free' as const),
          lifetime: lifetime || x.access_status === null,
          lessonCount: lessons,
          completedLessons: done,
          progressPercent: lessons > 0 ? Math.round((done / lessons) * 100) : 0,
          startedAt: x.starts_at ? new Date(x.starts_at).toISOString() : null,
        };
      });
  }

  // ───────────────────────── admin ─────────────────────────

  private static readonly PURCHASE_SELECT = `
    SELECT p.id, p.course_id, c.title AS course_title, p.buyer_name, p.buyer_contact, p.buyer_user_id, w.name AS wallet_name,
           p.transaction_number, p.amount, p.original_amount, p.discount_amount, p.currency, p.status, p.admin_note,
           k.code AS coupon_code, p.created_at, p.reviewed_at
      FROM coupon_purchases p
      JOIN courses c ON c.id = p.course_id
      JOIN payment_wallets w ON w.id = p.wallet_id
      LEFT JOIN course_coupons k ON k.id = p.coupon_id`;

  private toPurchase(x: Record<string, any>): AdminPurchaseView {
    return {
      id: x.id, courseId: x.course_id, courseTitle: x.course_title, buyerName: x.buyer_name, buyerContact: x.buyer_contact,
      buyerUserId: x.buyer_user_id, walletName: x.wallet_name, transactionNumber: x.transaction_number,
      amount: num(x.amount), originalAmount: num(x.original_amount), discountAmount: num(x.discount_amount), currency: x.currency,
      status: x.status, adminNote: x.admin_note, couponCode: x.coupon_code,
      createdAt: new Date(x.created_at).toISOString(), reviewedAt: x.reviewed_at ? new Date(x.reviewed_at).toISOString() : null,
    };
  }

  async listPurchases(status?: string): Promise<AdminPurchaseView[]> {
    if (status && !['pending', 'approved', 'rejected'].includes(status)) throw new BadRequestException('Invalid status');
    const r = status
      ? await this.db.query(`${CourseCouponService.PURCHASE_SELECT} WHERE p.status = $1 ORDER BY p.created_at DESC LIMIT 500`, [status])
      : await this.db.query(`${CourseCouponService.PURCHASE_SELECT} ORDER BY p.created_at DESC LIMIT 500`);
    return r.rows.map((x) => this.toPurchase(x));
  }

  async pendingPurchaseCount(): Promise<number> {
    const r = await this.db.query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM coupon_purchases WHERE status = 'pending'`);
    return num(r.rows[0]?.n);
  }

  async purchaseReceipt(id: string): Promise<{ contentType: string; data: Buffer }> {
    const r = await this.db.query<{ receipt_image_id: string }>(`SELECT receipt_image_id FROM coupon_purchases WHERE id::text = $1`, [id]);
    if (!r.rows[0]) throw new NotFoundException('Purchase not found');
    return this.images.read(r.rows[0].receipt_image_id);
  }

  async approvePurchase(id: string, adminId: string, note?: string): Promise<AdminPurchaseView> {
    await runInTransaction(
      (cb) => this.db.withClient(cb),
      async (client) => {
        const p = await client.query<{ id: string; course_id: string; status: string }>(
          `SELECT id, course_id, status FROM coupon_purchases WHERE id::text = $1 FOR UPDATE`,
          [id],
        );
        const row = p.rows[0];
        if (!row) throw new NotFoundException('Purchase not found');
        if (row.status !== 'pending') throw new ConflictException(`This purchase was already ${row.status}`);
        const coupon = await this.insertCoupon(client, row.course_id, 'purchase', row.id, null, adminId);
        await client.query(
          `UPDATE coupon_purchases SET status = 'approved', reviewed_by = $2, reviewed_at = now(), admin_note = $3, coupon_id = $4, updated_at = now()
            WHERE id = $1`,
          [row.id, adminId, (note ?? '').trim().slice(0, 500) || null, coupon.id],
        );
      },
    );
    return this.getPurchase(id);
  }

  async rejectPurchase(id: string, adminId: string, note?: string): Promise<AdminPurchaseView> {
    const clean = (note ?? '').trim().slice(0, 500);
    if (!clean) throw new BadRequestException('Add a note so the buyer knows why the payment was rejected');
    const r = await this.db.query(
      `UPDATE coupon_purchases SET status = 'rejected', reviewed_by = $2, reviewed_at = now(), admin_note = $3, updated_at = now()
        WHERE id::text = $1 AND status = 'pending'`,
      [id, adminId, clean],
    );
    if (!r.rowCount) throw new ConflictException('This purchase was already reviewed (or does not exist)');
    return this.getPurchase(id);
  }

  private async getPurchase(id: string): Promise<AdminPurchaseView> {
    const r = await this.db.query(`${CourseCouponService.PURCHASE_SELECT} WHERE p.id::text = $1`, [id]);
    if (!r.rows[0]) throw new NotFoundException('Purchase not found');
    return this.toPurchase(r.rows[0]);
  }

  private async insertCoupon(
    client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }> },
    courseId: string,
    source: 'purchase' | 'admin',
    purchaseId: string | null,
    note: string | null,
    createdBy: string | null,
  ): Promise<{ id: string; code: string }> {
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = randomCode();
      const r = await client.query(
        `INSERT INTO course_coupons (code, course_id, source, purchase_id, note, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO NOTHING RETURNING id, code`,
        [code, courseId, source, purchaseId, note, createdBy],
      );
      if (r.rows[0]) return r.rows[0];
    }
    throw new ConflictException('Could not generate a unique code, please try again');
  }

  async generateCoupons(courseId: string, count: number, note: string | undefined, adminId: string): Promise<AdminCouponView[]> {
    const n = Math.floor(Number(count));
    if (!Number.isFinite(n) || n < 1 || n > 200) throw new BadRequestException('Choose between 1 and 200 coupons');
    const course = await this.db.query(`SELECT 1 FROM courses WHERE id::text = $1`, [courseId]);
    if (!course.rowCount) throw new NotFoundException('Course not found');
    const cleanNote = (note ?? '').trim().slice(0, 200) || null;
    const ids = await runInTransaction(
      (cb) => this.db.withClient(cb),
      async (client) => {
        const out: string[] = [];
        for (let i = 0; i < n; i++) out.push((await this.insertCoupon(client, courseId, 'admin', null, cleanNote, adminId)).id);
        return out;
      },
    );
    return (await this.listCoupons()).filter((c) => ids.includes(c.id));
  }

  async listCoupons(status?: string, courseId?: string): Promise<AdminCouponView[]> {
    if (status && !['issued', 'redeemed', 'void'].includes(status)) throw new BadRequestException('Invalid status');
    const r = await this.db.query<Record<string, any>>(
      `SELECT k.id, k.code, k.course_id, c.title AS course_title, k.status, k.source, k.note, k.created_at, k.redeemed_at,
              p.buyer_name, COALESCE(sp.display_name, ru.email) AS redeemed_by_name, ru.email AS redeemed_by_email
         FROM course_coupons k
         JOIN courses c ON c.id = k.course_id
         LEFT JOIN coupon_purchases p ON p.id = k.purchase_id
         LEFT JOIN users ru ON ru.id = k.redeemed_by
         LEFT JOIN student_profiles sp ON sp.user_id = k.redeemed_by
        WHERE ($1::text IS NULL OR k.status = $1) AND ($2::text IS NULL OR k.course_id::text = $2)
        ORDER BY k.created_at DESC
        LIMIT 500`,
      [status ?? null, courseId ?? null],
    );
    return r.rows.map((x) => ({
      id: x.id, code: x.code, courseId: x.course_id, courseTitle: x.course_title, status: x.status, source: x.source, note: x.note,
      buyerName: x.buyer_name ?? null, redeemedByName: x.redeemed_by_name ?? null, redeemedByEmail: x.redeemed_by_email ?? null,
      redeemedAt: x.redeemed_at ? new Date(x.redeemed_at).toISOString() : null, createdAt: new Date(x.created_at).toISOString(),
    }));
  }

  async voidCoupon(id: string): Promise<void> {
    const r = await this.db.query(`UPDATE course_coupons SET status = 'void' WHERE id::text = $1 AND status = 'issued'`, [id]);
    if (!r.rowCount) throw new ConflictException('Only unused coupons can be voided');
  }
}
