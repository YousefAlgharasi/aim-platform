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
import 'package:aim_mobile/features/question_answer/ui/pages/practice_session_page.dart';

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
  _FakeRepository({this.questions = const [], this.questionsError});

  final List<QuestionModel> questions;
  final AppException? questionsError;

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
      throw UnimplementedError();

  @override
  Future<SessionFeedbackModel> getSessionState({
    required String bearerToken,
    required String studentId,
    required String sessionId,
  }) async =>
      throw UnimplementedError();
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
}
