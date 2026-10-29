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
      { assessmentId: 'a1', title: 'Final Exam', type: 'exam', isFinalExam: false, score: 18, maxScore: 20, scorePercent: 90, passed: true },
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
      score_snapshot: { scoringVersion: 2, assessments: [], practiceAccuracy: null },
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
      { rows: [{ assessment_id: 'a1', title: 'Final Exam', type: 'exam', score: '18.00', max_score: '20.00', passed: true, is_final_exam: true }] }, // getCourseAssessmentResults
      { rows: [{ total: '10', correct: '10' }] }, // getCoursePracticeAccuracy
      { rows: [] }, // INSERT
      { rows: [insertedRow] }, // getForStudentAndCourse (final read)
    ]);
    const service = new CertificateService(db as never, createCourseCompletion(true) as never);

    const result = await service.issueIfCompleted('student-1', 'course-1');

    expect(result?.id).toBe('cert-2');
    expect(result?.studentName).toBe('jane@example.com');
    expect(result?.breakdown).toBeDefined();
    expect(result?.totalPoints).toBeGreaterThan(0);
    expect(db.query.mock.calls[3][0]).toContain('INSERT INTO certificates');
  });
});

describe('CertificateService — legacy snapshots', () => {
  it('replaces the stored 100% practice score of a version-1 snapshot with the real accuracy', async () => {
    const legacyRow = {
      id: 'cert-3',
      student_id: 'student-1',
      course_id: 'course-1',
      course_title: 'English A1',
      display_name: 'Jane Doe',
      email: 'jane@example.com',
      issued_at: '2026-01-01',
      score_snapshot: {
        assessments: [
          { assessmentId: 'q1', title: 'Quiz', type: 'quiz', score: 0, maxScore: 10, scorePercent: 0, passed: false },
          { assessmentId: 'q1', title: 'Quiz', type: 'quiz', score: 10, maxScore: 10, scorePercent: 100, passed: true },
        ],
        practiceAccuracy: 100,
      },
    };
    const db = createDb([
      { rows: [legacyRow] }, // getForStudentAndCourse
      { rows: [{ total: '4', correct: '3' }] }, // getCoursePracticeAccuracy
    ]);
    const service = new CertificateService(db as never, { isCourseComplete: jest.fn() } as never);

    const result = await service.getForStudentAndCourse('student-1', 'course-1');

    expect(result?.breakdown.practiceAccuracyPercent).toBe(75);
    expect(result?.breakdown.quizAveragePercent).toBe(100);
    expect(result?.scoreSnapshot).toHaveLength(1);
  });
});
