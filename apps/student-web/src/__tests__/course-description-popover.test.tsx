import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CourseCatalog } from '../features/curriculum/CourseCatalog';

const mockNavigate = jest.fn();
const mockEnroll = jest.fn();
const DESC = 'اللغة الإنجليزية من الصفر المطلق: الحروف الأبجدية والأصوات.';

jest.mock('react-router-dom', () => ({
  Link: ({ children }: { children: unknown }) => <span>{children as never}</span>,
  useNavigate: () => mockNavigate,
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  plural: (_n: number, forms: Record<string, string>) => forms.other,
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));

const BASE = {
  levelCode: 'A1', lessonCount: 10, completedLessonCount: 3, quizCount: 2, examCount: 1,
  percent: 30, status: 'in_progress', locked: false, price: null, access: null,
};
jest.mock('../features/curriculum/curriculumApi', () => ({
  ...jest.requireActual('../features/curriculum/curriculumApi'),
  fetchStudentCourses: () => Promise.resolve([
    { ...BASE, courseId: 'c1', title: 'التمهيدي', description: DESC },
    { ...BASE, courseId: 'c2', title: 'No Description', description: null },
    { ...BASE, courseId: 'c3', title: 'Locked One', description: null, locked: true },
  ]),
  fetchCurrentEnrollment: () => Promise.resolve({ found: true, courseId: 'c1', courseTitle: 'التمهيدي', enrolledAt: null }),
  enrollInCourse: (...a: unknown[]) => mockEnroll(...a),
  fetchCourseLevels: (id: string) => Promise.resolve(id === 'c1' ? [{ id: 'l1' }, { id: 'l2' }] : []),
  fetchStudentChapters: (levelId: string) => Promise.resolve({ chapters: levelId === 'l1' ? [{ title: 'Greetings' }, { title: 'Numbers' }] : [{ title: 'Colours' }], finalExam: null }),
}));
jest.mock('../features/course-billing/CourseBillingBadge', () => ({ CourseBillingBadge: () => null }));

beforeEach(() => jest.clearAllMocks());

async function setup() {
  render(<CourseCatalog />);
  const info = await screen.findByRole('button', { name: 'التمهيدي: course description' });
  return info;
}
const exit = () => act(async () => { await new Promise((r) => setTimeout(r, 200)); });

describe('Course description popover', () => {
  it('lists the real chapter titles in the info popover and gives each course its own image', async () => {
    render(<CourseCatalog />);
    await screen.findByText('3 chapters');
    fireEvent.click(screen.getByRole('button', { name: 'التمهيدي: course description' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent("What you'll cover");
    ['Greetings', 'Numbers', 'Colours'].forEach((c) => expect(dialog).toHaveTextContent(c));
    const srcs = Array.from(document.querySelectorAll('img[aria-hidden]')).map((i) => i.getAttribute('src'));
    expect(srcs).toHaveLength(3);
    expect(new Set(srcs).size).toBe(3);
  });

  it('shows the summed chapter count on the learning path', async () => {
    render(<CourseCatalog />);
    expect(await screen.findByText('3 chapters')).toBeInTheDocument(); // c1: 2 + 1 across two levels
    expect(screen.queryByText(/UNIT/)).not.toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.queryByText('Lessons completed')).not.toBeInTheDocument();
  });

  it('keeps the description and the lesson/quiz/exam counts out of the card', async () => {
    await setup();
    expect(screen.queryByText(DESC)).not.toBeInTheDocument();
    expect(screen.queryByText('10 lessons')).not.toBeInTheDocument();
    expect(screen.queryByText('2 quizzes')).not.toBeInTheDocument();
    expect(screen.queryByText('Final exam')).not.toBeInTheDocument();
    expect(screen.getAllByText('3 of 10 lessons finished')).toHaveLength(3); // one per card
    expect(screen.getAllByText(/30%/).length).toBeGreaterThan(0); // progress untouched
    expect(screen.getByRole('progressbar', { name: 'التمهيدي progress' })).toHaveAttribute('aria-valuenow', '30');
  });

  it('shows the counts in the popover, and for a course without a description too', async () => {
    const info = await setup();
    fireEvent.click(info);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('10 lessons');
    expect(dialog).toHaveTextContent('2 quizzes');
    expect(dialog).toHaveTextContent('Final exam');
    fireEvent.keyDown(document, { key: 'Escape' });
    await exit();
    fireEvent.click(screen.getByRole('button', { name: 'No Description: course description' }));
    const d2 = await screen.findByRole('dialog');
    expect(d2).toHaveTextContent('10 lessons');
    expect(d2).not.toHaveTextContent(DESC);
  });

  it('opens with the real description, without navigating', async () => {
    const info = await setup();
    expect(info).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(info);
    const dialog = await screen.findByRole('dialog', { name: 'About this course' });
    expect(dialog).toHaveTextContent(DESC);
    expect(info).toHaveAttribute('aria-expanded', 'true');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('clicking inside the popover neither closes it nor opens the course', async () => {
    const info = await setup();
    fireEvent.click(info);
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(dialog);
    fireEvent.pointerDown(dialog);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('closes on the close button, Escape and an outside press', async () => {
    const info = await setup();

    fireEvent.click(info);
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }));
    await exit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(info);
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    await exit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(info).toHaveFocus();

    fireEvent.click(info);
    await screen.findByRole('dialog');
    fireEvent.pointerDown(document.body);
    await exit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('pressing Enter on the Info button does not open the course', async () => {
    const info = await setup();
    fireEvent.keyDown(info, { key: 'Enter' });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('clicking an open course opens its page, with no popover', async () => {
    await setup();
    fireEvent.click(screen.getByRole('button', { name: 'التمهيدي' }));
    expect(mockNavigate).toHaveBeenCalledWith('/curriculum/c1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockEnroll).not.toHaveBeenCalled();
  });

  it('clicking a locked course shows the unlock message in a popover, not a page banner', async () => {
    await setup();
    fireEvent.click(screen.getByRole('button', { name: 'Locked One (locked)' }));
    const pop = await screen.findByRole('dialog', { name: 'Locked' });
    expect(pop).toHaveTextContent('Finish your current level to unlock this course.');
    expect(screen.getAllByText('Finish your current level to unlock this course.')).toHaveLength(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    await exit();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
