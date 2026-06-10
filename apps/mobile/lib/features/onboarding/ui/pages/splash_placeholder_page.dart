import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../auth/logic/entity/auth_flow_status.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';

class SplashPlaceholderPage extends ConsumerWidget {
  const SplashPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authFlowProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('AIM Splash')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Splash placeholder'),
              const SizedBox(height: 8),
              Text('Auth state: ${authState.status.name}'),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () {
                  ref.read(authFlowProvider.notifier).completeBootstrap();
                  Navigator.of(context).pushNamed(AppRoutePaths.signIn);
                },
                child: const Text('Start auth placeholder flow'),
              ),
              TextButton(
                onPressed: authState.status == AuthFlowStatus.signedIn
                    ? () => Navigator.of(context).pushNamed(AppRoutePaths.mainShell)
                    : null,
                child: const Text('Open main shell'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
