// EngagementService.
//
// Scope: Backend-owned daily learning goal, streak, and daily challenge
// computation — surfaced on the mobile Home screen.
//
// All progress figures are derived server-side from lesson_progress; the
// client never submits or computes streak/goal/challenge progress itself.

import { Injectable } from '@nestjs/common';
import { EngagementRepository } from './engagement.repository';
import {
  DailyChallengeSummary,
  DailyGoalSummary,
  EngagementStatsResponse,
  EngagementSummaryResponse,
  WeeklyActivityDay,
} from './engagement.types';

const DEFAULT_DAILY_GOAL_LESSONS = 1;
const STREAK_LOOKBACK_DAYS = 60;

@Injectable()
export class EngagementService {
  constructor(private readonly repository: EngagementRepository) {}

  async getSummary(studentId: string): Promise<EngagementSummaryResponse> {
    const [goalRow, completedToday, activeDates, templates] = await Promise.all([
      this.repository.findGoal(studentId),
      this.repository.countLessonsCompletedToday(studentId),
      this.repository.findActiveDates(studentId, STREAK_LOOKBACK_DAYS),
      this.repository.findActiveChallengeTemplates(),
    ]);

    const streakDays = this.computeStreakDays(activeDates);

    const goal: DailyGoalSummary = {
      targetLessons: goalRow?.daily_goal_lessons ?? DEFAULT_DAILY_GOAL_LESSONS,
      completedToday,
      streakDays,
    };

    const challenge = this.selectChallenge(studentId, templates, completedToday, streakDays);

    return { goal, challenge };
  }

  async updateGoal(studentId: string, dailyGoalLessons: number): Promise<DailyGoalSummary> {
    const safeTarget = Math.min(Math.max(Math.round(dailyGoalLessons), 1), 20);
    const goalRow = await this.repository.upsertGoal(studentId, safeTarget);
    const [completedToday, activeDates] = await Promise.all([
      this.repository.countLessonsCompletedToday(studentId),
      this.repository.findActiveDates(studentId, STREAK_LOOKBACK_DAYS),
    ]);

    return {
      targetLessons: goalRow.daily_goal_lessons,
      completedToday,
      streakDays: this.computeStreakDays(activeDates),
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

  private computeStreakDays(activeDatesDesc: readonly string[]): number {
    if (activeDatesDesc.length === 0) {
      return 0;
    }

    const activeDateSet = new Set(activeDatesDesc);
    const todayUtc = new Date(new Date().toISOString().slice(0, 10));

    let streak = 0;
    const cursor = new Date(todayUtc);

    while (activeDateSet.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
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
