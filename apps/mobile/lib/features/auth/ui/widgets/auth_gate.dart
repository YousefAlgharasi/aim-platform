import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../logic/provider/app_bootstrap_notifier.dart';
import '../../logic/provider/app_bootstrap_provider.dart';
import '../../logic/provider/auth_flow_provider.dart';

/// Reactive auth gate that drives navigation based on [authFlowProvider].
///
/// Mount this widget once inside the splash screen's [initState] / first
/// build.  It watches [appBootstrapProvider] and [authFlowProvider] and
/// pushes to the correct named route as soon as the auth state resolves:
///
/// | Auth state  | Destination               |
/// |-------------|---------------------------|
/// | checking    | stay on splash            |
/// | signedOut   | `/auth/sign-in`           |
/// | signedIn    | `/main`                   |
///
/// The gate uses [AppRouter.resolveRouteName] as the single source of truth
/// for the routing decision, keeping gate logic and router logic in sync.
///
/// RTL / Arabic: this widget emits no UI of its own; it only drives
/// [Navigator] calls.  Direction-sensitive rendering happens in the
/// destination pages.
///
/// Security:
/// - The gate never inspects or stores credentials.
/// - All authorisation decisions are made by the backend and reflected in
///   [authFlowProvider] after the backend responds.
class AuthGate extends ConsumerStatefulWidget {
  const AuthGate({super.key});

  @override
  ConsumerState<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends ConsumerState<AuthGate> {
  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();
    // Trigger the bootstrap provider to start the session check immediately.
    // Reading it here ensures the provider is alive and [_checkSession] runs.
    ref.read(appBootstrapProvider);
  }

  @override
  Widget build(BuildContext context) {
    final bootstrapStatus = ref.watch(appBootstrapProvider);
    final authState = ref.watch(authFlowProvider);

    // Still checking — no navigation yet.
    if (bootstrapStatus == AppBootstrapStatus.checking) {
      return const SizedBox.shrink();
    }

    // Bootstrap done — resolve the target route.
    if (!_hasNavigated) {
      final target = AppRouter.resolveRouteName(
        AppRoutePaths.splash,
        authState: authState,
      );

      // Schedule the navigation after the current build frame to avoid
      // calling Navigator during a build.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted || _hasNavigated) return;
        _hasNavigated = true;

        if (target == AppRoutePaths.splash) {
          // resolveRouteName returned splash — auth still ambiguous.
          // This should not happen after bootstrap completes, but guard it.
          return;
        }

        Navigator.of(context).pushNamedAndRemoveUntil(
          target,
          (route) => false,
        );
      });
    }

    return const SizedBox.shrink();
  }
}
