// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md â†’ "Login"
//   docs/design/ui-for-all-system-mobile/screenshots/light/02-screen.png
//   docs/design/ui-for-all-system-mobile/design/AIM Mobile - Gen Z.dc.html
//   (lines 113-173 â€” canonical HTML source for screen 2)
//
// Key design decisions from HTML source:
//   â€¢ Page bg: --surface-sunken
//   â€¢ Header: gz-hero gradient, padding 40/24/70, border-radius 0 0 34 34,
//     box-shadow 0 16px 38px -18px rgba(108,99,255,.8)
//   â€¢ Blob 1 (top-right): white circle 170Ã—170, rgba(255,255,255,.14), animated
//   â€¢ Blob 2 (bottom-left): lime circle 130Ã—130, rgba(200,255,61,.16), blur 8px
//   â€¢ Badge: 62Ã—62, radius 18, rgba(255,255,255,.2), 1.5px border, backdrop-blur 6px
//   â€¢ "Welcome back": 26px/800, letter-spacing -.01em
//   â€¢ Card: margin-top -28px, padding 32/18/22, radius-2xl, shadow-card-hover
//   â€¢ Sign In button: 52px pill, gz-hero, shadow 0 10px 22px -6px rgba(108,99,255,.6)
//   â€¢ Social divider: Row [â€”â€” text â€”â€”] layout
//   â€¢ Social buttons: 52px pill, border-strong, surface bg, shadow-card
//   â€¢ Footer: "Don't have an account?" + gz-purple link, 13.5px
//
// Security (unchanged):
//   The backend (NestJS) is the sole auth authority. No service-role keys,
//   JWT secrets, or direct Supabase calls here.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/config/app_config_provider.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/login_provider.dart';

