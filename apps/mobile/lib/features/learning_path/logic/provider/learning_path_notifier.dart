// Phase 6 — P6-067
// LearningPathNotifier.
//
// Scope: Learning path screen only.
//
// Responsibilities:
//   1. Fetch all learning path screen data from the backend in a single load.
//   2. Expose [AppAsyncState<LearningPathData>] to the UI.
//   3. Support refresh (reload).
//
// Security rules:
// - Flutter never calculates band, masteryLevel, coveragePercent, severity,
//   recommendedFocus, action, or reason. All AIM values come from the backend
//   verbatim via LearningPathRepository.
// - studentId is sourced from authContextProvider (JWT-resolved by backend)
//   and passed as a URL path parameter — never from user input.
// - Bearer token is read from authFlowProvider; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';
import 'package:aim_mobile/features/learning_path/logic/entity/learning_path_data.dart';
import 'package:aim_mobile/features/learning_path/logic/repository/learning_path_repository.dart';

class LearningPathNotifier extends AppStateNotifier<LearningPathData> {
  LearningPathNotifier({required LearningPathRepository repository})
      : _repository = repository;

  final LearningPathRepository _repository;

  /// Fetch all learning path screen data for [studentId] using [bearerToken].
  ///
  /// Runs the three backend calls in parallel for speed.
  /// Any failure marks the full state as [AppAsyncFailure].
  ///
  /// [studentId] must come from [authContextProvider] (JWT-resolved).
  /// Never pass a user-supplied value here.
  Future<void> load({
    required String bearerToken,
    required String studentId,
  }) async {
    setLoading();
    try {
      final skillStatesFuture = _repository.getSkillStates(
        bearerToken: bearerToken,
        studentId: studentId,
      );
      final weaknessFuture = _repository.getWeaknessRecords(
        bearerToken: bearerToken,
        studentId: studentId,
      );
      final recommendFuture = _repository.getRecommendations(
        bearerToken: bearerToken,
        studentId: studentId,
      );

      final results = await Future.wait<Object>([
        skillStatesFuture,
        weaknessFuture,
        recommendFuture,
      ]);

      setSuccess(LearningPathData(
        skillStates: results[0] as List<LearningPathSkillStateModel>,
        weaknessRecords: results[1] as List<LearningPathWeaknessRecordModel>,
        recommendations: results[2] as List<LearningPathRecommendationModel>,
      ));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: e is Exception
            ? e.toString()
            : 'Failed to load learning path data',
        code: 'LEARNING_PATH_LOAD_FAILED',
      );
    }
  }

  /// Reload learning path data (alias for [load]).
  Future<void> refresh({
    required String bearerToken,
    required String studentId,
  }) =>
      load(bearerToken: bearerToken, studentId: studentId);

  /// Clear the learning path state (e.g. on sign-out).
  void clear() => reset();
}
