// AIM pipeline live wiring.
// practice_session_notifier_test.dart — unit tests for the lesson practice
// session flow (start session -> question delivery -> stepping).
//
// Covers:
//   1.  start() success with questions -> active, backend session id kept.
//   2.  start() success with no questions -> empty.
//   3.  start() 403 FORBIDDEN (P20-010 course gating) -> locked.
//   4.  start() other AppException -> failed with message.
//   5.  retry after delivery failure reuses the already-started session.
//   6.  advance() steps through questions and finishes after the last one.
//   7.  currentQuestion is null outside the active state.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/practice_session_notifier.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';

QuestionModel _question(String id) => QuestionModel.fromJson({
      'id': id,
      'type': 'multiple_choice',
      'stem': 'Q $id?',
      'difficulty': 'easy',
      'tags': ['a1'],
      'options': [
        {'id': 'opt-1', 'text': 'is', 'order': 0},
        {'id': 'opt-2', 'text': 'are', 'order': 1},
      ],
    });

class _FakeRepository implements QuestionAnswerRepository {
  _FakeRepository({
    this.questions = const [],
    this.startError,
    this.questionsError,
  });

  final List<QuestionModel> questions;
  AppException? startError;
  AppException? questionsError;

  int startCalls = 0;
  int questionCalls = 0;
  String? lastSessionId;
  String? lastLessonId;
  String? lastSessionType;

  @override
  Future<SessionStartResponseModel> startSession({
    required String bearerToken,
    required String sessionType,
    List<String> skillFocusIds = const [],
  }) async {
    startCalls++;
    lastSessionType = sessionType;
    if (startError != null) throw startError!;
    return const SessionStartResponseModel(
      id: 'session-1',
      sessionType: 'lesson_practice',
      status: 'active',
      startedAt: '2026-07-01T10:00:00Z',
      currentLevel: 'A1',
    );
  }

  @override
  Future<List<QuestionModel>> getLessonQuestions({
    required String bearerToken,
    required String sessionId,
    required String lessonId,
  }) async {
    questionCalls++;
    lastSessionId = sessionId;
    lastLessonId = lessonId;
    if (questionsError != null) throw questionsError!;
    return questions;
  }

  @override
  Future<QuestionModel> getQuestion({
    required String bearerToken,
    required String questionId,
  }) async =>
      _question(questionId);

  @override
  Future<AttemptSubmitResponseModel> submitAttempt({
    required String bearerToken,
    required String sessionId,
    required AttemptSubmitRequestModel request,
  }) async =>
      throw UnimplementedError();

  @override
  Future<SessionFeedbackModel> getSessionState({
    required String bearerToken,
    required String studentId,
    required String sessionId,
  }) async =>
      throw UnimplementedError();
}

void main() {
  test('1. start() with delivered questions -> active with backend session id',
      () async {
    final repo = _FakeRepository(questions: [_question('q-1'), _question('q-2')]);
    final notifier = PracticeSessionNotifier(repository: repo);

    await notifier.start(bearerToken: 'tok', lessonId: 'lesson-1');

    expect(notifier.state.status, PracticeSessionStatus.active);
    expect(notifier.state.sessionId, 'session-1');
    expect(notifier.state.questions, hasLength(2));
    expect(notifier.state.currentQuestion!.id, 'q-1');
    expect(repo.lastSessionType, 'lesson_practice');
    expect(repo.lastSessionId, 'session-1');
    expect(repo.lastLessonId, 'lesson-1');
  });

  test('2. start() with no delivered questions -> empty', () async {
    final repo = _FakeRepository(questions: const []);
    final notifier = PracticeSessionNotifier(repository: repo);

    await notifier.start(bearerToken: 'tok', lessonId: 'lesson-1');

    expect(notifier.state.status, PracticeSessionStatus.empty);
  });

  test('3. backend 403 FORBIDDEN (P20-010 gating) -> locked, never bypassed',
      () async {
    final repo = _FakeRepository(
      questionsError:
          const AppException(code: 'FORBIDDEN', message: 'locked'),
    );
    final notifier = PracticeSessionNotifier(repository: repo);

    await notifier.start(bearerToken: 'tok', lessonId: 'lesson-1');

    expect(notifier.state.status, PracticeSessionStatus.locked);
  });

  test('4. other AppException -> failed with backend message', () async {
    final repo = _FakeRepository(
      startError: const AppException(code: 'NOT_FOUND', message: 'no placement'),
    );
    final notifier = PracticeSessionNotifier(repository: repo);

    await notifier.start(bearerToken: 'tok', lessonId: 'lesson-1');

    expect(notifier.state.status, PracticeSessionStatus.failed);
    expect(notifier.state.errorMessage, 'no placement');
  });

  test('5. retry after delivery failure reuses the started session', () async {
    final repo = _FakeRepository(
      questions: [_question('q-1')],
      questionsError: const AppException(code: 'INTERNAL', message: 'boom'),
    );
    final notifier = PracticeSessionNotifier(repository: repo);

    await notifier.start(bearerToken: 'tok', lessonId: 'lesson-1');
    expect(notifier.state.status, PracticeSessionStatus.failed);
    expect(repo.startCalls, 1);

    repo.questionsError = null;
    await notifier.start(bearerToken: 'tok', lessonId: 'lesson-1');

    expect(repo.startCalls, 1); // no second POST /sessions/start
    expect(notifier.state.status, PracticeSessionStatus.active);
  });

  test('6. advance() steps through questions then finishes', () async {
    final repo = _FakeRepository(questions: [_question('q-1'), _question('q-2')]);
    final notifier = PracticeSessionNotifier(repository: repo);
    await notifier.start(bearerToken: 'tok', lessonId: 'lesson-1');

    notifier.advance();
    expect(notifier.state.status, PracticeSessionStatus.active);
    expect(notifier.state.currentQuestion!.id, 'q-2');

    notifier.advance();
    expect(notifier.state.status, PracticeSessionStatus.finished);
    expect(notifier.state.currentQuestion, isNull);
  });

  test('7. currentQuestion is null outside the active state', () {
    const state = PracticeSessionState();
    expect(state.currentQuestion, isNull);
  });
}
