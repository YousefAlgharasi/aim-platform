// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Login"
//   docs/design/ui-for-all-system-mobile/screenshots/light/02-screen.png
//   docs/design/ui-for-all-system-mobile/design/AIM Mobile - Gen Z.dc.html
//   (lines 113-173 — canonical HTML source for screen 2)
//
// Key design decisions from HTML source:
//   • Page bg: --surface-sunken
//   • Header: gz-hero gradient, padding 40/24/70, border-radius 0 0 34 34,
//     box-shadow 0 16px 38px -18px rgba(108,99,255,.8)
//   • Blob 1 (top-right): white circle 170×170, rgba(255,255,255,.14), animated
//   • Blob 2 (bottom-left): lime circle 130×130, rgba(200,255,61,.16), blur 8px
//   • Badge: 62×62, radius 18, rgba(255,255,255,.2), 1.5px border, backdrop-blur 6px
//   • "Welcome back": 26px/800, letter-spacing -.01em
//   • Card: margin-top -28px, padding 32/18/22, radius-2xl, shadow-card-hover
//   • Sign In button: 52px pill, gz-hero, shadow 0 10px 22px -6px rgba(108,99,255,.6)
//   • Social divider: Row [—— text ——] layout
//   • Social buttons: 52px pill, border-strong, surface bg, shadow-card
//   • Footer: "Don't have an account?" + gz-purple link, 13.5px
//
// Security (unchanged):
//   The backend (NestJS) is the sole auth authority. No service-role keys,
//   JWT secrets, or direct Supabase calls here.
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/config/app_config_provider.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/login_provider.dart';

