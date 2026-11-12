// After a lesson is completed the screens underneath (Courses, chapters,
// lessons) must refresh in place and never end up on an endless skeleton.
//
// Root cause this guards against: the lesson screen used to call
// ref.invalidate(...) on the chapters / courses providers. That recreated
// those notifiers in the idle ("not asked yet") state while the screens that
// watch them were still on the navigation stack; the screens only loaded in
// initState, so idle showed a loading skeleton forever.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/entity/current_enrollment.dart';
import 'package:aim_mobile/features/enrollment/logic/provider/enrollment_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/repository/enrollment_repository.dart';
import 'package:aim_mobile/features/lessons/logic/entity/chapter_progress.dart';
import 'package:aim_mobile/features/lessons/logic/entity/chapter_quiz_summary.dart';
import 'package:aim_mobile/features/lessons/logic/entity/final_exam_summary.dart';
import 'package:aim_mobile/features/lessons/logic/entity/level.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_progress.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';
import 'package:aim_mobile/features/lessons/ui/pages/chapter_list_page.dart';
import 'package:aim_mobile/features/lessons/ui/pages/course_list_page.dart';
import 'package:aim_mobile/features/lessons/ui/pages/lesson_list_page.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';
import 'package:aim_mobile/features/student_courses/logic/repository/student_courses_repository.dart';

StudentCourseModel _course(int done) => StudentCourseModel(
      courseId: 'c1',
      title: 'English A1',
      levelCode: 'A1',
      lessonCount: 10,
      completedLessonCount: done,
      quizCount: 0,
      examCount: 0,
      percent: done * 10,
      status: done == 0 ? StudentCourseStatus.notStarted : StudentCourseStatus.inProgress,
      locked: false,
    );

class _CoursesRepo implements StudentCoursesRepository {
  int calls = 0;
  bool fail = false;
  int done = 1;

  @override
  Future<List<StudentCourseModel>> getCourses({required String bearerToken}) async {
    calls++;
    await Future<void>.delayed(const Duration(milliseconds: 10));
    if (fail) throw Exception('network down');
    return [_course(done)];
  }
}

class _LessonsRepo implements LessonsRepository {
  int chapterCalls = 0;
  int lessonCalls = 0;
  bool fail = false;
  int done = 1;

  @override
  Future<List<Level>> getLevels({required String bearerToken, required String courseId}) async => [
        const Level(
          id: 'lv1',
          courseId: 'c1',
          title: 'A1',
          status: 'published',
          sortOrder: 1,
          createdAt: 'x',
          updatedAt: 'y',
        ),
      ];

  @override
  Future<List<ChapterProgress>> getChaptersWithProgress({
    required String bearerToken,
    required String levelId,
  }) async {
    chapterCalls++;
    await Future<void>.delayed(const Duration(milliseconds: 10));
    if (fail) throw Exception('network down');
    return [
      ChapterProgress(
        chapterId: 'ch1',
        title: 'Greetings chapter',
        description: null,
        levelCode: 'A1',
        lessonCount: 5,
        completedLessonCount: done,
        quizCount: 0,
        percent: done * 20,
        status: 'in_progress',
      ),
    ];
  }

  @override
  Future<List<LessonProgress>> getLessonsWithProgress({
    required String bearerToken,
    required String chapterId,
  }) async {
    lessonCalls++;
    await Future<void>.delayed(const Duration(milliseconds: 10));
    if (fail) throw Exception('network down');
    return [
      LessonProgress(
        id: 'l1',
        title: 'Hello lesson',
        description: '',
        xpValue: 10,
        completed: done > 0,
        current: done == 0,
      ),
    ];
  }

  @override
  Future<FinalExamSummary?> getFinalExamForLevel({
    required String bearerToken,
    required String levelId,
  }) async =>
      null;

  @override
  Future<ChapterQuizSummary?> getChapterQuiz({
    required String bearerToken,
    required String chapterId,
  }) async =>
      null;

  @override
  Future<dynamic> noSuchMethod(Invocation invocation) async => null;
}

class _EnrollRepo implements EnrollmentRepository {
  @override
  Future<dynamic> noSuchMethod(Invocation invocation) async => null;
}

Widget _app(Widget home, _CoursesRepo courses, _LessonsRepo lessons) => ProviderScope(
      overrides: [
        authFlowProvider.overrideWith(
          (ref) => AuthFlowNotifier()..signIn('a@b.c', accessToken: 'tok'),
        ),
        studentCoursesRepositoryProvider.overrideWithValue(courses),
        lessonsRepositoryProvider.overrideWithValue(lessons),
        currentEnrollmentProvider.overrideWith(
          (ref) => CurrentEnrollmentNotifier(repository: _EnrollRepo())
            ..state = const AsyncValue.data(CurrentEnrollment.none),
        ),
      ],
      child: MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: home,
      ),
    );

