// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Register"
//   docs/design/ui-for-all-system-mobile/screenshots/light/03-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/03-screen.png
// Endpoint: POST /auth/register
// Widgets: AIMInput, AIMGradientButton, AIMAlertBanner, AIMButton (disabled social row)
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
/// 2. [RegisterNotifier] validates locally, then calls the backend's
///    `POST /auth/register` (the backend is the sole auth authority).
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
  void _onPasswordChanged(String v) {
    ref.read(registerProvider.notifier).setPassword(v);
    // Password strength + confirm-match affordances are local UI state that
    // depends on the current text, so trigger a rebuild.
    setState(() {});
  }

  void _onConfirmChanged(String v) {
    ref.read(registerProvider.notifier).setConfirmPassword(v);
    setState(() {});
  }

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
    final shadows = aimShadowsOf(context);

    // Navigate to main shell when auto-confirmed and signed in.
    //
    // Deferred via addPostFrameCallback: this listener fires synchronously
    // on state change, before the root MaterialApp (which watches
    // authFlowProvider to build onGenerateRoute) has rebuilt. Pushing
    // immediately would route against the stale (signed-out) closure and
    // get redirected straight back to sign-in.
    ref.listen(authFlowProvider, (_, next) {
      if (next.isSignedIn && mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted) return;
          Navigator.of(context).pushNamedAndRemoveUntil(
            AppRoutePaths.mainShell,
            (route) => false,
          );
        });
      }
    });

    // Show email-confirmation screen after successful signup.
    if (notifier.outcome == RegisterOutcome.awaitingEmailConfirmation) {
      return _ConfirmationSentView(
        email: _emailController.text.trim(),
      );
    }

    final password = _passwordController.text;
    final confirm = _confirmController.text;
    final passwordsMatch = confirm.isEmpty || password == confirm;

    return Scaffold(
      backgroundColor: surfaces.background,
      body: AutofillGroup(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            // ── Gradient hero header ───────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.screenPaddingMobile,
                AimSpacing.space16,
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap * 2,
              ),
              decoration: const BoxDecoration(gradient: AimGradients.gzHero),
              child: SafeArea(
                bottom: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: Semantics(
                        button: true,
                        label: 'Back',
                        child: InkWell(
                          onTap: () => Navigator.of(context).pop(),
                          customBorder: const CircleBorder(),
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              color: AimColors.neutral0.withValues(alpha: 0.18),
                              shape: BoxShape.circle,
                            ),
                            child: const Padding(
                              padding: EdgeInsets.all(AimSpacing.space12),
                              child: Icon(
                                Icons.arrow_back,
                                size: AimSizes.iconMd,
                                color: AimColors.neutral0,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),
                    Text(
                      'Create account',
                      style: AimTextStyles.h2.copyWith(
                        color: AimColors.neutral0,
                      ),
                    ),
                    const SizedBox(height: AimSpacing.space4),
                    Text(
                      'Start learning English the fun way',
                      style: AimTextStyles.bodySm.copyWith(
                        color: AimColors.neutral0.withValues(alpha: 0.85),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Form card ──────────────────────────────────────────────
            Transform.translate(
              offset: const Offset(0, -AimSpacing.sectionGap),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.screenPaddingMobile,
                  vertical: AimSpacing.sectionGap,
                ),
                decoration: BoxDecoration(
                  color: surfaces.surface,
                  borderRadius: const BorderRadiusDirectional.only(
                    topStart: Radius.circular(AimRadius.x2l),
                    topEnd: Radius.circular(AimRadius.x2l),
                  ),
                  boxShadow: shadows.card,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // ── Error banner ───────────────────────────────────
                    if (formState.errorMessage != null) ...[
                      AIMAlertBanner(
                        tone: AIMAlertTone.error,
                        child: Text(formState.errorMessage!),
                      ),
                      const SizedBox(height: AimSpacing.formFieldGap),
                    ],

                    // ── Email ──────────────────────────────────────────
                    AIMInput(
                      controller: _emailController,
                      focusNode: _emailFocus,
                      label: 'Email',
                      placeholder: 'you@example.com',
                      type: AIMInputType.email,
                      disabled: formState.isSubmitting,
                      leadingIcon: const Icon(Icons.email_outlined),
                      onChanged: _onEmailChanged,
                      onSubmitted: (_) => _passwordFocus.requestFocus(),
                      textInputAction: TextInputAction.next,
                      autofillHints: const [AutofillHints.newUsername],
                      semanticLabel: 'Email address',
                    ),
                    const SizedBox(height: AimSpacing.formFieldGap),

                    // ── Password ─────────────────────────────────────────
                    AIMInput(
                      controller: _passwordController,
                      focusNode: _passwordFocus,
                      label: 'Password',
                      type: AIMInputType.password,
                      disabled: formState.isSubmitting,
                      leadingIcon: const Icon(Icons.lock_outline),
                      onChanged: _onPasswordChanged,
                      onSubmitted: (_) => _confirmFocus.requestFocus(),
                      textInputAction: TextInputAction.next,
                      autofillHints: const [AutofillHints.newPassword],
                      semanticLabel: 'Password',
                    ),
                    if (password.isNotEmpty) ...[
                      const SizedBox(height: AimSpacing.space8),
                      _PasswordStrengthMeter(password: password),
                    ],
                    const SizedBox(height: AimSpacing.formFieldGap),

                    // ── Confirm password ──────────────────────────────────
                    AIMInput(
                      controller: _confirmController,
                      focusNode: _confirmFocus,
                      label: 'Confirm Password',
                      type: AIMInputType.password,
                      disabled: formState.isSubmitting,
                      leadingIcon: const Icon(Icons.lock_outline),
                      error: passwordsMatch ? null : 'Passwords do not match',
                      helper: (confirm.isNotEmpty && passwordsMatch)
                          ? 'Passwords match'
                          : null,
                      onChanged: _onConfirmChanged,
                      onSubmitted: (_) => _submit(),
                      textInputAction: TextInputAction.done,
                      autofillHints: const [AutofillHints.newPassword],
                      semanticLabel: 'Confirm password',
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),

                    // ── Submit ─────────────────────────────────────────
                    AIMGradientButton(
                      label: 'Create account',
                      fullWidth: true,
                      loading: formState.isSubmitting,
                      enabled: formState.isValid,
                      onPressed: _submit,
                      semanticLabel: 'Create account',
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),

                    // ── Social sign-up (visual only — no backend yet) ───
                    Text(
                      'OR SIGN UP WITH',
                      style:
                          AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AimSpacing.formFieldGap),
                    const AIMButton(
                      onPressed: null,
                      variant: AIMButtonVariant.outline,
                      fullWidth: true,
                      semanticLabel: 'Sign up with Google (coming soon)',
                      child: Text('Continue with Google'),
                    ),
                    const SizedBox(height: AimSpacing.innerGap),
                    const Row(
                      children: [
                        Expanded(
                          child: AIMButton(
                            onPressed: null,
                            variant: AIMButtonVariant.outline,
                            semanticLabel: 'Sign up with Apple (coming soon)',
                            child: Text('Apple'),
                          ),
                        ),
                        SizedBox(width: AimSpacing.innerGap),
                        Expanded(
                          child: AIMButton(
                            onPressed: null,
                            variant: AIMButtonVariant.outline,
                            semanticLabel:
                                'Sign up with Facebook (coming soon)',
                            child: Text('Facebook'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),

                    // Visible per design, but there is no Terms/Privacy
                    // route or page yet, so this is non-interactive plain
                    // text rather than a dead-end link.
                    Text(
                      'By creating an account, you agree to our Terms of '
                      'Service and Privacy Policy.',
                      style: AimTextStyles.caption.copyWith(
                        color: surfaces.textMuted,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),

                    // ── Sign-in link ───────────────────────────────────
                    Center(
                      child: TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Already have an account? Sign in'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Email confirmation screen ─────────────────────────────────────────────────

/// Shown after successful registration when the backend reports
/// `requiresEmailConfirmation: true` — the account is not active yet.
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
                AIMGradientButton(
                  label: 'Go to Sign In',
                  fullWidth: true,
                  onPressed: () => Navigator.of(context)
                      .pushNamedAndRemoveUntil(
                    AppRoutePaths.signIn,
                    (route) => false,
                  ),
                  semanticLabel: 'Go to sign in',
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

/// Client-side-only password-strength affordance.
///
/// Purely a UX hint — the backend is the sole authority on password
/// acceptability. Strength is derived from length and character-class
/// variety (lowercase / uppercase / digit / symbol).
enum _PasswordStrength { weak, medium, strong }

class _PasswordStrengthMeter extends StatelessWidget {
  const _PasswordStrengthMeter({required this.password});

  final String password;

  _PasswordStrength get _strength {
    var varietyScore = 0;
    if (RegExp(r'[a-z]').hasMatch(password)) varietyScore++;
    if (RegExp(r'[A-Z]').hasMatch(password)) varietyScore++;
    if (RegExp(r'[0-9]').hasMatch(password)) varietyScore++;
    if (RegExp(r'[^a-zA-Z0-9]').hasMatch(password)) varietyScore++;

    if (password.length >= 10 && varietyScore >= 3) {
      return _PasswordStrength.strong;
    }
    if (password.length >= 6 && varietyScore >= 2) {
      return _PasswordStrength.medium;
    }
    return _PasswordStrength.weak;
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final strength = _strength;
    final activeSegments = switch (strength) {
      _PasswordStrength.weak => 1,
      _PasswordStrength.medium => 2,
      _PasswordStrength.strong => 3,
    };
    final color = switch (strength) {
      _PasswordStrength.weak => AimColors.error500,
      _PasswordStrength.medium => AimColors.warning500,
      _PasswordStrength.strong => AimColors.success500,
    };
    final label = switch (strength) {
      _PasswordStrength.weak => 'Weak',
      _PasswordStrength.medium => 'Medium',
      _PasswordStrength.strong => 'Strong',
    };

    return Semantics(
      label: 'Password strength: $label',
      child: Row(
        children: [
          for (var i = 0; i < 3; i++) ...[
            if (i > 0) const SizedBox(width: AimSpacing.space4),
            Expanded(
              child: SizedBox(
                height: AimSpacing.space4,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: i < activeSegments ? color : surfaces.border,
                    borderRadius: AimRadius.borderXs,
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(width: AimSpacing.space8),
          Text(
            label,
            style: AimTextStyles.caption.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}
