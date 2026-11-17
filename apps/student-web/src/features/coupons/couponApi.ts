import { apiClient } from '../../api/client';
import { config } from '../../config';

const enc = encodeURIComponent;

export interface PublicPrice {
  isFree: boolean;
  currency: string;
  originalAmount: number;
  discountAmount: number;
  amount: number;
  discountActive: boolean;
  discountEndsAt: string | null;
}
export interface PriceCourse {
  id: string;
  title: string;
  description: string | null;
  cefrCode: string | null;
  cefrRank: number | null;
  lessonCount: number;
  price: PublicPrice;
}
export interface PublicWallet {
  id: string;
  name: string;
  accountName: string | null;
  accountNumber: string | null;
  instructions: string | null;
  logoUrl: string | null;
  qrImageUrl: string | null;
}
export interface PurchaseStatus {
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  courseTitle: string;
  amount: number;
  currency: string;
  buyerName: string;
  createdAt: string;
  adminNote: string | null;
  couponCode: string | null;
}
export interface MyCourse {
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

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
export const RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const couponApi = {
  courses: () => apiClient.get<PriceCourse[]>('/public/courses', { auth: false }),
  wallets: () => apiClient.get<PublicWallet[]>('/public/wallets', { auth: false }),
  submitPurchase: (input: { courseId: string; buyerName: string; buyerContact: string; walletId: string; transactionNumber: string; receipt: File }) => {
    const form = new FormData();
    form.append('courseId', input.courseId);
    form.append('buyerName', input.buyerName);
    form.append('buyerContact', input.buyerContact);
    form.append('walletId', input.walletId);
    form.append('transactionNumber', input.transactionNumber);
    form.append('receipt', input.receipt);
    return apiClient.postForm<{ publicToken: string }>('/public/coupon-purchases', form, { auth: false });
  },
  purchaseStatus: (token: string) => apiClient.get<PurchaseStatus>(`/public/coupon-purchases/${enc(token)}`, { auth: false }),

  redeem: (code: string, courseId?: string) =>
    apiClient.post<{ courseId: string; courseTitle: string }>('/student/coupons/redeem', { code, courseId }),
  enrollFree: (courseId: string) => apiClient.post<{ enrolled: boolean }>(`/student/courses/${enc(courseId)}/enroll-free`),
  myCourses: () => apiClient.get<MyCourse[]>('/student/my-courses'),
};

export function walletImageUrl(path: string | null): string | null {
  return path ? `${config.apiBaseUrl.replace(/\/+$/, '')}${path}` : null;
}

export function formatPrice(amount: number, currency: string): string {
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`;
}

// The private purchase links of this browser, so a guest can find their coupon again.
const KEY = 'aim.couponPurchases';
export function rememberPurchase(token: string, courseTitle: string): void {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Array<{ token: string; courseTitle: string }>;
    localStorage.setItem(KEY, JSON.stringify([{ token, courseTitle }, ...list.filter((x) => x.token !== token)].slice(0, 20)));
  } catch { /* storage unavailable */ }
}
export function rememberedPurchases(): Array<{ token: string; courseTitle: string }> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}
