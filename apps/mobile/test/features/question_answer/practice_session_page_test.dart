// AIM pipeline live wiring.
// practice_session_page_test.dart — widget tests for PracticeSessionPage.
//
// Covers:
//   1. Delivered questions render via the embedded QuestionPage (stem +
//      options visible, no correctness data anywhere in the tree).
//   2. Empty delivery shows the empty state.
//   3. Backend 403 (P20-010 course gating) shows the locked-course message.
//   4. Failure shows the error state with a retry affordance.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_provider.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';
import 'package:aim_mobile/features/practice/ui/pages/practice_session_page.dart';

QuestionModel _question(String id) => QuestionModel.fromJson({
      'id': id,
      'type': 'multiple_choice',
      'stem': 'He _____ a teacher.',
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
    this.questionsError,
    this.attemptResponse,
  });

  final List<QuestionModel> questions;
  final AppException? questionsError;
  final AttemptSubmitResponseModel? attemptResponse;

  @override
  Future<SessionStartResponseModel> startSession({
    required String bearerToken,
    required String sessionType,
    List<String> skillFocusIds = const [],
  }) async =>
      const SessionStartResponseModel(
        id: 'session-1',
        sessionType: 'lesson_practice',
        status: 'active',
        startedAt: '2026-07-01T10:00:00Z',
        currentLevel: 'A1',
      );

  @override
  Future<List<QuestionModel>> getLessonQuestions({
    required String bearerToken,
    required String sessionId,
    required String lessonId,
  }) async {
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
      attemptResponse ??
      const AttemptSubmitResponseModel(
        attemptId: 'att-1',
        answerId: 'ans-1',
        submittedAt: '2026-07-01T10:00:00Z',
        aimPipelineTriggered: false,
        aimOutcome: 'pending',
        isCorrect: true,
      );

  @override
  Future<SessionFeedbackModel> getSessionState({
    required String bearerToken,
    required String studentId,
    required String sessionId,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> recordLessonProgress({
    required String bearerToken,
    required String lessonId,
    required int percent,
  }) async {}

  @override
  Future<void> markLessonComplete({
    required String bearerToken,
    required String lessonId,
  }) async {}

  @override
  Future<List<int>> getQuestionAudio({
    required String bearerToken,
    required String questionId,
  }) async =>
      const [];

  @override
  Future<List<int>> getLessonAssetAudio({
    required String bearerToken,
    required String assetId,
  }) async =>
      const [];
}

Widget _wrap(QuestionAnswerRepository repository) => ProviderScope(
      overrides: [
        authFlowProvider.overrideWith(
          (ref) => AuthFlowNotifier()
            ..signIn('learner@example.com', accessToken: 'tok-abc'),
        ),
        questionAnswerRepositoryProvider.overrideWithValue(repository),
      ],
      child: MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: const PracticeSessionPage(
          lessonId: 'lesson-1',
          lessonTitle: 'I am, You are, He/She is',
        ),
      ),
    );

void main() {
  testWidgets('1. renders delivered question stem and options', (tester) async {
    await tester.pumpWidget(_wrap(_FakeRepository(questions: [_question('q-1')])));
    await tester.pumpAndSettle();

    expect(find.text('He _____ a teacher.'), findsOneWidget);
    expect(find.text('is'), findsOneWidget);
    expect(find.text('are'), findsOneWidget);
  });

  testWidgets('2. empty delivery shows the empty state', (tester) async {
    await tester.pumpWidget(_wrap(_FakeRepository(questions: const [])));
    await tester.pumpAndSettle();

    expect(find.text('No questions yet'), findsOneWidget);
  });

  testWidgets('3. backend 403 gating shows the locked-course message',
      (tester) async {
    await tester.pumpWidget(_wrap(_FakeRepository(
      questionsError: const AppException(code: 'FORBIDDEN', message: 'locked'),
    )));
    await tester.pumpAndSettle();

    expect(
      find.text('Finish your current level to unlock this course'),
      findsOneWidget,
    );
  });

  testWidgets('4. failure shows the error state with retry', (tester) async {
    await tester.pumpWidget(_wrap(_FakeRepository(
      questionsError: const AppException(code: 'INTERNAL', message: 'boom'),
    )));
    await tester.pumpAndSettle();

    expect(find.text('boom'), findsOneWidget);
    expect(find.text('Try again'), findsOneWidget);
  });

  testWidgets('5. renders fill-in-the-blank input when options are empty and allows submission', (tester) async {
    final fillQuestion = QuestionModel.fromJson({
      'id': 'q-fill-1',
      'type': 'fill_in_the_blank',
      'stem': 'Fill in the missing letter: A, ___, C, D',
      'difficulty': 'beginner',
      'tags': ['alphabet'],
      'options': [],
    });

    await tester.pumpWidget(_wrap(_FakeRepository(questions: [fillQuestion])));
    await tester.pumpAndSettle();

    expect(find.text('Fill in the missing letter: A, ___, C, D'), findsOneWidget);
    expect(find.text('YOUR ANSWER'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'B');
    await tester.pumpAndSettle();

    expect(find.text('Complete Session'), findsOneWidget);
    await tester.tap(find.text('Complete Session'));
    await tester.pumpAndSettle();

    expect(find.text('PRACTICE COMPLETE!'), findsOneWidget);
    expect(find.text('CORRECT'), findsOneWidget);
    expect(find.text('Question Review'), findsOneWidget);
  });

  testWidgets('6. renders audio play button for listening_choice questions', (tester) async {
    final listeningQuestion = QuestionModel.fromJson({
      'id': 'e7a6bed2-135d-44bf-8780-df73384d3036',
      'type': 'listening_choice',
      'stem': 'Listen to the word. Does it start with a blend?',
      'difficulty': 'beginner',
      'tags': ['listening', 'phonics'],
      'options': [
        {'id': 'opt-yes', 'text': 'Yes', 'order': 0},
        {'id': 'opt-no', 'text': 'No', 'order': 1},
      ],
    });

    await tester.pumpWidget(_wrap(_FakeRepository(questions: [listeningQuestion])));
    await tester.pumpAndSettle();

    expect(find.text('Listen to the word. Does it start with a blend?'), findsOneWidget);
    expect(find.text('TAP TO LISTEN'), findsOneWidget);
    expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
    expect(find.text('Yes'), findsOneWidget);
    expect(find.text('No'), findsOneWidget);
  });

  testWidgets('7. handles incorrect answer without mid-quiz reveal and reports wrong count on finish', (tester) async {
    final question = _question('q-1');
    final repo = _FakeRepository(
      questions: [question],
      attemptResponse: const AttemptSubmitResponseModel(
        attemptId: 'att-1',
        answerId: 'ans-1',
        submittedAt: '2026-07-01T10:00:00Z',
        aimPipelineTriggered: false,
        aimOutcome: 'pending',
        isCorrect: false,
      ),
    );

    await tester.pumpWidget(_wrap(repo));
    await tester.pumpAndSettle();

    // Select option 2 ('are')
    await tester.tap(find.text('are'));
    await tester.pumpAndSettle();

    expect(find.text('Complete Session'), findsOneWidget);
    // Tap Complete Session to submit answer and finish quiz
    await tester.tap(find.text('Complete Session'));
    await tester.pumpAndSettle();

    // Verify finish view shows wrong answers count and question review
    expect(find.text('WRONG'), findsOneWidget);
    expect(find.text('You got 1 wrong answer out of 1 question'), findsOneWidget);
    expect(find.text('Question Review'), findsOneWidget);
  });

  testWidgets('8. advances smoothly across multiple questions with all answers evaluated at the end', (tester) async {
    final q1 = _question('q-1');
    final q2 = QuestionModel.fromJson({
      'id': 'q-2',
      'type': 'multiple_choice',
      'stem': 'She _____ my sister.',
      'difficulty': 'easy',
      'tags': ['a1'],
      'options': [
        {'id': 'opt-2-1', 'text': 'is', 'order': 0},
        {'id': 'opt-2-2', 'text': 'are', 'order': 1},
      ],
    });

    await tester.pumpWidget(_wrap(_FakeRepository(questions: [q1, q2])));
    await tester.pumpAndSettle();

    // Question 1
    expect(find.text('QUESTION 1 OF 2'), findsOneWidget);
    await tester.tap(find.text('is'));
    await tester.pumpAndSettle();

    // First question has 'Next Question'
    expect(find.text('Next Question'), findsOneWidget);
    await tester.tap(find.text('Next Question'));
    await tester.pumpAndSettle();

    // Question 2 immediately appears without intermediate check screen
    expect(find.text('QUESTION 2 OF 2'), findsOneWidget);
    expect(find.text('She _____ my sister.'), findsOneWidget);
    await tester.tap(find.text('is'));
    await tester.pumpAndSettle();

    // Final question has 'Complete Session'
    expect(find.text('Complete Session'), findsOneWidget);
    await tester.tap(find.text('Complete Session'));
    await tester.pumpAndSettle();

    // End-of-session evaluation is displayed
    expect(find.text('PRACTICE COMPLETE!'), findsOneWidget);
    expect(find.text('CORRECT'), findsOneWidget);
    expect(find.text('Question Review'), findsOneWidget);
    expect(find.text('Q1: He _____ a teacher.'), findsOneWidget);
    expect(find.text('Q2: She _____ my sister.'), findsOneWidget);
  });
}

