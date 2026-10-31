// CoursePaymentService — manual wallet payments for courses.
//
// Students submit a payment request (wallet, transaction number, receipt
// image) for a paid course. The amount is quoted by the backend at
// submission time and stored on the request. Admins approve (which grants a
// time-limited access window) or reject (with a note the student sees).

import { courseTextSql } from '../../common/locale/course-text.sql';
import { DEFAULT_LOCALE, SupportedLocale } from '../../common/locale/locale.constants';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AdminPaymentRequestView, PaymentRequestStatus, PaymentRequestView, UploadedImage } from './course-billing.types';
import { CourseAccessService } from './course-access.service';
import { quoteCoursePrice } from './course-pricing.util';
import { PaymentImageService } from './payment-image.service';
import { PaymentWalletService } from './payment-wallet.service';

interface RequestRow {
  readonly id: string;
  readonly student_id: string;
  readonly course_id: string;
  readonly course_title: string;
  readonly wallet_id: string;
  readonly wallet_name: string;
  readonly transaction_number: string;
  readonly receipt_image_id: string;
  readonly original_amount: string;
  readonly discount_amount: string;
  readonly amount: string;
  readonly currency: PaymentRequestView['currency'];
  readonly status: PaymentRequestStatus;
  readonly admin_note: string | null;
  readonly reviewed_at: Date | null;
  readonly created_at: Date;
  readonly student_email?: string | null;
  readonly student_name?: string | null;
  readonly reviewed_by_email?: string | null;
}

const SELECT_REQUESTS = buildSelectRequests();

function buildSelectRequests(localeParam?: string): string {
  const text = localeParam ? courseTextSql('co', localeParam) : null;
  return `
  SELECT r.*, ${text ? text.title : 'co.title'} AS course_title, w.name AS wallet_name,
         u.email AS student_email, sp.display_name AS student_name,
         rv.email AS reviewed_by_email
  FROM course_payment_requests r
  JOIN courses co ON co.id = r.course_id
  ${text ? text.joins : ''}
  JOIN payment_wallets w ON w.id = r.wallet_id
  JOIN users u ON u.id = r.student_id
  LEFT JOIN student_profiles sp ON sp.user_id = r.student_id
  LEFT JOIN users rv ON rv.id = r.reviewed_by`;
}

const MAX_TRANSACTION_LENGTH = 100;
const MAX_NOTE_LENGTH = 500;

function toView(row: RequestRow, receiptBase: string): PaymentRequestView {
  return {
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.course_title,
    walletId: row.wallet_id,
    walletName: row.wallet_name,
    transactionNumber: row.transaction_number,
    originalAmount: Number(row.original_amount),
    discountAmount: Number(row.discount_amount),
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    adminNote: row.admin_note,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    receiptUrl: `${receiptBase}/${row.id}/receipt`,
  };
}

function toAdminView(row: RequestRow): AdminPaymentRequestView {
  return {
    ...toView(row, '/admin/course-billing/payment-requests'),
    studentId: row.student_id,
    studentEmail: row.student_email ?? null,
    studentName: row.student_name ?? null,
    reviewedByEmail: row.reviewed_by_email ?? null,
  };
}

@Injectable()
export class CoursePaymentService {
  constructor(
    private readonly db: DatabaseService,
    private readonly access: CourseAccessService,
    private readonly wallets: PaymentWalletService,
    private readonly images: PaymentImageService,
  ) {}

  // ── Student ───────────────────────────────────────────────────────────

