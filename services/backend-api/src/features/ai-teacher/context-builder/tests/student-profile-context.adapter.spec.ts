// P8-029: Add Student Profile Context
// StudentProfileContextAdapter tests.

import { StudentProfileContextAdapter } from '../adapters/student-profile-context.adapter';
import { StudentsService } from '../../../students/students.service';

function makeMockStudents(findByUserId: StudentsService['findByUserId']) {
  return { findByUserId } as unknown as StudentsService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('StudentProfileContextAdapter', () => {
  it('maps a found profile to displayName, preferredLanguage, timezone only', async () => {
    const students = makeMockStudents(async () => ({
      id: 'profile-1',
      userId: STUDENT_ID,
      profileType: 'student_profile',
      displayName: 'Sara',
      avatarUrl: 'https://example.com/avatar.png',
      preferredLanguage: 'ar',
      timezone: 'Asia/Riyadh',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    }));
    const adapter = new StudentProfileContextAdapter(students);
    const context = await adapter.getProfileContext(STUDENT_ID);

    expect(context).toEqual({
      displayName: 'Sara',
      preferredLanguage: 'ar',
      timezone: 'Asia/Riyadh',
    });
    // avatarUrl, id, profileType are not part of AI Teacher prompt context.
    expect(context).not.toHaveProperty('avatarUrl');
  });

  it('returns null when no student profile row exists', async () => {
    const students = makeMockStudents(async () => null);
    const adapter = new StudentProfileContextAdapter(students);
    const context = await adapter.getProfileContext(STUDENT_ID);
    expect(context).toBeNull();
  });

  it('passes studentId through to StudentsService.findByUserId unchanged', async () => {
    const calls: string[] = [];
    const students = makeMockStudents(async (id) => {
      calls.push(id);
      return null;
    });
    const adapter = new StudentProfileContextAdapter(students);
    await adapter.getProfileContext(STUDENT_ID);
    expect(calls).toEqual([STUDENT_ID]);
  });

  it('never surfaces mastery/level/weakness/difficulty/recommendation fields (scope guard)', async () => {
    const students = makeMockStudents(async () => ({
      id: 'profile-1',
      userId: STUDENT_ID,
      profileType: 'student_profile',
      displayName: 'Sara',
      avatarUrl: null,
      preferredLanguage: 'en',
      timezone: null,
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    }));
    const adapter = new StudentProfileContextAdapter(students);
    const context = await adapter.getProfileContext(STUDENT_ID);
    const keys = Object.keys(context ?? {});
    for (const forbidden of ['mastery', 'level', 'weakness', 'difficulty', 'recommendation', 'reviewSchedule']) {
      expect(keys).not.toContain(forbidden);
    }
  });
});
