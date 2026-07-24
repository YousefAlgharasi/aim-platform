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
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  final _fullNameFocus = FocusNode();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _confirmFocus = FocusNode();

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    _fullNameFocus.dispose();
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
    _fullNameFocus.unfocus();
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    _confirmFocus.unfocus();
    await ref.read(registerProvider.notifier).submit(l10n);
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(registerProvider);
    final notifier = ref.read(registerProvider.notifier);
    final size = MediaQuery.sizeOf(context);

    // Show email-confirmation screen after successful signup.
    if (notifier.outcome == RegisterOutcome.awaitingEmailConfirmation) {
      return _ConfirmationSentView(email: _emailController.text.trim());
    }

    final password = _passwordController.text;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        // ── Figma Screen 3: bg-[#f8fafc] ────────────────────────────────
        backgroundColor: const Color(0xFFF8FAFC),
        body: SafeArea(
          child: AutofillGroup(
            child: ListView(
              padding: EdgeInsets.fromLTRB(
                24,
                size.height * 0.05, // responsive top padding (~42px)
                24,
                40,
              ),
              children: [
                // ── Title: "Create an account" — IBM Plex Sans Bold 30px #0F172A ──
                const Text(
                  'Create an account',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSans',
                    fontWeight: FontWeight.w700,
                    fontSize: 30,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.3,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 12),

                // ── Subtitle: #94A3B8, 14px ─────────────────────────────────
                const Text(
                  'Create your account, it takes less than a minute. Enter your email and password',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSans',
                    fontWeight: FontWeight.w400,
                    fontSize: 14,
                    color: Color(0xFF94A3B8),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 28),

                // ── Error Banner ───────────────────────────────────────────
                if (formState.errorMessage != null) ...[
                  AIMAlertBanner(
                    tone: AIMAlertTone.error,
                    child: Text(formState.errorMessage!),
                  ),
                  const SizedBox(height: 16),
                ],

                // ── Full Name Input — bg:#E2E8F0, border:#CBD5E1, radius:12 ────
                _RegFigmaInputField(
                  controller: _fullNameController,
                  focusNode: _fullNameFocus,
                  placeholder: 'Full name',
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.name],
                  disabled: formState.isSubmitting,
                  onSubmitted: (_) => _emailFocus.requestFocus(),
                ),
                const SizedBox(height: 16),

                // ── Email Input Field ───────────────────────────────────────
                _RegFigmaInputField(
                  controller: _emailController,
                  focusNode: _emailFocus,
                  placeholder: 'Email',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.newUsername],
                  disabled: formState.isSubmitting,
                  onChanged: _onEmailChanged,
                  onSubmitted: (_) => _passwordFocus.requestFocus(),
                ),
                const SizedBox(height: 16),

                // ── Password Input Field ────────────────────────────────────
                _RegFigmaInputField(
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  placeholder: 'Password',
                  obscureText: true,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.newPassword],
                  disabled: formState.isSubmitting,
                  onChanged: _onPasswordChanged,
                  onSubmitted: (_) => _confirmFocus.requestFocus(),
                ),

                // Password strength meter
                if (password.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _PasswordStrengthMeter(password: password),
                ],
                const SizedBox(height: 16),

                // ── Confirm Password Input Field ───────────────────────────
                _RegFigmaInputField(
                  controller: _confirmController,
                  focusNode: _confirmFocus,
                  placeholder: 'Confirm password',
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  autofillHints: const [AutofillHints.newPassword],
                  disabled: formState.isSubmitting,
                  onChanged: _onConfirmChanged,
                  onSubmitted: (_) => _submit(),
                ),
                const SizedBox(height: 24),

                // ── Primary Button: "Create an account" (Indigo height 52) ─
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: DecoratedBox(
                    decoration: const BoxDecoration(
                      color: Color(0xFF4F46E5), // solid indigo per Figma
                      borderRadius: BorderRadius.all(Radius.circular(12)),
                      boxShadow: [
                        BoxShadow(
                          color: Color(0x334F46E5),
                          blurRadius: 6,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      child: InkWell(
                        onTap: formState.isSubmitting ? null : _submit,
                        borderRadius: BorderRadius.circular(12),
                        child: Center(
                          child: formState.isSubmitting
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white),
                                  ),
                                )
                              : const Text(
                                  'Create an account',
                                  style: TextStyle(
                                    fontFamily: 'IBMPlexSans',
                                    fontWeight: FontWeight.w500,
                                    fontSize: 16,
                                    color: Color(0xFFF8FAFC),
                                    height: 1.5,
                                  ),
                                ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // ── "or" Divider ────────────────────────────────────────────
                const Row(
                  children: [
                    Expanded(
                      child: Divider(
                        color: Color(0xFF94A3B8),
                        height: 1,
                        thickness: 1,
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 14),
                      child: Text(
                        'or',
                        style: TextStyle(
                          fontFamily: 'IBMPlexSans',
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Divider(
                        color: Color(0xFF94A3B8),
                        height: 1,
                        thickness: 1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // ── Social Buttons Row (Google & Facebook) ──────────────────
                Row(
                  children: [
                    Expanded(
                      child: _RegFigmaSocialButton(
                        icon: const _RegGoogleLogo(),
                        label: 'Google',
                        onPressed: () {},
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _RegFigmaSocialButton(
                        icon: const _RegFacebookLogo(),
                        label: 'Facebook',
                        onPressed: () {},
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // ── Footer: "Already have an account? Log in" ───────────────
                Center(
                  child: GestureDetector(
                    onTap: () => context.go(AppRoutePaths.signIn),
                    child: RichText(
                      text: const TextSpan(
                        style: TextStyle(
                          fontFamily: 'IBMPlexSans',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0F172A),
                        ),
                        children: [
                          TextSpan(text: 'Already have an account? '),
                          TextSpan(
                            text: 'Log in',
                            style: TextStyle(
                              color: Color(0xFF4F46E5),
                              decoration: TextDecoration.underline,
                              decorationColor: Color(0xFF4F46E5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
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
// Figma Screen 3 — Input field: bg #E2E8F0, border #CBD5E1, radius 12.
// Focuses changes border to indigo. Eye toggle for password fields.
// ─────────────────────────────────────────────────────────────────────────────
class _RegFigmaInputField extends StatefulWidget {
  const _RegFigmaInputField({
    required this.controller,
    required this.focusNode,
    required this.placeholder,
    this.obscureText = false,
    this.keyboardType,
    this.textInputAction,
    this.autofillHints,
    this.disabled = false,
    this.onChanged,
    this.onSubmitted,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final String placeholder;
  final bool obscureText;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;
  final bool disabled;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  @override
  State<_RegFigmaInputField> createState() => _RegFigmaInputFieldState();
}

class _RegFigmaInputFieldState extends State<_RegFigmaInputField> {
  bool _showText = false;
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    widget.focusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    setState(() => _focused = widget.focusNode.hasFocus);
  }

  @override
  void dispose() {
    widget.focusNode.removeListener(_onFocusChange);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      height: 52,
      decoration: BoxDecoration(
        color: const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _focused ? const Color(0xFF4F46E5) : const Color(0xFFCBD5E1),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: widget.controller,
                focusNode: widget.focusNode,
                obscureText: widget.obscureText && !_showText,
                keyboardType: widget.keyboardType,
                textInputAction: widget.textInputAction,
                autofillHints: widget.autofillHints,
                enabled: !widget.disabled,
                onChanged: widget.onChanged,
                onSubmitted: widget.onSubmitted,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  color: Color(0xFF0F172A),
                ),
                decoration: InputDecoration(
                  hintText: widget.placeholder,
                  hintStyle: const TextStyle(
                    fontFamily: 'IBMPlexSans',
                    fontSize: 16,
                    fontWeight: FontWeight.w400,
                    color: Color(0xFF64748B),
                  ),
                  filled: true,
                  fillColor: Colors.transparent,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  disabledBorder: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ),
          ),
          if (widget.obscureText)
            GestureDetector(
              onTap: () => setState(() => _showText = !_showText),
              child: Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Icon(
                  _showText
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: 20,
                  color: const Color(0xFF64748B),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Figma Screen 3 — Social button: bg #0F172A, h 48, radius 16, white text.
// ─────────────────────────────────────────────────────────────────────────────
class _RegFigmaSocialButton extends StatelessWidget {
  const _RegFigmaSocialButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  final Widget icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: Material(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              icon,
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                  color: Color(0xFFF8FAFC),
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
