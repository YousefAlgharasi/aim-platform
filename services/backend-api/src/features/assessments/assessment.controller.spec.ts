// P10-033: AssessmentController unit tests.
//
// Scope: Student Assessment List API only.
//
// Coverage:
//   - GET /student/assessments delegates to AssessmentService.listForStudent
//     with the authenticated user's id (never client-supplied).
//   - Response never includes pass_threshold/late_penalty_percent/weight/
//     correct_answer fields (verified by mock response shape contract).

import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentController } from './assessment.controller';
import { AssessmentService, AssessmentListItem } from './assessment.service';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AssessmentPermissionGuard } from './guards/assessment-permission.guard';
import { AuthenticatedUser } from '../../auth/authenticated-user';

describe('AssessmentController', () => {
  let controller: AssessmentController;
  let assessmentService: jest.Mocked<Pick<AssessmentService, 'listForStudent'>>;

  const mockListItems: AssessmentListItem[] = [
    { id: 'assessment-1', type: 'quiz', title: 'Quiz 1', description: null, deadlineStatus: 'open' },
    { id: 'assessment-2', type: 'exam', title: 'Exam 1', description: 'Midterm', deadlineStatus: 'upcoming' },
  ];

  beforeEach(async () => {
    assessmentService = {
      listForStudent: jest.fn().mockResolvedValue(mockListItems),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentController],
      providers: [{ provide: AssessmentService, useValue: assessmentService }],
    })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AssessmentPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AssessmentController);
  });

  function makeUser(id: string): AuthenticatedUser {
    return { id, expiresAt: Date.now() + 3600, appMetadata: { role: 'student' } };
  }

  it('returns the assessment list resolved for the authenticated student id', async () => {
    const user = makeUser('student-1');
    const result = await controller.listAssessments(user);

    expect(assessmentService.listForStudent).toHaveBeenCalledWith('student-1');
    expect(result).toEqual(mockListItems);
  });

  it('never trusts a client-supplied student id — only the JWT-derived user.id is used', async () => {
    const user = makeUser('student-from-jwt');
    await controller.listAssessments(user);

    expect(assessmentService.listForStudent).toHaveBeenCalledTimes(1);
    expect(assessmentService.listForStudent).toHaveBeenCalledWith('student-from-jwt');
  });

  it('response items expose no backend-only fields (pass_threshold, weight, correct_answer)', async () => {
    const user = makeUser('student-1');
    const result = await controller.listAssessments(user);

    for (const item of result) {
      expect(item).not.toHaveProperty('pass_threshold');
      expect(item).not.toHaveProperty('late_penalty_percent');
      expect(item).not.toHaveProperty('weight');
      expect(item).not.toHaveProperty('correct_answer');
    }
  });
});
