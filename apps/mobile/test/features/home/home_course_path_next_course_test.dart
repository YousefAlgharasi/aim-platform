import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/home/logic/provider/home_courses_provider.dart';
import 'package:aim_mobile/features/home/ui/widgets/home_course_path_section.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';

StudentCourseModel _course(
  String id,
  StudentCourseStatus status, {
  bool current = false,
  bool next = false,
}) =>
    StudentCourseModel(
      courseId: id,
      title: id,
      lessonCount: 12,
      completedLessonCount: status == StudentCourseStatus.completed ? 12 : 0,
      quizCount: 4,
      examCount: 1,
      percent: status == StudentCourseStatus.completed ? 100 : 0,
      status: status,
      locked: false,
      isCurrent: current,
      isNext: next,
    );

void main() {
  testWidgets('offers the next course once the current course is completed',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authFlowProvider.overrideWith(
            (ref) => AuthFlowNotifier()
              ..signIn('learner@example.com', accessToken: 'tok-abc'),
          ),
          homeCoursesProvider.overrideWith(
            (ref) async => [
              // A demo course with some progress must not take over the roadmap.
              _course('English for Beginners', StudentCourseStatus.inProgress),
              _course('Starter', StudentCourseStatus.completed, current: true),
              _course('A1.1', StudentCourseStatus.notStarted, next: true),
            ],
          ),
        ],
        child: MaterialApp(
          theme: AppTheme.light,
          localizationsDelegates: AppLocale.delegates,
          supportedLocales: AppLocale.supportedLocales,
          home: const Scaffold(
            body: SingleChildScrollView(child: HomeCoursePathSection()),
          ),
        ),
      ),
    );
    await tester.pump();
    await tester.pump();

    expect(find.text('You finished Starter!'), findsOneWidget);
    expect(find.text('Start A1.1 now to keep going.'), findsOneWidget);
    expect(find.text('Start A1.1'), findsOneWidget);
  });
}
