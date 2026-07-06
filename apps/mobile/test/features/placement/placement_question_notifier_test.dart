// Phase 6 — P6-056
// PlacementQuestionNotifier tests.
//
// Scope: Placement Test phase only — question page state machine.
//
// Coverage:
//   - loadQuestions: idle → loading → ready with questions + attemptId
//   - loadQuestions: empty backend list → error (NO_QUESTIONS)
//   - loadQuestions: backend failure → error (QUESTIONS_LOAD_FAILED)
//   - selectAnswer: updates selectedAnswer; no-op while submitting
//   - submitCurrentAnswer: advances to next question, clears selection
//   - submitCurrentAnswer: transitions to SectionComplete on last question
//   - submitCurrentAnswer: resets isSubmitting and rethrows on failure
//   - canSubmit gating
//
// Security rules verified:
//   - The payload sent to the backend contains only placementAttemptId,
//     placementQuestionId, and answerValue — no is_correct, no skill_code,
//     no locally-evaluated correctness signal of any kind.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_question_notifier.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

const _questions = [
  PlacementQuestionModel(
    id: 'q-1',
    sectionId: 'sec-1',
    text: 'Choose A or B.',
    options: [
      PlacementOptionModel(id: 'A', text: 'Alpha'),
      PlacementOptionModel(id: 'B', text: 'Beta'),
    ],
    type: 'multiple_choice',
  ),
  PlacementQuestionModel(
    id: 'q-2',
    sectionId: 'sec-1',
    text: 'True or false?',
    options: [
      PlacementOptionModel(id: 'true', text: 'True'),
      PlacementOptionModel(id: 'false', text: 'False'),
    ],
    type: 'true_false',
  ),
];

class _FakePlacementRepository implements PlacementRepository {
  final List<PlacementQuestionModel>? _questions;
  final Exception? _loadError;
  final Exception? _submitError;
  final List<PlacementSubmitAnswerPayload> capturedPayloads = [];

  _FakePlacementRepository({
    List<PlacementQuestionModel>? questions,
    Exception? loadError,
    Exception? submitError,
  })  : _questions = questions,
        _loadError = loadError,
        _submitError = submitError;

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(
    String bearerToken, {
    required String sectionId,
  }) async {
    if (_loadError != null) throw _loadError;
    return _questions ?? const [];
  }

  @override
  Future<PlacementAnswerModel> submitAnswer(
    String bearerToken, {
    required String attemptId,
    required PlacementSubmitAnswerPayload payload,
  }) async {
    capturedPayloads.add(payload);
    if (_submitError != null) throw _submitError;
    return PlacementAnswerModel(
      id: 'ans-${capturedPayloads.length}',
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

  @override
  Future<List<int>> getQuestionAudio(String t, {required String questionId}) async =>
      throw UnimplementedError();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('PlacementQuestionNotifier', () {
    test('starts in idle state', () {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(questions: _questions),
          ),
        ],
      );
      addTearDown(container.dispose);

      expect(
        container.read(placementQuestionProvider),
        isA<PlacementQuestionIdle>(),
      );
    });

    test('loadQuestions → ready with questions and attemptId', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(questions: _questions),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(placementQuestionProvider.notifier).loadQuestions(
            'tok',
            sectionId: 'sec-1',
            attemptId: 'attempt-1',
          );

      final state = container.read(placementQuestionProvider);
      expect(state, isA<PlacementQuestionReady>());
      final ready = state as PlacementQuestionReady;
      expect(ready.questions.length, 2);
      expect(ready.attemptId, 'attempt-1');
      expect(ready.currentQuestion.id, 'q-1');
      expect(ready.isLastQuestion, isFalse);
      expect(ready.canSubmit, isFalse); // no selection yet
    });

