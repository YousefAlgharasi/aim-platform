import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../logic/provider/app_bootstrap_provider.dart';

/// Reactive auth gate — mounted on the splash screen to kick off the
/// session-restore check as soon as the app launches.
///
/// Navigation itself is no longer driven imperatively from here: once
/// [appBootstrapProvider] settles [authFlowProvider] into `signedOut` or
/// `signedIn`, [AppRouter]'s `redirect` callback (wired to `authFlowProvider`
/// via a refresh listenable in [AimMobileApp]) reactively redirects away
/// from splash to the correct destination. This widget's only remaining job
/// is to ensure the bootstrap provider is alive so [AppBootstrapNotifier]
/// runs its session check.
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
  @override
  void initState() {
    super.initState();
    // Trigger the bootstrap provider to start the session check immediately.
    // Reading it here ensures the provider is alive and [_checkSession] runs.
    ref.read(appBootstrapProvider);
  }

  @override
  Widget build(BuildContext context) {
    // No UI, no navigation — see class doc. Kept mounted on the splash page
    // solely so the bootstrap provider above stays alive for its lifetime.
    ref.watch(appBootstrapProvider);
    return const SizedBox.shrink();
  }
}
