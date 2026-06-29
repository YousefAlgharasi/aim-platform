// HomeEngagementGoalModel / HomeDailyChallengeModel — data-layer models.
//
// Parses GET /student/engagement/summary.
// Backend is the sole authority for goal/streak/challenge values.

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
