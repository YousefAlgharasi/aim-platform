import 'package:aim_mobile/features/auth/ui/pages/register_page.dart';
import 'package:flutter/material.dart';

import '../state/app_async_state.dart';
import '../../features/auth/data/models/auth_context_model.dart';
import '../../features/auth/logic/entity/auth_flow_state.dart';
import '../../features/auth/ui/pages/login_page.dart';
import '../../features/onboarding/ui/pages/splash_placeholder_page.dart';
import '../../features/placement/ui/pages/placement_question_page.dart';
import '../../features/placement/ui/pages/placement_result_page.dart';
import '../../features/placement/ui/pages/placement_section_page.dart';
import '../../features/placement/ui/pages/placement_start_page.dart';
import '../../features/placement/ui/pages/placement_submit_page.dart';
import '../../features/shell/ui/pages/main_shell_page.dart';
import 'app_route_paths.dart';

class AppRouter {
  const AppRouter._();

  static Route<dynamic> onGenerateRoute(
    RouteSettings settings, {
    AuthFlowState? authState,
    AppAsyncState<AuthContextModel>? authContextState,
  }) {
    final routeName = resolveRouteName(
      settings.name,
      authState: authState,
      authContextState: authContextState,
    );

    return MaterialPageRoute<void>(
      settings: RouteSettings(name: routeName, arguments: settings.arguments),
      builder: (context) {
        switch (routeName) {
          case AppRoutePaths.splash:
            return const SplashPlaceholderPage();
          case AppRoutePaths.signIn:
            return const LoginPage();
          case AppRoutePaths.register:
            return const RegisterPage();
          case AppRoutePaths.mainShell:
          case AppRoutePaths.home:
          case AppRoutePaths.learn:
          case AppRoutePaths.review:
          case AppRoutePaths.progress:
          case AppRoutePaths.profile:
            return const MainShellPage();
          // P6-021: Placement Test flow routes — guarded, backend-driven
          case AppRoutePaths.placementStart:
            return const PlacementStartPage();
          case AppRoutePaths.placementSection:
            return const PlacementSectionPage();
          case AppRoutePaths.placementQuestion:
            return const PlacementQuestionPage();
          case AppRoutePaths.placementSubmit:
            return const PlacementSubmitPage();
          case AppRoutePaths.placementResult:
            return const PlacementResultPage();
          default:
            return const SplashPlaceholderPage();
        }
      },
    );
  }

  static Widget _buildPlacementSection(Object? arguments) {
    final args = _placementArgs(arguments);
    final attemptId = args['attemptId'];

    if (attemptId is! String) return const SplashPlaceholderPage();

    return PlacementSectionPage(attemptId: attemptId);
  }

  static Widget _buildPlacementQuestion(Object? arguments) {
    final args = _placementArgs(arguments);
    final sectionId = args['sectionId'];
    final attemptId = args['attemptId'];
    final sectionTitle = args['sectionTitle'];
    final sectionIndex = args['sectionIndex'];
    final totalSections = args['totalSections'];

    if (sectionId is! String ||
        attemptId is! String ||
        sectionTitle is! String ||
        sectionIndex is! int ||
        totalSections is! int) {
      return const SplashPlaceholderPage();
    }

    return PlacementQuestionPage(
      sectionId: sectionId,
      attemptId: attemptId,
      sectionTitle: sectionTitle,
      sectionIndex: sectionIndex,
      totalSections: totalSections,
    );
  }

  static Widget _buildPlacementSubmit(Object? arguments) {
    final args = _placementArgs(arguments);
    final attemptId = args['attemptId'];

    if (attemptId is! String) return const SplashPlaceholderPage();

    return PlacementSubmitPage(attemptId: attemptId);
  }

  static Widget _buildPlacementResult(Object? arguments) {
    final args = _placementArgs(arguments);
    final attemptId = args['attemptId'];

    if (attemptId is! String) return const SplashPlaceholderPage();

    return PlacementResultPage(attemptId: attemptId);
  }

  static Widget _buildLessonDetailPage(Object? arguments) {
    final args = arguments is Map<String, dynamic> ? arguments : const <String, dynamic>{};
    final lessonId = args['lessonId'];
    final lessonTitle = args['lessonTitle'];
    if (lessonId is! String || lessonTitle is! String) {
      return const SplashPlaceholderPage();
    }
    return LessonDetailPage(lessonId: lessonId, lessonTitle: lessonTitle);
  }

  static Widget _buildLessonListPage(Object? arguments) {
    final args = arguments is Map<String, dynamic> ? arguments : const <String, dynamic>{};
    final chapterId = args['chapterId'];
    final chapterTitle = args['chapterTitle'];
    if (chapterId is! String || chapterTitle is! String) {
      return const SplashPlaceholderPage();
    }
    return LessonListPage(chapterId: chapterId, chapterTitle: chapterTitle);
  }

  static Widget _buildChapterListPage(Object? arguments) {
    final args = arguments is Map<String, dynamic> ? arguments : const <String, dynamic>{};
    final levelId = args['levelId'];
    final courseTitle = args['courseTitle'];
    if (levelId is! String || courseTitle is! String) {
      return const SplashPlaceholderPage();
    }
    return ChapterListPage(levelId: levelId, courseTitle: courseTitle);
  }

  static Map<String, dynamic> _placementArgs(Object? arguments) {
    return arguments is Map<String, dynamic> ? arguments : const {};
  }

  static String resolveRouteName(
    String? requestedRouteName, {
    AuthFlowState? authState,
    AppAsyncState<AuthContextModel>? authContextState,
  }) {
    final routeName = requestedRouteName ?? AppRoutePaths.splash;
    final isProtectedRoute = _protectedRoutes.contains(routeName);

    if (authState == null) {
      return routeName;
    }

    if (authState.isChecking) {
      return AppRoutePaths.splash;
    }

    if (authState.isSignedOut &&
        (isProtectedRoute || routeName == AppRoutePaths.splash)) {
      return AppRoutePaths.signIn;
    }

    final hasProfileReadyContext = authContextState == null ||
        authContextState is AppAsyncSuccess<AuthContextModel>;

    if (authState.isSignedIn &&
        hasProfileReadyContext &&
        (routeName == AppRoutePaths.splash ||
            routeName == AppRoutePaths.signIn)) {
      return AppRoutePaths.mainShell;
    }

    return routeName;
  }

  static const Set<String> _protectedRoutes = {
    AppRoutePaths.mainShell,
    AppRoutePaths.home,
    AppRoutePaths.learn,
    AppRoutePaths.review,
    AppRoutePaths.progress,
    AppRoutePaths.profile,
    // P6-021: Placement routes are protected — must be authenticated
    AppRoutePaths.placementStart,
    AppRoutePaths.placementSection,
    AppRoutePaths.placementQuestion,
    AppRoutePaths.placementSubmit,
    AppRoutePaths.placementResult,
  };
}