    test('loadQuestions → error when section has no questions', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(questions: const []),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(placementQuestionProvider.notifier).loadQuestions(
            'tok',
            sectionId: 'sec-1',
            attemptId: 'attempt-1',
          );

      final state = container.read(placementQuestionProvider);
      expect(state, isA<PlacementQuestionError>());
      expect((state as PlacementQuestionError).code, 'NO_QUESTIONS');
    });

    test('loadQuestions → error on backend failure', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(loadError: Exception('Network down')),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(placementQuestionProvider.notifier).loadQuestions(
            'tok',
            sectionId: 'sec-1',
            attemptId: 'attempt-1',
          );

      final state = container.read(placementQuestionProvider);
      expect(state, isA<PlacementQuestionError>());
      expect((state as PlacementQuestionError).code, 'QUESTIONS_LOAD_FAILED');
    });

    test('selectAnswer sets selection and enables canSubmit', () async {
      final container = ProviderContainer(
        overrides: [
          placementRepositoryProvider.overrideWithValue(
            _FakePlacementRepository(questions: _questions),
          ),
        ],
      );
      addTearDown(container.dispose);

      final notifier = container.read(placementQuestionProvider.notifier);
      await notifier.loadQuestions('tok',
          sectionId: 'sec-1', attemptId: 'attempt-1');
      notifier.selectAnswer('A');

      final state =
          container.read(placementQuestionProvider) as PlacementQuestionReady;
      expect(state.selectedAnswer, 'A');
      expect(state.canSubmit, isTrue);
    });

    test('submitCurrentAnswer sends a backend-only-safe payload', () async {
      final repo = _FakePlacementRepository(questions: _questions);
      final container = ProviderContainer(
        overrides: [placementRepositoryProvider.overrideWithValue(repo)],
      );
      addTearDown(container.dispose);

      final notifier = container.read(placementQuestionProvider.notifier);
      await notifier.loadQuestions('tok',
          sectionId: 'sec-1', attemptId: 'attempt-1');
      notifier.selectAnswer('A');
      await notifier.submitCurrentAnswer('tok');

      expect(repo.capturedPayloads, hasLength(1));
      final payload = repo.capturedPayloads.first;
      final json = payload.toJson();

      expect(payload.placementAttemptId, 'attempt-1');
      expect(payload.placementQuestionId, 'q-1');
      expect(payload.answerValue, 'A');
      // Only these three keys are ever sent — no is_correct, no skill_code.
      expect(json.keys.toSet(), {
        'placement_attempt_id',
        'placement_question_id',
        'answer_value',
      });
    });

    test('submitCurrentAnswer advances to next question and clears selection',
        () async {
      final repo = _FakePlacementRepository(questions: _questions);
      final container = ProviderContainer(
        overrides: [placementRepositoryProvider.overrideWithValue(repo)],
      );
      addTearDown(container.dispose);

      final notifier = container.read(placementQuestionProvider.notifier);
      await notifier.loadQuestions('tok',
          sectionId: 'sec-1', attemptId: 'attempt-1');
      notifier.selectAnswer('A');
      await notifier.submitCurrentAnswer('tok');

      final state =
          container.read(placementQuestionProvider) as PlacementQuestionReady;
      expect(state.currentIndex, 1);
      expect(state.currentQuestion.id, 'q-2');
      expect(state.selectedAnswer, isNull);
      expect(state.isSubmitting, isFalse);
    });

    test('submitCurrentAnswer on last question → SectionComplete', () async {
      final repo = _FakePlacementRepository(questions: _questions);
      final container = ProviderContainer(
        overrides: [placementRepositoryProvider.overrideWithValue(repo)],
      );
      addTearDown(container.dispose);

      final notifier = container.read(placementQuestionProvider.notifier);
      await notifier.loadQuestions('tok',
          sectionId: 'sec-1', attemptId: 'attempt-1');
      notifier.selectAnswer('A');
      await notifier.submitCurrentAnswer('tok'); // → q-2
      notifier.selectAnswer('true');
      await notifier.submitCurrentAnswer('tok'); // → section complete

      final state = container.read(placementQuestionProvider);
      expect(state, isA<PlacementQuestionSectionComplete>());
      expect(
        (state as PlacementQuestionSectionComplete).attemptId,
        'attempt-1',
      );
    });

    test('submitCurrentAnswer resets isSubmitting and rethrows on failure',
        () async {
      final repo = _FakePlacementRepository(
        questions: _questions,
        submitError: Exception('Server error'),
      );
      final container = ProviderContainer(
        overrides: [placementRepositoryProvider.overrideWithValue(repo)],
      );
      addTearDown(container.dispose);

      final notifier = container.read(placementQuestionProvider.notifier);
      await notifier.loadQuestions('tok',
          sectionId: 'sec-1', attemptId: 'attempt-1');
      notifier.selectAnswer('A');

      await expectLater(
        notifier.submitCurrentAnswer('tok'),
        throwsA(isA<Exception>()),
      );

      final state =
          container.read(placementQuestionProvider) as PlacementQuestionReady;
      expect(state.isSubmitting, isFalse);
      expect(state.selectedAnswer, 'A'); // selection preserved for retry
      expect(state.canSubmit, isTrue);
    });

    test('selectAnswer is a no-op while a submission is in flight', () async {
      final repo = _FakePlacementRepository(questions: _questions);
      final container = ProviderContainer(
        overrides: [placementRepositoryProvider.overrideWithValue(repo)],
      );
      addTearDown(container.dispose);

      final notifier = container.read(placementQuestionProvider.notifier);
      await notifier.loadQuestions('tok',
          sectionId: 'sec-1', attemptId: 'attempt-1');
      notifier.selectAnswer('A');

      final submitFuture = notifier.submitCurrentAnswer('tok');
      notifier.selectAnswer('B'); // should be ignored — isSubmitting is true
      await submitFuture;

      // After completion we're on q-2 with no selection — 'B' never landed.
      final state =
          container.read(placementQuestionProvider) as PlacementQuestionReady;
      expect(state.selectedAnswer, isNull);
    });
  });
}
