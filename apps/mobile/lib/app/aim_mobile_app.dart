import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/localization/localization.dart';
import '../core/routing/routing.dart';
import '../core/theme/theme.dart';
import '../features/auth/logic/provider/auth_context_provider.dart';
import '../features/auth/logic/provider/auth_flow_provider.dart';
import '../features/auth/logic/provider/deep_link_handler.dart';

final _rootScaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
final _rootNavigatorKey = GlobalKey<NavigatorState>();

/// Bridges Riverpod provider changes into GoRouter's `refreshListenable`, so
/// the router's `redirect` callback re-runs whenever auth state changes —
/// without rebuilding (and losing the navigation stack of) the [GoRouter]
/// instance itself.
class _RouterRefreshNotifier extends ChangeNotifier {
  void refresh() => notifyListeners();
}

class AimMobileApp extends ConsumerStatefulWidget {
  const AimMobileApp({super.key});

  static const String appTitle = 'AIM Mobile';

  @override
  ConsumerState<AimMobileApp> createState() => _AimMobileAppState();
}

class _AimMobileAppState extends ConsumerState<AimMobileApp> {
  final _refreshNotifier = _RouterRefreshNotifier();
  late final GoRouter _router = AppRouter.buildRouter(
    navigatorKey: _rootNavigatorKey,
    refreshListenable: _refreshNotifier,
    authState: () => ref.read(authFlowProvider),
    authContextState: () => ref.read(authContextProvider),
  );

  @override
  void initState() {
    super.initState();
    ref.read(deepLinkHandlerProvider).init(_router);
    ref.listenManual(authFlowProvider, (_, __) => _refreshNotifier.refresh());
    ref.listenManual(
        authContextProvider, (_, __) => _refreshNotifier.refresh());
  }

  @override
  void dispose() {
    _refreshNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);

    return MaterialApp.router(
      title: AimMobileApp.appTitle,
      debugShowCheckedModeBanner: false,
      scaffoldMessengerKey: _rootScaffoldMessengerKey,

      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,

      locale: locale,
      supportedLocales: AppLocale.supportedLocales,
      localizationsDelegates: AppLocale.delegates,

      routerConfig: _router,
    );
  }
}
