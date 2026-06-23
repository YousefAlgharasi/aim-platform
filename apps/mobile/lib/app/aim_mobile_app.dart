import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/localization/localization.dart';
import '../core/routing/routing.dart';
import '../core/theme/theme.dart';
import '../features/auth/logic/provider/auth_context_provider.dart';
import '../features/auth/logic/provider/auth_flow_provider.dart';

final _rootScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class AimMobileApp extends ConsumerWidget {
  const AimMobileApp({super.key});

  static const String appTitle = 'AIM Mobile';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authFlowProvider);
    final authContextState = ref.watch(authContextProvider);
    final themeMode = ref.watch(themeModeProvider);

    // RTL/Arabic: active locale drives TextDirection across the entire app.
    // Feature widgets must never hard-code TextDirection.ltr or .rtl.
    final locale = ref.watch(localeProvider);

    return MaterialApp(
      title: appTitle,
      debugShowCheckedModeBanner: false,
      scaffoldMessengerKey: _rootScaffoldMessengerKey,

      // ── Theme ───────────────────────────────────────────────────────────
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,

      // ── Localization & RTL ───────────────────────────────────────────────
      // locale drives TextDirection automatically:
      //   Locale('en') → TextDirection.ltr
      //   Locale('ar') → TextDirection.rtl
      locale: locale,
      supportedLocales: AppLocale.supportedLocales,
      localizationsDelegates: AppLocale.delegates,

      // ── Routing ─────────────────────────────────────────────────────────
      initialRoute: AppRoutePaths.splash,
      onGenerateRoute: (settings) => AppRouter.onGenerateRoute(
        settings,
        authState: authState,
        authContextState: authContextState,
      ),
    );
  }
}
