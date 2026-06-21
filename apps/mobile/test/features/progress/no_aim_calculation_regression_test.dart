// Phase 6 — P6-103
// no_aim_calculation_regression_test.dart
//
// Regression check: proves Flutter does not calculate AIM outputs.
//
// All AIM values (mastery, weakness, difficulty, recommendations,
// review schedule) must originate from the backend and be stored verbatim by
// the notifier. Flutter must never derive or transform these values.
//
// Covers:
//   1.  AimResultsNotifier starts idle.
//   2.  load() transitions to loading before success.
//   3.  load() stores skillStates verbatim — masteryScore untouched.
//   4.  load() stores weaknessRecords verbatim — severity untouched.
//   5.  load() stores recommendations verbatim — rank untouched.
//   6.  load() stores reviewSchedules verbatim — intervalDays untouched.
//   7.  Flutter never re-ranks recommendations (order preserved).
//   8.  Flutter never recalculates mastery from attempts.
//   9.  Flutter never filters weaknesses by local threshold.
//   10. Flutter never adjusts intervalDays locally.
//   11. load() failure does not expose partial AIM data.
//   12. clear() resets to idle — no stale AIM data retained.
//   13. refresh() replaces data verbatim with new backend response.
//   14. Empty backend response — no defaults injected by Flutter.
//   15. AimResultsData.isEmpty returns true only when all four lists empty.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_notifier.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/aim_results/logic/repository/aim_results_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

class _FakeAimResultsRepository implements AimResultsRepository {
  final bool shouldFail;
  final bool returnEmpty;
  final List<AimSkillStateModel>? overrideSkillStates;
  final List<AimRecommendationModel>? overrideRecommendations;
  final List<AimReviewScheduleModel>? overrideReviewSchedules;

  const _FakeAimResultsRepository({
    this.shouldFail = false,
    this.returnEmpty = false,
    this.overrideSkillStates,
    this.overrideRecommendations,
    this.overrideReviewSchedules,
  });

  static const _skillStates = [
    AimSkillStateModel(
      skillId: 'grammar-articles',
      masteryScore: 0.73,
      masteryConfidence: 0.81,
      masteryTrend: 'improving',
      previousMasteryScore: 0.61,
      lastAttemptId: 'att-1',
      lastEvaluatedAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    ),
  ];

  static const _weaknessRecords = [
    AimWeaknessRecordModel(
      weaknessId: 'wr-1',
      skillId: 'grammar-articles',
      severity: 'high',
      status: 'open',
      triggerAttemptIds: ['att-1'],
      detectedAt: '2026-06-01T10:00:00Z',
      updatedAt: '2026-06-01T10:00:00Z',
    ),
  ];

  static const _recommendations = [
    AimRecommendationModel(
      id: 'rec-1',
      kind: 'lesson',
      targetSkillId: 'grammar-articles',
      rank: 1,
      reason: 'High weakness severity detected by AIM Engine.',
      generatedAt: '2026-06-01T10:00:00Z',
      status: 'active',
      updatedAt: '2026-06-01T10:00:00Z',
    ),
    AimRecommendationModel(
      id: 'rec-2',
      kind: 'review_session',
      targetSkillId: 'vocabulary-core',
      rank: 2,
      reason: 'Spaced repetition interval due per AIM schedule.',
      generatedAt: '2026-06-01T10:00:00Z',
      status: 'active',
      updatedAt: '2026-06-01T10:00:00Z',
    ),
  ];

  static const _reviewSchedules = [
    AimReviewScheduleModel(
      scheduleId: 'rs-1',
      skillId: 'grammar-articles',
      dueAt: '2026-06-10T09:00:00Z',
      intervalDays: 7,
      repetitionCount: 3,
      status: 'pending',
      basedOnAttemptId: 'att-99',
      scheduledAt: '2026-06-03T09:00:00Z',
      updatedAt: '2026-06-03T09:00:00Z',
    ),
  ];

