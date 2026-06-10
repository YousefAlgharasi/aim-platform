import 'package:flutter/material.dart';

import '../../features/auth/ui/pages/sign_in_placeholder_page.dart';
import '../../features/home/ui/pages/home_placeholder_page.dart';
import '../../features/lessons/ui/pages/learn_placeholder_page.dart';
import '../../features/onboarding/ui/pages/splash_placeholder_page.dart';
import '../../features/profile/ui/pages/profile_placeholder_page.dart';
import '../../features/progress/ui/pages/progress_placeholder_page.dart';
import '../../features/reviews/ui/pages/review_placeholder_page.dart';
import 'app_route_paths.dart';
import 'main_shell_placeholder_page.dart';

class AppRouter {
  const AppRouter._();

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    return MaterialPageRoute<void>(
      settings: settings,
      builder: (context) {
        switch (settings.name) {
          case AppRoutePaths.splash:
            return const SplashPlaceholderPage();
          case AppRoutePaths.signIn:
            return const SignInPlaceholderPage();
          case AppRoutePaths.mainShell:
            return const MainShellPlaceholderPage();
          case AppRoutePaths.home:
            return const HomePlaceholderPage();
          case AppRoutePaths.learn:
            return const LearnPlaceholderPage();
          case AppRoutePaths.review:
            return const ReviewPlaceholderPage();
          case AppRoutePaths.progress:
            return const ProgressPlaceholderPage();
          case AppRoutePaths.profile:
            return const ProfilePlaceholderPage();
          default:
            return const SplashPlaceholderPage();
        }
      },
    );
  }
}
