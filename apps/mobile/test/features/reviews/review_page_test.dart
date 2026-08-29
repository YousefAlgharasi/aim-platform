import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_notifier.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/aim_results/logic/repository/aim_results_repository.dart';
import 'package:aim_mobile/features/reviews/ui/pages/review_page.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class _NoOpAimRepo implements AimResultsRepository {
  @override
  Future<List<AimSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async =>
      [];

  @override
  Future<List<AimWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async =>
      [];

  @override
  Future<List<AimRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async =>
      [];

  @override
  Future<List<AimReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) async =>
      [];
}

class _StubAimNotifier extends AimResultsNotifier {
  _StubAimNotifier(AppAsyncState<AimResultsData> initial)
      : super(repository: _NoOpAimRepo()) {
    state = initial;
  }

  @override
  Future<void> load({
    required String bearerToken,
    required String studentId,
  }) async {}

  @override
  Future<void> refresh({
    required String bearerToken,
    required String studentId,
  }) async {}
}

const _dummySchedule = AimReviewScheduleModel(
  scheduleId: 'rev_1',
  skillId: 'skill:vocab:greetings',
  status: 'due',
  dueAt: '2026-08-30T12:00:00Z',
  scheduledAt: '2026-08-25T12:00:00Z',
  intervalDays: 2.0,
  repetitionCount: 3,
  basedOnAttemptId: 'att_1',
  updatedAt: '2026-08-25T12:00:00Z',
);

const _populatedData = AimResultsData(
  skillStates: [],
  weaknessRecords: [],
  reviewSchedules: [_dummySchedule],
  recommendations: [],
);

Widget _buildTestWidget({
  required AppAsyncState<AimResultsData> state,
  Locale? locale,
}) {
  return ProviderScope(
    overrides: [
      aimResultsProvider.overrideWith((ref) => _StubAimNotifier(state)),
    ],
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const ReviewPage(),
    ),
  );
}

void main() {
  group('ReviewPage Widget Tests', () {
    testWidgets('renders loading state', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(state: const AppAsyncLoading()),
      );
      await tester.pump();

      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
    });

    testWidgets('renders error state', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          state: const AppAsyncFailure(message: 'Network error'),
        ),
      );
      await tester.pump();

      expect(find.byType(AIMFullScreenError), findsOneWidget);
      expect(find.text('Network error'), findsOneWidget);
    });

    testWidgets('renders empty state in English', (tester) async {
      const emptyData = AimResultsData(
        skillStates: [],
        weaknessRecords: [],
        reviewSchedules: [],
        recommendations: [],
      );

      await tester.pumpWidget(
        _buildTestWidget(
          state: const AppAsyncSuccess(emptyData),
          locale: const Locale('en'),
        ),
      );
      await tester.pump();

      expect(find.byType(AIMEmptyState), findsOneWidget);
      expect(find.text('No reviews scheduled'), findsOneWidget);
    });

    testWidgets('renders populated review cards in English', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          state: const AppAsyncSuccess(_populatedData),
          locale: const Locale('en'),
        ),
      );
      await tester.pump();

      expect(find.text('Review'), findsOneWidget);
      expect(find.text('Due now'), findsOneWidget);
      expect(find.text('Learned'), findsOneWidget);
      expect(find.text('Streak'), findsOneWidget);
      expect(find.text('Start Review Session'), findsOneWidget);
      expect(find.text('Greetings'), findsOneWidget);
      expect(find.text('Interval 2d'), findsOneWidget);
      expect(find.text('rep #3'), findsOneWidget);
    });

    testWidgets('renders in Arabic RTL with translations', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          state: const AppAsyncSuccess(_populatedData),
          locale: const Locale('ar'),
        ),
      );
      await tester.pump();

      expect(find.text('المراجعة'), findsOneWidget);
      expect(find.text('مستحقة الآن'), findsOneWidget);
      expect(find.text('تم تعلمها'), findsOneWidget);
      expect(find.text('التتابع'), findsOneWidget);
      expect(find.text('بدء جلسة المراجعة'), findsOneWidget);
      expect(find.text('الفاصل 2 يوم'), findsOneWidget);
      expect(find.text('تكرار #3'), findsOneWidget);
    });
  });
}
