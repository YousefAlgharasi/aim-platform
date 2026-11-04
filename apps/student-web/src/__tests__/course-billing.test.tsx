import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
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
  it('hides the price and opens the course when the card is clicked', async () => {
    render(<CourseCatalog />);
    await screen.findByRole('button', { name: 'English Basics' });
    expect(screen.queryByText('8,000 YER')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'English Basics' }));
    expect(mockNavigate).toHaveBeenCalledWith('/curriculum/c1');
  });
});
