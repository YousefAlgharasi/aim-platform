import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/config/app_config_provider.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/login_provider.dart';

/// Login screen — Student Mobile App MVP.
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
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: AutofillGroup(
            child: ListView(
              padding: EdgeInsets.fromLTRB(
                AimSpacing.screenPaddingMobile,
                size.height * 0.065,
                AimSpacing.screenPaddingMobile,
                AimSpacing.space40,
              ),
              children: [
                // Sparkle logo header row
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: AimGradients.gzHero,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: AimColors.primary500.withValues(alpha: 0.2),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(Icons.auto_awesome, color: Colors.white, size: 20),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ShaderMask(
                      shaderCallback: (bounds) => AimGradients.gzHero.createShader(
                        Rect.fromLTWH(0, 0, bounds.width, bounds.height),
                      ),
                      child: const Text(
                        'AIM',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                Text(
                  l10n.authWelcomeBackTitle.toUpperCase(),
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.primary600,
                    fontWeight: AimFontWeights.extrabold,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 4),

                Text(
                  'Sign in to your\naccount',
                  style: AimTextStyles.h1.copyWith(
                    color: surfaces.textPrimary,
                    fontSize: 28,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 8),

                Text(
                  'Happy to see you again. Enter your email and password to continue.',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 24),

                if (formState.errorMessage != null) ...[
                  AIMAlertBanner(
                    tone: AIMAlertTone.error,
                    child: Text(formState.errorMessage!),
                  ),
                  const SizedBox(height: AimSpacing.formFieldGap),
                ],

                _FigmaInputField(
                  controller: _emailController,
                  focusNode: _emailFocus,
                  placeholder: l10n.authEmailLabel,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.email],
                  disabled: formState.isSubmitting,
                  onChanged: _onEmailChanged,
                  onSubmitted: (_) => _passwordFocus.requestFocus(),
                ),
                const SizedBox(height: AimSpacing.formFieldGap),

                _FigmaInputField(
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  placeholder: l10n.authPasswordLabel,
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  autofillHints: const [AutofillHints.password],
                  disabled: formState.isSubmitting,
                  onChanged: _onPasswordChanged,
                  onSubmitted: (_) => _submit(),
                ),
                const SizedBox(height: AimSpacing.componentGap),

                Center(
                  child: TextButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(l10n.authPasswordResetComingSoon),
                          behavior: SnackBarBehavior.floating,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AimSpacing.space16,
                        vertical: AimSpacing.space8,
                      ),
                      tapTargetSize: MaterialTapTargetSize.padded,
                      overlayColor: AimColors.primary500.withValues(alpha: 0.12),
                    ),
                    child: Text(
                      l10n.authForgotPassword,
                      style: AimTextStyles.button.copyWith(
                        color: surfaces.textPrimary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AimSpacing.space20),

                SizedBox(
                  width: double.infinity,
                  height: AimSizes.buttonLg,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AimColors.primary500,
                      borderRadius: AimRadius.borderMd,
                      boxShadow: [
                        BoxShadow(
                          color: AimColors.primary500.withValues(alpha: 0.2),
                          blurRadius: 6,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      borderRadius: AimRadius.borderMd,
                      child: InkWell(
                        onTap: formState.isSubmitting ? null : _submit,
                        borderRadius: AimRadius.borderMd,
                        child: Center(
                          child: formState.isSubmitting
                              ? SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      surfaces.textOnPrimary,
                                    ),
                                  ),
                                )
                              : Text(
                                  l10n.authSignInButton,
                                  style: AimTextStyles.button.copyWith(
                                    color: surfaces.textOnPrimary,
                                  ),
                                ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AimSpacing.sectionGap),

                Row(
                  children: [
                    Expanded(
                      child: Divider(
                        color: surfaces.divider,
                        height: 1,
                        thickness: 1,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      child: Text(
                        l10n.authOrConnector,
                        style: AimTextStyles.bodySm.copyWith(
                          color: surfaces.textMuted,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Divider(
                        color: surfaces.divider,
                        height: 1,
                        thickness: 1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.formFieldGap),

                Row(
                  children: [
                    Expanded(
                      child: _FigmaSocialButton(
                        icon: const _GoogleLogo(),
                        label: 'Google',
                        onPressed: () {},
                      ),
                    ),
                    const SizedBox(width: AimSpacing.componentGap),
                    Expanded(
                      child: _FigmaSocialButton(
                        icon: const _FacebookLogo(),
                        label: 'Facebook',
                        onPressed: () {},
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.space24),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      l10n.authNoAccountPrompt,
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textSecondary,
                      ),
                    ),
                    GestureDetector(
                      onTap: _openRegister,
                      child: Text(
                        l10n.authCreateOneLink,
                        style: AimTextStyles.bodySm.copyWith(
                          fontWeight: AimFontWeights.bold,
                          color: AimColors.primary500,
                        ),
                      ),
                    ),
                  ],
                ),

                if (isTestModeAvailable) ...[
                  const SizedBox(height: AimSpacing.space32),
                  _TestAccountsCard(
                    isSubmitting: formState.isSubmitting,
                    onSelectRole: _enterAsTestRole,
                    onOpenEndpointTester: _openEndpointTester,
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
    final surfaces = aimSurfacesOf(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      height: AimSizes.buttonLg,
      decoration: BoxDecoration(
        color: surfaces.surfaceSunken,
        borderRadius: AimRadius.borderMd,
        border: Border.all(
          color: _focused ? AimColors.primary500 : surfaces.border,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AimSpacing.space16),
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
                style: AimTextStyles.bodyMd.copyWith(
                  color: surfaces.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: widget.placeholder,
                  hintStyle: AimTextStyles.bodyMd.copyWith(
                    color: surfaces.textMuted,
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
                padding: const EdgeInsets.only(right: AimSpacing.space16),
                child: Icon(
                  _showText
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: AimSizes.iconMd,
                  color: surfaces.textMuted,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

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
    final surfaces = aimSurfacesOf(context);

    return SizedBox(
      height: AimSizes.input,
      child: Material(
        color: surfaces.surfaceRaised,
        borderRadius: AimRadius.borderLg,
        child: InkWell(
          onTap: onPressed,
          borderRadius: AimRadius.borderLg,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              icon,
              const SizedBox(width: AimSpacing.innerGap),
              Text(
                label,
                style: AimTextStyles.bodySm.copyWith(
                  fontWeight: AimFontWeights.medium,
                  color: surfaces.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TestAccountsCard extends StatelessWidget {
  const _TestAccountsCard({
    required this.isSubmitting,
    required this.onSelectRole,
    required this.onOpenEndpointTester,
  });

  final bool isSubmitting;
  final ValueChanged<String> onSelectRole;
  final VoidCallback onOpenEndpointTester;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Container(
      padding: const EdgeInsets.all(AimSpacing.cardPadding),
      decoration: BoxDecoration(
        color: surfaces.surfaceSunken,
        borderRadius: AimRadius.borderMd,
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'DEV / TEST ACCOUNTS',
            style: AimTextStyles.caption.copyWith(
              fontWeight: AimFontWeights.bold,
              color: surfaces.textMuted,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Text(
            'Quick-login with test credentials:',
            style: AimTextStyles.bodySm.copyWith(
              color: surfaces.textSecondary,
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Wrap(
            spacing: AimSpacing.innerGap,
            runSpacing: AimSpacing.innerGap,
            children: [
              _TestRoleChip(
                label: 'Student',
                enabled: !isSubmitting,
                onTap: () => onSelectRole('student'),
              ),
              _TestRoleChip(
                label: 'Parent',
                enabled: !isSubmitting,
                onTap: () => onSelectRole('parent'),
              ),
              _TestRoleChip(
                label: 'Teacher',
                enabled: !isSubmitting,
                onTap: () => onSelectRole('teacher'),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          GestureDetector(
            onTap: onOpenEndpointTester,
            child: Text(
              'Open Endpoint Tester →',
              style: AimTextStyles.caption.copyWith(
                fontWeight: AimFontWeights.semibold,
                color: AimColors.primary500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TestRoleChip extends StatelessWidget {
  const _TestRoleChip({
    required this.label,
    required this.enabled,
    required this.onTap,
  });

  final String label;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return ActionChip(
      label: Text(label),
      onPressed: enabled ? onTap : null,
      backgroundColor: surfaces.surface,
      labelStyle: AimTextStyles.caption.copyWith(
        color: AimColors.primary500,
        fontWeight: AimFontWeights.semibold,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: AimRadius.borderSm,
        side: BorderSide(color: AimColors.primary500.withValues(alpha: 0.3)),
      ),
    );
  }
}

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
          ..cubicTo(7.7 * scale, 1 * scale, 4 * scale, 3.47 * scale,
              2.18 * scale, 7.06 * scale)
          ..lineTo(5.84 * scale, 9.9 * scale)
          ..cubicTo(6.71 * scale, 7.3 * scale, 9.14 * scale, 5.38 * scale,
              12 * scale, 5.38 * scale)
          ..close());
  }

  @override
  bool shouldRepaint(CustomPainter old) => false;
}

class _FacebookLogo extends StatelessWidget {
  const _FacebookLogo();

  @override
  Widget build(BuildContext context) {
    return const Icon(
      Icons.facebook,
      size: 20,
      color: Color(0xFF1877F2),
    );
  }
}