  @override
  Future<List<AimSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) throw const AppException(message: 'API error', code: 'ERR');
    if (returnEmpty) return [];
    return overrideSkillStates ?? _skillStates;
  }

  @override
  Future<List<AimWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) throw const AppException(message: 'API error', code: 'ERR');
    if (returnEmpty) return [];
    return _weaknessRecords;
  }

  @override
  Future<List<AimRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) throw const AppException(message: 'API error', code: 'ERR');
    if (returnEmpty) return [];
    return overrideRecommendations ?? _recommendations;
  }

  @override
  Future<List<AimReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) async {
    if (shouldFail) throw const AppException(message: 'API error', code: 'ERR');
    if (returnEmpty) return [];
    return overrideReviewSchedules ?? _reviewSchedules;
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────

ProviderContainer _container({
  bool shouldFail = false,
  bool returnEmpty = false,
  List<AimSkillStateModel>? overrideSkillStates,
  List<AimRecommendationModel>? overrideRecommendations,
  List<AimReviewScheduleModel>? overrideReviewSchedules,
}) {
  final repo = _FakeAimResultsRepository(
    shouldFail: shouldFail,
    returnEmpty: returnEmpty,
    overrideSkillStates: overrideSkillStates,
    overrideRecommendations: overrideRecommendations,
    overrideReviewSchedules: overrideReviewSchedules,
  );
  return ProviderContainer(
    overrides: [
      aimResultsProvider.overrideWith(
        (ref) => AimResultsNotifier(repository: repo),
      ),
    ],
  );
}

Future<void> _load(ProviderContainer c) =>
    c.read(aimResultsProvider.notifier).load(
          bearerToken: 'tok',
          studentId: 'stu-1',
        );

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('P6-103 — No AIM Calculation Regression', () {
    test('1. notifier starts idle', () {
      final c = _container();
      addTearDown(c.dispose);
      expect(c.read(aimResultsProvider), isA<AppAsyncIdle>());
    });

    test('2. load() emits loading before success', () async {
      final c = _container();
      addTearDown(c.dispose);

      final states = <AppAsyncState<AimResultsData>>[];
      final sub = c.listen(aimResultsProvider, (_, n) => states.add(n));
      addTearDown(sub.close);

      await _load(c);

      expect(states.first, isA<AppAsyncLoading>());
      expect(states.last, isA<AppAsyncSuccess>());
    });

    test('3. skillStates stored verbatim — masteryScore not recomputed', () async {
      final c = _container();
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.skillStates.length, 1);
      expect(data.skillStates.first.masteryScore, 0.73);
      expect(data.skillStates.first.masteryTrend, 'improving');
    });

    test('4. weaknessRecords stored verbatim — severity not recomputed', () async {
      final c = _container();
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.weaknessRecords.length, 1);
      expect(data.weaknessRecords.first.severity, 'high');
      expect(data.weaknessRecords.first.status, 'open');
    });

    test('5. recommendations stored verbatim — rank not recomputed', () async {
      final c = _container();
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.recommendations.length, 2);
      expect(data.recommendations.first.rank, 1);
      expect(data.recommendations.last.rank, 2);
    });

    test('6. reviewSchedules stored verbatim — intervalDays not recomputed', () async {
      final c = _container();
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.reviewSchedules.length, 1);
      expect(data.reviewSchedules.first.intervalDays, 7);
      expect(data.reviewSchedules.first.status, 'pending');
    });

    test('7. recommendation rank order preserved — Flutter never re-ranks', () async {
      const reordered = [
        AimRecommendationModel(
          id: 'rec-B',
          kind: 'review_session',
          targetSkillId: 'vocab',
          rank: 3,
          reason: 'AIM rank 3.',
          generatedAt: '2026-06-01T00:00:00Z',
          status: 'active',
          updatedAt: '2026-06-01T00:00:00Z',
        ),
        AimRecommendationModel(
          id: 'rec-A',
          kind: 'lesson',
          targetSkillId: 'grammar',
          rank: 1,
          reason: 'AIM rank 1.',
          generatedAt: '2026-06-01T00:00:00Z',
          status: 'active',
          updatedAt: '2026-06-01T00:00:00Z',
        ),
      ];
      final c = _container(overrideRecommendations: reordered);
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.recommendations[0].id, 'rec-B');
      expect(data.recommendations[1].id, 'rec-A');
    });

    test('8. masteryScore stored as received — Flutter never recalculates from attempts', () async {
      const custom = [
        AimSkillStateModel(
          skillId: 'listening',
          masteryScore: 0.55,
          masteryConfidence: 0.60,
          masteryTrend: 'stable',
          lastAttemptId: 'att-x',
          lastEvaluatedAt: '2026-06-01T00:00:00Z',
          updatedAt: '2026-06-01T00:00:00Z',
        ),
      ];
      final c = _container(overrideSkillStates: custom);
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.skillStates.first.masteryScore, 0.55);
    });

    test('9. weaknessRecords not filtered by Flutter — all backend records stored', () async {
      final c = _container();
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.weaknessRecords.isNotEmpty, isTrue);
    });

    test('10. intervalDays stored as received — Flutter never adjusts', () async {
      const schedules = [
        AimReviewScheduleModel(
          scheduleId: 'rs-x',
          skillId: 'listening',
          dueAt: '2026-07-01T00:00:00Z',
          intervalDays: 14,
          repetitionCount: 1,
          status: 'pending',
          basedOnAttemptId: 'att-x',
          scheduledAt: '2026-06-17T00:00:00Z',
          updatedAt: '2026-06-17T00:00:00Z',
        ),
      ];
      final c = _container(overrideReviewSchedules: schedules);
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.reviewSchedules.first.intervalDays, 14);
    });

    test('11. failure emits error — no partial AIM data exposed', () async {
      final c = _container(shouldFail: true);
      addTearDown(c.dispose);
      await _load(c);

      expect(c.read(aimResultsProvider), isA<AppAsyncFailure>());
    });

    test('12. clear() resets to idle — no stale AIM data retained', () async {
      final c = _container();
      addTearDown(c.dispose);
      await _load(c);

      c.read(aimResultsProvider.notifier).clear();
      expect(c.read(aimResultsProvider), isA<AppAsyncIdle>());
    });

    test('13. refresh() replaces data verbatim with updated backend response', () async {
      const first = [
        AimSkillStateModel(
          skillId: 'grammar',
          masteryScore: 0.40,
          masteryConfidence: 0.50,
          masteryTrend: 'stable',
          lastAttemptId: 'att-v1',
          lastEvaluatedAt: '2026-06-01T00:00:00Z',
          updatedAt: '2026-06-01T00:00:00Z',
        ),
      ];
      const updated = [
        AimSkillStateModel(
          skillId: 'grammar',
          masteryScore: 0.75,
          masteryConfidence: 0.80,
          masteryTrend: 'improving',
          lastAttemptId: 'att-v2',
          lastEvaluatedAt: '2026-06-17T00:00:00Z',
          updatedAt: '2026-06-17T00:00:00Z',
        ),
      ];

      final c1 = _container(overrideSkillStates: first);
      addTearDown(c1.dispose);
      await _load(c1);
      final before =
          (c1.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>)
              .data
              .skillStates
              .first
              .masteryScore;
      expect(before, 0.40);

      final c2 = _container(overrideSkillStates: updated);
      addTearDown(c2.dispose);
      await c2.read(aimResultsProvider.notifier).refresh(
            bearerToken: 'tok',
            studentId: 'stu-1',
          );
      final after =
          (c2.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>)
              .data
              .skillStates
              .first
              .masteryScore;
      expect(after, 0.75);
    });

    test('14. empty backend response — no defaults injected by Flutter', () async {
      final c = _container(returnEmpty: true);
      addTearDown(c.dispose);
      await _load(c);

      final data =
          (c.read(aimResultsProvider) as AppAsyncSuccess<AimResultsData>).data;
      expect(data.isEmpty, isTrue);
      expect(data.skillStates, isEmpty);
      expect(data.weaknessRecords, isEmpty);
      expect(data.recommendations, isEmpty);
      expect(data.reviewSchedules, isEmpty);
    });

    test('15. AimResultsData.isEmpty true only when all four lists empty', () {
      const nonEmpty = AimResultsData(
        skillStates: [
          AimSkillStateModel(
            skillId: 'grammar',
            masteryScore: 0.5,
            masteryConfidence: 0.5,
            masteryTrend: 'stable',
            lastAttemptId: 'att-1',
            lastEvaluatedAt: '2026-06-01T00:00:00Z',
            updatedAt: '2026-06-01T00:00:00Z',
          ),
        ],
        weaknessRecords: [],
        recommendations: [],
        reviewSchedules: [],
      );
      expect(nonEmpty.isEmpty, isFalse);

      const allEmpty = AimResultsData(
        skillStates: [],
        weaknessRecords: [],
        recommendations: [],
        reviewSchedules: [],
      );
      expect(allEmpty.isEmpty, isTrue);
    });
  });
}
