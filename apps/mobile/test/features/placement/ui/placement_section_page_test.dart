// Phase 6 — P6-056
// placement_section_page_test.dart — widget tests for PlacementSectionPage.
//
// Drives the real PlacementSectionNotifier through a fake PlacementRepository
// so the page's genuine initState → loadSections flow is exercised.
//
// Covers:
//   1. Loading state renders a progress indicator, no crash.
//   2. Backend failure renders an error message with a retry action.
//   3. Ready state renders section title, skill badge, and progress.
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
import 'package:aim_mobile/features/placement/ui/pages/placement_section_page.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

const _sections = [
  PlacementSectionModel(
    id: 'sec-1',
    title: 'Grammar',
    skillCode: 'grammar',
    orderIndex: 1,
    totalQuestions: 5,
  ),
];

class _FakePlacementRepository implements PlacementRepository {
  final Exception? _loadError;
  final Completer<List<PlacementSectionModel>>? _gate;
  const _FakePlacementRepository({
    Exception? loadError,
    Completer<List<PlacementSectionModel>>? gate,
  })  : _loadError = loadError,
        _gate = gate;

  @override
  Future<List<PlacementSectionModel>> getActiveSections(String t) async {
    if (_gate != null) return _gate.future;
    if (_loadError != null) throw _loadError;
    return _sections;
  }

  @override
  Future<PlacementTestModel> getActivePlacementTest(String t) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAttemptModel> startAttempt(String t,
          {required String placementTestId}) async =>
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
  group('PlacementSectionPage', () {
    testWidgets('shows a loading indicator before sections resolve',
        (tester) async {
      final gate = Completer<List<PlacementSectionModel>>();
      await tester.pumpWidget(
        _wrap(
          const PlacementSectionPage(attemptId: 'attempt-1'),
          repository: _FakePlacementRepository(gate: gate),
        ),
      );
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows an error message when the backend call fails',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const PlacementSectionPage(attemptId: 'attempt-1'),
          repository: _FakePlacementRepository(
            loadError: Exception('Network error'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Retry'), findsOneWidget);
    });

    testWidgets('shows section title, skill badge, and question count',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const PlacementSectionPage(attemptId: 'attempt-1'),
          repository: const _FakePlacementRepository(),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Grammar'), findsAtLeastNWidgets(1));
      expect(find.text('5 questions'), findsOneWidget);
      expect(find.text('Section 1 of 1'), findsOneWidget);
      expect(find.text('Start Final Section'), findsOneWidget);
      // Backend-authority note must always be visible on this screen.
      expect(
        find.textContaining('All scoring is performed by the server'),
        findsOneWidget,
      );
    });

    testWidgets('renders without error under RTL directionality',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const PlacementSectionPage(attemptId: 'attempt-1'),
          repository: const _FakePlacementRepository(),
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.byType(PlacementSectionPage), findsOneWidget);
      expect(find.text('Grammar'), findsAtLeastNWidgets(1));
    });
  });
}
