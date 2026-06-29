import { EngagementRepository } from './engagement.repository';
import { EngagementService } from './engagement.service';

describe('EngagementService', () => {
  const makeRepository = (overrides: Partial<EngagementRepository> = {}) =>
    ({
      findGoal: jest.fn().mockResolvedValue(null),
      upsertGoal: jest.fn(),
      countLessonsCompletedToday: jest.fn().mockResolvedValue(0),
      findActiveDates: jest.fn().mockResolvedValue([]),
      findActiveChallengeTemplates: jest.fn().mockResolvedValue([]),
      ...overrides,
    }) as unknown as EngagementRepository;

  describe('getSummary', () => {
    it('defaults the goal target when no goal row exists', async () => {
      const repository = makeRepository();
      const service = new EngagementService(repository);

      const summary = await service.getSummary('student-1');

      expect(summary.goal).toEqual({
        targetLessons: 1,
        completedToday: 0,
        streakDays: 0,
      });
      expect(summary.challenge).toBeNull();
    });

    it('computes a consecutive streak ending today', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10);

      const repository = makeRepository({
        findActiveDates: jest.fn().mockResolvedValue([today, yesterday, twoDaysAgo]),
      });
      const service = new EngagementService(repository);

      const summary = await service.getSummary('student-1');

      expect(summary.goal.streakDays).toBe(3);
    });

    it('breaks the streak when today is missing from active dates', async () => {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

      const repository = makeRepository({
        findActiveDates: jest.fn().mockResolvedValue([yesterday]),
      });
      const service = new EngagementService(repository);

      const summary = await service.getSummary('student-1');

      expect(summary.goal.streakDays).toBe(0);
    });

    it('deterministically selects the same challenge for the same student and day', async () => {
      const templates = [
        { id: '1', key: 'a', title: 'A', description: 'a', challenge_type: 'lessons' as const, target_count: 1 },
        { id: '2', key: 'b', title: 'B', description: 'b', challenge_type: 'lessons' as const, target_count: 2 },
      ];
      const repository = makeRepository({
        findActiveChallengeTemplates: jest.fn().mockResolvedValue(templates),
        countLessonsCompletedToday: jest.fn().mockResolvedValue(2),
      });
      const service = new EngagementService(repository);

      const first = await service.getSummary('student-1');
      const second = await service.getSummary('student-1');

      expect(first.challenge?.key).toBe(second.challenge?.key);
    });

    it('marks a lessons-type challenge completed once the target is met', async () => {
      const templates = [
        { id: '1', key: 'complete_one_lesson', title: 'A', description: 'a', challenge_type: 'lessons' as const, target_count: 1 },
      ];
      const repository = makeRepository({
        findActiveChallengeTemplates: jest.fn().mockResolvedValue(templates),
        countLessonsCompletedToday: jest.fn().mockResolvedValue(1),
      });
      const service = new EngagementService(repository);

      const summary = await service.getSummary('student-1');

      expect(summary.challenge?.completed).toBe(true);
      expect(summary.challenge?.progressCount).toBe(1);
    });
  });

  describe('updateGoal', () => {
    it('clamps the target between 1 and 20', async () => {
      const repository = makeRepository({
        upsertGoal: jest.fn().mockImplementation((studentId: string, target: number) =>
          Promise.resolve({ student_id: studentId, daily_goal_lessons: target }),
        ),
      });
      const service = new EngagementService(repository);

      const result = await service.updateGoal('student-1', 99);

      expect(result.targetLessons).toBe(20);
    });
  });
});
