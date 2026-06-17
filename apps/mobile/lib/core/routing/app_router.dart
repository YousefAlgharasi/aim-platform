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

    if (authState.isSignedOut && isProtectedRoute) {
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
