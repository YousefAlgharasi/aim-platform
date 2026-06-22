// Phase 6 — P6-056
// placement_start_page_test.dart — widget tests for PlacementStartPage.
//
// Drives the real PlacementStartNotifier through a fake PlacementRepository
// (overriding only placementRepositoryProvider) so the page's genuine
// initState → load flow is exercised, not a hand-rolled fake notifier.
//
// Covers:
//   1. Loading state renders a progress indicator, no crash.
//   2. Backend failure renders an error message with a retry action.
//   3. Ready state renders the test title, section count, and time.
//   4. RTL layout does not throw; key content still renders.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_start_page.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

const _testModel = PlacementTestModel(
  id: 'test-1',
  title: 'English Placement Test',
  status: 'active',
  totalSections: 3,
  estimatedMinutes: 20,
);

class _FakePlacementRepository implements PlacementRepository {
  final Exception? _loadError;
  final Completer<PlacementTestModel>? _gate;
  const _FakePlacementRepository({Exception? loadError, Completer<PlacementTestModel>? gate})
      : _loadError = loadError,
        _gate = gate;

  @override
  Future<PlacementTestModel> getActivePlacementTest(String t) async {
    if (_gate != null) return _gate.future;
    if (_loadError != null) throw _loadError;
    return _testModel;
  }

  @override
  Future<PlacementAttemptModel> startAttempt(String t,
          {required String placementTestId}) async =>
      throw UnimplementedError();

  @override
  Future<List<PlacementSectionModel>> getActiveSections(String t) async =>
      throw UnimplementedError();

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(String t,
          {required String sectionId}) async =>
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
    child: MaterialApp(
      theme: AppTheme.light,
      onGenerateRoute: (_) =>
          MaterialPageRoute(builder: (_) => const SizedBox()),
      home: Directionality(textDirection: dir, child: child),
    ),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementStartPage', () {
    testWidgets('shows a loading indicator before the test resolves',
        (tester) async {
      final gate = Completer<PlacementTestModel>();
      await tester.pumpWidget(
        _wrap(
          const PlacementStartPage(),
          repository: _FakePlacementRepository(gate: gate),
        ),
      );
      await tester.pump(); // first frame — postFrameCallback fires here

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows an error message when the backend call fails',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const PlacementStartPage(),
          repository: _FakePlacementRepository(
            loadError: Exception('Network error'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Could not load placement test'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
    });

    testWidgets('shows test info once the active test loads',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const PlacementStartPage(),
          repository: const _FakePlacementRepository(),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('English Placement Test'), findsOneWidget);
      expect(find.text('3'), findsOneWidget); // totalSections
      expect(find.text('20 min'), findsOneWidget);
      expect(find.text('Start Placement Test'), findsOneWidget);
      // Backend-authority note must always be visible before starting.
      expect(
        find.textContaining('determined by the backend'),
        findsOneWidget,
      );
    });

    testWidgets('renders without error under RTL directionality',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const PlacementStartPage(),
          repository: const _FakePlacementRepository(),
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.byType(PlacementStartPage), findsOneWidget);
      expect(find.text('English Placement Test'), findsOneWidget);
    });
  });
}
