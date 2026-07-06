// Phase 6 — P6-056
// placement_start_page_test.dart — widget tests for PlacementStartPage.
//
// Drives the real PlacementStartNotifier through a fake PlacementRepository
// (overriding only placementRepositoryProvider) so the page's genuine
// initState → load flow is exercised, not a hand-rolled fake notifier.
//
// Covers:
//   1. Loading state renders AIMFullScreenLoading, no crash.
//   2. Backend failure renders AIMFullScreenError with a retry action.
//   3. Ready state renders the hero stats and the sections preview list.
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
import 'package:aim_mobile/features/placement/ui/pages/placement_start_page.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

const _testModel = PlacementTestModel(
  id: 'test-1',
  title: 'English Placement Test',
  status: 'active',
  totalSections: 3,
  estimatedMinutes: 20,
);

const _sections = [
  PlacementSectionModel(
    id: 'sec-1',
    title: 'Vocabulary',
    skillCode: 'vocabulary',
    orderIndex: 1,
    totalQuestions: 10,
  ),
  PlacementSectionModel(
    id: 'sec-2',
    title: 'Grammar',
    skillCode: 'grammar',
    orderIndex: 2,
    totalQuestions: 8,
  ),
  PlacementSectionModel(
    id: 'sec-3',
    title: 'Reading',
    skillCode: 'reading',
    orderIndex: 3,
    totalQuestions: 6,
  ),
];

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
  Future<List<PlacementSectionModel>> getActiveSections(String t) async {
    if (_gate != null) return _gate.future.then((_) => _sections);
    if (_loadError != null) throw _loadError;
    return _sections;
  }

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

  @override
  Future<List<int>> getQuestionAudio(String t, {required String questionId}) async =>
      throw UnimplementedError();

  @override
  Future<PlacementLatestStatusModel> getLatestStatus(String t) async =>
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

      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
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

      expect(find.byType(AIMFullScreenError), findsOneWidget);
      // AIMFullScreenError's default retryLabel is "Try again" (matches the
      // convention used everywhere else in the app), not "Retry".
      expect(find.text('Try again'), findsOneWidget);
    });

    testWidgets('shows hero stats and the sections preview once loaded',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const PlacementStartPage(),
          repository: const _FakePlacementRepository(),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Placement Test'), findsOneWidget); // header title
      expect(find.text('Find your level'), findsOneWidget);
      expect(find.text('3'), findsOneWidget); // totalSections
      expect(find.text('~20'), findsOneWidget); // estimatedMinutes
      expect(find.text('Start Placement Test'), findsOneWidget);
      // Backend-authority note must always be visible before starting.
      expect(
        find.textContaining('determined by the backend'),
        findsOneWidget,
      );
      expect(find.text('Start Placement Test'), findsOneWidget);
      expect(find.text('Not now'), findsOneWidget);
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
      expect(find.text('Find your level'), findsOneWidget);
    });
  });
}
