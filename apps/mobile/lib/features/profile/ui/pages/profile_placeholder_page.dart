import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../shell/ui/widgets/main_shell_placeholder_card.dart';

class ProfilePlaceholderPage extends ConsumerWidget {
  const ProfilePlaceholderPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authFlowProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('AIM Profile')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          MainShellPlaceholderCard(
            title: 'Profile',
            description: authState.email == null
                ? 'Profile placeholder. No placeholder learner is signed in.'
                : 'Profile placeholder for ${authState.email}. Real account data will come from the Backend API.',
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () {
              ref.read(authFlowProvider.notifier).signOutPlaceholder();
              Navigator.of(context).pushNamedAndRemoveUntil(
                AppRoutePaths.signIn,
                (route) => false,
              );
            },
            child: const Text('Sign out placeholder'),
          ),
        ],
      ),
    );
  }
}
