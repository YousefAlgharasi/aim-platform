// Phase 6 — P6-061
// HomeData — aggregated home screen data entity.
//
// Holds all four backend-sourced data sets for the home screen.
// All AIM values (band, masteryLevel, severity, priority, action, reason)
// are backend-computed. Flutter renders them verbatim; no local computation.

import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/features/home/logic/entity/home_quick_start_lesson.dart';
import 'package:aim_mobile/features/home/logic/entity/home_recommended_course.dart';

/// Aggregated home screen data loaded from the backend.
///
/// A single [HomeData] instance drives the entire home page UI.
/// Backend is the sole authority for all AIM values contained within.
class HomeData {
  const HomeData({
    required this.skillStates,
    required this.weaknessRecords,
    required this.reviewSchedules,
    required this.recommendations,
    this.goal,
    this.dailyChallenge,
    this.continueLearning,
    this.quickStartLesson,
    this.recommendedCourse,
    this.engagementStats,
  });

  /// Backend-computed skill state summary cards.
  final List<HomeSkillStateModel> skillStates;

  /// Backend-computed weakness strip entries.
  final List<HomeWeaknessRecordModel> weaknessRecords;

  /// Backend-computed review schedule reminders.
  final List<HomeReviewScheduleModel> reviewSchedules;

  /// Backend-computed recommendation cards.
  /// Never generated or rewritten by Flutter.
  final List<HomeRecommendationModel> recommendations;

  /// Backend-computed daily goal + streak. Null only if the engagement
  /// summary call failed to load (handled separately from the four
  /// required lists above, which fail the whole page on error).
  final HomeEngagementGoalModel? goal;

  /// Backend-selected daily challenge, or null if none is configured.
  final HomeDailyChallengeModel? dailyChallenge;

  /// Most recently active, incomplete lesson, or null if the student has
  /// not started any lesson yet.
  final HomeContinueLearningModel? continueLearning;

  /// Next lesson recommended for the student based on their placement result,
  /// or null if no placement has been taken yet or no published lessons exist.
  final HomeQuickStartLesson? quickStartLesson;

  /// Course recommended for the student based on their placement result,
  /// or null if no placement has been taken yet or no published courses exist.
  final HomeRecommendedCourse? recommendedCourse;

  /// Backend-computed level/XP/badge/rank/weekly-activity stats for the
  /// hero card. Null only if the engagement stats call failed to load
  /// (handled separately, like [goal]/[dailyChallenge], so a failure here
  /// never fails the whole page).
  final HomeEngagementStatsModel? engagementStats;

  /// True when the four core AIM lists and continue-learning are all empty
  /// (backend returned no progress data yet) — drives whether the "getting
  /// started" promo cards are shown in place of those sections. Goal and
  /// daily challenge are intentionally excluded: they always have a value
  /// (with sane defaults) for any student and are rendered independently of
  /// this flag, so a brand-new student still sees their goal/streak.
  bool get isEmpty =>
      skillStates.isEmpty &&
      weaknessRecords.isEmpty &&
      reviewSchedules.isEmpty &&
      recommendations.isEmpty &&
      continueLearning == null;
}
