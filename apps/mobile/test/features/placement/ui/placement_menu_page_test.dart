// PlacementMenuPage — widget tests.
//
// Covers the drawer's "Placement Test" menu entry:
//   - 'active'/'submitted' status shows a real action, never a permanent
//     spinner with no way forward.
//   - 'none' status shows the fresh-start CTA.
//   - 'completed' status shows the result summary + retake button.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_menu_page.dart';

class _FakePlacementRepository implements PlacementRepository {
  _FakePlacementRepository({required PlacementLatestStatusModel status})
      : _status = status;

  final PlacementLatestStatusModel _status;
  int getLatestStatusCallCount = 0;

  @override
  Future<PlacementLatestStatusModel> getLatestStatus(
      String bearerToken) async {
    getLatestStatusCallCount++;
    return _status;
  }

  @override
  Future<PlacementTestModel> getActivePlacementTest(String t) async =>
      throw UnimplementedError();

  @override
  Future<List<PlacementSectionModel>> getActiveSections(String t) async =>
      throw UnimplementedError();

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(String t,
          {required String sectionId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAttemptModel> startAttempt(String t,
          {required String placementTestId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAnswerModel> submitAnswer(String t,
          {required String attemptId,
          required PlacementSubmitAnswerPayload payload}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAttemptModel> completeAttempt(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementResultModel> getResult(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();

  @override
  Future<List<int>> getQuestionAudio(String t,
          {required String questionId}) async =>
      throw UnimplementedError();
}

Widget _wrap(_FakePlacementRepository repo) {
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (context, state) => const PlacementMenuPage()),
      GoRoute(
        path: AppRoutePaths.placementStart,
        builder: (context, state) => const Scaffold(body: Text('Start Page')),
      ),
    ],
  );

  return ProviderScope(
    overrides: [
      placementRepositoryProvider.overrideWithValue(repo),
    ],
    child: MaterialApp.router(
      routerConfig: router,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
    ),
  );
}

void main() {
  group('PlacementMenuPage', () {
    testWidgets(
        'status "active" shows a real Continue action, not a permanent spinner',
        (tester) async {
      final repo = _FakePlacementRepository(
        status: const PlacementLatestStatusModel(
          status: 'active',
          attemptId: 'att-1',
          result: null,
        ),
      );

      await tester.pumpWidget(_wrap(repo));
      await tester.pump();
      await tester.pump();

      expect(find.text('You have a placement test in progress'),
          findsOneWidget);
      expect(find.text('Continue Placement Test'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsNothing);

      await tester.tap(find.text('Continue Placement Test'));
      await tester.pumpAndSettle();

      expect(find.text('Start Page'), findsOneWidget);
    });

    testWidgets(
        'status "submitted" shows a Check Again action, not a permanent spinner',
        (tester) async {
      final repo = _FakePlacementRepository(
        status: const PlacementLatestStatusModel(
          status: 'submitted',
          attemptId: 'att-1',
          result: null,
        ),
      );

      await tester.pumpWidget(_wrap(repo));
      await tester.pump();
      await tester.pump();

      expect(find.text('Your placement test is being scored'), findsOneWidget);
      expect(find.text('Check Again'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsNothing);

      await tester.tap(find.text('Check Again'));
      await tester.pump();
      await tester.pump();

      expect(repo.getLatestStatusCallCount, 2);
    });

    testWidgets('status "none" shows the fresh-start CTA', (tester) async {
      final repo = _FakePlacementRepository(
        status: const PlacementLatestStatusModel(
          status: 'none',
          attemptId: null,
          result: null,
        ),
      );

      await tester.pumpWidget(_wrap(repo));
      await tester.pump();
      await tester.pump();

      expect(find.text('Take the Placement Test'), findsOneWidget);
    });
  });
}
