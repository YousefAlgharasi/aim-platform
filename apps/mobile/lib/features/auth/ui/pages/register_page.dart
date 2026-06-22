import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../../logic/provider/register_notifier.dart';
import '../../logic/provider/register_provider.dart';

/// Registration screen — Student Mobile App MVP.
///
/// Flow:
/// 1. Student enters email, password, and confirm-password.
/// 2. [RegisterNotifier] validates locally, then calls Supabase Auth signup.
/// 3a. Auto-confirmed: backend sync → [authFlowProvider] signedIn → main shell.
/// 3b. Email confirmation required: [RegisterOutcome.awaitingEmailConfirmation]
///     → [_ConfirmationSentView] shown inline.
///
/// Design system: all colours, typography, spacing, and interactive widgets
/// use AIM Mobile Design System tokens.  No hard-coded values.
///
/// RTL/Arabic: no [TextDirection] is hard-coded.  [ListView] and children
/// respect the ambient locale direction.  Icons are direction-neutral or
/// mirrored via [IconDirectionality] where required.
///
/// Security:
/// - No service-role keys, JWT secrets, or backend credentials here.
/// - Role and permission checks are backend-enforced.
/// - The form never decides authorisation.
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _confirmFocus = FocusNode();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
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
    final surfaces = aimSurfacesOf(context);

    // Navigate to main shell when auto-confirmed and signed in.
    ref.listen(authFlowProvider, (_, next) {
      if (next.isSignedIn && mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutePaths.mainShell,
          (route) => false,
        );
      }
    });

    // Show email-confirmation screen after successful signup.
    if (notifier.outcome == RegisterOutcome.awaitingEmailConfirmation) {
      return _ConfirmationSentView(
        email: _emailController.text.trim(),
      );
    }

    final passwordsMatch = _confirmController.text.isEmpty ||
        _passwordController.text == _confirmController.text;

    return Scaffold(
      appBar: const AIMTopAppBar(
        title: 'Create Account',
        centerTitle: true,
      ),
      body: SafeArea(
        child: AutofillGroup(
          child: ListView(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.screenPaddingMobile,
              vertical: AimSpacing.space32,
            ),
            children: [
              // ── Branding ────────────────────────────────────────────
              const _AimLogo(),
              const SizedBox(height: AimSpacing.space32),
              Text(
                'Create your AIM account',
                style:
                    AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AimSpacing.sectionGap),

              // ── Email ────────────────────────────────────────────────
              AIMInput(
                controller: _emailController,
                focusNode: _emailFocus,
                label: 'Email',
                placeholder: 'you@example.com',
                type: AIMInputType.email,
                leadingIcon: const Icon(Icons.email_outlined),
                onChanged: _onEmailChanged,
                onSubmitted: (_) => _passwordFocus.requestFocus(),
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.newUsername],
                semanticLabel: 'Email address',
              ),
              const SizedBox(height: AimSpacing.formFieldGap),

              // ── Password ─────────────────────────────────────────────
              AIMInput(
                controller: _passwordController,
                focusNode: _passwordFocus,
                label: 'Password',
                type: AIMInputType.password,
                leadingIcon: const Icon(Icons.lock_outline),
                onChanged: _onPasswordChanged,
                onSubmitted: (_) => _confirmFocus.requestFocus(),
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.newPassword],
                semanticLabel: 'Password',
              ),
              const SizedBox(height: AimSpacing.formFieldGap),

              // ── Confirm password ──────────────────────────────────────
              AIMInput(
                controller: _confirmController,
                focusNode: _confirmFocus,
                label: 'Confirm Password',
                type: AIMInputType.password,
                leadingIcon: const Icon(Icons.lock_outline),
                error: passwordsMatch ? null : 'Passwords do not match',
                onChanged: _onConfirmChanged,
                onSubmitted: (_) => _submit(),
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.newPassword],
                semanticLabel: 'Confirm password',
              ),
              const SizedBox(height: AimSpacing.sectionGap),

              // ── Error banner ──────────────────────────────────────────
              if (formState.errorMessage != null) ...[
                AIMAlertBanner(
                  tone: AIMAlertTone.error,
                  child: Text(formState.errorMessage!),
                ),
                const SizedBox(height: AimSpacing.formFieldGap),
              ],

              // ── Submit ────────────────────────────────────────────────
              AIMButton(
                onPressed: (formState.isValid && !formState.isSubmitting)
                    ? _submit
                    : null,
                fullWidth: true,
                loading: formState.isSubmitting,
                semanticLabel: 'Create account',
                child: const Text('Create Account'),
              ),
              const SizedBox(height: AimSpacing.innerGap),

              // ── Sign-in link ──────────────────────────────────────────
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text(
                  'Already have an account? Sign in',
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Email confirmation screen ─────────────────────────────────────────────────

/// Shown after successful registration when Supabase requires email
/// confirmation before the account is active.
class _ConfirmationSentView extends StatelessWidget {
  const _ConfirmationSentView({required this.email});

  final String email;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      appBar: const AIMTopAppBar(
        title: 'Check Your Email',
        centerTitle: true,
      ),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AimSpacing.space32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.mark_email_read_outlined,
                  size: AimSizes.iconLg * 4,
                  color: AimColors.primary500,
                ),
                const SizedBox(height: AimSpacing.sectionGap),
                Text(
                  'Confirmation email sent',
                  style: AimTextStyles.h3
                      .copyWith(color: surfaces.textPrimary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                Text(
                  'We sent a confirmation link to:\n$email\n\n'
                  'Open the link to activate your account, then sign in.',
                  style: AimTextStyles.bodyMd
                      .copyWith(color: surfaces.textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.space32),
                AIMButton(
                  onPressed: () => Navigator.of(context)
                      .pushNamedAndRemoveUntil(
                    AppRoutePaths.signIn,
                    (route) => false,
                  ),
                  fullWidth: true,
                  semanticLabel: 'Go to sign in',
                  child: const Text('Go to Sign In'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Supporting widgets ────────────────────────────────────────────────────────

class _AimLogo extends StatelessWidget {
  const _AimLogo();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Center(
      child: Column(
        children: [
          const Icon(
            Icons.school_outlined,
            size: AimSizes.iconLg * 3,
            color: AimColors.primary500,
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Text(
            'AIM',
            style: AimTextStyles.h1.copyWith(
              color: surfaces.textPrimary,
              letterSpacing: 2,
            ),
          ),
          Text(
            'Adaptive Intelligence for Mastery',
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
