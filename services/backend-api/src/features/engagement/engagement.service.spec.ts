import { EngagementRepository } from './engagement.repository';
import { EngagementService, shortName } from './engagement.service';

describe('EngagementService', () => {
  const makeRepository = (overrides: Partial<EngagementRepository> = {}) =>
    ({
      findGoal: jest.fn().mockResolvedValue(null),
      upsertGoal: jest.fn(),
      countLessonsCompletedToday: jest.fn().mockResolvedValue(0),
      findActiveDates: jest.fn().mockResolvedValue([]),
      findFrozenDates: jest.fn().mockResolvedValue([]),
      countFreezesThisMonth: jest.fn().mockResolvedValue(0),
      insertFreezeIfAllowed: jest.fn().mockResolvedValue(true),
      findActiveChallengeTemplates: jest.fn().mockResolvedValue([]),
      findLeaderboard: jest.fn().mockResolvedValue([]),
      countPracticeCompletedToday: jest.fn().mockResolvedValue({ speaking: 0, writing: 0 }),
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
      expect(summary.streakFreeze).toMatchObject({ allowance: 2, remaining: 2, atRisk: false, canUseNow: false });
      expect(summary.challenge).toMatchObject({ key: 'daily_goal', targetCount: 1, progressCount: 0, completed: false });
    });

    it('lists the last 7 UTC days oldest first, marking active and frozen days', async () => {
      const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
      const repository = makeRepository({
        findActiveDates: jest.fn().mockResolvedValue([day(0), day(-2), day(-9)]),
        findFrozenDates: jest.fn().mockResolvedValue([day(-1)]),
      });
      const summary = await new EngagementService(repository).getSummary('student-1');

      expect(summary.recentDays.map((d) => d.date)).toEqual([-6, -5, -4, -3, -2, -1, 0].map(day));
      expect(summary.recentDays.map((d) => d.status)).toEqual(['none', 'none', 'none', 'none', 'active', 'frozen', 'active']);
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

    it('breaks the streak when yesterday and today are missing from active dates', async () => {
      const twoDaysAgo = new Date(Date.now() - 86_400_000 * 2).toISOString().slice(0, 10);

      const repository = makeRepository({
        findActiveDates: jest.fn().mockResolvedValue([twoDaysAgo]),
      });
      const service = new EngagementService(repository);

      const summary = await service.getSummary('student-1');

      expect(summary.goal.streakDays).toBe(0);
    });
  });

  describe('daily goal challenge', () => {
    const service = (goal: number | null, lessonsToday: number) =>
      new EngagementService(makeRepository({
        findGoal: jest.fn().mockResolvedValue(goal === null ? null : { student_id: 's', daily_goal_lessons: goal }),
        countLessonsCompletedToday: jest.fn().mockResolvedValue(lessonsToday),
      }));

    it('starts at 1 lesson a day when the student has not chosen a goal', async () => {
      const { challenge } = await service(null, 0).getSummary('student-1');
      expect(challenge).toMatchObject({ key: 'daily_goal', targetCount: 1, description: 'Complete 1 lesson today.', completed: false });
    });

    it('follows the goal the student picked, counting up and completing when it is met', async () => {
      expect((await service(3, 0).getSummary('student-1')).challenge).toMatchObject({ targetCount: 3, progressCount: 0, description: 'Complete 3 lessons today.', completed: false });
      expect((await service(3, 2).getSummary('student-1')).challenge).toMatchObject({ progressCount: 2, completed: false });
      expect((await service(3, 3).getSummary('student-1')).challenge).toMatchObject({ progressCount: 3, completed: true });
      expect((await service(3, 7).getSummary('student-1')).challenge).toMatchObject({ progressCount: 3, completed: true });
    });

    it('is not done just because a streak exists from yesterday', async () => {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      const svc = new EngagementService(makeRepository({ findActiveDates: jest.fn().mockResolvedValue([yesterday]) }));
      expect((await svc.getSummary('student-1')).challenge?.completed).toBe(false);
    });
  });

  describe('daily practice challenges', () => {
    it('always lists the goal, speaking and writing practice, so a day has three', async () => {
      const summary = await new EngagementService(makeRepository()).getSummary('student-1');

      expect(summary.challenges.map((c) => c.key)).toEqual(['daily_goal', 'practice_speaking', 'practice_writing']);
      expect(summary.challenge?.key).toBe('daily_goal');
      expect(summary.challenges.slice(1).every((c) => !c.completed && c.progressCount === 0 && c.targetCount === 1)).toBe(true);
    });

    it('completes each practice challenge from what the student finished today', async () => {
      const service = new EngagementService(makeRepository({ countPracticeCompletedToday: jest.fn().mockResolvedValue({ speaking: 2, writing: 0 }) }));

      const [, speaking, writing] = (await service.getSummary('student-1')).challenges;

      expect(speaking).toMatchObject({ key: 'practice_speaking', completed: true, progressCount: 1 });
      expect(writing).toMatchObject({ key: 'practice_writing', completed: false, progressCount: 0 });
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

  describe('streak freezes', () => {
    const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

    it('keeps the streak alive across a frozen day without counting it', async () => {
      // active 3, 2 days ago... yesterday frozen, today not yet done
      const repository = makeRepository({
        findActiveDates: jest.fn().mockResolvedValue([day(-2), day(-3), day(-4)]),
        findFrozenDates: jest.fn().mockResolvedValue([day(-1)]),
      });
      const summary = await new EngagementService(repository).getSummary('s');
      expect(summary.goal.streakDays).toBe(3);
      expect(summary.streakFreeze.atRisk).toBe(false);
    });

    it('is at risk when yesterday was missed but the day before was active', async () => {
      const repository = makeRepository({ findActiveDates: jest.fn().mockResolvedValue([day(-2), day(-3)]) });
      const summary = await new EngagementService(repository).getSummary('s');
      expect(summary.goal.streakDays).toBe(0);
      expect(summary.streakFreeze).toMatchObject({ atRisk: true, canUseNow: true, remaining: 2 });
    });

    it('cannot be used once the monthly allowance is spent', async () => {
      const repository = makeRepository({
        findActiveDates: jest.fn().mockResolvedValue([day(-2)]),
        countFreezesThisMonth: jest.fn().mockResolvedValue(2),
      });
      const service = new EngagementService(repository);
      expect((await service.getSummary('s')).streakFreeze).toMatchObject({ atRisk: true, canUseNow: false, remaining: 0 });
      await expect(service.useStreakFreeze('s')).rejects.toMatchObject({ status: 409 });
      expect(repository.insertFreezeIfAllowed).not.toHaveBeenCalled();
    });

    it('refuses when the streak is not at risk', async () => {
      const repository = makeRepository({ findActiveDates: jest.fn().mockResolvedValue([day(0), day(-1)]) });
      await expect(new EngagementService(repository).useStreakFreeze('s')).rejects.toMatchObject({ status: 400 });
    });

    it('freezes yesterday when allowed', async () => {
      const insert = jest.fn().mockResolvedValue(true);
      const repository = makeRepository({
        findActiveDates: jest.fn().mockResolvedValue([day(-2)]),
        insertFreezeIfAllowed: insert,
      });
      await new EngagementService(repository).useStreakFreeze('s');
      expect(insert).toHaveBeenCalledWith('s', day(-1), 2);
    });
  });

  describe('leaderboard', () => {
    it('shortens names to first name and last initial, never exposing the full name', () => {
      expect(shortName('Yousef Ahmed Algharasi')).toBe('Yousef A.');
      expect(shortName('Y Student')).toBe('Y S.');
      expect(shortName('محمد القباطي')).toBe('محمد ا.');
      expect(shortName('Madonna')).toBe('Madonna');
      expect(shortName('   ')).toBe('Student');
      expect(shortName(null)).toBe('Student');
    });

    it('returns the top list in rank order and marks the caller', async () => {
      const rows = [
        { rank: 1, display_name: 'Sara Khan', xp: 90, is_you: false },
        { rank: 2, display_name: 'Y Student', xp: 80, is_you: true },
      ];
      const repo = makeRepository({ findLeaderboard: jest.fn().mockResolvedValue(rows) });

      const board = await new EngagementService(repo).getLeaderboard('me', 'week', 5);

      expect(repo.findLeaderboard).toHaveBeenCalledWith('me', 'week', 5);
      expect(board.period).toBe('week');
      expect(board.entries.map((e) => [e.rank, e.name, e.xp, e.isYou])).toEqual([[1, 'Sara K.', 90, false], [2, 'Y S.', 80, true]]);
      expect(board.you).toMatchObject({ rank: 2, xp: 80 });
    });

    it('shows the caller below the top list when they are outside it', async () => {
      const rows = [
        { rank: 1, display_name: 'A One', xp: 50, is_you: false },
        { rank: 9, display_name: 'Me Myself', xp: 5, is_you: true },
      ];
      const board = await new EngagementService(makeRepository({ findLeaderboard: jest.fn().mockResolvedValue(rows) })).getLeaderboard('me', 'all', 1);

      expect(board.entries).toHaveLength(1);
      expect(board.you).toMatchObject({ rank: 9, name: 'Me M.', isYou: true });
    });

    it('has no entry for a caller with no XP yet', async () => {
      const board = await new EngagementService(makeRepository()).getLeaderboard('me', 'week', 5);
      expect(board.entries).toEqual([]);
      expect(board.you).toBeNull();
    });
  });
});
