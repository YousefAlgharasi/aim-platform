// Phase 6 — P6-057
// HomeRepository — abstract interface (logic layer).
//
// Scope: Home screen only.
//
// Security rules:
// - Flutter never calculates mastery, band, severity, priority, action, or
//   reason. All AIM values come from the backend verbatim.
// - studentId is resolved from the JWT on the backend — passed as a URL path
//   parameter sourced from authContextProvider, never from user input.
// - Bearer token is passed from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.

import 'package:aim_mobile/features/home/logic/entity/home_continue_learning.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/features/home/logic/entity/home_quick_start_lesson.dart';
import 'package:aim_mobile/features/home/logic/entity/home_recommendation.dart';
import 'package:aim_mobile/features/home/logic/entity/home_recommended_course.dart';
import 'package:aim_mobile/features/home/logic/entity/home_review_schedule.dart';
import 'package:aim_mobile/features/home/logic/entity/home_skill_state.dart';
import 'package:aim_mobile/features/home/logic/entity/home_weakness_record.dart';

abstract class HomeRepository {
  /// Fetch AIM skill state summary cards.
  /// All [band] and [masteryLevel] values are backend-computed.
  Future<List<HomeSkillState>> getSkillStates({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch weakness strip entries.
  /// [severity] is backend-computed.
  Future<List<HomeWeaknessRecord>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch review schedule reminders.
  /// [priority] and [dueAt] are backend-computed.
  Future<List<HomeReviewSchedule>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch recommendation cards.
  /// [action] and [reason] are backend-computed; never generated locally.
  Future<List<HomeRecommendation>> getRecommendations({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch the backend-computed daily goal, streak, and today's challenge.
  Future<HomeEngagementSummary> getEngagementSummary({
    required String bearerToken,
  });

  /// Fetch the backend-computed level, XP, badge count, global rank, and
  /// weekly activity for the hero card.
  Future<HomeEngagementStats?> getEngagementStats({
    required String bearerToken,
  });

  /// Fetch the most recently active, incomplete lesson, if any.
  Future<HomeContinueLearning?> getContinueLearning({
    required String bearerToken,
  });

  /// Fetch the next lesson to start, derived from the student's placement result.
  Future<HomeQuickStartLesson?> getQuickStartLesson({
    required String bearerToken,
  });

  /// Fetch the course recommended based on the student's placement result.
  Future<HomeRecommendedCourse?> getRecommendedCourse({
    required String bearerToken,
  });
}
