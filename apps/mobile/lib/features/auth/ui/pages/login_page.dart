import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/state/app_form_state.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../../logic/provider/login_provider.dart';

/// Login screen — Phase 2: Auth, Users, Roles.
///
/// Allows an authenticated user to sign in through the mobile app flow.
///
/// - Calls Supabase Auth for the bearer token.
/// - Syncs and loads the current user from the backend via [AuthContextNotifier].
/// - Transitions the global [authFlowProvider] to signedIn on success.
///
/// Security rules:
/// - No service-role keys, JWT secrets, or backend credentials appear here.
/// - Role and permission checks are backend-enforced; this UI is UX only.
/// - The form never decides authorization.
class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  void _onEmailChanged(String value) {
    ref.read(loginProvider.notifier).setEmail(value);
  }

  void _onPasswordChanged(String value) {
    ref.read(loginProvider.notifier).setPassword(value);
  }

  void _togglePasswordVisibility() {
    setState(() => _obscurePassword = !_obscurePassword);
  }

  Future<void> _submit() async {
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    await ref.read(loginProvider.notifier).submit();
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(loginProvider);
    final authFlow = ref.watch(authFlowProvider);
    final theme = Theme.of(context);

    // Navigate away once signedIn.
    ref.listen(authFlowProvider, (_, next) {
      if (next.isSignedIn && mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          '/main-shell',
          (route) => false,
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign In'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          children: [
            _AimLogo(),
            const SizedBox(height: 32),
            _SectionLabel('Sign in to AIM'),
            const SizedBox(height: 24),

            // Email field
            TextField(
              controller: _emailController,
              focusNode: _emailFocus,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              autocorrect: false,
              onChanged: _onEmailChanged,
              onSubmitted: (_) => _passwordFocus.requestFocus(),
              decoration: const InputDecoration(
                labelText: 'Email',
                hintText: 'you@example.com',
                prefixIcon: Icon(Icons.email_outlined),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Password field
            TextField(
              controller: _passwordController,
              focusNode: _passwordFocus,
              obscureText: _obscurePassword,
              textInputAction: TextInputAction.done,
              onChanged: _onPasswordChanged,
              onSubmitted: (_) => _submit(),
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock_outline),
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                  ),
                  onPressed: _togglePasswordVisibility,
                  tooltip:
                      _obscurePassword ? 'Show password' : 'Hide password',
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Error message
            if (formState.errorMessage != null) ...[
              _ErrorBanner(formState.errorMessage!),
              const SizedBox(height: 16),
            ],

            // Submit button
            FilledButton(
              onPressed:
                  (formState.isValid && !formState.isSubmitting)
                      ? _submit
                      : null,
              child: formState.isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Sign In'),
            ),

            // Invisible auth flow state — used by ref.listen above.
            // Show a subtle checking indicator when auth is in checking state.
            if (authFlow.isChecking)
              const Padding(
                padding: EdgeInsets.only(top: 12),
                child: LinearProgressIndicator(),
              ),
          ],
        ),
      ),
    );
  }
}

class _AimLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        children: [
          Icon(
            Icons.school_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.primary,
          ),
          const SizedBox(height: 8),
          Text(
            'AIM',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
          ),
          Text(
            'Adaptive Intelligence for Mastery',
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: Theme.of(context)
          .textTheme
          .titleMedium
          ?.copyWith(fontWeight: FontWeight.w600),
      textAlign: TextAlign.center,
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner(this.message);
  final String message;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: colorScheme.errorContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: colorScheme.onErrorContainer),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(color: colorScheme.onErrorContainer),
            ),
          ),
        ],
      ),
    );
  }
}