/// Login screen — Student Mobile App MVP.
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
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);
    final isTestModeAvailable = !ref.watch(appConfigProvider).isProduction;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: surfaces.surfaceSunken,
        body: AutofillGroup(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              // ── Gradient hero header ─────────────────────────────────
              const _LoginHeader(),

              // ── Card + content pulled up -28px over the header ───────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, -28, 20, 28),
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
                      padding: const EdgeInsets.fromLTRB(18, 32, 18, 22),
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

                          // Email input
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
                            autofillHints: const [AutofillHints.email],
                            semanticLabel: l10n.authEmailSemantic,
                          ),
                          const SizedBox(height: AimSpacing.formFieldGap),

                          // Password input
                          AIMInput(
                            controller: _passwordController,
                            focusNode: _passwordFocus,
                            label: l10n.authPasswordLabel,
                            type: AIMInputType.password,
                            disabled: formState.isSubmitting,
                            leadingIcon: const Icon(Icons.lock_outline),
                            onChanged: _onPasswordChanged,
                            onSubmitted: (_) => _submit(),
                            textInputAction: TextInputAction.done,
                            autofillHints: const [AutofillHints.password],
                            semanticLabel: l10n.authPasswordSemantic,
                          ),
                          const SizedBox(height: AimSpacing.space8),

                          // Forgot password (right-aligned, gz-purple)
                          Align(
                            alignment: AlignmentDirectional.centerEnd,
                            child: Text(
                              l10n.authForgotPassword,
                              style: const TextStyle(
                                fontFamily: 'Inter',
                                fontWeight: FontWeight.w700,
                                fontSize: 12.5,
                                color: Color(0xFF6C63FF),
                              ),
                            ),
                          ),
                          const SizedBox(height: AimSpacing.sectionGap),

                          // Sign In — 52px pill, gz-hero gradient + glow
                          _GzPillButton(
                            label: l10n.authSignInButton,
                            loading: formState.isSubmitting,
                            enabled: formState.isValid && !formState.isSubmitting,
                            onPressed: _submit,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),

                    // "OR CONTINUE WITH" divider row
                    _SocialDivider(label: l10n.authOrContinueWith),
                    const SizedBox(height: 11),

                    // Google (full width, 52px pill)
                    _SocialPillButton(
                      onPressed: () {},
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const _GoogleLogo(),
                          const SizedBox(width: 11),
                          Text(
                            l10n.authContinueWithGoogle,
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              color: Color(0xFF181C26),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 11),

                    // Apple + Facebook (half-width each)
                    Row(
                      children: [
                        Expanded(
                          child: _SocialPillButton(
                            onPressed: () {},
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const _AppleLogo(),
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
                          child: _SocialPillButton(
                            onPressed: () {},
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const _FacebookLogo(),
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
                    const SizedBox(height: 18),

                    // "Don't have an account? Create one"
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          l10n.authNoAccountPrompt,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 13.5,
                            fontWeight: FontWeight.w500,
                            color: surfaces.textSecondary,
                          ),
                        ),
                        GestureDetector(
                          onTap: _openRegister,
                          child: const Text(
                            'Create one',
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

                    // Developer test mode (non-production only)
                    if (isTestModeAvailable) ...[
                      const SizedBox(height: AimSpacing.sectionGap),
                      const _DeveloperTestModeDivider(),
                      const SizedBox(height: AimSpacing.formFieldGap),
                      _DeveloperTestModeRoleButtons(
                        isSubmitting: formState.isSubmitting,
                        onSelectRole: _enterAsTestRole,
                      ),
                      const SizedBox(height: AimSpacing.formFieldGap),
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
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Header: gz-hero gradient, rounded bottom corners (34px), purple drop shadow,
// two animated decorative blobs, glass badge, title + subtitle.
// ─────────────────────────────────────────────────────────────────────────────
class _LoginHeader extends StatefulWidget {
  const _LoginHeader();

  @override
  State<_LoginHeader> createState() => _LoginHeaderState();
}

class _LoginHeaderState extends State<_LoginHeader>
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
        padding: const EdgeInsets.fromLTRB(24, 40, 24, 70),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment(-0.74, -1.0),
            end: Alignment(0.74, 1.0),
            stops: [0.0, 0.46, 1.0],
            colors: [Color(0xFF8B5CF6), Color(0xFF6C63FF), Color(0xFF5AC8FA)],
          ),
          boxShadow: [
            BoxShadow(
              color: Color(0xCB6C63FF), // rgba(108,99,255,.8)
              blurRadius: 38,
              spreadRadius: -18,
              offset: Offset(0, 16),
            ),
          ],
        ),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Blob 1: top-right, white circle 170×170, animating
            PositionedDirectional(
              top: -50,
              end: -30,
              child: AnimatedBuilder(
                animation: _blobCtrl,
                builder: (_, __) {
                  final r = BorderRadius.lerp(
                    const BorderRadius.only(
                      topLeft: Radius.circular(46),
                      topRight: Radius.circular(54),
                      bottomRight: Radius.circular(60),
                      bottomLeft: Radius.circular(40),
                    ),
                    const BorderRadius.only(
                      topLeft: Radius.circular(58),
                      topRight: Radius.circular(42),
                      bottomRight: Radius.circular(38),
                      bottomLeft: Radius.circular(62),
                    ),
                    _blobCtrl.value,
                  )!;
                  return Container(
                    width: 170,
                    height: 170,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.14),
                      borderRadius: r,
                    ),
                  );
                },
              ),
            ),

            // Blob 2: bottom-left, lime circle 130×130, blurred
            PositionedDirectional(
              bottom: -30,
              start: -40,
              child: Container(
                width: 130,
                height: 130,
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

            // Content column: badge + title + subtitle
            SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Glass badge: 62×62, radius 18, backdrop-blur
                  ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: BackdropFilter(
                      filter: ui.ImageFilter.blur(sigmaX: 6, sigmaY: 6),
                      child: Container(
                        width: 62,
                        height: 62,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.4),
                            width: 1.5,
                          ),
                        ),
                        child: const Center(
                          child: _MiniGradCap(size: 32),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // "Welcome back"
                  Text(
                    l10n.authWelcomeBackTitle,
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w800,
                      fontSize: 26,
                      letterSpacing: -0.26,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),

                  // "Sign in to keep your streak alive"
                  Text(
                    l10n.authWelcomeBackSubtitle,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontWeight: FontWeight.w500,
                      fontSize: 13.5,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                    textAlign: TextAlign.center,
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
// Shared gz-hero pill button (Sign In, Create account).
// height:52, border-radius:pill, gz-hero gradient, glow shadow, 800/16px.
// ─────────────────────────────────────────────────────────────────────────────
class _GzPillButton extends StatelessWidget {
  const _GzPillButton({
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
                    color: Color(0x996C63FF), // rgba(108,99,255,.6)
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
// "—— OR CONTINUE WITH ——" divider row.
// ─────────────────────────────────────────────────────────────────────────────
class _SocialDivider extends StatelessWidget {
  const _SocialDivider({required this.label});
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
// Social button: 52px pill, border-strong, surface bg, shadow-card.
// IgnorePointer (no backend yet) but still in accessibility tree.
// ─────────────────────────────────────────────────────────────────────────────
class _SocialPillButton extends StatelessWidget {
  const _SocialPillButton({required this.child, required this.onPressed});
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
// Small graduation cap SVG painted into a 32×32 box (for the login header badge).
// ─────────────────────────────────────────────────────────────────────────────
class _MiniGradCap extends StatelessWidget {
  const _MiniGradCap({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _GradCapPainter(),
    );
  }
}

class _GradCapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.0 * (size.width / 24)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final s = size.width / 24;
    final hat = Path()
      ..moveTo(22 * s, 10 * s)
      ..lineTo(12 * s, 5 * s)
      ..lineTo(2 * s, 10 * s)
      ..lineTo(12 * s, 15 * s)
      ..lineTo(22 * s, 10 * s)
      ..close();
    canvas.drawPath(hat, paint);
    final gown = Path()
      ..moveTo(6 * s, 12 * s)
      ..lineTo(6 * s, 17 * s)
      ..cubicTo(6 * s, 18 * s, 8.7 * s, 20 * s, 12 * s, 20 * s)
      ..cubicTo(15.3 * s, 20 * s, 18 * s, 18 * s, 18 * s, 17 * s)
      ..lineTo(18 * s, 12 * s);
    canvas.drawPath(gown, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand logos for social buttons (painted SVG paths from HTML source).
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

class _AppleLogo extends StatelessWidget {
  const _AppleLogo();
  @override
  Widget build(BuildContext context) {
    final color = aimSurfacesOf(context).textPrimary;
    return Icon(Icons.apple, size: 19, color: color);
  }
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

// ─────────────────────────────────────────────────────────────────────────────
// Developer test mode (non-production builds only).
// ─────────────────────────────────────────────────────────────────────────────
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
