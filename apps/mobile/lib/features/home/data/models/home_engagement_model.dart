// HomeEngagementGoalModel / HomeDailyChallengeModel / HomeEngagementStatsModel
// — data-layer models.
//
// Parses GET /student/engagement/summary and GET /student/engagement/stats.
// Backend is the sole authority for goal/streak/challenge/level/XP/rank
// values.

import '../../logic/entity/home_engagement.dart';

class HomeEngagementGoalModel extends HomeEngagementGoal {
  const HomeEngagementGoalModel({
    required super.targetLessons,
    required super.completedToday,
    required super.streakDays,
  });

  factory HomeEngagementGoalModel.fromJson(Map<String, dynamic> json) {
    return HomeEngagementGoalModel(
      targetLessons: (json['targetLessons'] as num).toInt(),
      completedToday: (json['completedToday'] as num).toInt(),
      streakDays: (json['streakDays'] as num).toInt(),
    );
  }
}

class HomeDailyChallengeModel extends HomeDailyChallenge {
  const HomeDailyChallengeModel({
    required super.key,
    required super.title,
    required super.description,
    required super.targetCount,
    required super.progressCount,
    required super.completed,
  });

  factory HomeDailyChallengeModel.fromJson(Map<String, dynamic> json) {
    return HomeDailyChallengeModel(
      key: json['key'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      targetCount: (json['targetCount'] as num).toInt(),
      progressCount: (json['progressCount'] as num).toInt(),
      completed: json['completed'] as bool,
    );
  }
}

class HomeWeeklyActivityDayModel extends HomeWeeklyActivityDay {
  const HomeWeeklyActivityDayModel({required super.date, required super.xp});

  factory HomeWeeklyActivityDayModel.fromJson(Map<String, dynamic> json) {
    return HomeWeeklyActivityDayModel(
      date: json['date'] as String,
      xp: (json['xp'] as num).toInt(),
    );
  }
}

class HomeEngagementStatsModel extends HomeEngagementStats {
  const HomeEngagementStatsModel({
    required super.totalXp,
    required super.xpToday,
    required super.level,
    required super.currentLevelMinXp,
    required super.levelProgressPercent,
    required super.badgeCount,
    required super.rankPercentile,
    required super.weeklyActivity,
    super.nextLevel,
    super.nextLevelMinXp,
    super.weeklyDeltaPercent,
  });

  factory HomeEngagementStatsModel.fromJson(Map<String, dynamic> json) {
    final weeklyActivityJson = json['weeklyActivity'] as List<dynamic>? ?? [];
    return HomeEngagementStatsModel(
      totalXp: (json['totalXp'] as num).toInt(),
      xpToday: (json['xpToday'] as num).toInt(),
      level: (json['level'] as num).toInt(),
      nextLevel: (json['nextLevel'] as num?)?.toInt(),
      currentLevelMinXp: (json['currentLevelMinXp'] as num).toInt(),
      nextLevelMinXp: (json['nextLevelMinXp'] as num?)?.toInt(),
      levelProgressPercent: (json['levelProgressPercent'] as num).toInt(),
      badgeCount: (json['badgeCount'] as num).toInt(),
      rankPercentile: (json['rankPercentile'] as num).toInt(),
      weeklyActivity: weeklyActivityJson
          .whereType<Map<String, dynamic>>()
          .map(HomeWeeklyActivityDayModel.fromJson)
          .toList(),
      weeklyDeltaPercent: (json['weeklyDeltaPercent'] as num?)?.toInt(),
    );
  }
}
