import { apiClient } from '../../api/client';
import { config } from '../../config';

// Course billing (wallet payments for paid courses), mirroring the Flutter app:
//   GET  /student/billing/wallets                      — active wallets
//   GET  /student/courses/:id/billing                  — price quote + access for a course
//   POST /student/courses/:id/payment-requests         — multipart: walletId, transactionNumber, receipt
//   GET  /student/payment-requests                     — the student's payments
// The backend computes every price, discount and access decision.

export type CourseAccessStatus = 'free' | 'none' | 'pending' | 'rejected' | 'active' | 'completed' | 'failed';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface CoursePriceQuote {
  isFree: boolean;
  currency: string;
  originalAmount: number;
  discountAmount: number;
  amount: number;
  discountActive: boolean;
  discountEndsAt: string | null;
  accessDays: number;
}

export interface CourseAccess {
  status: CourseAccessStatus;
  hasAccess: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  daysLeft: number | null;
  rejectionNote: string | null;
}

export interface CourseBilling {
  courseId: string;
  price: CoursePriceQuote;
  access: CourseAccess;
}

export interface PaymentWallet {
  id: string;
  name: string;
  accountName: string | null;
  accountNumber: string | null;
  instructions: string | null;
  logoUrl: string | null;
  qrImageUrl: string | null;
}

export interface CoursePayment {
  id: string;
  courseId: string;
  courseTitle: string;
  walletName: string;
  transactionNumber: string;
  originalAmount: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  adminNote: string | null;
  createdAt: string;
}

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
export const RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const enc = encodeURIComponent;

export async function fetchWallets(): Promise<PaymentWallet[]> {
  return (await apiClient.get<PaymentWallet[]>('/student/billing/wallets')) ?? [];
}

export function fetchCourseBilling(courseId: string): Promise<CourseBilling> {
  return apiClient.get<CourseBilling>(`/student/courses/${enc(courseId)}/billing`);
}

export async function fetchMyPayments(): Promise<CoursePayment[]> {
  return (await apiClient.get<CoursePayment[]>('/student/payment-requests')) ?? [];
}

export function submitCoursePayment(
  courseId: string,
  input: { walletId: string; transactionNumber: string; receipt: File },
): Promise<CoursePayment> {
  const form = new FormData();
  form.append('walletId', input.walletId);
  form.append('transactionNumber', input.transactionNumber);
  form.append('receipt', input.receipt);
  return apiClient.postForm<CoursePayment>(`/student/courses/${enc(courseId)}/payment-requests`, form);
}

/** Wallet logos / QR images are public backend paths. */
export function walletImageUrl(path: string | null): string | null {
  return path ? `${config.apiBaseUrl.replace(/\/+$/, '')}${path}` : null;
}
