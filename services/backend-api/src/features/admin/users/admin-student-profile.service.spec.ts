import { AdminStudentProfileService } from './admin-student-profile.service';
import { AppError } from '../../../common/errors/app-error';

// getProfile fans out several queries concurrently (Promise.all), so a
// simple FIFO queue mock would be order-dependent and flaky. Match on SQL
// content instead, like the placement service specs do for the same reason.
function createDb(handler: (sql: string) => { rows: Record<string, unknown>[] } | undefined) {
  return {
    query: jest.fn().mockImplementation((sql: string) => {
      const result = handler(sql) ?? { rows: [] };
      return Promise.resolve({ rowCount: result.rows.length, rows: result.rows });
    }),
  };
}

describe('AdminStudentProfileService', () => {
  it('throws NOT_FOUND when the student does not exist', async () => {
    const db = createDb(() => ({ rows: [] }));
    const service = new AdminStudentProfileService(
      db as never,
      {} as never,
      { getLatestResultForStudent: jest.fn() } as never,
      { getUserSubscriptions: jest.fn() } as never,
      {} as never,
    );

    await expect(service.getProfile('missing-student')).rejects.toThrow(AppError);
  });

  it('assembles a full profile from all collaborators', async () => {
    const db = createDb((sql) => {
      if (sql.includes('FROM users u') && sql.includes("user_type = 'student'")) {
        return { rows: [{ id: 's1', email: 'jane@example.com', status: 'active', created_at: '2026-01-01', display_name: 'Jane Doe' }] };
      }
      if (sql.includes('FROM course_enrollments')) {
        return { rows: [{ id: 'ce1', course_id: 'course-1', course_title: 'English A1', status: 'active', enrolled_at: '2026-01-05' }] };
      }
      if (sql.includes('course_lessons')) {
        return { rows: [{ total: '10', completed_count: '10' }] };
      }
      if (sql.includes('FROM weakness_records')) {
        return { rows: [{ id: 'w1', skill_id: 'grammar.past', skill_title: 'Past Simple', severity: 'developing', status: 'active', detected_at: '2026-01-02', resolved_at: null }] };
      }
      if (sql.includes('FROM ai_chat_sessions')) {
        return { rows: [{ id: 'sess1', context_ref: 'lesson:l1', status: 'active', created_at: '2026-01-03', updated_at: '2026-01-04' }] };
      }
      if (sql.includes('FROM assessment_results ar')) {
        return {
          rows: [
            {
              id: 'ar1',
              assessment_id: 'a1',
              title: 'Placement Prep Quiz',
              type: 'quiz',
              score: '8.00',
              max_score: '10.00',
              passed: true,
              attempted_at: '2026-01-06',
              course_title: null,
            },
          ],
        };
      }
      if (sql.includes('FROM billing_plans')) {
        return { rows: [{ name: 'Free Plan' }] };
      }
      if (sql.includes('FROM courses WHERE id')) {
        return { rows: [{ title: 'English A2' }] };
      }
      return undefined;
    });

    const placementResultRead = {
      getLatestResultForStudent: jest.fn().mockResolvedValue({
        estimated_level: 'B1',
        created_at: '2026-01-01',
        skill_mastery_map: { 'grammar.past': { mastery_score: 0.8, signal: 'strong', total_questions: 5, correct_answers: 4 } },
        recommended_course_id: 'course-2',
      }),
    };
    const subscriptionService = {
      getUserSubscriptions: jest.fn().mockResolvedValue([
        { id: 'sub1', planId: 'plan-free', status: 'active', currentPeriodEnd: null },
      ]),
    };
    const certificateService = {
      getCourseAssessmentResults: jest.fn().mockResolvedValue([
        { assessmentId: 'a1', title: 'Chapter Quiz', type: 'quiz', score: 8, maxScore: 10, passed: true },
      ]),
      issueIfCompleted: jest.fn().mockResolvedValue({ id: 'cert-1', issuedAt: '2026-02-01' }),
    };

    const service = new AdminStudentProfileService(
      db as never,
      {} as never,
      placementResultRead as never,
      subscriptionService as never,
      certificateService as never,
    );

    const profile = await service.getProfile('s1');

    expect(profile.student).toEqual({
      id: 's1',
      email: 'jane@example.com',
      displayName: 'Jane Doe',
      status: 'active',
      createdAt: '2026-01-01',
    });
    expect(profile.placement).toEqual({
      estimatedLevel: 'B1',
      completedAt: '2026-01-01',
      skillSummary: [{ skillCode: 'grammar.past', signal: 'strong' }],
      scorePercent: 80,
      recommendedCourseId: 'course-2',
      recommendedCourseTitle: 'English A2',
    });
    expect(profile.subscription).toEqual({
      planId: 'plan-free',
      planName: 'Free Plan',
      status: 'active',
      currentPeriodEnd: null,
    });
    expect(profile.assessmentResults).toEqual([
      {
        id: 'ar1',
        assessmentId: 'a1',
        title: 'Placement Prep Quiz',
        type: 'quiz',
        score: 8,
        maxScore: 10,
        passed: true,
        attemptedAt: '2026-01-06',
        courseTitle: null,
      },
    ]);
    expect(profile.courses).toHaveLength(1);
    expect(profile.courses[0]).toEqual({
      enrollmentId: 'ce1',
      courseId: 'course-1',
      courseTitle: 'English A1',
      enrollmentStatus: 'active',
      enrolledAt: '2026-01-05',
      completedLessons: 10,
      totalLessons: 10,
      completionPct: 100,
      completed: true,
      assessments: [{ assessmentId: 'a1', title: 'Chapter Quiz', type: 'quiz', score: 8, maxScore: 10, passed: true }],
      certificate: { id: 'cert-1', issuedAt: '2026-02-01' },
    });
    expect(certificateService.issueIfCompleted).toHaveBeenCalledWith('s1', 'course-1');
    expect(profile.weaknesses).toEqual([
      {
        id: 'w1',
        skillId: 'grammar.past',
        skillTitle: 'Past Simple',
        severity: 'developing',
        status: 'active',
        detectedAt: '2026-01-02',
        resolvedAt: null,
      },
    ]);
    expect(profile.aiTeacherSessions).toEqual([
      { id: 'sess1', contextRef: 'lesson:l1', status: 'active', createdAt: '2026-01-03', updatedAt: '2026-01-04' },
    ]);
  });

  it('does not issue a certificate for an incomplete course', async () => {
    const db = createDb((sql) => {
      if (sql.includes('FROM users u') && sql.includes("user_type = 'student'")) {
        return { rows: [{ id: 's1', email: 'jane@example.com', status: 'active', created_at: '2026-01-01', display_name: null }] };
      }
      if (sql.includes('FROM course_enrollments')) {
        return { rows: [{ id: 'ce1', course_id: 'course-1', course_title: 'English A1', status: 'active', enrolled_at: '2026-01-05' }] };
      }
      if (sql.includes('course_lessons')) {
        return { rows: [{ total: '10', completed_count: '3' }] };
      }
      return undefined;
    });
    const certificateService = {
      getCourseAssessmentResults: jest.fn().mockResolvedValue([]),
      issueIfCompleted: jest.fn(),
    };
    const service = new AdminStudentProfileService(
      db as never,
      {} as never,
      { getLatestResultForStudent: jest.fn().mockResolvedValue(null) } as never,
      { getUserSubscriptions: jest.fn().mockResolvedValue([]) } as never,
      certificateService as never,
    );

    const profile = await service.getProfile('s1');

    expect(profile.courses[0].completed).toBe(false);
    expect(profile.courses[0].certificate).toBeNull();
    expect(certificateService.issueIfCompleted).not.toHaveBeenCalled();
  });
});
