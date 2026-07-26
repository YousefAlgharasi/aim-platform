import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/register_notifier.dart';
import '../../logic/provider/register_provider.dart';

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
    final l10n = AppLocalizations.of(context);
    final formState = ref.watch(registerProvider);
    final notifier = ref.read(registerProvider.notifier);
    final size = MediaQuery.sizeOf(context);
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
              padding: EdgeInsets.fromLTRB(
                AimSpacing.screenPaddingMobile,
                size.height * 0.05,
                AimSpacing.screenPaddingMobile,
                AimSpacing.space40,
              ),
              children: [
                Text(
                  l10n.authCreateAccount,
                  style: AimTextStyles.h1.copyWith(
                    color: surfaces.textPrimary,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: AimSpacing.componentGap),

                Text(
                  l10n.authRegisterSubtitle,
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
                  autofillHints: const [AutofillHints.newUsername],
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
                  const SizedBox(height: AimSpacing.innerGap),
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
                const SizedBox(height: AimSpacing.space24),

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
                const SizedBox(height: AimSpacing.space32),

                Center(
                  child: GestureDetector(
                    onTap: () => context.go(AppRoutePaths.signIn),
                    child: Text(
                      l10n.authAlreadyHaveAccount,
                      style: AimTextStyles.bodyMd.copyWith(
                        fontWeight: AimFontWeights.semibold,
                        color: AimColors.primary500,
                        decoration: TextDecoration.underline,
                        decorationColor: AimColors.primary500,
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
    final score = _calculateScore(password);
    final color = _scoreColor(score);
    final label = _scoreLabel(score);

    return Row(
      children: [
        Expanded(
          child: Row(
            children: List.generate(4, (index) {
              final active = index < score;
              return Expanded(
                child: Container(
                  height: 4,
                  margin: EdgeInsets.only(right: index < 3 ? 4 : 0),
                  decoration: BoxDecoration(
                    color: active ? color : AimColors.neutral300,
                    borderRadius: AimRadius.borderXs,
                  ),
                ),
              );
            }),
          ),
        ),
        const SizedBox(width: AimSpacing.innerGap),
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

  String _scoreLabel(int score) => switch (score) {
        1 => 'Weak',
        2 => 'Medium',
        3 => 'Strong',
        _ => 'Very Strong',
      };
}

class _ConfirmationSentView extends StatelessWidget {
  const _ConfirmationSentView({required this.email});

  final String email;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

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
                'Check your email',
                style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
              ),
              const SizedBox(height: AimSpacing.innerGap),
              Text(
                'We sent a confirmation link to:\n$email',
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
                  child: const Text('Back to Login'),
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
