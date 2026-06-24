import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/localization/localization.dart';
import '../core/routing/routing.dart';
import '../core/theme/theme.dart';
import '../features/auth/logic/provider/auth_context_provider.dart';
import '../features/auth/logic/provider/auth_flow_provider.dart';
import '../features/auth/logic/provider/deep_link_handler.dart';

final _rootScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
final _rootNavigatorKey = GlobalKey<NavigatorState>();

class AimMobileApp extends ConsumerStatefulWidget {
  const AimMobileApp({super.key});

  static const String appTitle = 'AIM Mobile';

  @override
  ConsumerState<AimMobileApp> createState() => _AimMobileAppState();
}

class _AimMobileAppState extends ConsumerState<AimMobileApp> {
  @override
  void initState() {
    super.initState();
    ref.read(deepLinkHandlerProvider).init(_rootNavigatorKey);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authFlowProvider);
    final authContextState = ref.watch(authContextProvider);
    final themeMode = ref.watch(themeModeProvider);

    final locale = ref.watch(localeProvider);

    return MaterialApp(
      title: AimMobileApp.appTitle,
      debugShowCheckedModeBanner: false,
      scaffoldMessengerKey: _rootScaffoldMessengerKey,
      navigatorKey: _rootNavigatorKey,

      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,

      locale: locale,
      supportedLocales: AppLocale.supportedLocales,
      localizationsDelegates: AppLocale.delegates,

      initialRoute: AppRoutePaths.splash,
      onGenerateRoute: (settings) => AppRouter.onGenerateRoute(
        settings,
        authState: authState,
        authContextState: authContextState,
      ),
    );
  }
}
