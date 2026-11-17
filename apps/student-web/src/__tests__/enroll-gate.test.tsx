import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CourseDetailPage } from '../features/curriculum/CourseDetailPage';
import { needsEnroll, notEnrolledCourseId } from '../features/curriculum/curriculumApi';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({ subjectId: 'c1' }),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
// A stable `t` matters: the page reloads whenever `t` changes identity.
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  plural: (_n: number, f: Record<string, string>) => f.other,
  locale: 'en',
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));
HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function close() { this.removeAttribute('open'); };

let mockCourse: Record<string, unknown>;
// CRA resets mock implementations before every test, so they are (re)set in beforeEach below.
const mockFetchLevels = jest.fn();
const mockFetchChapters = jest.fn();
const mockEnroll = jest.fn();
const mockEnrollFree = jest.fn();
const mockRedeem = jest.fn();

jest.mock('../features/curriculum/curriculumApi', () => ({
  ...jest.requireActual('../features/curriculum/curriculumApi'),
  fetchStudentCourses: () => Promise.resolve([mockCourse]),
  fetchCurrentEnrollment: () => Promise.resolve({ found: false, courseId: null, courseTitle: null, enrolledAt: null }),
  fetchCourseLevels: (...a: unknown[]) => mockFetchLevels(...(a as [])),
  fetchStudentChapters: (...a: unknown[]) => mockFetchChapters(...(a as [])),
  enrollInCourse: (...a: unknown[]) => mockEnroll(...(a as [])),
}));
jest.mock('../features/coupons/couponApi', () => ({
  ...jest.requireActual('../features/coupons/couponApi'),
  couponApi: {
    enrollFree: (...a: unknown[]) => mockEnrollFree(...(a as [])),
    redeem: (...a: unknown[]) => mockRedeem(...(a as [])),
  },
}));
jest.mock('../features/stories/storiesApi', () => ({ storiesApi: { forCourse: () => Promise.resolve({ story: null }) } }));
jest.mock('../features/stories/CourseStoryCard', () => ({ CourseStoryCard: () => null }));
jest.mock('../features/curriculum/ChapterLessonList', () => ({ ChapterLessonList: () => <div>LESSON LIST</div> }));

const base = {
  courseId: 'c1', title: 'Starter', description: '', locale: 'en', levelCode: 'A1', lessonCount: 5, completedLessonCount: 0,
  quizCount: 0, examCount: 0, percent: 0, status: 'not_started', locked: false,
};
const free = { isFree: true, currency: 'YER', originalAmount: 0, discountAmount: 0, amount: 0, discountActive: false, discountEndsAt: null, accessDays: 30 };
const paid = { ...free, isFree: false, amount: 5000, originalAmount: 5000 };

function renderPage() {
  return render(<CourseDetailPage />);
}

beforeEach(() => {
  mockFetchLevels.mockResolvedValue([{ id: 'l1', title: 'Level' }]);
  mockFetchChapters.mockResolvedValue({ chapters: [{ chapterId: 'c1', title: 'Hello', status: 'not_started' }], finalExam: null });
  mockEnroll.mockResolvedValue({});
  mockEnrollFree.mockResolvedValue({ enrolled: true });
  mockRedeem.mockResolvedValue({ courseId: 'c1', courseTitle: 'Starter' });
});

describe('enrollment gate (helpers)', () => {
  it('needsEnroll is true only when the backend says the student has not enrolled', () => {
    expect(needsEnroll({ access: { enrolled: false } } as never)).toBe(true);
    expect(needsEnroll({ access: { enrolled: true } } as never)).toBe(false);
    expect(needsEnroll({} as never)).toBe(false); // older backend
  });
  it('reads the course id from a COURSE_NOT_ENROLLED error only', () => {
    expect(notEnrolledCourseId({ code: 'COURSE_NOT_ENROLLED', details: { courseId: 'c9' } })).toBe('c9');
    expect(notEnrolledCourseId({ code: 'COURSE_LOCKED', details: { courseId: 'c9' } })).toBeNull();
    expect(notEnrolledCourseId(new Error('x'))).toBeNull();
  });
});

describe('course page before enrolling', () => {
  it('free course: shows the "do you want to enroll" pop-up, hides the lessons and never loads them', async () => {
    mockCourse = { ...base, price: free, access: { status: 'free', hasAccess: true, enrolled: false } };
    renderPage();
    expect(await screen.findByText('Do you want to enroll in Starter?')).toBeInTheDocument();
    expect(screen.getByText('This course is free. Enroll to open its lessons.')).toBeInTheDocument();
    expect(screen.queryByText('LESSON LIST')).not.toBeInTheDocument();
    expect(mockFetchLevels).not.toHaveBeenCalled();
  });

  it('free course: "Yes, enroll" enrolls then starts the course', async () => {
    mockCourse = { ...base, price: free, access: { status: 'free', hasAccess: true, enrolled: false } };
    renderPage();
    fireEvent.click(await screen.findByText('Yes, enroll'));
    await waitFor(() => expect(mockEnroll).toHaveBeenCalledWith('c1'));
    expect(mockEnrollFree).toHaveBeenCalledWith('c1');
  });

  it('paid course: the pop-up asks for the coupon and redeems it before starting', async () => {
    mockCourse = { ...base, price: paid, access: { status: 'none', hasAccess: false, enrolled: false } };
    renderPage();
    expect(await screen.findByText('This course is paid. Enter your coupon code to enroll.', { exact: false })).toBeInTheDocument();
    const button = screen.getByText('Use coupon & enroll');
    expect(button.closest('button')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Coupon code'), { target: { value: 'AIM-AAAA-BBBB-CCCC' } });
    fireEvent.click(button);
    await waitFor(() => expect(mockRedeem).toHaveBeenCalledWith('AIM-AAAA-BBBB-CCCC', 'c1'));
    await waitFor(() => expect(mockEnroll).toHaveBeenCalledWith('c1'));
    expect(mockEnrollFree).not.toHaveBeenCalled();
  });

  it('an enrolled student sees the lessons and no pop-up', async () => {
    mockCourse = { ...base, price: free, access: { status: 'active', hasAccess: true, enrolled: true } };
    renderPage();
    expect(await screen.findByText('LESSON LIST')).toBeInTheDocument();
    expect(screen.getByText('Do you want to enroll in Starter?')).not.toBeVisible();
    expect(mockFetchLevels).toHaveBeenCalled();
  });
});
