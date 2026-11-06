import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AdminEngagementService } from './admin-engagement.service';
import { FeatureFlagService } from './feature-flag.service';

const mkDb = (rows: any[] = [], err?: unknown) =>
  ({ query: jest.fn(async () => { if (err) throw err; return { rows, rowCount: rows.length }; }) }) as any;

describe('AdminEngagementService', () => {
  it('rejects out-of-range challenge targets and unknown types', async () => {
    const svc = new AdminEngagementService(mkDb());
    const base = { key: 'k_1', title: 'T', description: 'D', challengeType: 'lessons', targetCount: 3 };
    await expect(svc.createChallenge({ ...base, targetCount: 0 }, 'a')).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.createChallenge({ ...base, targetCount: 21 }, 'a')).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.createChallenge({ ...base, challengeType: 'xp' }, 'a')).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.createChallenge({ ...base, key: 'Bad Key' }, 'a')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a challenge and maps the row', async () => {
    const db = mkDb([{ id: 'i', key: 'k_1', title: 'T', description: 'D', challenge_type: 'lessons', target_count: 3, is_active: true }]);
    const out = await new AdminEngagementService(db).createChallenge(
      { key: 'k_1', title: 'T', description: 'D', challengeType: 'lessons', targetCount: 3 }, 'a');
    expect(out).toMatchObject({ id: 'i', challengeType: 'lessons', targetCount: 3, isActive: true });
  });

  it('turns a duplicate key into 409', async () => {
    const svc = new AdminEngagementService(mkDb([], { code: '23505' }));
    await expect(svc.createChallenge(
      { key: 'dup', title: 'T', description: 'D', challengeType: 'streak', targetCount: 1 }, 'a')).rejects.toBeInstanceOf(ConflictException);
  });

  it('achievements: only whitelisted fields are editable; empty update and missing id fail', async () => {
    const svc = new AdminEngagementService(mkDb([]));
    await expect(svc.updateAchievement('id', { key: 'hacked' }, 'a')).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.updateAchievement('id', { title: 'New' }, 'a')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('FeatureFlagService.evaluateAll', () => {
  const flag = (flagKey: string, enabled: boolean, rolloutPercentage: number) => ({ flagKey, enabled, rolloutPercentage });
  it('applies enabled / rollout rules and is stable per user', async () => {
    const repo = { findAllFeatureFlags: async () => [flag('on', true, 100), flag('off', false, 100), flag('zero', true, 0), flag('half', true, 50)] } as any;
    const svc = new FeatureFlagService(repo, {} as any);
    const a = await svc.evaluateAll('user-1');
    expect(a).toMatchObject({ on: true, off: false, zero: false });
    expect(await svc.evaluateAll('user-1')).toEqual(a);
  });
});
