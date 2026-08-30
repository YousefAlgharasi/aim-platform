import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/register_notifier.dart';
import '../../logic/provider/register_provider.dart';

/// Registration screen — Student Mobile App.
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
    setState(() {}); // Updates live password strength meter
  }

  void _onConfirmChanged(String v) =>
      ref.read(registerProvider.notifier).setConfirmPassword(v);

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
    final l10n = AppLocalizations.of(context);
    final formState = ref.watch(registerProvider);
    final notifier = ref.read(registerProvider.notifier);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (notifier.outcome == RegisterOutcome.awaitingEmailConfirmation) {
      return _ConfirmationSentView(email: _emailController.text.trim());
    }

    final password = _passwordController.text;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: AutofillGroup(
            child: ListView(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.screenPaddingMobile,
                AimSpacing.space32,
                AimSpacing.screenPaddingMobile,
                AimSpacing.space40,
              ),
              children: [
                // Header brand row
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: AimGradients.gzHero,
                        borderRadius: AimRadius.borderSm,
                        boxShadow: [
                          BoxShadow(
                            color: AimColors.primary500.withValues(alpha: 0.2),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.auto_awesome,
                          color: AimColors.neutral0,
                          size: 20,
                        ),
                      ),
                    ),
                    const SizedBox(width: AimSpacing.innerGap),
                    ShaderMask(
                      shaderCallback: (bounds) =>
                          AimGradients.gzHero.createShader(
                        Rect.fromLTWH(0, 0, bounds.width, bounds.height),
                      ),
                      child: Text(
                        l10n.appTitle,
                        style: AimTextStyles.h2.copyWith(
                          color: AimColors.neutral0,
                          fontWeight: AimFontWeights.extrabold,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.sectionGap),

                Text(
                  'Start your journey'.toUpperCase(),
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.primary600,
                    fontWeight: AimFontWeights.extrabold,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),

                Text(
                  'Create an account',
                  style: AimTextStyles.h1.copyWith(
                    color: surfaces.textPrimary,
                    fontSize: 28,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: AimSpacing.innerGap),

                Text(
                  'Takes less than a minute. Enter your details below.',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: AimSpacing.sectionGap),

                if (formState.errorMessage != null) ...[
                  AIMAlertBanner(
                    tone: AIMAlertTone.error,
                    child: Text(formState.errorMessage!),
                  ),
                  const SizedBox(height: AimSpacing.formFieldGap),
                ],

                _RegFigmaInputField(
                  controller: _fullNameController,
                  focusNode: _fullNameFocus,
                  placeholder: l10n.authFullNameLabel,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.name],
                  disabled: formState.isSubmitting,
                  onSubmitted: (_) => _emailFocus.requestFocus(),
                ),
                const SizedBox(height: AimSpacing.formFieldGap),

                _RegFigmaInputField(
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

                _RegFigmaInputField(
                  controller: _passwordController,
                  focusNode: _passwordFocus,
                  placeholder: l10n.authPasswordLabel,
                  obscureText: true,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.newPassword],
                  disabled: formState.isSubmitting,
                  onChanged: _onPasswordChanged,
                  onSubmitted: (_) => _confirmFocus.requestFocus(),
                ),

                if (password.isNotEmpty) ...[
                  const SizedBox(height: AimSpacing.space8),
                  _PasswordStrengthMeter(password: password),
                ],

                const SizedBox(height: AimSpacing.formFieldGap),

                _RegFigmaInputField(
                  controller: _confirmController,
                  focusNode: _confirmFocus,
                  placeholder: l10n.authConfirmPasswordLabel,
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  autofillHints: const [AutofillHints.newPassword],
                  disabled: formState.isSubmitting,
                  onChanged: _onConfirmChanged,
                  onSubmitted: (_) => _submit(),
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
                      color: AimColors.neutral0.withValues(alpha: 0.0),
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
                                  l10n.authCreateAccount,
                                  style: AimTextStyles.button.copyWith(
                                    color: surfaces.textOnPrimary,
                                  ),
                                ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AimSpacing.space24),

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
                        l10n.authOrSignUpWith,
                        style: AimTextStyles.caption.copyWith(
                          color: surfaces.textMuted,
                          fontWeight: AimFontWeights.semibold,
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
                      child: _RegFigmaSocialButton(
                        icon: const _RegGoogleLogo(),
                        label: 'Google',
                        onPressed: () {},
                      ),
                    ),
                    const SizedBox(width: AimSpacing.componentGap),
                    Expanded(
                      child: _RegFigmaSocialButton(
                        icon: const _RegFacebookLogo(),
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
                      'Already have an account? ',
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textSecondary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.go(AppRoutePaths.signIn),
                      child: Text(
                        'Sign In',
                        style: AimTextStyles.bodySm.copyWith(
                          fontWeight: AimFontWeights.bold,
                          color: AimColors.primary500,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

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
    final surfaces = aimSurfacesOf(context);

    Color borderColor;
    if (widget.disabled) {
      borderColor = surfaces.disabledBorder;
    } else if (_focused) {
      borderColor = AimColors.primary500;
    } else {
      borderColor = surfaces.border;
    }

    return Container(
      height: AimSizes.input,
      decoration: BoxDecoration(
        color: widget.disabled ? surfaces.surfaceSunken : surfaces.surfaceRaised,
        borderRadius: AimRadius.borderMd,
        border: Border.all(
          color: borderColor,
          width: _focused ? 1.5 : 1.0,
        ),
      ),
      child: Row(
        children: [
          Expanded(
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
              style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
              decoration: InputDecoration(
                hintText: widget.placeholder,
                hintStyle: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted),
                contentPadding: const EdgeInsetsDirectional.symmetric(
                  horizontal: AimSpacing.space16,
                  vertical: AimSpacing.space12,
                ),
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),
          if (widget.obscureText)
            IconButton(
              icon: Icon(
                _showText
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                size: 20,
                color: surfaces.textMuted,
              ),
              onPressed: widget.disabled
                  ? null
                  : () => setState(() => _showText = !_showText),
            ),
        ],
      ),
    );
  }
}

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

class _PasswordStrengthMeter extends StatelessWidget {
  const _PasswordStrengthMeter({required this.password});

  final String password;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final score = _calculateScore(password);
    final color = _scoreColor(score);
    final label = _scoreLabel(score, l10n);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: List.generate(4, (i) {
            return Expanded(
              child: Container(
                height: 4,
                margin: EdgeInsetsDirectional.only(end: i < 3 ? 4 : 0),
                decoration: BoxDecoration(
                  color: i < score ? color : AimColors.neutral200,
                  borderRadius: AimRadius.borderPill,
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: AimSpacing.space4),
        Text(
          label,
          style: AimTextStyles.caption.copyWith(
            color: color,
            fontWeight: AimFontWeights.semibold,
          ),
        ),
      ],
    );
  }

  int _calculateScore(String p) {
    if (p.length < 6) return 1;
    var score = 1;
    if (p.length >= 8) score++;
    if (RegExp(r'[A-Z]').hasMatch(p) && RegExp(r'[0-9]').hasMatch(p)) score++;
    if (RegExp(r'[!@#$%^&*(),.?":{}|<-_>]').hasMatch(p)) score++;
    return score;
  }

  Color _scoreColor(int score) => switch (score) {
        1 => AimColors.error500,
        2 => AimColors.warning500,
        3 => AimColors.success500,
        _ => AimColors.success500,
      };

  String _scoreLabel(int score, AppLocalizations l10n) => switch (score) {
        1 => l10n.authPasswordStrengthWeak,
        2 => l10n.authPasswordStrengthMedium,
        3 => l10n.authPasswordStrengthStrong,
        _ => l10n.authPasswordStrengthStrong,
      };
}

class _ConfirmationSentView extends StatelessWidget {
  const _ConfirmationSentView({required this.email});

  final String email;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AimColors.primary500.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(
                    Icons.mark_email_read_outlined,
                    size: AimSizes.avatarMd,
                    color: AimColors.primary500,
                  ),
                ),
              ),
              const SizedBox(height: AimSpacing.sectionGap),
              Text(
                l10n.authCheckYourEmailTitle,
                style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
              ),
              const SizedBox(height: AimSpacing.innerGap),
              Text(
                l10n.authConfirmationEmailBody(email),
                textAlign: TextAlign.center,
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textSecondary,
                ),
              ),
              const SizedBox(height: AimSpacing.sectionGap),
              SizedBox(
                width: double.infinity,
                height: AimSizes.buttonLg,
                child: ElevatedButton(
                  onPressed: () => context.go(AppRoutePaths.signIn),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AimColors.primary500,
                    foregroundColor: surfaces.textOnPrimary,
                    shape: const RoundedRectangleBorder(
                      borderRadius: AimRadius.borderMd,
                    ),
                  ),
                  child: Text(l10n.authGoToSignInButton),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

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
          ..cubicTo(13.62 * scale, 5.38 * scale, 15.06 * scale,
              5.94 * scale, 16.21 * scale, 7.02 * scale)
          ..lineTo(19.36 * scale, 3.87 * scale)
          ..cubicTo(17.45 * scale, 2.09 * scale, 14.97 * scale,
              1 * scale, 12 * scale, 1 * scale)
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

class _RegFacebookLogo extends StatelessWidget {
  const _RegFacebookLogo();

  @override
  Widget build(BuildContext context) {
    return const Icon(
      Icons.facebook,
      size: 20,
      color: Color(0xFF1877F2),
    );
  }
}
