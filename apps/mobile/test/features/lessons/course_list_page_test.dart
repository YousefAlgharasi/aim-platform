// Phase 6 — P6-073
// course_list_page_test.dart — widget tests for CourseListPage.
//
// Covers:
//   1. Loading state renders without crash.
//   2. Error state renders error message.
//   3. Empty success state renders AIMEmptyState.
//   4. Populated state renders course titles.
//   5. RTL layout renders without error.
//   6. Course level/percent/status are backend values — not mutated in UI.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/entity/current_enrollment.dart';
import 'package:aim_mobile/features/enrollment/logic/provider/enrollment_provider.dart';
import 'package:aim_mobile/features/enrollment/logic/repository/enrollment_repository.dart';
import 'package:aim_mobile/features/lessons/ui/pages/course_list_page.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_notifier.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';
import 'package:aim_mobile/features/student_courses/logic/repository/student_courses_repository.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

Widget _wrap(
  Widget child, {
  List<Override> overrides = const [],
  TextDirection dir = TextDirection.ltr,
}) =>
    ProviderScope(
      overrides: overrides,
      child: MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: Directionality(textDirection: dir, child: child),
      ),
    );

const _courses = [
  StudentCourseModel(
    courseId: 'course-1',
    title: 'English B1',
    levelCode: 'B1',
    lessonCount: 20,
    completedLessonCount: 5,
    percent: 25,
    status: StudentCourseStatus.inProgress,
    locked: false,
  ),
  StudentCourseModel(
    courseId: 'course-2',
    title: 'Math Foundations',
    levelCode: null,
    lessonCount: 10,
    completedLessonCount: 0,
    percent: 0,
    status: StudentCourseStatus.notStarted,
    locked: false,
  ),
];

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('CourseListPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          studentCoursesProvider.overrideWith(
            (ref) => _FakeStudentCoursesNotifier(const AppAsyncState.loading()),
          ),
        ],
      ));
      await tester.pump();
      expect(find.byType(CourseListPage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          studentCoursesProvider.overrideWith(
            (ref) => _FakeStudentCoursesNotifier(
                const AppAsyncState.failure(message: 'Load failed')),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Load failed'), findsOneWidget);
    });

    testWidgets('shows empty state when courses list is empty', (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          studentCoursesProvider.overrideWith(
            (ref) =>
                _FakeStudentCoursesNotifier(const AppAsyncState.success([])),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('No courses available'), findsOneWidget);
    });

    testWidgets('shows course titles when populated', (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          studentCoursesProvider.overrideWith(
            (ref) => _FakeStudentCoursesNotifier(
                const AppAsyncState.success(_courses)),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('English B1'), findsOneWidget);
      expect(find.text('Math Foundations'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality',
        (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          studentCoursesProvider.overrideWith(
            (ref) => _FakeStudentCoursesNotifier(
                const AppAsyncState.success(_courses)),
          ),
        ],
        dir: TextDirection.rtl,
      ));
      await tester.pump();
      expect(find.byType(CourseListPage), findsOneWidget);
      expect(find.text('English B1'), findsOneWidget);
    });

    testWidgets(
        'course level, percent, and status are backend values — not mutated',
        (tester) async {
      // The widget renders these verbatim from the model; this test confirms
      // the model values are not recomputed before display.
      final course = _courses[0];
      expect(course.levelCode, 'B1');
      expect(course.percent, 25);
      expect(course.status, StudentCourseStatus.inProgress);

      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          studentCoursesProvider.overrideWith(
            (ref) => _FakeStudentCoursesNotifier(
              AppAsyncState.success([course]),
            ),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('English B1'), findsOneWidget);
      expect(find.text('25%'), findsOneWidget);
      expect(find.text('In progress'), findsWidgets);
    });

    testWidgets('tapping a locked course tile shows a message and does not navigate',
        (tester) async {
      final router = GoRouter(routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const CourseListPage(),
        ),
        GoRoute(
          path: AppRoutePaths.courseChapters,
          builder: (context, state) => const Scaffold(body: Text('Chapters')),
        ),
      ]);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            studentCoursesProvider.overrideWith(
              (ref) => _FakeStudentCoursesNotifier(
                AppAsyncState.success([
                  const StudentCourseModel(
                    courseId: 'locked-course',
                    title: 'Locked Course',
                    levelCode: 'B2',
                    lessonCount: 5,
                    completedLessonCount: 0,
                    percent: 0,
                    status: StudentCourseStatus.notStarted,
                    locked: true,
                  ),
                ]),
              ),
            ),
          ],
          child: MaterialApp.router(
            theme: AppTheme.light,
            localizationsDelegates: AppLocale.delegates,
            supportedLocales: AppLocale.supportedLocales,
            routerConfig: router,
          ),
        ),
      );
      await tester.pump();

      await tester.tap(find.text('Locked Course'));
      await tester.pump();

      expect(find.text('Chapters'), findsNothing);
      // The locked message now appears twice: once always-visible inline on
      // the tile (P25 UX pass — locked-content messaging), and once via the
      // tap-triggered SnackBar (pre-existing behavior).
      expect(
        find.text('Finish your current level to unlock this course'),
        findsNWidgets(2),
      );
    });

    testWidgets('tapping an unlocked course tile navigates to chapters',
        (tester) async {
      final router = GoRouter(routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const CourseListPage(),
        ),
        GoRoute(
          path: AppRoutePaths.courseChapters,
          builder: (context, state) => const Scaffold(body: Text('Chapters')),
        ),
      ]);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authFlowProvider.overrideWith(
              (ref) => AuthFlowNotifier()
                ..signIn('learner@example.com', accessToken: 'tok-abc'),
            ),
            studentCoursesProvider.overrideWith(
              (ref) => _FakeStudentCoursesNotifier(
                AppAsyncState.success([
                  const StudentCourseModel(
                    courseId: 'unlocked-course',
                    title: 'Unlocked Course',
                    levelCode: 'A1',
                    lessonCount: 5,
                    completedLessonCount: 0,
                    percent: 0,
                    status: StudentCourseStatus.notStarted,
                    locked: false,
                  ),
                ]),
              ),
            ),
            currentEnrollmentProvider.overrideWith(
              (ref) => CurrentEnrollmentNotifier(
                repository: _FakeEnrollmentRepository(),
              )..state = const AsyncValue.data(CurrentEnrollment.none),
            ),
          ],
          child: MaterialApp.router(
            theme: AppTheme.light,
            localizationsDelegates: AppLocale.delegates,
            supportedLocales: AppLocale.supportedLocales,
            routerConfig: router,
          ),
        ),
      );
      await tester.pump();

      // Bugfix: tapping an unlocked course no longer navigates immediately —
      // it's an explicit "start this course" action (course_enrollments),
      // confirmed via a dialog since the student has no active course yet.
      await tester.tap(find.text('Unlocked Course'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Start course'));
      await tester.pumpAndSettle();

      expect(find.text('Chapters'), findsOneWidget);
    });

    testWidgets(
      'tapping the already-active course navigates straight through, no dialog',
      (tester) async {
        final router = GoRouter(routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const CourseListPage(),
          ),
          GoRoute(
            path: AppRoutePaths.courseChapters,
            builder: (context, state) => const Scaffold(body: Text('Chapters')),
          ),
        ]);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              authFlowProvider.overrideWith(
                (ref) => AuthFlowNotifier()
                  ..signIn('learner@example.com', accessToken: 'tok-abc'),
              ),
              studentCoursesProvider.overrideWith(
                (ref) => _FakeStudentCoursesNotifier(
                  AppAsyncState.success([
                    const StudentCourseModel(
                      courseId: 'active-course',
                      title: 'Active Course',
                      levelCode: 'A1',
                      lessonCount: 5,
                      completedLessonCount: 1,
                      percent: 20,
                      status: StudentCourseStatus.inProgress,
                      locked: false,
                    ),
                  ]),
                ),
              ),
              currentEnrollmentProvider.overrideWith(
                (ref) => CurrentEnrollmentNotifier(
                  repository: _FakeEnrollmentRepository(
                    current: const CurrentEnrollment(
                      found: true,
                      courseId: 'active-course',
                      courseTitle: 'Active Course',
                      enrolledAt: '2026-07-01T00:00:00Z',
                    ),
                  ),
                ),
              ),
            ],
            child: MaterialApp.router(
              theme: AppTheme.light,
              localizationsDelegates: AppLocale.delegates,
              supportedLocales: AppLocale.supportedLocales,
              routerConfig: router,
            ),
          ),
        );
        await tester.pump();
        await tester.pump();

        // Already the active enrollment — tapping navigates directly, no
        // "start course" confirmation needed.
        expect(find.text('Current'), findsOneWidget);
        await tester.tap(find.text('Active Course'));
        await tester.pumpAndSettle();

        expect(find.text('Chapters'), findsOneWidget);
        expect(find.text('Start this course?'), findsNothing);
      },
    );
  });
}

// ── Fake notifier ─────────────────────────────────────────────────────────────

class _FakeStudentCoursesNotifier extends StudentCoursesNotifier {
  _FakeStudentCoursesNotifier(
      AppAsyncState<List<StudentCourseModel>> initialState)
      : super(repository: _FakeStudentCoursesRepository()) {
    state = initialState;
  }

  @override
  Future<void> load({required String bearerToken}) async {}
  @override
  Future<void> refresh({required String bearerToken}) async {}
}

class _FakeStudentCoursesRepository implements StudentCoursesRepository {
  @override
  Future<List<StudentCourseModel>> getCourses({
    required String bearerToken,
  }) async =>
      const [];
}

class _FakeEnrollmentRepository implements EnrollmentRepository {
  _FakeEnrollmentRepository({this.current = CurrentEnrollment.none});

  final CurrentEnrollment current;

  @override
  Future<CurrentEnrollment> getCurrent({required String bearerToken}) async =>
      current;

  @override
  Future<CurrentEnrollment> enroll({
    required String bearerToken,
    required String courseId,
  }) async =>
      CurrentEnrollment(
        found: true,
        courseId: courseId,
        courseTitle: 'Unlocked Course',
        enrolledAt: '2026-07-05T00:00:00Z',
      );
}
