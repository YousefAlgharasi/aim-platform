import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseClaimPage } from '../features/course-billing/CourseClaimPage';
import { CourseCatalog } from '../features/curriculum/CourseCatalog';

const mockNavigate = jest.fn();
const mockSubmit = jest.fn();
let mockBilling: Record<string, unknown>;

jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: unknown }) => <span>{children as never}</span>,
  useParams: () => ({ subjectId: 'c1' }),
  useNavigate: () => mockNavigate,
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  plural: (_n: number, forms: Record<string, string>) => forms.other,
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));

const COURSE = {
  courseId: 'c1', title: 'English Basics', description: null, levelCode: 'A1', lessonCount: 10,
  completedLessonCount: 0, quizCount: 2, examCount: 1, percent: 0, status: 'not_started', locked: false,
};
const PRICE = { isFree: false, currency: 'YER', originalAmount: 10000, discountAmount: 2000, amount: 8000, discountActive: true, discountEndsAt: null, accessDays: 30 };
const ACCESS = (status: string, extra: Record<string, unknown> = {}) => ({
  status, hasAccess: ['active', 'completed', 'free'].includes(status), startsAt: null, expiresAt: null, daysLeft: null, rejectionNote: null, ...extra,
});

jest.mock('../features/curriculum/curriculumApi', () => ({
  ...jest.requireActual('../features/curriculum/curriculumApi'),
  fetchStudentCourses: () => Promise.resolve([{ ...COURSE, price: PRICE, access: ACCESS('none') }]),
  fetchCurrentEnrollment: () => Promise.resolve({ found: false, courseId: null, courseTitle: null, enrolledAt: null }),
  enrollInCourse: jest.fn(),
}));
jest.mock('../features/course-billing/courseBillingApi', () => ({
  ...jest.requireActual('../features/course-billing/courseBillingApi'),
  fetchCourseBilling: () => Promise.resolve(mockBilling),
  fetchWallets: () => Promise.resolve([
    { id: 'w1', name: 'Jawali', accountName: 'AIM Academy', accountNumber: '777123456', instructions: 'Send the exact amount', logoUrl: '/billing/wallets/w1/logo?v=1', qrImageUrl: '/billing/wallets/w1/qr?v=2' },
  ]),
  submitCoursePayment: (...a: unknown[]) => mockSubmit(...a),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockBilling = { courseId: 'c1', price: PRICE, access: ACCESS('none') };
});

describe('CourseCatalog with paid courses', () => {
  it('shows the price and opens the buy page instead of enrolling', async () => {
    render(<CourseCatalog />);
    expect(await screen.findByText('8,000 YER')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'English Basics' }));
    expect(mockNavigate).toHaveBeenCalledWith('/curriculum/c1/buy');
  });
});

describe('CourseClaimPage', () => {
  it('shows the price with discount and the time rule', async () => {
    render(<CourseClaimPage />);
    expect(await screen.findByText('8,000 YER')).toBeInTheDocument();
    expect(screen.getByText('10,000 YER')).toBeInTheDocument();
    expect(screen.getByText(/30 days to finish this course/)).toBeInTheDocument();
  });

  it('shows wallet transfer details and QR after choosing a wallet', async () => {
    render(<CourseClaimPage />);
    fireEvent.change(await screen.findByLabelText('1. Choose the wallet you paid with'), { target: { value: 'w1' } });
    expect(screen.getByText('Transfer 8,000 YER to:')).toBeInTheDocument();
    expect(screen.getByText('777123456')).toBeInTheDocument();
    expect(screen.getByAltText('Account number / QR code')).toHaveAttribute('src', '/api/billing/wallets/w1/qr?v=2');
  });

  it('submits wallet, transaction number and receipt', async () => {
    mockSubmit.mockResolvedValue({ id: 'r1', status: 'pending' });
    render(<CourseClaimPage />);
    const submit = await screen.findByRole('button', { name: 'Send payment for review' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('1. Choose the wallet you paid with'), { target: { value: 'w1' } });
    fireEvent.change(screen.getByLabelText('2. Transaction number'), { target: { value: ' TX-55 ' } });
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'receipt.png', { type: 'image/png' });
    global.URL.createObjectURL = jest.fn(() => 'blob:preview');
    global.URL.revokeObjectURL = jest.fn();
    fireEvent.change(screen.getByLabelText('3. Receipt screenshot'), { target: { files: [file] } });

    expect(submit).not.toBeDisabled();
    fireEvent.click(submit);
    await waitFor(() => expect(mockSubmit).toHaveBeenCalledWith('c1', { walletId: 'w1', transactionNumber: 'TX-55', receipt: file }));
  });

  it('rejects non-image receipts', async () => {
    render(<CourseClaimPage />);
    const input = await screen.findByLabelText('3. Receipt screenshot');
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText('Choose a PNG, JPEG or WebP image.')).toBeInTheDocument();
  });

  it('pending payment hides the form', async () => {
    mockBilling = { courseId: 'c1', price: PRICE, access: ACCESS('pending') };
    render(<CourseClaimPage />);
    expect(await screen.findByText('Waiting for confirmation')).toBeInTheDocument();
    expect(screen.queryByLabelText('2. Transaction number')).not.toBeInTheDocument();
  });

  it('rejected payment shows the note and the form', async () => {
    mockBilling = { courseId: 'c1', price: PRICE, access: ACCESS('rejected', { rejectionNote: 'Wrong amount' }) };
    render(<CourseClaimPage />);
    expect(await screen.findByText('Payment not accepted')).toBeInTheDocument();
    expect(screen.getByText(/Note: Wrong amount/)).toBeInTheDocument();
    expect(screen.getByLabelText('2. Transaction number')).toBeInTheDocument();
  });

  it('failed course asks to pay again', async () => {
    mockBilling = { courseId: 'c1', price: PRICE, access: ACCESS('failed') };
    render(<CourseClaimPage />);
    expect(await screen.findByText('Time ran out')).toBeInTheDocument();
    expect(screen.getByLabelText('2. Transaction number')).toBeInTheDocument();
  });

  it('active access shows days left and opens the course', async () => {
    mockBilling = { courseId: 'c1', price: PRICE, access: ACCESS('active', { daysLeft: 12, expiresAt: '2026-12-01T00:00:00Z' }) };
    render(<CourseClaimPage />);
    expect(await screen.findByText('You have access')).toBeInTheDocument();
    expect(screen.getByText(/12 days left/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open course' }));
    expect(mockNavigate).toHaveBeenCalledWith('/curriculum/c1');
  });
});
