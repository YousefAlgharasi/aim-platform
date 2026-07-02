// Phase 13 — TASK-13
// AchievementModel — data-layer model for Achievement.
//
// Parses AchievementSummary items from AchievementsResponse
// (GET /student/achievements).

import '../../logic/entity/achievement.dart';

class AchievementModel extends Achievement {
  const AchievementModel({
    required super.key,
    required super.title,
    required super.description,
    required super.icon,
    required super.category,
    required super.unlocked,
    required super.unlockedAt,
  });

  factory AchievementModel.fromJson(Map<String, dynamic> json) {
    return AchievementModel(
      key: json['key'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      icon: json['icon'] as String,
      category: json['category'] as String,
      unlocked: json['unlocked'] as bool,
      unlockedAt: json['unlockedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'key': key,
        'title': title,
        'description': description,
        'icon': icon,
        'category': category,
        'unlocked': unlocked,
        'unlockedAt': unlockedAt,
      };
}
