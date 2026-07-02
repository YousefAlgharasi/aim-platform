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
      findXpLevels: jest.fn().mockResolvedValue([
        { level: 1, min_xp: 0 },
        { level: 2, min_xp: 100 },
        { level: 3, min_xp: 300 },
        { level: 4, min_xp: 600 },
      ]),
      sumTotalXp: jest.fn().mockResolvedValue(0),
      sumXpToday: jest.fn().mockResolvedValue(0),
      sumXpLastWeek: jest.fn().mockResolvedValue(0),
      findWeeklyXp: jest.fn().mockResolvedValue([]),
      countUnlockedBadges: jest.fn().mockResolvedValue(0),
      findRankPercentile: jest.fn().mockResolvedValue(null),
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

  describe('getStats', () => {
    it('places a brand-new student at level 1 with 0 XP and 100% rank', async () => {
      const repository = makeRepository();
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats).toEqual({
        totalXp: 0,
        xpToday: 0,
        level: 1,
        nextLevel: 2,
        currentLevelMinXp: 0,
        nextLevelMinXp: 100,
        levelProgressPercent: 0,
        badgeCount: 0,
        rankPercentile: 100,
        weeklyActivity: [],
        weeklyDeltaPercent: null,
      });
    });

    it('computes the correct level and progress percent partway through a level', async () => {
      const repository = makeRepository({
        sumTotalXp: jest.fn().mockResolvedValue(200), // between level 2 (100) and level 3 (300)
      });
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats.level).toBe(2);
      expect(stats.nextLevel).toBe(3);
      expect(stats.currentLevelMinXp).toBe(100);
      expect(stats.nextLevelMinXp).toBe(300);
      expect(stats.levelProgressPercent).toBe(50); // (200-100)/(300-100) = 50%
    });

    it('reports levelProgressPercent 100 and no nextLevel at the max seeded level', async () => {
      const repository = makeRepository({
        sumTotalXp: jest.fn().mockResolvedValue(10_000), // beyond the highest seeded level (4, min_xp 600)
      });
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats.level).toBe(4);
      expect(stats.nextLevel).toBeNull();
      expect(stats.nextLevelMinXp).toBeNull();
      expect(stats.levelProgressPercent).toBe(100);
    });

    it('converts a percent_rank of 0 (top student) to rankPercentile 1, never 0', async () => {
      const repository = makeRepository({
        findRankPercentile: jest.fn().mockResolvedValue(0),
      });
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats.rankPercentile).toBe(1);
    });

    it('rounds percent_rank into a 1-100 rankPercentile', async () => {
      const repository = makeRepository({
        findRankPercentile: jest.fn().mockResolvedValue(0.42),
      });
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats.rankPercentile).toBe(42);
    });

    it('passes through real weekly activity rows and computes the delta vs last week', async () => {
      const repository = makeRepository({
        findWeeklyXp: jest.fn().mockResolvedValue([
          { day: '2026-06-29', xp: 50 },
          { day: '2026-06-30', xp: 0 },
          { day: '2026-07-01', xp: 100 },
          { day: '2026-07-02', xp: 0 },
          { day: '2026-07-03', xp: 0 },
          { day: '2026-07-04', xp: 0 },
          { day: '2026-07-05', xp: 0 },
        ]),
        sumXpLastWeek: jest.fn().mockResolvedValue(100), // this week 150 vs last week 100 = +50%
      });
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats.weeklyActivity).toEqual([
        { date: '2026-06-29', xp: 50 },
        { date: '2026-06-30', xp: 0 },
        { date: '2026-07-01', xp: 100 },
        { date: '2026-07-02', xp: 0 },
        { date: '2026-07-03', xp: 0 },
        { date: '2026-07-04', xp: 0 },
        { date: '2026-07-05', xp: 0 },
      ]);
      expect(stats.weeklyDeltaPercent).toBe(50);
    });

    it('returns a null weeklyDeltaPercent when last week had 0 XP (avoids divide-by-zero)', async () => {
      const repository = makeRepository({
        findWeeklyXp: jest.fn().mockResolvedValue([{ day: '2026-06-29', xp: 20 }]),
        sumXpLastWeek: jest.fn().mockResolvedValue(0),
      });
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats.weeklyDeltaPercent).toBeNull();
    });

    it('passes through the real badge count verbatim', async () => {
      const repository = makeRepository({
        countUnlockedBadges: jest.fn().mockResolvedValue(7),
      });
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats.badgeCount).toBe(7);
    });

    it('falls back to level 1 with no next level when no XP levels are seeded', async () => {
      const repository = makeRepository({ findXpLevels: jest.fn().mockResolvedValue([]) });
      const service = new EngagementService(repository);

      const stats = await service.getStats('student-1');

      expect(stats.level).toBe(1);
      expect(stats.nextLevel).toBeNull();
      expect(stats.levelProgressPercent).toBe(0);
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
