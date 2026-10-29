// Course payments admin API: course prices, payment wallets, wallet payments
// to review, and students' course access windows. The backend computes every
// price and decides access; this module only sends admin edits.

import { backendAssetUrl, backendFetch, backendUpload } from '../../core/api/client-api-helpers';

export type Currency = 'YER' | 'SAR' | 'USD';
export type DiscountType = 'none' | 'percent' | 'fixed';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export const CURRENCIES: readonly Currency[] = ['YER', 'SAR', 'USD'];

export type PriceQuote = {
  readonly isFree: boolean;
  readonly currency: Currency;
  readonly originalAmount: number;
  readonly discountAmount: number;
  readonly amount: number;
  readonly discountActive: boolean;
  readonly discountEndsAt: string | null;
  readonly accessDays: number;
};

export type CoursePrice = {
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
  readonly quote: PriceQuote;
};

export type CoursePriceInput = {
  amount: number;
  currency: Currency;
  discountType: DiscountType;
  discountValue: number;
  discountStartsAt: string | null;
  discountEndsAt: string | null;
  accessDays: number;
};

export type Wallet = {
  readonly id: string;
  readonly name: string;
  readonly accountName: string | null;
  readonly accountNumber: string | null;
  readonly instructions: string | null;
  readonly logoUrl: string | null;
  readonly qrImageUrl: string | null;
  readonly isActive: boolean;
  readonly sortOrder: number;
};

export type WalletInput = {
  name?: string;
  accountName?: string | null;
  accountNumber?: string | null;
  instructions?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type PaymentRequest = {
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
  readonly status: PaymentStatus;
  readonly adminNote: string | null;
  readonly reviewedAt: string | null;
  readonly createdAt: string;
  readonly studentId: string;
  readonly studentEmail: string | null;
  readonly studentName: string | null;
  readonly reviewedByEmail: string | null;
};

export type AccessStatus = 'active' | 'completed' | 'failed' | 'revoked' | 'expired';

export type AccessWindow = {
  readonly id: string;
  readonly studentId: string;
  readonly studentEmail: string | null;
  readonly studentName: string | null;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly status: AccessStatus;
  readonly startsAt: string;
  readonly expiresAt: string;
  readonly completedAt: string | null;
  readonly failedAt: string | null;
};

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    const message = json?.error?.message ?? json?.message;
    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string') return message;
  } catch {
    // Non-JSON error body.
  }
  return `${fallback} (${res.status})`;
}

async function unwrap<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) throw new Error(await readError(res, fallback));
  const json = await res.json();
  return (json?.data ?? json) as T;
}

const BASE = '/admin/course-billing';

export const coursePaymentsApi = {
  listPrices: async () => unwrap<CoursePrice[]>(await backendFetch(`${BASE}/prices`), 'Failed to load prices'),
  savePrice: async (courseId: string, input: CoursePriceInput) =>
    unwrap<CoursePrice>(
      await backendFetch(`${BASE}/prices/${courseId}`, { method: 'PUT', body: JSON.stringify(input) }),
      'Failed to save price',
    ),

  listWallets: async () => unwrap<Wallet[]>(await backendFetch(`${BASE}/wallets`), 'Failed to load wallets'),
  createWallet: async (input: WalletInput) =>
    unwrap<Wallet>(await backendFetch(`${BASE}/wallets`, { method: 'POST', body: JSON.stringify(input) }), 'Failed to add wallet'),
  updateWallet: async (id: string, input: WalletInput) =>
    unwrap<Wallet>(
      await backendFetch(`${BASE}/wallets/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
      'Failed to save wallet',
    ),
  deleteWallet: async (id: string) =>
    unwrap<{ deleted: boolean; deactivated: boolean }>(
      await backendFetch(`${BASE}/wallets/${id}`, { method: 'DELETE' }),
      'Failed to delete wallet',
    ),
  uploadWalletImage: async (id: string, kind: 'logo' | 'qr', file: File) => {
    const form = new FormData();
    form.append('image', file);
    return unwrap<Wallet>(await backendUpload(`${BASE}/wallets/${id}/${kind}`, form, 'PUT'), 'Failed to upload image');
  },
  removeWalletImage: async (id: string, kind: 'logo' | 'qr') =>
    unwrap<Wallet>(await backendFetch(`${BASE}/wallets/${id}/${kind}`, { method: 'DELETE' }), 'Failed to remove image'),

  listPayments: async (status?: PaymentStatus) =>
    unwrap<PaymentRequest[]>(
      await backendFetch(`${BASE}/payment-requests${status ? `?status=${status}` : ''}`),
      'Failed to load payments',
    ),
  pendingCount: async () =>
    unwrap<{ count: number }>(await backendFetch(`${BASE}/payment-requests/pending-count`), 'Failed to load count'),
  approve: async (id: string, note?: string) =>
    unwrap<PaymentRequest>(
      await backendFetch(`${BASE}/payment-requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ note }) }),
      'Failed to approve',
    ),
  reject: async (id: string, note: string) =>
    unwrap<PaymentRequest>(
      await backendFetch(`${BASE}/payment-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) }),
      'Failed to reject',
    ),

  listAccess: async (status?: string) =>
    unwrap<AccessWindow[]>(
      await backendFetch(`${BASE}/access${status ? `?status=${status}` : ''}`),
      'Failed to load access',
    ),
};

export function receiptUrl(paymentId: string): string {
  return backendAssetUrl(`${BASE}/payment-requests/${paymentId}/receipt`);
}

/** Admin preview of a wallet image; the cache-busting part of the public URL is kept. */
export function walletImageUrl(wallet: Wallet, kind: 'logo' | 'qr'): string | null {
  const publicUrl = kind === 'logo' ? wallet.logoUrl : wallet.qrImageUrl;
  if (!publicUrl) return null;
  const version = publicUrl.split('?v=')[1] ?? '';
  return `${backendAssetUrl(`${BASE}/wallets/${wallet.id}/${kind}`)}?v=${version}`;
}

export function formatMoney(amount: number, currency: Currency): string {
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}
