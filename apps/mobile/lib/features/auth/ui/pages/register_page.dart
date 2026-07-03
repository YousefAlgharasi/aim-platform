// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Register"
//   docs/design/ui-for-all-system-mobile/screenshots/light/03-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/03-screen.png
// Endpoint: POST /auth/register
// Widgets: AIMInput, AIMGradientButton, AIMAlertBanner, AIMButton (disabled social row)
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
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
    final l10n = AppLocalizations.of(context);
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    _confirmFocus.unfocus();
    await ref.read(registerProvider.notifier).submit(l10n);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final formState = ref.watch(registerProvider);
    final notifier = ref.read(registerProvider.notifier);
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    // Navigation to main shell when auto-confirmed and signed in is handled
    // declaratively by AppRouter's `redirect` (see AimMobileApp), which
    // re-evaluates authFlowProvider via a refresh listenable.

    // Show email-confirmation screen after successful signup.
    if (notifier.outcome == RegisterOutcome.awaitingEmailConfirmation) {
      return _ConfirmationSentView(
        email: _emailController.text.trim(),
      );
    }

    final password = _passwordController.text;
    final confirm = _confirmController.text;
    final passwordsMatch = confirm.isEmpty || password == confirm;

    // Without this, the OS paints its default status bar background above
    // the gradient instead of light icons sitting transparently on it.
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
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
                          label: l10n.commonBack,
                          child: InkWell(
                            onTap: () => context.pop(),
                            borderRadius: AimRadius.borderMd,
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                color:
                                    AimColors.neutral0.withValues(alpha: 0.18),
                                borderRadius: AimRadius.borderMd,
                              ),
                              child: Padding(
                                padding:
                                    const EdgeInsets.all(AimSpacing.space12),
                                child: Icon(
                                  isRtl
                                      ? Icons.chevron_right
                                      : Icons.chevron_left,
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
                        l10n.authCreateAccount,
                        style: AimTextStyles.h2.copyWith(
                          color: AimColors.neutral0,
                        ),
                      ),
                      const SizedBox(height: AimSpacing.space4),
                      Text(
                        l10n.authStartLearningTagline,
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
                        label: l10n.authEmailLabel,
                        placeholder: l10n.authEmailPlaceholder,
                        type: AIMInputType.email,
                        disabled: formState.isSubmitting,
                        leadingIcon: const Icon(Icons.email_outlined),
                        onChanged: _onEmailChanged,
                        onSubmitted: (_) => _passwordFocus.requestFocus(),
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.newUsername],
                        semanticLabel: l10n.authEmailSemantic,
                      ),
                      const SizedBox(height: AimSpacing.formFieldGap),

                      // ── Password ─────────────────────────────────────────
                      AIMInput(
                        controller: _passwordController,
                        focusNode: _passwordFocus,
                        label: l10n.authPasswordLabel,
                        type: AIMInputType.password,
                        disabled: formState.isSubmitting,
                        leadingIcon: const Icon(Icons.lock_outline),
                        onChanged: _onPasswordChanged,
                        onSubmitted: (_) => _confirmFocus.requestFocus(),
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.newPassword],
                        semanticLabel: l10n.authPasswordSemantic,
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
                        label: l10n.authConfirmPasswordLabel,
                        type: AIMInputType.password,
                        disabled: formState.isSubmitting,
                        leadingIcon: const Icon(Icons.lock_outline),
                        error:
                            passwordsMatch ? null : l10n.authPasswordsDoNotMatch,
                        trailingIcon: (confirm.isNotEmpty && passwordsMatch)
                            ? const Icon(
                                Icons.check_circle,
                                color: AimColors.success500,
                              )
                            : null,
                        onChanged: _onConfirmChanged,
                        onSubmitted: (_) => _submit(),
                        textInputAction: TextInputAction.done,
                        autofillHints: const [AutofillHints.newPassword],
                        semanticLabel: l10n.authConfirmPasswordSemantic,
                      ),
                      const SizedBox(height: AimSpacing.sectionGap),

                      // ── Submit ─────────────────────────────────────────
                      AIMGradientButton(
                        label: l10n.authCreateAccount,
                        fullWidth: true,
                        loading: formState.isSubmitting,
                        enabled: formState.isValid,
                        onPressed: _submit,
                        semanticLabel: l10n.authCreateAccount,
                      ),
                      const SizedBox(height: AimSpacing.sectionGap),

                      // ── Social sign-up (visual only — no backend yet) ───
                      // onPressed is a no-op (not null) so AIMButton renders
                      // its normal enabled outline spec instead of the
                      // low-contrast disabled spec; IgnorePointer keeps them
                      // untappable while still announcing to screen readers.
                      Text(
                        l10n.authOrSignUpWith,
                        style: AimTextStyles.caption
                            .copyWith(color: surfaces.textMuted),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AimSpacing.formFieldGap),
                      IgnorePointer(
                        ignoringSemantics: false,
                        child: AIMButton(
                          onPressed: () {},
                          variant: AIMButtonVariant.outline,
                          fullWidth: true,
                          semanticLabel: l10n.authSignUpWithGoogleSemantic,
                          child: Text(l10n.authSignUpWithGoogle),
                        ),
                      ),
                      const SizedBox(height: AimSpacing.innerGap),
                      Row(
                        children: [
                          Expanded(
                            child: IgnorePointer(
                              ignoringSemantics: false,
                              child: AIMButton(
                                onPressed: () {},
                                variant: AIMButtonVariant.outline,
                                semanticLabel:
                                    l10n.authSignUpWithAppleSemantic,
                                child: Text(l10n.authAppleButton),
                              ),
                            ),
                          ),
                          const SizedBox(width: AimSpacing.innerGap),
                          Expanded(
                            child: IgnorePointer(
                              ignoringSemantics: false,
                              child: AIMButton(
                                onPressed: () {},
                                variant: AIMButtonVariant.outline,
                                semanticLabel:
                                    l10n.authSignUpWithFacebookSemantic,
                                child: Text(l10n.authFacebookButton),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AimSpacing.sectionGap),

                      // Visible per design, but there is no Terms/Privacy
                      // route or page yet, so "Terms"/"Privacy Policy" are
                      // styled like links without being tappable — not a
                      // dead-end action.
                      Text.rich(
                        TextSpan(
                          style: AimTextStyles.caption.copyWith(
                            color: surfaces.textMuted,
                          ),
                          children: [
                            TextSpan(text: l10n.authAgreeToTermsPrefix),
                            TextSpan(
                              text: l10n.authTermsLink,
                              style: TextStyle(color: surfaces.textLink),
                            ),
                            TextSpan(text: l10n.authAndConnector),
                            TextSpan(
                              text: l10n.authPrivacyPolicyLink,
                              style: TextStyle(color: surfaces.textLink),
                            ),
                            const TextSpan(text: '.'),
                          ],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AimSpacing.sectionGap),

                      // ── Sign-in link ───────────────────────────────────
                      Center(
                        child: TextButton(
                          onPressed: () => context.pop(),
                          child: Text(l10n.authAlreadyHaveAccount),
                        ),
                      ),
                    ],
                  ),
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

/// Shown after successful registration when the backend reports
/// `requiresEmailConfirmation: true` — the account is not active yet.
class _ConfirmationSentView extends StatelessWidget {
  const _ConfirmationSentView({required this.email});

  final String email;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.authCheckYourEmailTitle,
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
                  l10n.authConfirmationEmailSentTitle,
                  style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                Text(
                  l10n.authConfirmationEmailBody(email),
                  style: AimTextStyles.bodyMd
                      .copyWith(color: surfaces.textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.space32),
                AIMGradientButton(
                  label: l10n.authGoToSignInButton,
                  fullWidth: true,
                  onPressed: () => context.go(AppRoutePaths.signIn),
                  semanticLabel: l10n.authGoToSignInSemantic,
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
    final l10n = AppLocalizations.of(context);
    final strength = _strength;
    final activeSegments = switch (strength) {
      _PasswordStrength.weak => 1,
      _PasswordStrength.medium => 2,
      _PasswordStrength.strong => 3,
    };
    final color = switch (strength) {
      _PasswordStrength.weak => AimColors.error500,
      _PasswordStrength.medium => AimColors.warning500,
      _PasswordStrength.strong => AimColors.gzLime,
    };
    final label = switch (strength) {
      _PasswordStrength.weak => l10n.authPasswordStrengthWeak,
      _PasswordStrength.medium => l10n.authPasswordStrengthMedium,
      _PasswordStrength.strong => l10n.authPasswordStrengthStrong,
    };

    return Semantics(
      label: l10n.authPasswordStrengthSemantic(label),
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
