import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/app_route_paths.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../../logic/provider/register_notifier.dart';
import '../../logic/provider/register_provider.dart';

/// Registration screen — Phase 2: Auth, Users, Roles.
///
/// Allows a new user to create an account through the mobile app.
///
/// Flow:
/// - Email + password + confirm-password form.
/// - Calls Supabase Auth signup via [RegisterNotifier].
/// - If auto-confirmed: backend sync → [authFlowProvider] signedIn → navigate to main.
/// - If email confirmation required: show confirmation message; user must verify email.
///
/// Security rules:
/// - No service-role keys, JWT secrets, or backend credentials here.
/// - Role and permission checks are backend-enforced; this UI is UX only.
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _confirmFocus = FocusNode();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    _confirmFocus.dispose();
    super.dispose();
  }

  void _onEmailChanged(String v) =>
      ref.read(registerProvider.notifier).setEmail(v);
  void _onPasswordChanged(String v) =>
      ref.read(registerProvider.notifier).setPassword(v);
  void _onConfirmChanged(String v) =>
      ref.read(registerProvider.notifier).setConfirmPassword(v);

  Future<void> _submit() async {
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    _confirmFocus.unfocus();
    await ref.read(registerProvider.notifier).submit();
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(registerProvider);
    final notifier = ref.read(registerProvider.notifier);

    // Navigate to main shell when auto-confirmed and signed in.
    ref.listen(authFlowProvider, (_, next) {
      if (next.isSignedIn && mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutePaths.mainShell,
          (route) => false,
        );
      }
    });

    // Show confirmation screen when email confirmation is required.
    final outcome = notifier.outcome;
    if (outcome == RegisterOutcome.awaitingEmailConfirmation) {
      return _ConfirmationSentScreen(email: _emailController.text.trim());
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          children: [
            _AimLogo(),
            const SizedBox(height: 32),
            _SectionLabel('Create your AIM account'),
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
              textInputAction: TextInputAction.next,
              onChanged: _onPasswordChanged,
              onSubmitted: (_) => _confirmFocus.requestFocus(),
              decoration: InputDecoration(
                labelText: 'Password',
                hintText: 'At least 6 characters',
                prefixIcon: const Icon(Icons.lock_outline),
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(_obscurePassword
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined),
                  onPressed: () =>
                      setState(() => _obscurePassword = !_obscurePassword),
                  tooltip: _obscurePassword ? 'Show password' : 'Hide password',
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Confirm password field
            TextField(
              controller: _confirmPasswordController,
              focusNode: _confirmFocus,
              obscureText: _obscureConfirm,
              textInputAction: TextInputAction.done,
              onChanged: _onConfirmChanged,
              onSubmitted: (_) => _submit(),
              decoration: InputDecoration(
                labelText: 'Confirm Password',
                prefixIcon: const Icon(Icons.lock_outline),
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: Icon(_obscureConfirm
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined),
                  onPressed: () =>
                      setState(() => _obscureConfirm = !_obscureConfirm),
                  tooltip:
                      _obscureConfirm ? 'Show password' : 'Hide password',
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Password match hint
            if (_confirmPasswordController.text.isNotEmpty &&
                _passwordController.text != _confirmPasswordController.text)
              const Padding(
                padding: EdgeInsets.only(bottom: 12),
                child: _PasswordMismatchHint(),
              ),

            // Error message
            if (formState.errorMessage != null) ...[
              _ErrorBanner(formState.errorMessage!),
              const SizedBox(height: 16),
            ],

            // Submit button
            FilledButton(
              onPressed: (formState.isValid && !formState.isSubmitting)
                  ? _submit
                  : null,
              child: formState.isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Create Account'),
            ),
            const SizedBox(height: 16),

            // Back to sign in
            TextButton(
              onPressed: () {
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                } else {
                  Navigator.pushReplacementNamed(
                      context, AppRoutePaths.signIn);
                }
              },
              child: const Text('Already have an account? Sign in'),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Supporting widgets ───────────────────────────────────────────────────────

class _AimLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        children: [
          Icon(Icons.school_outlined,
              size: 64, color: Theme.of(context).colorScheme.primary),
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

class _PasswordMismatchHint extends StatelessWidget {
  const _PasswordMismatchHint();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(Icons.info_outline,
            size: 16, color: Theme.of(context).colorScheme.error),
        const SizedBox(width: 6),
        Text(
          'Passwords do not match',
          style: TextStyle(
              color: Theme.of(context).colorScheme.error, fontSize: 12),
        ),
      ],
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner(this.message);
  final String message;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
          color: cs.errorContainer, borderRadius: BorderRadius.circular(8)),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: cs.onErrorContainer),
          const SizedBox(width: 8),
          Expanded(
              child: Text(message,
                  style: TextStyle(color: cs.onErrorContainer))),
        ],
      ),
    );
  }
}

/// Shown after successful registration when email confirmation is required.
class _ConfirmationSentScreen extends StatelessWidget {
  const _ConfirmationSentScreen({required this.email});
  final String email;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Check Your Email'), centerTitle: true),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.mark_email_read_outlined,
                  size: 72,
                  color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 24),
              Text(
                'Confirmation email sent',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'We sent a confirmation link to:\n$email\n\n'
                'Open the link to activate your account, then sign in.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 32),
              FilledButton(
                onPressed: () => Navigator.pushNamedAndRemoveUntil(
                  context,
                  AppRoutePaths.signIn,
                  (route) => false,
                ),
                child: const Text('Go to Sign In'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