/// Login screen â€” Student Mobile App MVP.
///
/// A student enters their email and password, [LoginNotifier] validates the
/// input locally and then calls the backend's `POST /auth/login`. On
/// success the notifier syncs the auth context, persists the session, and
/// flips `authFlowProvider` to signed-in; `AppRouter`'s redirect then takes
/// the user to [AppRoutePaths.mainShell] automatically.
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

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  void _onEmailChanged(String value) =>
      ref.read(loginProvider.notifier).setEmail(value);

  void _onPasswordChanged(String value) =>
      ref.read(loginProvider.notifier).setPassword(value);

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context);
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    await ref.read(loginProvider.notifier).submit(l10n);
  }

  Future<void> _enterAsTestRole(String role) async {
    final l10n = AppLocalizations.of(context);
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    await ref.read(loginProvider.notifier).submitTestLogin(role, l10n);
  }

  void _openRegister() => context.push(AppRoutePaths.register);
  void _openEndpointTester() => context.push(AppRoutePaths.endpointTester);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final formState = ref.watch(loginProvider);
    final isTestModeAvailable = !ref.watch(appConfigProvider).isProduction;
    final size = MediaQuery.sizeOf(context);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        // â”€â”€ Figma Screen 2: bg-[#f8fafc] â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        backgroundColor: const Color(0xFFF8FAFC),
        body: SafeArea(
          child: AutofillGroup(
            child: ListView(
              padding: EdgeInsets.fromLTRB(
                24,
                size.height * 0.065, // ~55px on 852 â€” matches Figma top:190px minus safe area
                24,
                40,
              ),
              children: [
                // â”€â”€ Title: "Welcome back," â€” IBM Plex Sans Bold 30px #0F172A â”€â”€
                const Text(
                  'Welcome back,',
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

                // â”€â”€ Subtitle: #94A3B8, 14px â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                const Text(
                  'We are happy to see you here again. Enter your email address and password',
                  style: TextStyle(
                    fontFamily: 'IBMPlexSans',
                    fontWeight: FontWeight.w400,
                    fontSize: 14,
                    color: Color(0xFF94A3B8),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 36),

                // â”€â”€ Error Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                if (formState.errorMessage != null) ...[
                  AIMAlertBanner(
                    tone: AIMAlertTone.error,
                    child: Text(formState.errorMessage!),
                  ),
                  const SizedBox(height: 16),
                ],

                // â”€â”€ Email Input â€” bg:#E2E8F0, border:#CBD5E1, radius:12 â”€â”€â”€â”€
                _FigmaInputField(
                  controller: _emailController,
                  focusNode: _emailFocus,
                  placeholder: 'Email',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.email],
                  disabled: formState.isSubmitting,
                  onChanged: _onEmailChanged,
                  onSubmitted: (_) => _passwordFocus.requestFocus(),
                ),
                const SizedBox(height: 16),

                // â”€â”€ Password Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                _FigmaInputField(
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  placeholder: 'Password',
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  autofillHints: const [AutofillHints.password],
                  disabled: formState.isSubmitting,
                  onChanged: _onPasswordChanged,
                  onSubmitted: (_) => _submit(),
                ),
                const SizedBox(height: 12),

                // ——— Forgot password? — centered, #0F172A SemiBold 16px —————
                Center(
                  child: TextButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Password reset — coming soon'),
                          behavior: SnackBarBehavior.floating,
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      tapTargetSize: MaterialTapTargetSize.padded,
                      overlayColor: const Color(0xFF4F46E5).withValues(alpha: 0.12),
                    ),
                    child: const Text(
                      'Forget password?',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSans',
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // ── Login Button — Figma: bg #4F46E5, shadow rgba(79,70,229,0.2) ─
                // Always shows indigo; onTap is gated by validation.
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: DecoratedBox(
                    decoration: const BoxDecoration(
                      color: Color(0xFF4F46E5), // always indigo per Figma
                      borderRadius: BorderRadius.all(Radius.circular(12)),
                      boxShadow: [
                        BoxShadow(
                          color: Color(0x334F46E5), // rgba(79,70,229,0.2)
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
                              : Text(
                                  l10n.authSignInButton,
                                  style: const TextStyle(
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

                // ——— "or" Divider — lines in #94A3B8 ————————————————————————
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

                // â”€â”€ Social Buttons â€” bg:#0F172A, h:48, radius:16 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                Row(
                  children: [
                    Expanded(
                      child: _FigmaSocialButton(
                        icon: const _GoogleLogo(),
                        label: 'Google',
                        onPressed: () {},
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _FigmaSocialButton(
                        icon: const _FacebookLogo(),
                        label: 'Facebook',
                        onPressed: () {},
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // â”€â”€ Footer: "Create an account" underline, #0F172A â”€â”€â”€â”€â”€â”€â”€â”€â”€
                Center(
                  child: GestureDetector(
                    onTap: _openRegister,
                    child: const Text(
                      'Create an account',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSans',
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0F172A),
                        decoration: TextDecoration.underline,
                        decorationColor: Color(0xFF0F172A),
                      ),
                    ),
                  ),
                ),

                // â”€â”€ Developer test mode (non-production only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                if (isTestModeAvailable) ...[
                  const SizedBox(height: 32),
                  const _DeveloperTestModeDivider(),
                  const SizedBox(height: 12),
                  _DeveloperTestModeRoleButtons(
                    isSubmitting: formState.isSubmitting,
                    onSelectRole: _enterAsTestRole,
                  ),
                  const SizedBox(height: 12),
                  AIMButton(
                    onPressed: _openEndpointTester,
                    variant: AIMButtonVariant.outline,
                    fullWidth: true,
                    child: Text(l10n.authOpenEndpointTester),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Figma Screen 2 â€” Input field: bg #E2E8F0, border #CBD5E1, radius 12.
// Focuses changes border to indigo. Eye toggle for password fields.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _FigmaInputField extends StatefulWidget {
  const _FigmaInputField({
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
  State<_FigmaInputField> createState() => _FigmaInputFieldState();
}

class _FigmaInputFieldState extends State<_FigmaInputField> {
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
                  // filled + transparent prevents Material dark-theme from
                  // painting the TextField's own background (shows black).
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Figma Screen 2 â€” Social button: bg #0F172A, h 48, radius 16, white text.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _FigmaSocialButton extends StatelessWidget {
  const _FigmaSocialButton({
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
// Brand logos for social buttons.
// ─────────────────────────────────────────────────────────────────────────────
class _GoogleLogo extends StatelessWidget {
  const _GoogleLogo();
  @override
  Widget build(BuildContext context) => CustomPaint(
        size: const Size(20, 20),
        painter: _GooglePainter(),
      );
}

class _GooglePainter extends CustomPainter {
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
          ..cubicTo(14.97 * scale, 23 * scale, 17.46 * scale, 22.02 * scale,
              19.28 * scale, 20.34 * scale)
          ..lineTo(15.71 * scale, 17.57 * scale)
          ..cubicTo(14.73 * scale, 18.23 * scale, 13.48 * scale,
              18.63 * scale, 12 * scale, 18.63 * scale)
          ..cubicTo(9.14 * scale, 18.63 * scale, 6.71 * scale, 16.7 * scale,
              5.84 * scale, 14.1 * scale)
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

class _FacebookLogo extends StatelessWidget {
  const _FacebookLogo();
  @override
  Widget build(BuildContext context) => CustomPaint(
        size: const Size(19, 19),
        painter: _FacebookPainter(),
      );
}

class _FacebookPainter extends CustomPainter {
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Developer test mode (non-production builds only).
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
class _DeveloperTestModeDivider extends StatelessWidget {
  const _DeveloperTestModeDivider();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    return Row(
      children: [
        Expanded(child: Divider(color: surfaces.textSecondary)),
        Padding(
          padding: const EdgeInsetsDirectional.symmetric(horizontal: AimSpacing.innerGap),
          child: Text(
            l10n.authTestModeLabel,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ),
        Expanded(child: Divider(color: surfaces.textSecondary)),
      ],
    );
  }
}

class _DeveloperTestModeRoleButtons extends StatelessWidget {
  const _DeveloperTestModeRoleButtons({
    required this.isSubmitting,
    required this.onSelectRole,
  });

  final bool isSubmitting;
  final ValueChanged<String> onSelectRole;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Row(
      children: [
        Expanded(
          child: AIMButton(
            onPressed: isSubmitting ? null : () => onSelectRole('student'),
            variant: AIMButtonVariant.secondary,
            semanticLabel: l10n.authEnterAsTestStudentSemantic,
            child: Text(l10n.authStudentButton),
          ),
        ),
        const SizedBox(width: AimSpacing.innerGap),
        Expanded(
          child: AIMButton(
            onPressed: isSubmitting ? null : () => onSelectRole('parent'),
            variant: AIMButtonVariant.secondary,
            semanticLabel: l10n.authEnterAsTestParentSemantic,
            child: Text(l10n.authParentButton),
          ),
        ),
        const SizedBox(width: AimSpacing.innerGap),
        Expanded(
          child: AIMButton(
            onPressed: isSubmitting ? null : () => onSelectRole('admin'),
            variant: AIMButtonVariant.secondary,
            semanticLabel: l10n.authEnterAsTestAdminSemantic,
            child: Text(l10n.authAdminButton),
          ),
        ),
      ],
    );
  }
}
