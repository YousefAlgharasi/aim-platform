import { HttpStatus } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';

function makeDb(responses: Array<{ rowCount?: number; rows: unknown[] }>) {
  const query = jest.fn();
  responses.forEach((response) => query.mockResolvedValueOnce(response));
  return { query };
}

const COURSE_ROW = { id: 'course-1', title: 'English Foundations' };

describe('EnrollmentService', () => {
  describe('enroll', () => {
    it('throws NOT_FOUND when the course does not exist or is not published', async () => {
      const db = makeDb([{ rows: [] }]);
      const service = new EnrollmentService(db as never);

      await expect(service.enroll('student-1', 'course-1')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      });
    });

    it('creates a new active enrollment when the student has none yet', async () => {
      const db = makeDb([
        { rows: [COURSE_ROW] }, // course lookup
        { rows: [] }, // no current active enrollment
        { rows: [{ enrolled_at: '2026-07-05T00:00:00Z' }] }, // insert
      ]);
      const service = new EnrollmentService(db as never);

      const result = await service.enroll('student-1', 'course-1');

      expect(result).toEqual({
        courseId: 'course-1',
        courseTitle: 'English Foundations',
        enrolledAt: '2026-07-05T00:00:00Z',
      });
      const insertCall = db.query.mock.calls.find((call) =>
        call[0].includes('INSERT INTO course_enrollments'),
      );
      expect(insertCall![1]).toEqual(['student-1', 'course-1']);
    });

    it('is idempotent when the student is already enrolled in this course', async () => {
      const db = makeDb([
        { rows: [COURSE_ROW] }, // course lookup
        { rows: [{ course_id: 'course-1' }] }, // already active in course-1
        {
          rows: [
            { id: 'enr-1', course_id: 'course-1', course_title: 'English Foundations', enrolled_at: '2026-07-01T00:00:00Z' },
          ],
        }, // existing row re-fetch
      ]);
      const service = new EnrollmentService(db as never);

      const result = await service.enroll('student-1', 'course-1');

      expect(result.enrolledAt).toBe('2026-07-01T00:00:00Z');
      const switchCall = db.query.mock.calls.find((call) => call[0].includes("SET status = 'switched'"));
      expect(switchCall).toBeUndefined();
    });

    it('switches the previous active enrollment to switched when starting a different course', async () => {
      const db = makeDb([
        { rows: [COURSE_ROW] }, // course lookup
        { rows: [{ course_id: 'course-0' }] }, // active in a different course
        { rows: [] }, // UPDATE ... SET status = 'switched'
        { rows: [{ enrolled_at: '2026-07-05T00:00:00Z' }] }, // insert new active row
      ]);
      const service = new EnrollmentService(db as never);

      await service.enroll('student-1', 'course-1');

      const switchCall = db.query.mock.calls.find((call) => call[0].includes("SET status = 'switched'"));
      expect(switchCall).toBeDefined();
      expect(switchCall![1]).toEqual(['student-1']);
    });
  });

  describe('getCurrentEnrollment', () => {
    it('returns found: false when the student has no active enrollment', async () => {
      const db = makeDb([{ rows: [] }]);
      const service = new EnrollmentService(db as never);

      const result = await service.getCurrentEnrollment('student-1');

      expect(result).toEqual({
        found: false,
        courseId: null,
        courseTitle: null,
        enrolledAt: null,
      });
    });

    it('returns the active enrollment when one exists', async () => {
      const db = makeDb([
        {
          rows: [
            { id: 'enr-1', course_id: 'course-1', course_title: 'English Foundations', enrolled_at: '2026-07-01T00:00:00Z' },
          ],
        },
      ]);
      const service = new EnrollmentService(db as never);

      const result = await service.getCurrentEnrollment('student-1');

      expect(result).toEqual({
        found: true,
        courseId: 'course-1',
        courseTitle: 'English Foundations',
        enrolledAt: '2026-07-01T00:00:00Z',
      });
    });
  });
});
