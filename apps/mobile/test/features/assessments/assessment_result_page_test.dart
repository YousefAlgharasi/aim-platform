import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/features/assessments/logic/provider/result_notifier.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';
import 'package:aim_mobile/features/assessments/ui/pages/assessment_result_page.dart';

class _UnusedRepository implements AssessmentRepository {
  @override
  dynamic noSuchMethod(Invocation invocation) => throw UnimplementedError();
}

const _options = [
  ReviewOption(id: 'a', label: 'A', text: 'Hello'),
  ReviewOption(id: 'b', label: 'B', text: 'Goodbye'),
];

AttemptResultDetail _result({required bool passed}) => AttemptResultDetail(
      resultId: 'r1',
      attemptId: 'att1',
      score: 1,
      maxScore: 3,
      passed: passed,
      latePenaltyApplied: false,
      gradedAt: '2026-10-29T10:00:00Z',
      feedbackAllowed: false,
      breakdown: const [],
      assessmentType: 'exam',
      courseId: 'c1',
      percentScore: 33,
      totalQuestions: 3,
      correctCount: 1,
      wrongCount: 1,
      skippedCount: 1,
      answersRevealed: true,
      certificateId: passed ? 'cert1' : null,
      review: const [
        ReviewItem(
          assessmentQuestionLinkId: 'q1',
          number: 1,
          prompt: 'How do you greet someone?',
          options: _options,
          selectedOptionId: 'a',
          correctOptionIds: ['a'],
          status: ReviewStatus.correct,
        ),
        ReviewItem(
          assessmentQuestionLinkId: 'q2',
          number: 2,
          prompt: 'What do you say when leaving?',
          options: _options,
          selectedOptionId: 'a',
          correctOptionIds: ['b'],
          status: ReviewStatus.wrong,
        ),
        ReviewItem(
          assessmentQuestionLinkId: 'q3',
          number: 3,
          prompt: 'Pick the greeting.',
          options: _options,
          selectedOptionId: null,
          correctOptionIds: ['a'],
          status: ReviewStatus.skipped,
        ),
      ],
    );

Future<void> _pump(WidgetTester tester, AttemptResultDetail result,
    {Locale locale = const Locale('en')}) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        attemptResultProvider.overrideWith((ref) =>
            AttemptResultNotifier(repository: _UnusedRepository())
              ..setSuccess(result)),
      ],
      child: MaterialApp(
        theme: AppTheme.light,
        locale: locale,
        supportedLocales: AppLocale.supportedLocales,
        localizationsDelegates: AppLocale.delegates,
        home: const AssessmentResultPage(
          attemptId: 'att1',
          assessmentTitle: 'Final exam',
        ),
      ),
    ),
  );
  await tester.pump();
}

void main() {
  testWidgets('shows score out of 100, counts, review and certificate button',
      (tester) async {
    await _pump(tester, _result(passed: true));

    expect(find.text('33'), findsOneWidget);
    expect(find.text('out of 100'), findsOneWidget);
    expect(find.text('My certificate'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Review your answers'), 200);
    expect(find.text('Review your answers'), findsOneWidget);

    await tester.scrollUntilVisible(find.text('You skipped this question'), 200);
    expect(find.text('Correct answer'), findsWidgets);
    expect(find.text('Your answer'), findsWidgets);
  });

  testWidgets('filter shows only wrong answers', (tester) async {
    await _pump(tester, _result(passed: true));
    await tester.scrollUntilVisible(find.text('Wrong (1)'), 200);
    await tester.tap(find.text('Wrong (1)'));
    await tester.pump();
    expect(find.text('What do you say when leaving?'), findsOneWidget);
    expect(find.text('How do you greet someone?'), findsNothing);
  });

  testWidgets('no certificate button when failed', (tester) async {
    await _pump(tester, _result(passed: false));
    expect(find.text('My certificate'), findsNothing);
  });

  testWidgets('renders in Arabic without overflow', (tester) async {
    tester.view.physicalSize = const Size(360 * 3, 740 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    await _pump(tester, _result(passed: true), locale: const Locale('ar'));
    expect(find.text('شهادتي'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('لقد تركت هذا السؤال'), 200);
    expect(tester.takeException(), isNull);
  });
}
