import { screen, renderWithProviders, fireEvent, waitFor } from '../test-utils';
import CoursePaymentsPage from '../../app/admin/course-payments/page';
import CoursePricesPage from '../../app/admin/course-payments/prices/page';
import WalletsPage from '../../app/admin/course-payments/wallets/page';
import CourseAccessPage from '../../app/admin/course-payments/access/page';
import { validatePriceDraft } from '../../features/course-payments/price-draft';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const ok = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ data }) });
const fail = (status: number, message: string) => ({ ok: false, status, json: async () => ({ error: { message } }) });

const PAYMENT = {
  id: 'r1', courseId: 'c1', courseTitle: 'English Basics', walletId: 'w1', walletName: 'Jawali',
  transactionNumber: 'TX-77', originalAmount: 10000, discountAmount: 2000, amount: 8000, currency: 'YER',
  status: 'pending', adminNote: null, reviewedAt: null, createdAt: '2026-11-01T10:00:00Z',
  studentId: 'u1', studentEmail: 'sara@example.com', studentName: 'Sara', reviewedByEmail: null,
};

beforeEach(() => mockFetch.mockReset());

describe('CoursePaymentsPage', () => {
  it('lists pending payments with receipt, amount and transaction number', async () => {
    mockFetch.mockResolvedValueOnce(ok([PAYMENT]));
    renderWithProviders(<CoursePaymentsPage />);

    expect(await screen.findByText('Sara')).toBeInTheDocument();
    expect(screen.getByText('TX-77')).toBeInTheDocument();
    expect(screen.getByText('8,000 YER')).toBeInTheDocument();
    expect(screen.getByText('10,000 YER')).toBeInTheDocument();
    expect(screen.getByAltText('Payment receipt')).toHaveAttribute(
      'src', '/api/admin/proxy/course-billing/payment-requests/r1/receipt',
    );
    expect(mockFetch.mock.calls[0][0]).toBe('/api/admin/proxy/course-billing/payment-requests?status=pending');
  });

  it('requires a note to reject', async () => {
    mockFetch.mockResolvedValueOnce(ok([PAYMENT]));
    renderWithProviders(<CoursePaymentsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Reject' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Write a note');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('approves a payment and removes it from the pending list', async () => {
    mockFetch.mockResolvedValueOnce(ok([PAYMENT])).mockResolvedValueOnce(ok({ ...PAYMENT, status: 'approved' }));
    renderWithProviders(<CoursePaymentsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Approve & unlock course' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Sara can now open English Basics');
    expect(screen.queryByText('TX-77')).not.toBeInTheDocument();
    expect(mockFetch.mock.calls[1][0]).toBe('/api/admin/proxy/course-billing/payment-requests/r1/approve');
    expect(mockFetch.mock.calls[1][1].method).toBe('POST');
  });

  it('rejects with the note', async () => {
    mockFetch.mockResolvedValueOnce(ok([PAYMENT])).mockResolvedValueOnce(ok({ ...PAYMENT, status: 'rejected' }));
    renderWithProviders(<CoursePaymentsPage />);
    fireEvent.change(await screen.findByLabelText(/Note to student/), { target: { value: 'Wrong amount' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    expect(JSON.parse(mockFetch.mock.calls[1][1].body)).toEqual({ note: 'Wrong amount' });
  });
});

const PRICE = {
  courseId: 'c1', courseTitle: 'English Basics', courseStatus: 'published', cefrCode: 'A1', amount: 10000,
  currency: 'YER', discountType: 'percent', discountValue: 20, discountStartsAt: null, discountEndsAt: null, accessDays: 30,
  quote: { isFree: false, currency: 'YER', originalAmount: 10000, discountAmount: 2000, amount: 8000, discountActive: true, discountEndsAt: null, accessDays: 30 },
};

describe('CoursePricesPage', () => {
  it('shows each course with the price students pay', async () => {
    mockFetch.mockResolvedValueOnce(ok([PRICE, { ...PRICE, courseId: 'c2', courseTitle: 'Starter', amount: 0, discountType: 'none', discountValue: 0, quote: { ...PRICE.quote, isFree: true, amount: 0, discountActive: false } }]));
    renderWithProviders(<CoursePricesPage />);
    expect(await screen.findByText('English Basics (A1)')).toBeInTheDocument();
    expect(screen.getByText('8,000 YER')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('saves a new price', async () => {
    mockFetch.mockResolvedValueOnce(ok([PRICE])).mockResolvedValueOnce(ok({ ...PRICE, amount: 15000 }));
    renderWithProviders(<CoursePricesPage />);
    fireEvent.change(await screen.findByLabelText('Price'), { target: { value: '15000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved.')).toBeInTheDocument();
    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toBe('/api/admin/proxy/course-billing/prices/c1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toMatchObject({ amount: 15000, currency: 'YER', discountType: 'percent', discountValue: 20, accessDays: 30 });
  });

  it('shows backend validation errors', async () => {
    mockFetch.mockResolvedValueOnce(ok([PRICE])).mockResolvedValueOnce(fail(400, 'A fixed discount cannot be more than the price'));
    renderWithProviders(<CoursePricesPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('A fixed discount cannot be more than the price');
  });
});

describe('validatePriceDraft', () => {
  const base = { amount: '100', currency: 'YER' as const, discountType: 'none' as const, discountValue: '0', discountStartsAt: '', discountEndsAt: '', accessDays: '30' };
  it('accepts a free course', () => expect(validatePriceDraft({ ...base, amount: '0' }).input?.amount).toBe(0));
  it('rejects bad values', () => {
    expect(validatePriceDraft({ ...base, amount: '-1' }).error).toMatch(/0 or more/);
    expect(validatePriceDraft({ ...base, accessDays: '0' }).error).toMatch(/1 to 365/);
    expect(validatePriceDraft({ ...base, discountType: 'percent', discountValue: '120' }).error).toMatch(/100/);
    expect(validatePriceDraft({ ...base, discountType: 'fixed', discountValue: '150' }).error).toMatch(/more than the price/);
    expect(validatePriceDraft({ ...base, discountType: 'percent', discountValue: '10', discountStartsAt: '2026-11-10T10:00', discountEndsAt: '2026-11-01T10:00' }).error).toMatch(/end after/);
  });
});

const WALLET = {
  id: 'w1', name: 'Jawali', accountName: 'AIM', accountNumber: '777123', instructions: null,
  logoUrl: '/billing/wallets/w1/logo?v=abcd1234', qrImageUrl: null, isActive: true, sortOrder: 0,
};

describe('WalletsPage', () => {
  it('lists wallets with logo preview through the admin proxy', async () => {
    mockFetch.mockResolvedValueOnce(ok([WALLET]));
    renderWithProviders(<WalletsPage />);
    expect(await screen.findByRole('heading', { name: 'Jawali' })).toBeInTheDocument();
    expect(screen.getByAltText('Jawali Logo')).toHaveAttribute('src', '/api/admin/proxy/course-billing/wallets/w1/logo?v=abcd1234');
  });

  it('adds a wallet', async () => {
    mockFetch.mockResolvedValueOnce(ok([])).mockResolvedValueOnce(ok({ ...WALLET, id: 'w2', name: 'Kuraimi', logoUrl: null }));
    renderWithProviders(<WalletsPage />);
    fireEvent.change(await screen.findByLabelText('Wallet name', { selector: '#new-name' }), { target: { value: 'Kuraimi' } });
    fireEvent.change(screen.getByLabelText('Number to transfer to', { selector: '#new-acct-number' }), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add wallet' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Added Kuraimi');
    expect(JSON.parse(mockFetch.mock.calls[1][1].body)).toMatchObject({ name: 'Kuraimi', accountNumber: '123', isActive: true });
  });

  it('uploads a QR image as multipart without a JSON content type', async () => {
    mockFetch.mockResolvedValueOnce(ok([WALLET])).mockResolvedValueOnce(ok({ ...WALLET, qrImageUrl: '/billing/wallets/w1/qr?v=ffff0000' }));
    renderWithProviders(<WalletsPage />);
    const input = await screen.findByLabelText('Upload Account number / QR code');
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'qr.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toBe('/api/admin/proxy/course-billing/wallets/w1/qr');
    expect(init.method).toBe('PUT');
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).toBeUndefined();
  });

  it('refuses non-image files before uploading', async () => {
    mockFetch.mockResolvedValueOnce(ok([WALLET]));
    renderWithProviders(<WalletsPage />);
    const input = await screen.findByLabelText('Upload Logo');
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('PNG, JPEG or WebP');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('CourseAccessPage', () => {
  it('lists access windows with time left', async () => {
    const expires = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 - 60000).toISOString();
    mockFetch.mockResolvedValueOnce(ok([{
      id: 'a1', studentId: 'u1', studentEmail: 'sara@example.com', studentName: 'Sara', courseId: 'c1',
      courseTitle: 'English Basics', status: 'active', startsAt: '2026-11-01T10:00:00Z', expiresAt: expires,
      completedAt: null, failedAt: null,
    }]));
    renderWithProviders(<CourseAccessPage />);
    expect(await screen.findByText('Sara')).toBeInTheDocument();
    expect(screen.getByText('10 days')).toBeInTheDocument();
    expect(screen.getAllByText('Active')).toHaveLength(2); // filter tab + status badge
  });
});
