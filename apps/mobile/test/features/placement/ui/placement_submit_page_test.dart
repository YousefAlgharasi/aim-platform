// Phase 6 — P6-056
// placement_submit_page_test.dart — widget tests for PlacementSubmitPage.
//
// Drives the real PlacementSubmitNotifier through a fake PlacementRepository.
//
// Covers:
//   1. Idle/confirm state renders the summary and submit button.
//   2. Tapping submit shows AIMFullScreenLoading while completeAttempt runs.
//   3. Backend failure renders AIMFullScreenError with a retry action.
//   4. RTL layout does not throw; key content still renders.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_submit_page.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

class _FakePlacementRepository implements PlacementRepository {
  final Exception? _completeError;
  final Completer<PlacementAttemptModel>? _gate;
  const _FakePlacementRepository({
    Exception? completeError,
    Completer<PlacementAttemptModel>? gate,
  })  : _completeError = completeError,
        _gate = gate;

  @override
  Future<PlacementAttemptModel> completeAttempt(String t,
      {required String attemptId}) async {
    if (_gate != null) return _gate.future;
    if (_completeError != null) throw _completeError;
    return PlacementAttemptModel(
      id: attemptId,
      placementTestId: 'test-1',
      status: 'submitted',
      startedAt: '2026-06-18T00:00:00Z',
    );
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
  Future<PlacementResultModel> getResult(String t,
          {required String attemptId}) async =>
      throw UnimplementedError();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

Widget _wrap(
  Widget child, {
  required PlacementRepository repository,
  TextDirection dir = TextDirection.ltr,
}) {
  return ProviderScope(
    overrides: [
      placementRepositoryProvider.overrideWithValue(repository),
      authFlowProvider.overrideWith((ref) {
        final notifier = AuthFlowNotifier();
        notifier.signIn('student@example.com', accessToken: 'test-token');
        return notifier;
      }),
    ],
    child: MaterialApp.router(
      theme: AppTheme.light,
      routerConfig: GoRouter(
        initialLocation: '/',
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) =>
                Directionality(textDirection: dir, child: child),
          ),
        ],
        errorBuilder: (context, state) => const SizedBox(),
      ),
    ),
  );
}

const _page = PlacementSubmitPage(attemptId: 'attempt-1', totalSections: 4);

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementSubmitPage', () {
    testWidgets('shows the confirmation summary and submit button',
        (tester) async {
      await tester.pumpWidget(
        _wrap(_page, repository: const _FakePlacementRepository()),
      );
      await tester.pump();

      expect(find.text('All 4 sections complete'), findsOneWidget);
      expect(find.text('Submit Placement Test'), findsOneWidget);
    });

    testWidgets('shows AIMFullScreenLoading while completeAttempt runs',
        (tester) async {
      final gate = Completer<PlacementAttemptModel>();
      await tester.pumpWidget(
        _wrap(_page, repository: _FakePlacementRepository(gate: gate)),
      );
      await tester.pump();

      await tester.tap(find.text('Submit Placement Test'));
      await tester.pump(); // loading state renders immediately

      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
    });

    testWidgets('shows an error message and lets the student retry',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          _page,
          repository: _FakePlacementRepository(
            completeError: Exception('Server error'),
          ),
        ),
      );
      await tester.pump();

      await tester.tap(find.text('Submit Placement Test'));
      await tester.pump();
      await tester.pump();

      expect(find.byType(AIMFullScreenError), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);

      await tester.tap(find.text('Retry'));
      await tester.pump();

      // reset() returns to idle — confirmation screen shown again.
      expect(find.text('All 4 sections complete'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          _page,
          repository: const _FakePlacementRepository(),
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();

      expect(find.byType(PlacementSubmitPage), findsOneWidget);
      expect(find.text('All 4 sections complete'), findsOneWidget);
    });
  });
}
