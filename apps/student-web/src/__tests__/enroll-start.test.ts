import { ensureStartingCourse } from '../features/start/enrollStart';
import * as api from '../features/curriculum/curriculumApi';

jest.mock('../features/curriculum/curriculumApi', () => ({
  enrollInCourse: jest.fn(),
  fetchCurrentEnrollment: jest.fn(),
  fetchStudentCourses: jest.fn(),
  needsPayment: (c: { access?: { hasAccess: boolean } }) => (c.access ? !c.access.hasAccess : false),
}));
const m = api as unknown as Record<string, jest.Mock>;
beforeEach(() => { Object.values(m).forEach((f) => typeof f?.mockReset === 'function' && f.mockReset()); });

describe('ensureStartingCourse', () => {
  it('does nothing when a course is already started', async () => {
    m.fetchCurrentEnrollment.mockResolvedValue({ found: true, courseId: 'c9' });
    await ensureStartingCourse();
    expect(m.enrollInCourse).not.toHaveBeenCalled();
  });
  it('starts the preferred (recommended) course when given', async () => {
    m.fetchCurrentEnrollment.mockResolvedValue({ found: false });
    await ensureStartingCourse('rec1');
    expect(m.enrollInCourse).toHaveBeenCalledWith('rec1');
  });
  it('otherwise starts the first open, free course', async () => {
    m.fetchCurrentEnrollment.mockResolvedValue({ found: false });
    m.fetchStudentCourses.mockResolvedValue([
      { courseId: 'locked', locked: true },
      { courseId: 'paid', locked: false, access: { hasAccess: false } },
      { courseId: 'starter', locked: false },
    ]);
    await ensureStartingCourse();
    expect(m.enrollInCourse).toHaveBeenCalledWith('starter');
  });
  it('never throws, so setup can always finish', async () => {
    m.fetchCurrentEnrollment.mockResolvedValue({ found: false });
    m.fetchStudentCourses.mockRejectedValue(new Error('down'));
    await expect(ensureStartingCourse()).resolves.toBeUndefined();
  });
});
