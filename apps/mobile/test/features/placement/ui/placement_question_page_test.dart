// Phase 6 — P6-056
// placement_question_page_test.dart — widget tests for PlacementQuestionPage.
//
// Drives the real PlacementQuestionNotifier through a fake PlacementRepository
// so the page's genuine initState → loadQuestions flow is exercised.
//
// Covers:
//   1. Loading state renders AIMFullScreenLoading, no crash.
//   2. Backend failure renders AIMFullScreenError with the message.
//   3. Ready state renders the question text and answer options.
//   4. Selecting an option enables the submit button.
//   5. RTL layout does not throw; key content still renders.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_question_page.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

const _questions = [
  PlacementQuestionModel(
    id: 'q-1',
    sectionId: 'sec-1',
    text: 'Choose the correct option.',
    options: [
      PlacementOptionModel(id: 'A', text: 'Alpha'),
      PlacementOptionModel(id: 'B', text: 'Beta'),
    ],
    type: 'multiple_choice',
  ),
];

class _FakePlacementRepository implements PlacementRepository {
  final Exception? _loadError;
  final Completer<List<PlacementQuestionModel>>? _gate;
  const _FakePlacementRepository({
    Exception? loadError,
    Completer<List<PlacementQuestionModel>>? gate,
  })  : _loadError = loadError,
        _gate = gate;

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(String t,
      {required String sectionId}) async {
    if (_gate != null) return _gate.future;
    if (_loadError != null) throw _loadError;
    return _questions;
  }

  @override
  Future<PlacementAnswerModel> submitAnswer(String t,
      {required String attemptId,
      required PlacementSubmitAnswerPayload payload}) async {
    return PlacementAnswerModel(
      id: 'ans-1',
      placementAttemptId: payload.placementAttemptId,
      placementQuestionId: payload.placementQuestionId,
      answerValue: payload.answerValue,
      createdAt: '2026-06-18T00:00:00Z',
    );
  }

  @override
  Future<PlacementTestModel> getActivePlacementTest(String t) async =>
      throw UnimplementedError();

  @override
  Future<List<PlacementSectionModel>> getActiveSections(String t) async =>
      throw UnimplementedError();

  @override
  Future<PlacementAttemptModel> startAttempt(String t,
          {required String placementTestId}) async =>
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

const _page = PlacementQuestionPage(
  sectionId: 'sec-1',
  attemptId: 'attempt-1',
  sectionTitle: 'Grammar',
  sectionIndex: 1,
  totalSections: 3,
);

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementQuestionPage', () {
    testWidgets('shows AIMFullScreenLoading before questions resolve',
        (tester) async {
      final gate = Completer<List<PlacementQuestionModel>>();
      await tester.pumpWidget(
        _wrap(_page, repository: _FakePlacementRepository(gate: gate)),
      );
      await tester.pump();

      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
    });

    testWidgets('shows AIMFullScreenError when the backend call fails',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          _page,
          repository: _FakePlacementRepository(
            loadError: Exception('Network error'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.byType(AIMFullScreenError), findsOneWidget);
      expect(find.text('Try again'), findsOneWidget);
    });

    testWidgets('shows the question text and answer options', (tester) async {
      await tester.pumpWidget(
        _wrap(_page, repository: const _FakePlacementRepository()),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Choose the correct option.'), findsOneWidget);
      // Each option letter renders twice: once in the key badge, once as
      // the child label (PlacementQuestionPage always shows A/B/C/D for
      // multiple_choice regardless of the model's option text).
      expect(find.text('A'), findsNWidgets(2));
      expect(find.text('B'), findsNWidgets(2));
      expect(find.byType(AIMAnswerOption), findsNWidgets(4));
      expect(find.byType(AIMButton), findsOneWidget);
    });

    testWidgets('selecting an option enables the submit button',
        (tester) async {
      await tester.pumpWidget(
        _wrap(_page, repository: const _FakePlacementRepository()),
      );
      await tester.pump();
      await tester.pump();

      final button = tester.widget<AIMButton>(find.byType(AIMButton));
      expect(button.onPressed, isNull); // no selection yet

      await tester.tap(find.byType(AIMAnswerOption).first);
      await tester.pump();

      final updated = tester.widget<AIMButton>(find.byType(AIMButton));
      expect(updated.onPressed, isNotNull);
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
      await tester.pump();

      expect(find.byType(PlacementQuestionPage), findsOneWidget);
      expect(find.text('Choose the correct option.'), findsOneWidget);
    });
  });
}
