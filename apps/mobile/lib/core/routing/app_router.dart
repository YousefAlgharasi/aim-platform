import 'package:flutter/material.dart';

import '../../features/auth/ui/pages/login_page.dart';
import '../../features/auth/ui/pages/register_page.dart';
import '../../features/auth/ui/pages/sign_in_placeholder_page.dart';
import '../../features/onboarding/ui/pages/splash_placeholder_page.dart';
import '../../features/shell/ui/pages/main_shell_page.dart';
import 'app_route_paths.dart';

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
          default:
            return const SplashPlaceholderPage();
        }
      },
    );
  }
}
