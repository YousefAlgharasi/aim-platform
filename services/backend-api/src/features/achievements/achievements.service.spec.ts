import { AchievementsRepository } from './achievements.repository';
import { AchievementsService } from './achievements.service';

describe('AchievementsService', () => {
  const makeRepository = (overrides: Partial<AchievementsRepository> = {}) =>
    ({
      findActiveDefinitions: jest.fn().mockResolvedValue([]),
      findUnlockStateForStudent: jest.fn().mockResolvedValue([]),
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
  });
});
