// EngagementService.
//
// Scope: Backend-owned daily learning goal, streak, and daily challenge
// computation — surfaced on the mobile Home screen.
//
// All progress figures are derived server-side from lesson_progress; the
// client never submits or computes streak/goal/challenge progress itself.

import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { EngagementRepository } from './engagement.repository';
import {
  DailyChallengeSummary,
  DailyGoalSummary,
  EngagementStatsResponse,
  EngagementSummaryResponse,
  StreakFreezeSummary,
  WeeklyActivityDay,
} from './engagement.types';

const DEFAULT_DAILY_GOAL_LESSONS = 1;
const STREAK_LOOKBACK_DAYS = 60;
/** Freezes each student gets per UTC month. */
export const STREAK_FREEZES_PER_MONTH = 2;

const dayStr = (offset: number, from = new Date()): string => {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

@Injectable()
export class EngagementService {
  constructor(private readonly repository: EngagementRepository) {}

  async getSummary(studentId: string): Promise<EngagementSummaryResponse> {
    const [goalRow, completedToday, activeDates, frozenDates, usedThisMonth, templates] = await Promise.all([
      this.repository.findGoal(studentId),
      this.repository.countLessonsCompletedToday(studentId),
      this.repository.findActiveDates(studentId, STREAK_LOOKBACK_DAYS),
      this.repository.findFrozenDates(studentId, STREAK_LOOKBACK_DAYS),
      this.repository.countFreezesThisMonth(studentId),
      this.repository.findActiveChallengeTemplates(),
    ]);

    const streakDays = this.computeStreakDays(activeDates, frozenDates);

    const goal: DailyGoalSummary = {
      targetLessons: goalRow?.daily_goal_lessons ?? DEFAULT_DAILY_GOAL_LESSONS,
      completedToday,
      streakDays,
    };

    const challenge = this.selectChallenge(studentId, templates, completedToday, streakDays);

    return { goal, challenge, streakFreeze: this.freezeSummary(activeDates, frozenDates, usedThisMonth) };
  }

  /**
   * Cover yesterday with a freeze so the streak survives. Only allowed when yesterday was missed, the day before
   * it was part of the streak, and this month's allowance is not used up. Returns the fresh summary.
   */
  async useStreakFreeze(studentId: string): Promise<EngagementSummaryResponse> {
    const [activeDates, frozenDates, usedThisMonth] = await Promise.all([
      this.repository.findActiveDates(studentId, STREAK_LOOKBACK_DAYS),
      this.repository.findFrozenDates(studentId, STREAK_LOOKBACK_DAYS),
      this.repository.countFreezesThisMonth(studentId),
    ]);
    const info = this.freezeSummary(activeDates, frozenDates, usedThisMonth);
    if (!info.atRisk) {
      throw new BadRequestException({ code: 'STREAK_FREEZE_NOT_NEEDED', message: 'Your streak is not at risk right now.' });
    }
    if (!info.canUseNow) {
      throw new ConflictException({ code: 'STREAK_FREEZE_ALLOWANCE_USED', message: 'You have used all your streak freezes this month.' });
    }
    const inserted = await this.repository.insertFreezeIfAllowed(studentId, dayStr(-1), STREAK_FREEZES_PER_MONTH);
    if (!inserted) {
      // Lost a race with another tap/tab: allowance gone or the day is already frozen. The summary below is the truth.
      const fresh = await this.getSummary(studentId);
      if (fresh.streakFreeze.atRisk) {
        throw new ConflictException({ code: 'STREAK_FREEZE_ALLOWANCE_USED', message: 'You have used all your streak freezes this month.' });
      }
      return fresh;
    }
    return this.getSummary(studentId);
  }

  private freezeSummary(activeDates: readonly string[], frozenDates: readonly string[], usedThisMonth: number): StreakFreezeSummary {
    const covered = new Set([...activeDates, ...frozenDates]);
    const remaining = Math.max(0, STREAK_FREEZES_PER_MONTH - usedThisMonth);
    // Yesterday was missed, but the day before it was part of a streak: that streak can still be saved.
    const atRisk = !covered.has(dayStr(-1)) && covered.has(dayStr(-2));
    return { allowance: STREAK_FREEZES_PER_MONTH, usedThisMonth, remaining, atRisk, canUseNow: atRisk && remaining > 0 };
  }

  async updateGoal(studentId: string, dailyGoalLessons: number): Promise<DailyGoalSummary> {
    const safeTarget = Math.min(Math.max(Math.round(dailyGoalLessons), 1), 20);
    const goalRow = await this.repository.upsertGoal(studentId, safeTarget);
    const [completedToday, activeDates, frozenDates] = await Promise.all([
      this.repository.countLessonsCompletedToday(studentId),
      this.repository.findActiveDates(studentId, STREAK_LOOKBACK_DAYS),
      this.repository.findFrozenDates(studentId, STREAK_LOOKBACK_DAYS),
    ]);

    return {
      targetLessons: goalRow.daily_goal_lessons,
      completedToday,
      streakDays: this.computeStreakDays(activeDates, frozenDates),
    };
  }

  /**
   * Level/XP/badge/rank/weekly-activity stats for the mobile Home screen's
   * hero card. Every field is computed here from real lesson_progress +
   * lessons.xp_value + student_achievements + xp_levels data — none of it
   * is fabricated, and Flutter never recomputes any of it.
   */
  async getStats(studentId: string): Promise<EngagementStatsResponse> {
    const [totalXp, xpToday, xpLastWeek, levels, badgeCount, rankPct, weeklyRows] =
      await Promise.all([
        this.repository.sumTotalXp(studentId),
        this.repository.sumXpToday(studentId),
        this.repository.sumXpLastWeek(studentId),
        this.repository.findXpLevels(),
        this.repository.countUnlockedBadges(studentId),
        this.repository.findRankPercentile(studentId),
        this.repository.findWeeklyXp(studentId),
      ]);

    const { level, nextLevel, currentLevelMinXp, nextLevelMinXp, levelProgressPercent } =
      this.computeLevel(totalXp, levels);

    const weeklyActivity: WeeklyActivityDay[] = weeklyRows.map((row) => ({
      date: row.day,
      xp: row.xp,
    }));
    const weeklyTotal = weeklyActivity.reduce((sum, day) => sum + day.xp, 0);
    const weeklyDeltaPercent =
      xpLastWeek === 0 ? null : Math.round(((weeklyTotal - xpLastWeek) / xpLastWeek) * 100);

    // PERCENT_RANK returns 0 for the best student; convert to a 1-100
    // "Top N%" label, never 0.
    const rankPercentile = rankPct === null ? 100 : Math.max(1, Math.round(rankPct * 100));

    return {
      totalXp,
      xpToday,
      level,
      nextLevel,
      currentLevelMinXp,
      nextLevelMinXp,
      levelProgressPercent,
      badgeCount,
      rankPercentile,
      weeklyActivity,
      weeklyDeltaPercent,
    };
  }

  private computeLevel(
    totalXp: number,
    levels: readonly { level: number; min_xp: number }[],
  ): {
    level: number;
    nextLevel: number | null;
    currentLevelMinXp: number;
    nextLevelMinXp: number | null;
    levelProgressPercent: number;
  } {
    if (levels.length === 0) {
      return {
        level: 1,
        nextLevel: null,
        currentLevelMinXp: 0,
        nextLevelMinXp: null,
        levelProgressPercent: 0,
      };
    }

    const sorted = [...levels].sort((a, b) => a.level - b.level);
    let currentIndex = 0;
    for (let i = 0; i < sorted.length; i += 1) {
      if (sorted[i].min_xp <= totalXp) {
        currentIndex = i;
      } else {
        break;
      }
    }

    const current = sorted[currentIndex];
    const next = sorted[currentIndex + 1] ?? null;

    const levelProgressPercent = next
      ? Math.round(((totalXp - current.min_xp) / (next.min_xp - current.min_xp)) * 100)
      : 100;

    return {
      level: current.level,
      nextLevel: next?.level ?? null,
      currentLevelMinXp: current.min_xp,
      nextLevelMinXp: next?.min_xp ?? null,
      levelProgressPercent,
    };
  }

  /**
   * Consecutive days ending today (or yesterday, if today is not done yet). A frozen day keeps the chain
   * unbroken but does not add to the count.
   */
  private computeStreakDays(activeDatesDesc: readonly string[], frozenDates: readonly string[] = []): number {
    const active = new Set(activeDatesDesc);
    const chain = new Set([...activeDatesDesc, ...frozenDates]);
    if (active.size === 0) {
      return 0;
    }

    const todayStr = dayStr(0);
    const yesterdayStr = dayStr(-1);
    let cursorDate: Date;
    if (chain.has(todayStr)) {
      cursorDate = new Date(todayStr);
    } else if (chain.has(yesterdayStr)) {
      cursorDate = new Date(yesterdayStr);
    } else {
      return 0;
    }

    let streak = 0;
    for (;;) {
      const key = cursorDate.toISOString().slice(0, 10);
      if (!chain.has(key)) break;
      if (active.has(key)) streak += 1;
      cursorDate.setUTCDate(cursorDate.getUTCDate() - 1);
    }

    return streak;
  }

  private selectChallenge(
    studentId: string,
    templates: readonly {
      key: string;
      title: string;
      description: string;
      challenge_type: 'lessons' | 'streak';
      target_count: number;
    }[],
    completedToday: number,
    streakDays: number,
  ): DailyChallengeSummary | null {
    if (templates.length === 0) {
      return null;
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const index = this.hashToIndex(`${studentId}:${todayKey}`, templates.length);
    const template = templates[index];

    const progressCount = template.challenge_type === 'streak' ? (streakDays > 0 ? 1 : 0) : completedToday;
    const completed = progressCount >= template.target_count;

    return {
      key: template.key,
      title: template.title,
      description: template.description,
      targetCount: template.target_count,
      progressCount: Math.min(progressCount, template.target_count),
      completed,
    };
  }

  private hashToIndex(value: string, modulus: number): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash % modulus;
  }
}