void main() {
  testWidgets('Courses screen reloads instead of staying on a skeleton when its provider is reset',
      (tester) async {
    final courses = _CoursesRepo();
    final lessons = _LessonsRepo();
    await tester.pumpWidget(_app(const CourseListPage(), courses, lessons));
    await tester.pumpAndSettle();
    expect(find.text('English A1'), findsOneWidget);

    // What the lesson screen used to do after a completed exercise.
    ProviderScope.containerOf(tester.element(find.byType(CourseListPage)))
        .invalidate(studentCoursesProvider);
    await tester.pumpAndSettle();

    expect(find.text('English A1'), findsOneWidget, reason: 'courses are shown again, not a skeleton');
    expect(courses.calls, 2);
  });

  testWidgets('Chapters screen reloads instead of staying on a skeleton when its provider is reset',
      (tester) async {
    final courses = _CoursesRepo();
    final lessons = _LessonsRepo();
    await tester.pumpWidget(_app(
      const ChapterListPage(courseId: 'c1', courseTitle: 'English A1'),
      courses,
      lessons,
    ));
    await tester.pumpAndSettle();
    expect(find.text('Greetings chapter'), findsOneWidget);

    ProviderScope.containerOf(tester.element(find.byType(ChapterListPage)))
        .invalidate(chaptersProvider);
    await tester.pumpAndSettle();

    expect(find.text('Greetings chapter'), findsOneWidget);
    expect(lessons.chapterCalls, 2);
  });

  testWidgets('Lessons screen reloads instead of staying on a skeleton when its provider is reset',
      (tester) async {
    final courses = _CoursesRepo();
    final lessons = _LessonsRepo();
    await tester.pumpWidget(_app(
      const LessonListPage(chapterId: 'ch1', chapterTitle: 'Greetings', chapterIndex: 0),
      courses,
      lessons,
    ));
    await tester.pumpAndSettle();
    expect(find.text('Hello lesson'), findsOneWidget);

    ProviderScope.containerOf(tester.element(find.byType(LessonListPage)))
        .invalidate(lessonsListProvider);
    await tester.pumpAndSettle();

    expect(find.text('Hello lesson'), findsOneWidget);
    expect(lessons.lessonCalls, 2);
  });

  group('quiet refresh after a lesson is completed', () {
    testWidgets('keeps the screen filled while fetching, then shows the new progress',
        (tester) async {
      final courses = _CoursesRepo();
      final lessons = _LessonsRepo();
      await tester.pumpWidget(_app(
        const ChapterListPage(courseId: 'c1', courseTitle: 'English A1'),
        courses,
        lessons,
      ));
      await tester.pumpAndSettle();
      final container = ProviderScope.containerOf(tester.element(find.byType(ChapterListPage)));
      expect(lessons.chapterCalls, 1);

      lessons.done = 2;
      unawaited(container
          .read(chaptersProvider.notifier)
          .refreshQuietly(bearerToken: 'tok'));
      await tester.pump();
      // Still showing the list (not a skeleton) while the request runs.
      expect(container.read(chaptersProvider), isA<AppAsyncSuccess>());
      expect(find.text('Greetings chapter'), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 50));
      await tester.pumpAndSettle();
      final state = container.read(chaptersProvider) as AppAsyncSuccess<List<ChapterProgress>>;
      expect(state.data.single.completedLessonCount, 2);
      expect(lessons.chapterCalls, 2);
    });

    testWidgets('a failed refresh leaves the current list in place', (tester) async {
      final courses = _CoursesRepo();
      final lessons = _LessonsRepo();
      await tester.pumpWidget(_app(const CourseListPage(), courses, lessons));
      await tester.pumpAndSettle();
      final container = ProviderScope.containerOf(tester.element(find.byType(CourseListPage)));

      courses.fail = true;
      unawaited(container.read(studentCoursesProvider.notifier).refreshQuietly(bearerToken: 'tok'));
      await tester.pump(const Duration(milliseconds: 50));
      await tester.pumpAndSettle();

      expect(find.text('English A1'), findsOneWidget);
      expect(container.read(studentCoursesProvider), isA<AppAsyncSuccess>());
    });

    testWidgets('nothing loaded yet means nothing to refresh', (tester) async {
      final courses = _CoursesRepo();
      final lessons = _LessonsRepo();
      await tester.pumpWidget(_app(const SizedBox(), courses, lessons));
      final container = ProviderScope.containerOf(tester.element(find.byType(SizedBox)));

      await container.read(chaptersProvider.notifier).refreshQuietly(bearerToken: 'tok');
      await container.read(lessonsListProvider.notifier).refreshQuietly(bearerToken: 'tok');

      expect(lessons.chapterCalls, 0);
      expect(lessons.lessonCalls, 0);
    });
  });
}
