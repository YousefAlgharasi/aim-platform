import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/routing/routing.dart';
import '../core/theme/theme.dart';
import '../features/auth/logic/provider/auth_context_provider.dart';
import '../features/auth/logic/provider/auth_flow_provider.dart';

class AimMobileApp extends ConsumerWidget {
  const AimMobileApp({super.key});

  static const String appTitle = 'AIM Mobile';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authFlowProvider);
    final authContextState = ref.watch(authContextProvider);

    return MaterialApp(
      title: appTitle,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: AppRoutePaths.splash,
      onGenerateRoute: (settings) => AppRouter.onGenerateRoute(
        settings,
        authState: authState,
        authContextState: authContextState,
      ),
    );
  }
}
