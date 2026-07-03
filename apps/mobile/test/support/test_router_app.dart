import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

/// Minimal app shell mirroring `AimMobileApp`'s router wiring, scoped for
/// widget tests: builds a single [GoRouter] (via [AppRouter.buildRouter])
/// that reads auth state from the ambient [ProviderScope] via `ref.read`.
///
/// No refresh listenable is wired here — tests using this harness set up
/// their final auth state via provider overrides before the first pump, so
/// there's nothing to react to after the router is built.
class TestRouterApp extends ConsumerWidget {
  const TestRouterApp({
    super.key,
    this.initialLocation = AppRoutePaths.splash,
    this.locale,
  });

  final String initialLocation;
  final Locale? locale;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = AppRouter.buildRouter(
      initialLocation: initialLocation,
      authState: () => ref.read(authFlowProvider),
      authContextState: () => ref.read(authContextProvider),
    );
    return MaterialApp.router(routerConfig: router, locale: locale);
  }
}
