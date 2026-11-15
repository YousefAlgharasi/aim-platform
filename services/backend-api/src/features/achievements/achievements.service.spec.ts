import { AchievementsRepository } from './achievements.repository';
import { AchievementsService } from './achievements.service';

describe('AchievementsService', () => {
  const makeRepository = (overrides: Partial<AchievementsRepository> = {}) =>
    ({
      findActiveDefinitions: jest.fn().mockResolvedValue([]),
      findUnlockStateForStudent: jest.fn().mockResolvedValue([]),
      getCounters: jest.fn().mockResolvedValue({ lessons_completed: 0, assessments_passed: 0, streak_days: 0 }),
      unlockAchievement: jest.fn(),
      ...overrides,
    }) as unknown as AchievementsRepository;

  describe('getAchievements', () => {
    it('returns all achievements locked when the student has no unlock rows', async () => {
      const repository = makeRepository({
        findActiveDefinitions: jest.fn().mockResolvedValue([
          {
            id: 'def-1',
            key: 'first_lesson_complete',
            title: 'First Steps',
            description: 'Complete your first lesson.',
            icon: 'emoji_events',
            category: 'lessons',
          },
        ]),
      });
      const service = new AchievementsService(repository);

      const result = await service.getAchievements('student-1');

      expect(result.achievements).toEqual([
        {
          key: 'first_lesson_complete',
          title: 'First Steps',
          description: 'Complete your first lesson.',
          icon: 'emoji_events',
          category: 'lessons',
          unlocked: false,
          unlockedAt: null,
        },
      ]);
    });

    it('returns an empty list when there are no active achievement definitions', async () => {
      const repository = makeRepository();
      const service = new AchievementsService(repository);

      const result = await service.getAchievements('student-1');

      expect(result.achievements).toEqual([]);
    });

    it('marks an achievement unlocked when a matching unlock row exists', async () => {
      const unlockedAt = new Date('2026-06-01T00:00:00.000Z');
      const repository = makeRepository({
        findActiveDefinitions: jest.fn().mockResolvedValue([
          {
            id: 'def-1',
            key: 'first_lesson_complete',
            title: 'First Steps',
            description: 'Complete your first lesson.',
            icon: 'emoji_events',
            category: 'lessons',
          },
          {
            id: 'def-2',
            key: 'five_lessons_complete',
            title: 'Getting Started',
            description: 'Complete 5 lessons.',
            icon: 'emoji_events',
            category: 'lessons',
          },
        ]),
        findUnlockStateForStudent: jest
          .fn()
          .mockResolvedValue([{ achievement_id: 'def-1', unlocked_at: unlockedAt }]),
      });
      const service = new AchievementsService(repository);

      const result = await service.getAchievements('student-1');

      expect(result.achievements).toEqual([
        {
          key: 'first_lesson_complete',
          title: 'First Steps',
          description: 'Complete your first lesson.',
          icon: 'emoji_events',
          category: 'lessons',
          unlocked: true,
          unlockedAt: unlockedAt.toISOString(),
        },
        {
          key: 'five_lessons_complete',
          title: 'Getting Started',
          description: 'Complete 5 lessons.',
          icon: 'emoji_events',
          category: 'lessons',
          unlocked: false,
          unlockedAt: null,
        },
      ]);
    });

    it('unlocks an achievement whose rule counter reaches the threshold and persists it', async () => {
      const unlockAchievement = jest.fn().mockResolvedValue(undefined);
      const repository = makeRepository({
        findActiveDefinitions: jest.fn().mockResolvedValue([
          { id: 'def-1', key: 'ten_lessons', title: 'Ten', description: 'd', icon: 'i', category: 'lessons', rule_type: 'lessons_completed', rule_threshold: 10 },
          { id: 'def-2', key: 'fifty', title: 'Fifty', description: 'd', icon: 'i', category: 'lessons', rule_type: 'lessons_completed', rule_threshold: 50 },
          { id: 'def-3', key: 'manual', title: 'Manual', description: 'd', icon: 'i', category: 'milestone', rule_type: null, rule_threshold: null },
        ]),
        getCounters: jest.fn().mockResolvedValue({ lessons_completed: 12 }),
        unlockAchievement,
      });
      const service = new AchievementsService(repository);

      const result = await service.getAchievements('student-1');

      expect(result.achievements.map((a) => [a.key, a.unlocked])).toEqual([['ten_lessons', true], ['fifty', false], ['manual', false]]);
      expect(unlockAchievement).toHaveBeenCalledTimes(1);
      expect(unlockAchievement).toHaveBeenCalledWith('student-1', 'def-1');
    });
  });
});
