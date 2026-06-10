import 'package:flutter/material.dart';

import '../core/routing/routing.dart';
import '../core/theme/theme.dart';

class AimMobileApp extends StatelessWidget {
  const AimMobileApp({super.key});

  static const String appTitle = 'AIM Mobile';

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: appTitle,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: AppRoutePaths.splash,
      onGenerateRoute: AppRouter.onGenerateRoute,
    );
  }
}
