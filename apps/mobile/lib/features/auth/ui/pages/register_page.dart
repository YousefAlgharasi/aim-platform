// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Register"
//   docs/design/ui-for-all-system-mobile/screenshots/light/03-screen.png
//   docs/design/ui-for-all-system-mobile/design/AIM Mobile - Gen Z.dc.html
//   (lines 175-225 — canonical HTML source for screen 3)
//
// Key design decisions from HTML source:
//   • Page bg: --surface-sunken
//   • Header: gz-hero gradient, padding 18/20/64, border-radius 0 0 34 34,
//     box-shadow 0 16px 38px -18px rgba(108,99,255,.8)
//   • Blob 1 (top-LEFT): white circle 150×150, rgba(255,255,255,.14), animated
//   • Blob 2 (bottom-RIGHT): lime circle 120×120, rgba(200,255,61,.16), blur 8px
//   • Back button: 42×42, radius 13, rgba(255,255,255,.18), white chevron
//   • "Create account": 26px/800, letter-spacing -.01em
//   • "Start learning English the fun way": 13.5px/500, opacity .9
//   • Card: margin-top -40px, padding 22/18, gap 15, radius-2xl, shadow-card-hover
//   • Password strength meter: 4 segments (3 active = lime), "Strong" label
//   • "Create account" button: 52px pill, gz-hero + glow shadow
//   • Social divider: Row [—— text ——] layout
//   • Terms: 11.5px muted, gz-purple "Terms" and "Privacy Policy"
//   • "Already have an account? Sign in" inline row, 13.5px
//
// Security:
//   No service-role keys, JWT secrets, or direct Supabase calls here.
//   Backend is the sole auth authority.
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/register_notifier.dart';
import '../../logic/provider/register_provider.dart';

// Shared widgets defined in login_page.dart are intentionally NOT reused across
// files — each page is self-contained for readability and independent evolution.
// The _GzPillButton, _SocialDivider, _SocialPillButton, logo painters are
// duplicated here as private widgets with "_" prefixes.