  async submit(
    studentId: string,
    courseId: string,
    input: { walletId?: string; transactionNumber?: string },
    receipt: UploadedImage | undefined,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PaymentRequestView> {
    const transactionNumber = (input.transactionNumber ?? '').trim();
    if (!transactionNumber) throw new BadRequestException('Transaction number is required');
    if (transactionNumber.length > MAX_TRANSACTION_LENGTH) {
      throw new BadRequestException('Transaction number is too long');
    }
    if (!input.walletId) throw new BadRequestException('Choose the wallet you paid with');

    const course = await this.db.query<{ id: string }>(
      `SELECT id FROM courses WHERE id::text = $1 AND status = 'published'`,
      [courseId],
    );
    if (!course.rows[0]) throw new NotFoundException('Course not found');

    const billing = await this.access.getBilling(studentId, course.rows[0].id);
    if (billing.price.isFree) throw new BadRequestException('This course is free — no payment needed');
    if (billing.access.status === 'active' || billing.access.status === 'completed') {
      throw new ConflictException('You already have access to this course');
    }
    if (billing.access.status === 'pending') {
      throw new ConflictException('Your payment for this course is already waiting for review');
    }

    const wallet = await this.wallets.getActive(input.walletId);
    const student = await this.access.resolveStudent(studentId);

    const duplicate = await this.db.query(
      `SELECT 1 FROM course_payment_requests
       WHERE wallet_id = $1 AND lower(trim(transaction_number)) = lower($2) AND status IN ('pending', 'approved')
       LIMIT 1`,
      [wallet.id, transactionNumber],
    );
    if (duplicate.rowCount) throw new ConflictException('This transaction number was already submitted');

    const receiptId = await this.images.store(receipt, 'receipt', student.userId);
    const price = billing.price;
    const inserted = await this.db.query<{ id: string }>(
      `INSERT INTO course_payment_requests
         (student_id, course_id, wallet_id, transaction_number, receipt_image_id,
          original_amount, discount_amount, amount, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        student.userId, course.rows[0].id, wallet.id, transactionNumber, receiptId,
        price.originalAmount, price.discountAmount, price.amount, price.currency,
      ],
    );
    return this.getForStudent(studentId, inserted.rows[0].id, locale);
  }

  async listForStudent(studentId: string, locale: SupportedLocale = DEFAULT_LOCALE): Promise<PaymentRequestView[]> {
    const student = await this.access.resolveStudent(studentId);
    const result = await this.db.query<RequestRow>(
      `${buildSelectRequests('$2')} WHERE r.student_id = $1 ORDER BY r.created_at DESC`,
      [student.userId, locale],
    );
    return result.rows.map((r) => toView(r, '/student/payment-requests'));
  }

  async getForStudent(
    studentId: string,
    requestId: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PaymentRequestView> {
    const student = await this.access.resolveStudent(studentId);
    const result = await this.db.query<RequestRow>(
      `${buildSelectRequests('$3')} WHERE r.id::text = $1 AND r.student_id = $2`,
      [requestId, student.userId, locale],
    );
    if (!result.rows[0]) throw new NotFoundException('Payment not found');
    return toView(result.rows[0], '/student/payment-requests');
  }

  async receiptForStudent(studentId: string, requestId: string): Promise<{ contentType: string; data: Buffer }> {
    const student = await this.access.resolveStudent(studentId);
    const result = await this.db.query<{ receipt_image_id: string }>(
      `SELECT receipt_image_id FROM course_payment_requests WHERE id::text = $1 AND student_id = $2`,
      [requestId, student.userId],
    );
    if (!result.rows[0]) throw new NotFoundException('Payment not found');
    return this.images.read(result.rows[0].receipt_image_id);
  }

  // ── Admin ─────────────────────────────────────────────────────────────

  async listForAdmin(status?: string): Promise<AdminPaymentRequestView[]> {
    const valid = ['pending', 'approved', 'rejected'];
    if (status && !valid.includes(status)) {
      throw new BadRequestException(`status must be one of: ${valid.join(', ')}`);
    }
    const result = status
      ? await this.db.query<RequestRow>(`${SELECT_REQUESTS} WHERE r.status = $1 ORDER BY r.created_at ${status === 'pending' ? 'ASC' : 'DESC'} LIMIT 500`, [status])
      : await this.db.query<RequestRow>(`${SELECT_REQUESTS} ORDER BY r.created_at DESC LIMIT 500`);
    return result.rows.map(toAdminView);
  }

  async pendingCount(): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM course_payment_requests WHERE status = 'pending'`,
    );
    return Number(result.rows[0]?.count ?? 0);
  }

  async receiptForAdmin(requestId: string): Promise<{ contentType: string; data: Buffer }> {
    const result = await this.db.query<{ receipt_image_id: string }>(
      `SELECT receipt_image_id FROM course_payment_requests WHERE id::text = $1`,
      [requestId],
    );
    if (!result.rows[0]) throw new NotFoundException('Payment not found');
    return this.images.read(result.rows[0].receipt_image_id);
  }

  private async getAdminRow(requestId: string): Promise<RequestRow> {
    const result = await this.db.query<RequestRow>(`${SELECT_REQUESTS} WHERE r.id::text = $1`, [requestId]);
    if (!result.rows[0]) throw new NotFoundException('Payment not found');
    return result.rows[0];
  }

  async approve(requestId: string, adminId: string, note?: string, now = new Date()): Promise<AdminPaymentRequestView> {
    const row = await this.getAdminRow(requestId);
    if (row.status !== 'pending') throw new ConflictException(`This payment was already ${row.status}`);
    const cleanNote = this.cleanNote(note);

    const updated = await this.db.query(
      `UPDATE course_payment_requests
       SET status = 'approved', reviewed_by = $2, reviewed_at = $3, admin_note = $4
       WHERE id = $1 AND status = 'pending'`,
      [row.id, adminId, now, cleanNote],
    );
    if (!updated.rowCount) throw new ConflictException('This payment was already reviewed');

    const priceRows = await this.access.getPriceRows([row.course_id]);
    const accessDays = quoteCoursePrice(priceRows.get(row.course_id), now).accessDays;
    await this.access.grantAccess(row.student_id, row.course_id, accessDays, row.id, now);
    return toAdminView(await this.getAdminRow(row.id));
  }

  async reject(requestId: string, adminId: string, note?: string, now = new Date()): Promise<AdminPaymentRequestView> {
    const row = await this.getAdminRow(requestId);
    if (row.status !== 'pending') throw new ConflictException(`This payment was already ${row.status}`);
    const cleanNote = this.cleanNote(note);
    if (!cleanNote) throw new BadRequestException('Add a note so the student knows why the payment was rejected');
    const updated = await this.db.query(
      `UPDATE course_payment_requests
       SET status = 'rejected', reviewed_by = $2, reviewed_at = $3, admin_note = $4
       WHERE id = $1 AND status = 'pending'`,
      [row.id, adminId, now, cleanNote],
    );
    if (!updated.rowCount) throw new ConflictException('This payment was already reviewed');
    return toAdminView(await this.getAdminRow(row.id));
  }

  private cleanNote(note?: string): string | null {
    const trimmed = (note ?? '').trim();
    if (trimmed.length > MAX_NOTE_LENGTH) throw new BadRequestException('Note is too long');
    return trimmed.length ? trimmed : null;
  }
}
