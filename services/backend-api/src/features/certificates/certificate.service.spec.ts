import { CertificateService } from './certificate.service';

function createDb(results: Array<{ rows: Record<string, unknown>[] }>) {
  const queue = [...results];
  return {
    query: jest.fn().mockImplementation(() => {
      const result = queue.shift() ?? { rows: [] };
      return Promise.resolve({ rowCount: result.rows.length, rows: result.rows });
    }),
  };
}

function createCourseCompletion(isComplete: boolean) {
  return { isCourseComplete: jest.fn().mockResolvedValue(isComplete) };
}

describe('CertificateService', () => {
  it('getCourseAssessmentResults returns course-level and chapter-level results with numeric coercion', async () => {
    const db = createDb([
      {
        rows: [
          { assessment_id: 'a1', title: 'Final Exam', type: 'exam', score: '18.00', max_score: '20.00', passed: true },
        ],
      },
    ]);
    const service = new CertificateService(db as never, createCourseCompletion(true) as never);
    const result = await service.getCourseAssessmentResults('student-1', 'course-1');

    expect(result).toEqual([
      { assessmentId: 'a1', title: 'Final Exam', type: 'exam', score: 18, maxScore: 20, scorePercent: 90, passed: true },
    ]);
    expect(db.query.mock.calls[0][1]).toEqual(['student-1', 'course-1']);
  });

  it('getForStudentAndCourse returns null when no certificate exists', async () => {
    const db = createDb([{ rows: [] }]);
    const service = new CertificateService(db as never, createCourseCompletion(true) as never);
    const result = await service.getForStudentAndCourse('student-1', 'course-1');
    expect(result).toBeNull();
  });

  it('issueIfCompleted returns null when the course is not complete, and does not insert', async () => {
    const db = createDb([{ rows: [] }]);
    const courseCompletion = createCourseCompletion(false);
    const service = new CertificateService(db as never, courseCompletion as never);

    const result = await service.issueIfCompleted('student-1', 'course-1');

    expect(result).toBeNull();
    expect(courseCompletion.isCourseComplete).toHaveBeenCalledWith('student-1', 'course-1');
    expect(db.query).toHaveBeenCalledTimes(1); // only the initial existence check
  });

  it('issueIfCompleted is idempotent — returns the existing certificate without re-inserting', async () => {
    const existingRow = {
      id: 'cert-1',
      student_id: 'student-1',
      course_id: 'course-1',
      course_title: 'English A1',
      display_name: 'Jane Doe',
      email: 'jane@example.com',
      issued_at: '2026-01-01',
      score_snapshot: [],
    };
    const db = createDb([{ rows: [existingRow] }]);
    const courseCompletion = createCourseCompletion(true);
    const service = new CertificateService(db as never, courseCompletion as never);

    const result = await service.issueIfCompleted('student-1', 'course-1');

    expect(result?.id).toBe('cert-1');
    expect(result?.studentName).toBe('Jane Doe');
    expect(courseCompletion.isCourseComplete).not.toHaveBeenCalled();
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('issueIfCompleted inserts a snapshot and returns the new certificate when the course just completed', async () => {
    const insertedRow = {
      id: 'cert-2',
      student_id: 'student-1',
      course_id: 'course-1',
      course_title: 'English A1',
      display_name: null,
      email: 'jane@example.com',
      issued_at: '2026-02-01',
      score_snapshot: [
        { assessmentId: 'a1', title: 'Final Exam', type: 'exam', score: 18, maxScore: 20, scorePercent: 90, passed: true },
      ],
    };
    const db = createDb([
      { rows: [] }, // getForStudentAndCourse (existence check) -> none
      { rows: [{ assessment_id: 'a1', title: 'Final Exam', type: 'exam', score: '18.00', max_score: '20.00', passed: true }] }, // getCourseAssessmentResults
      { rows: [] }, // INSERT
      { rows: [insertedRow] }, // getForStudentAndCourse (final read)
    ]);
    const service = new CertificateService(db as never, createCourseCompletion(true) as never);

    const result = await service.issueIfCompleted('student-1', 'course-1');

    expect(result?.id).toBe('cert-2');
    expect(result?.studentName).toBe('jane@example.com');
    expect(result?.overallScorePercent).toBe(90);
    expect(db.query.mock.calls[2][0]).toContain('INSERT INTO certificates');
    expect(db.query.mock.calls[2][1]).toEqual(['student-1', 'course-1', JSON.stringify([
      { assessmentId: 'a1', title: 'Final Exam', type: 'exam', score: 18, maxScore: 20, scorePercent: 90, passed: true },
    ])]);
  });
});