/// Registration screen — Student Mobile App MVP.
///
/// Flow:
/// 1. Student enters email, password, and confirm-password.
/// 2. [RegisterNotifier] validates locally, then calls the backend's
///    `POST /auth/register`.
/// 3a. Auto-confirmed → [authFlowProvider] signedIn → main shell.
/// 3b. Email confirmation required → [_ConfirmationSentView] shown inline.
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

    // Show email-confirmation screen after successful signup.
    if (notifier.outcome == RegisterOutcome.awaitingEmailConfirmation) {
      return _ConfirmationSentView(email: _emailController.text.trim());
    }

    final password = _passwordController.text;
    final confirm = _confirmController.text;
    final passwordsMatch = confirm.isEmpty || password == confirm;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: surfaces.surfaceSunken,
        body: AutofillGroup(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              // ── Gradient hero header ─────────────────────────────────
              _RegisterHeader(isRtl: isRtl),

              // ── Card + content pulled up -40px over the header ───────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, -40, 20, 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Form card
                    Container(
                      decoration: BoxDecoration(
                        color: surfaces.surface,
                        border: Border.all(color: surfaces.border),
                        borderRadius: AimRadius.borderX2l,
                        boxShadow: shadows.cardHover,
                      ),
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Error banner
                          if (formState.errorMessage != null) ...[
                            AIMAlertBanner(
                              tone: AIMAlertTone.error,
                              child: Text(formState.errorMessage!),
                            ),
                            const SizedBox(height: AimSpacing.formFieldGap),
                          ],

                          // Email
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
                          const SizedBox(height: 15),

                          // Password
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

                          // Password strength meter (shown as soon as user types)
                          if (password.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            _PasswordStrengthMeter(password: password),
                          ],
                          const SizedBox(height: 15),

                          // Confirm password
                          AIMInput(
                            controller: _confirmController,
                            focusNode: _confirmFocus,
                            label: l10n.authConfirmPasswordLabel,
                            type: AIMInputType.password,
                            disabled: formState.isSubmitting,
                            leadingIcon: const Icon(Icons.lock_outline),
                            error: passwordsMatch
                                ? null
                                : l10n.authPasswordsDoNotMatch,
                            trailingIcon:
                                (confirm.isNotEmpty && passwordsMatch)
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
                          const SizedBox(height: 4 + 15),

                          // Create account — 52px pill, gz-hero + glow
                          _RegGzPillButton(
                            label: l10n.authCreateAccount,
                            loading: formState.isSubmitting,
                            enabled:
                                formState.isValid && !formState.isSubmitting,
                            onPressed: _submit,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // "OR SIGN UP WITH" divider
                    _RegSocialDivider(label: l10n.authOrSignUpWith),
                    const SizedBox(height: 11),

                    // Google (full width, 52px pill)
                    _RegSocialPillButton(
                      onPressed: () {},
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const _RegGoogleLogo(),
                          const SizedBox(width: 11),
                          Text(
                            l10n.authSignUpWithGoogle,
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 11),

                    // Apple + Facebook (half-width)
                    Row(
                      children: [
                        Expanded(
                          child: _RegSocialPillButton(
                            onPressed: () {},
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.apple,
                                  size: 19,
                                  color: surfaces.textPrimary,
                                ),
                                const SizedBox(width: 9),
                                Text(
                                  l10n.authAppleButton,
                                  style: const TextStyle(
                                    fontFamily: 'Inter',
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 11),
                        Expanded(
                          child: _RegSocialPillButton(
                            onPressed: () {},
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const _RegFacebookLogo(),
                                const SizedBox(width: 9),
                                Text(
                                  l10n.authFacebookButton,
                                  style: const TextStyle(
                                    fontFamily: 'Inter',
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Terms and Privacy Policy
                    Text.rich(
                      TextSpan(
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 11.5,
                          color: surfaces.textMuted,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(text: l10n.authAgreeToTermsPrefix),
                          TextSpan(
                            text: l10n.authTermsLink,
                            style: const TextStyle(
                              color: Color(0xFF6C63FF),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          TextSpan(text: l10n.authAndConnector),
                          TextSpan(
                            text: l10n.authPrivacyPolicyLink,
                            style: const TextStyle(
                              color: Color(0xFF6C63FF),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      textAlign: TextAlign.center,
                      textDirection: Directionality.of(context),
                    ),
                    const SizedBox(height: 12),

                    // "Already have an account? Sign in"
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          l10n.authAlreadyHaveAccount,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 13.5,
                            fontWeight: FontWeight.w500,
                            color: surfaces.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: const Text(
                            'Sign in',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF6C63FF),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Header: gz-hero gradient, rounded bottom (34px), purple glow shadow,
// Blob 1 on TOP-LEFT (white), Blob 2 on BOTTOM-RIGHT (lime),
// glass back button (42×42, radius 13), title + subtitle — NO badge.
// ─────────────────────────────────────────────────────────────────────────────
class _RegisterHeader extends StatefulWidget {
  const _RegisterHeader({required this.isRtl});
  final bool isRtl;

  @override
  State<_RegisterHeader> createState() => _RegisterHeaderState();
}

class _RegisterHeaderState extends State<_RegisterHeader>
    with SingleTickerProviderStateMixin {
  late final AnimationController _blobCtrl;

  @override
  void initState() {
    super.initState();
    _blobCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 9000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _blobCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(34)),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 64),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment(-0.74, -1.0),
            end: Alignment(0.74, 1.0),
            stops: [0.0, 0.46, 1.0],
            colors: [Color(0xFF8B5CF6), Color(0xFF6C63FF), Color(0xFF5AC8FA)],
          ),
          boxShadow: [
            BoxShadow(
              color: Color(0xCB6C63FF),
              blurRadius: 38,
              spreadRadius: -18,
              offset: Offset(0, 16),
            ),
          ],
        ),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Blob 1: TOP-LEFT, white, animated morph (register flips vs login)
            PositionedDirectional(
              top: -40,
              start: -30,
              child: AnimatedBuilder(
                animation: _blobCtrl,
                builder: (_, __) {
                  final r = BorderRadius.lerp(
                    const BorderRadius.only(
                      topLeft: Radius.circular(52),
                      topRight: Radius.circular(46),
                      bottomRight: Radius.circular(42),
                      bottomLeft: Radius.circular(58),
                    ),
                    const BorderRadius.only(
                      topLeft: Radius.circular(40),
                      topRight: Radius.circular(60),
                      bottomRight: Radius.circular(56),
                      bottomLeft: Radius.circular(44),
                    ),
                    _blobCtrl.value,
                  )!;
                  return Container(
                    width: 150,
                    height: 150,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.14),
                      borderRadius: r,
                    ),
                  );
                },
              ),
            ),

            // Blob 2: BOTTOM-RIGHT, lime, blurred (register flips vs login)
            PositionedDirectional(
              bottom: -20,
              end: -30,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: const Color(0xFFC8FF3D).withValues(alpha: 0.16),
                  shape: BoxShape.circle,
                ),
                child: ClipOval(
                  child: BackdropFilter(
                    filter: ui.ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                    child: const SizedBox.expand(),
                  ),
                ),
              ),
            ),

            // Content: back button + title + subtitle
            SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Back button: 42×42, radius 13, glass
                  Semantics(
                    button: true,
                    label: AppLocalizations.of(context).commonBack,
                    child: GestureDetector(
                      onTap: () => context.pop(),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(13),
                        child: BackdropFilter(
                          filter:
                              ui.ImageFilter.blur(sigmaX: 6, sigmaY: 6),
                          child: Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(13),
                            ),
                            child: Center(
                              child: Icon(
                                widget.isRtl
                                    ? Icons.chevron_right
                                    : Icons.chevron_left,
                                size: 22,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // "Create account"
                  Text(
                    l10n.authCreateAccount,
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w800,
                      fontSize: 26,
                      letterSpacing: -0.26,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 3),

                  // "Start learning English the fun way"
                  Text(
                    l10n.authStartLearningTagline,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w500,
                      fontSize: 13.5,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 52px pill button — gz-hero gradient + glow shadow (register variant).
// ─────────────────────────────────────────────────────────────────────────────
class _RegGzPillButton extends StatelessWidget {
  const _RegGzPillButton({
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.enabled = true,
  });

  final String label;
  final VoidCallback onPressed;
  final bool loading;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: enabled
              ? const LinearGradient(
                  begin: Alignment(-0.74, -1.0),
                  end: Alignment(0.74, 1.0),
                  stops: [0.0, 0.46, 1.0],
                  colors: [
                    Color(0xFF8B5CF6),
                    Color(0xFF6C63FF),
                    Color(0xFF5AC8FA),
                  ],
                )
              : null,
          color: enabled ? null : const Color(0xFFCDD2DD),
          borderRadius: BorderRadius.circular(999),
          boxShadow: enabled
              ? const [
                  BoxShadow(
                    color: Color(0x996C63FF),
                    blurRadius: 22,
                    spreadRadius: -6,
                    offset: Offset(0, 10),
                  ),
                ]
              : null,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(999),
          child: InkWell(
            onTap: enabled && !loading ? onPressed : null,
            borderRadius: BorderRadius.circular(999),
            child: Center(
              child: loading
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      label,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// "—— OR SIGN UP WITH ——" divider (register variant).
// ─────────────────────────────────────────────────────────────────────────────
class _RegSocialDivider extends StatelessWidget {
  const _RegSocialDivider({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    final dividerColor = aimSurfacesOf(context).divider;
    return Row(
      children: [
        Expanded(child: Container(height: 1, color: dividerColor)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            label.toUpperCase(),
            style: TextStyle(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w700,
              fontSize: 11,
              letterSpacing: 0.04 * 11,
              color: aimSurfacesOf(context).textMuted,
            ),
          ),
        ),
        Expanded(child: Container(height: 1, color: dividerColor)),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 52px pill social button (register variant).
// ─────────────────────────────────────────────────────────────────────────────
class _RegSocialPillButton extends StatelessWidget {
  const _RegSocialPillButton({required this.child, required this.onPressed});
  final Widget child;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);

    return AbsorbPointer(
      child: SizedBox(
        height: 52,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: surfaces.borderStrong),
            boxShadow: shadows.card,
          ),
          child: Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(999),
            child: InkWell(
              onTap: onPressed,
              borderRadius: BorderRadius.circular(999),
              child: Center(child: child),
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Google logo (multi-color SVG) for register social button.
// ─────────────────────────────────────────────────────────────────────────────
class _RegGoogleLogo extends StatelessWidget {
  const _RegGoogleLogo();
  @override
  Widget build(BuildContext context) => CustomPaint(
        size: const Size(20, 20),
        painter: _RegGooglePainter(),
      );
}

class _RegGooglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size s) {
    final scale = s.width / 24;
    void fill(String hex, Path p) =>
        canvas.drawPath(p, Paint()..color = Color(int.parse('FF$hex', radix: 16)));

    fill(
        '4285F4',
        Path()
          ..moveTo(22.56 * scale, 12.25 * scale)
          ..cubicTo(22.56 * scale, 11.47 * scale, 22.49 * scale,
              10.72 * scale, 22.36 * scale, 10 * scale)
          ..lineTo(12 * scale, 10 * scale)
          ..lineTo(12 * scale, 14.26 * scale)
          ..lineTo(17.92 * scale, 14.26 * scale)
          ..cubicTo(17.67 * scale, 15.63 * scale, 16.89 * scale,
              16.8 * scale, 15.72 * scale, 17.58 * scale)
          ..lineTo(15.72 * scale, 20.35 * scale)
          ..lineTo(19.29 * scale, 20.35 * scale)
          ..cubicTo(21.37 * scale, 18.43 * scale, 22.56 * scale,
              15.61 * scale, 22.56 * scale, 12.25 * scale)
          ..close());
    fill(
        '34A853',
        Path()
          ..moveTo(12 * scale, 23 * scale)
          ..cubicTo(14.97 * scale, 23 * scale, 17.46 * scale,
              22.02 * scale, 19.28 * scale, 20.34 * scale)
          ..lineTo(15.71 * scale, 17.57 * scale)
          ..cubicTo(14.73 * scale, 18.23 * scale, 13.48 * scale,
              18.63 * scale, 12 * scale, 18.63 * scale)
          ..cubicTo(9.14 * scale, 18.63 * scale, 6.71 * scale,
              16.7 * scale, 5.84 * scale, 14.1 * scale)
          ..lineTo(2.18 * scale, 14.1 * scale)
          ..lineTo(2.18 * scale, 16.94 * scale)
          ..cubicTo(4 * scale, 20.53 * scale, 7.7 * scale, 23 * scale,
              12 * scale, 23 * scale)
          ..close());
    fill(
        'FBBC05',
        Path()
          ..moveTo(5.84 * scale, 14.1 * scale)
          ..cubicTo(5.62 * scale, 13.44 * scale, 5.5 * scale, 12.73 * scale,
              5.5 * scale, 12 * scale)
          ..cubicTo(5.5 * scale, 11.27 * scale, 5.62 * scale, 10.56 * scale,
              5.84 * scale, 9.9 * scale)
          ..lineTo(5.84 * scale, 7.06 * scale)
          ..lineTo(2.18 * scale, 7.06 * scale)
          ..cubicTo(1.43 * scale, 8.55 * scale, 1 * scale, 10.22 * scale,
              1 * scale, 12 * scale)
          ..cubicTo(1 * scale, 13.78 * scale, 1.43 * scale, 15.45 * scale,
              2.18 * scale, 16.94 * scale)
          ..lineTo(5.84 * scale, 14.1 * scale)
          ..close());
    fill(
        'EA4335',
        Path()
          ..moveTo(12 * scale, 5.38 * scale)
          ..cubicTo(13.62 * scale, 5.38 * scale, 15.06 * scale, 5.94 * scale,
              16.21 * scale, 7.02 * scale)
          ..lineTo(19.36 * scale, 3.87 * scale)
          ..cubicTo(17.45 * scale, 2.09 * scale, 14.97 * scale, 1 * scale,
              12 * scale, 1 * scale)
          ..cubicTo(7.7 * scale, 1 * scale, 3.99 * scale, 3.47 * scale,
              2.18 * scale, 7.06 * scale)
          ..lineTo(5.84 * scale, 9.9 * scale)
          ..cubicTo(6.71 * scale, 7.31 * scale, 9.14 * scale, 5.38 * scale,
              12 * scale, 5.38 * scale)
          ..close());
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _RegFacebookLogo extends StatelessWidget {
  const _RegFacebookLogo();
  @override
  Widget build(BuildContext context) => CustomPaint(
        size: const Size(19, 19),
        painter: _RegFacebookPainter(),
      );
}

class _RegFacebookPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size s) {
    final scale = s.width / 24;
    final paint = Paint()..color = const Color(0xFF1877F2);
    final path = Path()
      ..moveTo(24 * scale, 12.07 * scale)
      ..cubicTo(24 * scale, 5.4 * scale, 18.63 * scale, 0, 12 * scale, 0)
      ..cubicTo(5.37 * scale, 0, 0, 5.4 * scale, 0, 12.07 * scale)
      ..cubicTo(0, 18.09 * scale, 4.39 * scale, 23.08 * scale,
          10.13 * scale, 24 * scale)
      ..lineTo(10.13 * scale, 15.56 * scale)
      ..lineTo(7.08 * scale, 15.56 * scale)
      ..lineTo(7.08 * scale, 12.07 * scale)
      ..lineTo(10.13 * scale, 12.07 * scale)
      ..lineTo(10.13 * scale, 9.41 * scale)
      ..cubicTo(10.13 * scale, 6.39 * scale, 11.92 * scale, 4.72 * scale,
          14.66 * scale, 4.72 * scale)
      ..cubicTo(15.97 * scale, 4.72 * scale, 17.34 * scale, 4.96 * scale,
          17.34 * scale, 4.96 * scale)
      ..lineTo(17.34 * scale, 7.93 * scale)
      ..lineTo(15.84 * scale, 7.93 * scale)
      ..cubicTo(14.35 * scale, 7.93 * scale, 13.88 * scale, 8.86 * scale,
          13.88 * scale, 9.82 * scale)
      ..lineTo(13.88 * scale, 12.07 * scale)
      ..lineTo(17.21 * scale, 12.07 * scale)
      ..lineTo(16.68 * scale, 15.56 * scale)
      ..lineTo(13.88 * scale, 15.56 * scale)
      ..lineTo(13.88 * scale, 24 * scale)
      ..cubicTo(19.61 * scale, 23.08 * scale, 24 * scale, 18.09 * scale,
          24 * scale, 12.07 * scale)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Email confirmation screen — shown after successful signup when backend
// requires email confirmation before the account is active.
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Password strength meter — 4 segments (3 shown active for strong),
// lime-green (#C8FF3D) for filled segments, label "Weak/Medium/Strong".
// ─────────────────────────────────────────────────────────────────────────────
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

    // Number of active (colored) segments out of 4 (design shows 4 total)
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
          // 4 segments (not 3) — matches the HTML design source
          for (var i = 0; i < 4; i++) ...[
            if (i > 0) const SizedBox(width: 4),
            Expanded(
              child: SizedBox(
                height: 4,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: i < activeSegments ? color : surfaces.surfaceSunken,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Inter',
              fontWeight: FontWeight.w800,
              fontSize: 11,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
