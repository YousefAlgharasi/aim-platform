// Phase 6 — P6-056
// placement_result_page_test.dart — widget tests for PlacementResultPage.
//
// Drives the real PlacementResultNotifier through a fake PlacementRepository.
//
// Covers:
//   1. Loading state renders AIMFullScreenLoading, no crash.
//   2. Pending state ("still scoring") renders the scoring-in-progress copy.
//   3. Ready state renders the estimated level, skill row, and weakness row
//      exactly as returned by the backend.
//   4. Backend failure renders AIMFullScreenError with the message.
//   5. RTL layout does not throw; key content still renders.
//
// Note on the pending state: after entering Pending, the notifier schedules
// a real 2-second retry Timer. This suite unmounts the widget tree
// immediately after asserting the Pending UI so Riverpod's autoDispose
// mechanism disposes PlacementResultNotifier (cancelling the timer) before
// the test completes — see PlacementResultNotifier.dispose().

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';
import 'package:aim_mobile/features/placement/ui/pages/placement_result_page.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

final _resultModel = PlacementResultModel.fromJson({
  'id': 'result-1',
  'placement_attempt_id': 'attempt-1',
  'estimated_level': 'intermediate',
  'skill_mastery_map': {
    'grammar': {
      'total_questions': 10,
      'correct_answers': 7,
      'mastery_score': 0.7,
      'signal': 'developing',
    },
  },
  'weakness_map': {
    'weaknesses': [
      {'skill_code': 'grammar', 'mastery_score': 0.7, 'priority': 1},
    ],
  },
  'initial_path_id': 'path-1',
  'created_at': '2026-06-18T00:00:00Z',
});

class _FakePlacementRepository implements PlacementRepository {
  final PlacementResultModel? _result;
  final Exception? _error;
  final Completer<PlacementResultModel>? _gate;
  const _FakePlacementRepository({
    PlacementResultModel? result,
    Exception? error,
    Completer<PlacementResultModel>? gate,
  })  : _result = result,
        _error = error,
        _gate = gate;

  @override
  Future<PlacementResultModel> getResult(String t,
      {required String attemptId}) async {
    if (_gate != null) return _gate.future;
    if (_error != null) throw _error!;
    return _result!;
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

const _page = PlacementResultPage(attemptId: 'attempt-1');

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementResultPage', () {
    testWidgets('shows AIMFullScreenLoading before the result resolves',
        (tester) async {
      final gate = Completer<PlacementResultModel>();
      await tester.pumpWidget(
        _wrap(_page, repository: _FakePlacementRepository(gate: gate)),
      );
      await tester.pump();

      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
    });

    testWidgets('shows the scoring-in-progress copy while pending',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          _page,
          repository: _FakePlacementRepository(
            error: Exception('RESULT_NOT_FOUND — still processing'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Scoring in progress…'), findsOneWidget);

      // Unmount so autoDispose cancels the scheduled retry timer before
      // this test completes — see file header note.
      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('shows AIMFullScreenError on a non-retryable failure',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          _page,
          repository: _FakePlacementRepository(
            error: Exception('Unexpected server error'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.byType(AIMFullScreenError), findsOneWidget);
      expect(find.text('Try again'), findsOneWidget);
    });

    testWidgets(
        'shows estimated level, skill row, and weakness row from the backend',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          _page,
          repository: _FakePlacementRepository(result: _resultModel),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Intermediate'), findsOneWidget); // estimatedLevel
      expect(find.text('Grammar'), findsAtLeastNWidgets(1));
      expect(find.text('Developing'), findsOneWidget); // signal, capitalized
      expect(find.text('Continue to Home'), findsOneWidget);
      expect(
        find.textContaining('no local calculations are performed'),
        findsOneWidget,
      );
    });

    testWidgets('renders without error under RTL directionality',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          _page,
          repository: _FakePlacementRepository(result: _resultModel),
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.byType(PlacementResultPage), findsOneWidget);
      expect(find.text('Intermediate'), findsOneWidget);
    });
  });
}
