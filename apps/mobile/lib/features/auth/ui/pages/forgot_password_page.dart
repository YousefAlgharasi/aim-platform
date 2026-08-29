import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/auth_context_provider.dart';

/// State of the forgot password flow.
enum _ForgotPasswordStep {
  email,
  sent,
}

/// Forgot Password Screen — high-fidelity design prototype implementation.
///
/// Features:
/// - Brand header with AIM logo pill & gradient text.
/// - Rounded icon back button.
/// - Prototype typography & spacing (FORGOT PASSWORD? badge, Reset your password title).
/// - High contrast dark and light mode input styling.
/// - Interactive Send Reset Link CTA & Resend email flows.
class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  ConsumerState<ForgotPasswordPage> createState() =>
      _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _emailController = TextEditingController();
  final _emailFocus = FocusNode();

  _ForgotPasswordStep _step = _ForgotPasswordStep.email;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _emailFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter a valid email address';
      });
      return;
    }

    _emailFocus.unfocus();
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await ref
          .read(authRepositoryProvider)
          .requestPasswordReset(email: email);
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _step = _ForgotPasswordStep.sent;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  void _backToLogin() {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(AppRoutePaths.signIn);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.screenPaddingMobile,
              vertical: AimSpacing.space20,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Brand Header + Back Button
                _buildHeader(isDark, surfaces),
                const SizedBox(height: AimSpacing.space24),

                Expanded(
                  child: _step == _ForgotPasswordStep.email
                      ? _buildEmailStep(l10n, surfaces, isDark)
                      : _buildSentStep(l10n, surfaces, isDark),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(bool isDark, AimSurfaceTheme surfaces) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Brand Logo Row
        Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: AimGradients.ai,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: const Icon(
                Icons.auto_awesome_rounded,
                color: AimColors.neutral0,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            ShaderMask(
              shaderCallback: (bounds) => AimGradients.ai.createShader(bounds),
              child: Text(
                'AIM',
                style: AimTextStyles.h2.copyWith(
                  color: AimColors.neutral0,
                  fontWeight: AimFontWeights.extrabold,
                  fontSize: 22,
                  letterSpacing: -0.5,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AimSpacing.space16),

        // Back Button
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: _backToLogin,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              width: 40,
              height: 40,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: surfaces.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: surfaces.border),
              ),
              child: Icon(
                Icons.arrow_back_rounded,
                size: 20,
                color: surfaces.textPrimary,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmailStep(
    AppLocalizations l10n,
    AimSurfaceTheme surfaces,
    bool isDark,
  ) {
    final primaryColor =
        isDark ? const Color(0xFF818CF8) : const Color(0xFF4F46E5);

    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: IntrinsicHeight(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category Badge
                  Text(
                    'FORGOT PASSWORD?',
                    style: AimTextStyles.caption.copyWith(
                      color: primaryColor,
                      fontWeight: AimFontWeights.extrabold,
                      fontSize: 11,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Title
                  Text(
                    'Reset your\npassword',
                    style: AimTextStyles.h1.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: AimFontWeights.extrabold,
                      fontSize: 28,
                      height: 1.15,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space8),

                  // Subtitle
                  Text(
                    "Enter the email linked to your account and we'll send you a link to reset your password.",
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textMuted,
                      fontSize: 14,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space24),

                  // Error message banner if present
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(AimSpacing.space12),
                      decoration: BoxDecoration(
                        color: AimColors.error500.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AimColors.error500.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline,
                              color: AimColors.error500, size: 20),
                          const SizedBox(width: AimSpacing.space8),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: AimTextStyles.caption.copyWith(
                                color: AimColors.error500,
                                fontWeight: AimFontWeights.medium,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AimSpacing.space16),
                  ],

                  // Input Field
                  TextField(
                    controller: _emailController,
                    focusNode: _emailFocus,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    enabled: !_isLoading,
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Email address',
                      hintStyle: AimTextStyles.bodyMd
                          .copyWith(color: surfaces.textMuted),
                      filled: true,
                      fillColor: surfaces.surface,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AimSpacing.space16,
                        vertical: 14,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: surfaces.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: surfaces.border),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: primaryColor, width: 2),
                      ),
                    ),
                    onSubmitted: (_) => _submit(),
                  ),
                  const SizedBox(height: AimSpacing.space16),

                  // Submit CTA Button
                  AIMButton(
                    variant: AIMButtonVariant.primary,
                    fullWidth: true,
                    size: AIMButtonSize.large,
                    loading: _isLoading,
                    disabled: _isLoading,
                    onPressed: _submit,
                    child: const Text('Send Reset Link'),
                  ),

                  const Spacer(),

                  // Bottom Navigation Link
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.only(
                          top: AimSpacing.space16,
                          bottom: AimSpacing.space12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Remembered your password? ',
                            style: AimTextStyles.bodySm.copyWith(
                              color: surfaces.textSecondary,
                            ),
                          ),
                          GestureDetector(
                            onTap: _backToLogin,
                            child: Text(
                              'Back to Sign In',
                              style: AimTextStyles.bodySm.copyWith(
                                color: primaryColor,
                                fontWeight: AimFontWeights.bold,
                                decoration: TextDecoration.underline,
                                decorationColor: primaryColor,
                              ),
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
      },
    );
  }

  Widget _buildSentStep(
    AppLocalizations l10n,
    AimSurfaceTheme surfaces,
    bool isDark,
  ) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: IntrinsicHeight(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(),
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0x3310B981)
                          : const Color(0xFFD1FAE5),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.mail_outline_rounded,
                      color: isDark
                          ? const Color(0xFF34D399)
                          : const Color(0xFF059669),
                      size: 32,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space20),
                  Text(
                    'Check Your Email',
                    style: AimTextStyles.h2.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: AimFontWeights.extrabold,
                      fontSize: 24,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space8),
                  Text(
                    'We sent a password reset link to',
                    textAlign: TextAlign.center,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textMuted,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _emailController.text.trim(),
                    textAlign: TextAlign.center,
                    style: AimTextStyles.bodyLg.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: AimFontWeights.bold,
                    ),
                  ),
                  const Spacer(),

                  AIMButton(
                    variant: AIMButtonVariant.outline,
                    fullWidth: true,
                    size: AIMButtonSize.large,
                    onPressed: _isLoading ? null : _submit,
                    child: const Text("Didn't get it? Resend email"),
                  ),
                  const SizedBox(height: AimSpacing.space12),

                  AIMButton(
                    variant: AIMButtonVariant.primary,
                    fullWidth: true,
                    size: AIMButtonSize.large,
                    onPressed: _backToLogin,
                    child: const Text('Back to Sign In'),
                  ),
                  const SizedBox(height: AimSpacing.space12),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
