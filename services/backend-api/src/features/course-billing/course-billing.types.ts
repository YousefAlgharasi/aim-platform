// Course billing types shared by the student, admin and access services.

export const CURRENCIES = ['YER', 'SAR', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DISCOUNT_TYPES = ['none', 'percent', 'fixed'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected';
export type CourseAccessRowStatus = 'active' | 'completed' | 'failed' | 'revoked';

export interface CoursePriceRow {
  readonly course_id: string;
  readonly amount: string;
  readonly currency: Currency;
  readonly discount_type: DiscountType;
  readonly discount_value: string;
  readonly discount_starts_at: Date | null;
  readonly discount_ends_at: Date | null;
  readonly access_days: number;
}

/** What a student pays for a course right now. */
export interface CoursePriceQuote {
  readonly isFree: boolean;
  readonly currency: Currency;
  readonly originalAmount: number;
  readonly discountAmount: number;
  readonly amount: number;
  readonly discountActive: boolean;
  readonly discountType: DiscountType;
  readonly discountValue: number;
  readonly discountEndsAt: string | null;
  readonly accessDays: number;
}

/**
 * The student's access to a course:
 * - free: no payment needed.
 * - none: payment needed, nothing submitted.
 * - pending: payment submitted, waiting for an admin.
 * - rejected: last payment was rejected (see rejectionNote); can resubmit.
 * - active: paid; must finish before expiresAt.
 * - completed: finished within the time limit.
 * - failed: time ran out; progress was reset and a new payment is needed.
 */
export type CourseAccessStatus =
  | 'free'
  | 'none'
  | 'pending'
  | 'rejected'
  | 'active'
  | 'completed'
  | 'failed';

export interface CourseAccessState {
  readonly status: CourseAccessStatus;
  /** True when the student can open lessons and assessments. */
  readonly hasAccess: boolean;
  readonly startsAt: string | null;
  readonly expiresAt: string | null;
  readonly daysLeft: number | null;
  readonly rejectionNote: string | null;
  readonly pendingRequestId: string | null;
}

export interface StudentCourseBilling {
  readonly courseId: string;
  readonly price: CoursePriceQuote;
  readonly access: CourseAccessState;
}

export interface WalletView {
  readonly id: string;
  readonly name: string;
  readonly accountName: string | null;
  readonly accountNumber: string | null;
  readonly instructions: string | null;
  readonly logoUrl: string | null;
  readonly qrImageUrl: string | null;
  readonly isActive: boolean;
  readonly sortOrder: number;
}

export interface PaymentRequestView {
  readonly id: string;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly walletId: string;
  readonly walletName: string;
  readonly transactionNumber: string;
  readonly originalAmount: number;
  readonly discountAmount: number;
  readonly amount: number;
  readonly currency: Currency;
  readonly status: PaymentRequestStatus;
  readonly adminNote: string | null;
  readonly reviewedAt: string | null;
  readonly createdAt: string;
  readonly receiptUrl: string;
}

export interface AdminPaymentRequestView extends PaymentRequestView {
  readonly studentId: string;
  readonly studentEmail: string | null;
  readonly studentName: string | null;
  readonly reviewedByEmail: string | null;
}

export interface AdminCoursePriceView {
  readonly courseId: string;
  readonly courseTitle: string;
  readonly courseStatus: string;
  readonly cefrCode: string | null;
  readonly amount: number;
  readonly currency: Currency;
  readonly discountType: DiscountType;
  readonly discountValue: number;
  readonly discountStartsAt: string | null;
  readonly discountEndsAt: string | null;
  readonly accessDays: number;
  readonly quote: CoursePriceQuote;
}

export interface UploadedImage {
  readonly buffer: Buffer;
  readonly size: number;
  readonly mimetype?: string;
}
