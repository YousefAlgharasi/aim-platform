import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../widgets/auth_placeholder_banner.dart';

class SignInPlaceholderPage extends ConsumerStatefulWidget {
  const SignInPlaceholderPage({super.key});

  @override
  ConsumerState<SignInPlaceholderPage> createState() =>
      _SignInPlaceholderPageState();
}

class _SignInPlaceholderPageState extends ConsumerState<SignInPlaceholderPage> {
  final TextEditingController _emailController = TextEditingController(
    text: 'learner@example.com',
  );

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _continueWithPlaceholderAuth() {
    ref
        .read(authFlowProvider.notifier)
        .signInPlaceholder(_emailController.text.trim());

    Navigator.of(context).pushNamedAndRemoveUntil(
      AppRoutePaths.mainShell,
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authFlowProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('AIM Sign In')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const AuthPlaceholderBanner(),
          const SizedBox(height: 16),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email placeholder',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _continueWithPlaceholderAuth,
            child: const Text('Continue with placeholder auth'),
          ),
          const SizedBox(height: 12),
          Text(
            authState.email == null
                ? 'No placeholder learner signed in.'
                : 'Placeholder learner: ${authState.email}',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
