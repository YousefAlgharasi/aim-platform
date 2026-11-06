import { lockedReason } from '../features/curriculum/lockedReason';
import type { StudentCourse } from '../features/curriculum/curriculumApi';

const t = (s: string, p?: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k]));
const c = (courseId: string, title: string, status: string, locked: boolean) => ({ courseId, title, status, locked }) as unknown as StudentCourse;

describe('lockedReason', () => {
  it('names the one course in the way', () => {
    const list = [c('1', 'Starter', 'completed', false), c('2', 'A1.1', 'in_progress', false), c('3', 'A1.2', 'not_started', true)];
    expect(lockedReason(list[2], list, t)).toBe('Finish A1.1 to unlock this course.');
  });
  it('for a far-away course (like C2) says how many are left and what is next', () => {
    const list = [
      c('1', 'Starter', 'completed', false), c('2', 'A1.1', 'in_progress', false),
      c('3', 'A1.2', 'not_started', true), c('4', 'A2.1', 'not_started', true), c('5', 'C2', 'not_started', true),
    ];
    expect(lockedReason(list[4], list, t)).toBe('Courses to finish first: 3. Next up: A1.1.');
  });
  it('ignores courses the student already opened by passing the placement test', () => {
    const list = [c('1', 'Starter', 'not_started', false), c('2', 'A1.1', 'not_started', false), c('3', 'A2.1', 'in_progress', false), c('4', 'A2.2', 'not_started', true)];
    expect(lockedReason(list[3], list, t)).toBe('Finish A2.1 to unlock this course.');
  });
  it('falls back to a generic sentence when nothing is known', () => {
    expect(lockedReason(c('9', 'X', 'not_started', true), [], t)).toBe('Finish the courses before this one to unlock it.');
  });
});
