// HomeEngagementGoal / HomeDailyChallenge — domain entities for the
// "Goal" and "Daily Challenge" Home screen sections.
//
// All values (targetLessons, completedToday, streakDays, progressCount,
// completed) are backend-computed. Flutter never computes streaks, goal
// progress, or challenge completion locally.

class HomeEngagementGoal {
  const HomeEngagementGoal({
    required this.targetLessons,
    required this.completedToday,
    required this.streakDays,
  });

  final int targetLessons;
  final int completedToday;
  final int streakDays;
}

class HomeDailyChallenge {
  const HomeDailyChallenge({
    required this.key,
    required this.title,
    required this.description,
    required this.targetCount,
    required this.progressCount,
    required this.completed,
  });

  final String key;
  final String title;
  final String description;
  final int targetCount;
  final int progressCount;
  final bool completed;
}

/// One day's XP total in [HomeEngagementStats.weeklyActivity].
class HomeWeeklyActivityDay {
  const HomeWeeklyActivityDay({required this.date, required this.xp});

  /// ISO date (yyyy-mm-dd), UTC.
  final String date;
  final int xp;
}

/// Level/XP/badge/rank/weekly-activity stats for the Home hero card.
///
/// Every field is backend-computed from real lesson_progress + xp_levels +
/// student_achievements data (GET /student/engagement/stats). Flutter never
/// computes level, XP, rank, or weekly totals locally.
class HomeEngagementStats {
  const HomeEngagementStats({
    required this.totalXp,
    required this.xpToday,
    required this.level,
    required this.currentLevelMinXp,
    required this.levelProgressPercent,
    required this.badgeCount,
    required this.rankPercentile,
    required this.weeklyActivity,
    this.nextLevel,
    this.nextLevelMinXp,
    this.weeklyDeltaPercent,
  });

  final int totalXp;
  final int xpToday;

  final int level;
  /// Null when the student is already at the highest seeded level.
  final int? nextLevel;
  final int currentLevelMinXp;
  final int? nextLevelMinXp;
  /// 0-100.
  final int levelProgressPercent;

  final int badgeCount;

  /// 1-100. Lower is better (1 = top 1%).
  final int rankPercentile;

  /// Monday through Sunday of the current UTC week.
  final List<HomeWeeklyActivityDay> weeklyActivity;
  /// Null when there's no meaningful comparison (last week had 0 XP).
  final int? weeklyDeltaPercent;
}
