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

/// Forgot Password Screen — AIM Mobile.
class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  ConsumerState<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
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
      await ref.read(authRepositoryProvider).requestPasswordReset(email: email);
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
    final size = MediaQuery.sizeOf(context);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.screenPaddingMobile,
              vertical: AimSpacing.space24,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Row with Back Button & Logo
                Row(
                  children: [
                    IconButton(
                      onPressed: _backToLogin,
                      icon: const Icon(Icons.arrow_back_rounded),
                      style: IconButton.styleFrom(
                        backgroundColor: surfaces.surface,
                        shape: RoundedRectangleBorder(
                          borderRadius: AimRadius.borderMd,
                        ),
                      ),
                    ),
                    const Spacer(),
                    const AimBrandLogo(size: 32),
                  ],
                ),
                const SizedBox(height: AimSpacing.space32),

                Expanded(
                  child: _step == _ForgotPasswordStep.email
                      ? _buildEmailStep(l10n, surfaces, size)
                      : _buildSentStep(l10n, surfaces),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmailStep(
    AppLocalizations l10n,
    AimSurfaceTheme surfaces,
    Size size,
  ) {
    return ListView(
      physics: const ClampingScrollPhysics(),
      children: [
        Text(
          l10n.authForgotPassword,
          style: AimTextStyles.h2.copyWith(
            color: surfaces.textPrimary,
            fontWeight: AimFontWeights.extrabold,
          ),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(
          'Enter your email address and we will send you instructions to reset your password.',
          style: AimTextStyles.bodyMd.copyWith(
            color: surfaces.textSecondary,
          ),
        ),
        const SizedBox(height: AimSpacing.space32),

        if (_errorMessage != null) ...[
          Container(
            padding: const EdgeInsets.all(AimSpacing.space12),
            decoration: BoxDecoration(
              color: AimColors.error500.withValues(alpha: 0.1),
              borderRadius: AimRadius.borderMd,
              border: Border.all(
                color: AimColors.error500.withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: AimColors.error500, size: 20),
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
          const SizedBox(height: AimSpacing.space20),
        ],

        Text(
          l10n.authEmailLabel,
          style: AimTextStyles.caption.copyWith(
            color: surfaces.textSecondary,
            fontWeight: AimFontWeights.semibold,
          ),
        ),
        const SizedBox(height: AimSpacing.space8),
        TextField(
          controller: _emailController,
          focusNode: _emailFocus,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          enabled: !_isLoading,
          style: AimTextStyles.bodyLg.copyWith(color: surfaces.textPrimary),
          decoration: InputDecoration(
            hintText: 'name@example.com',
            prefixIcon: const Icon(Icons.mail_outline_rounded),
            filled: true,
            fillColor: surfaces.surface,
            border: OutlineInputBorder(
              borderRadius: AimRadius.borderMd,
              borderSide: BorderSide(color: surfaces.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: AimRadius.borderMd,
              borderSide: BorderSide(color: surfaces.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: AimRadius.borderMd,
              borderSide: const BorderSide(color: AimColors.primary500, width: 2),
            ),
          ),
          onSubmitted: (_) => _submit(),
        ),
        const SizedBox(height: AimSpacing.space32),

        SizedBox(
          width: double.infinity,
          height: AimSizes.buttonLg,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: AimColors.primary500,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: AimRadius.borderMd,
              ),
              elevation: 0,
            ),
            child: _isLoading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    'Send Reset Link',
                    style: AimTextStyles.button.copyWith(
                      fontWeight: AimFontWeights.bold,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: AimSpacing.space24),

        Center(
          child: TextButton(
            onPressed: _backToLogin,
            child: Text(
              'Back to Sign In',
              style: AimTextStyles.bodyMd.copyWith(
                color: AimColors.primary500,
                fontWeight: AimFontWeights.semibold,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSentStep(AppLocalizations l10n, AimSurfaceTheme surfaces) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: AimColors.success500.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Icon(
              Icons.mark_email_read_rounded,
              color: AimColors.success500,
              size: 36,
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.space24),
        Text(
          'Check Your Email',
          style: AimTextStyles.h2.copyWith(
            color: surfaces.textPrimary,
            fontWeight: AimFontWeights.bold,
          ),
        ),
        const SizedBox(height: AimSpacing.space12),
        Text(
          'We sent a password reset link to:',
          textAlign: TextAlign.center,
          style: AimTextStyles.bodyMd.copyWith(
            color: surfaces.textSecondary,
          ),
        ),
        const SizedBox(height: AimSpacing.space4),
        Text(
          _emailController.text.trim(),
          textAlign: TextAlign.center,
          style: AimTextStyles.bodyLg.copyWith(
            color: surfaces.textPrimary,
            fontWeight: AimFontWeights.bold,
          ),
        ),
        const SizedBox(height: AimSpacing.space32),

        SizedBox(
          width: double.infinity,
          height: AimSizes.buttonLg,
          child: ElevatedButton(
            onPressed: _backToLogin,
            style: ElevatedButton.styleFrom(
              backgroundColor: AimColors.primary500,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: AimRadius.borderMd,
              ),
              elevation: 0,
            ),
            child: Text(
              'Back to Sign In',
              style: AimTextStyles.button.copyWith(
                fontWeight: AimFontWeights.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.space16),

        TextButton(
          onPressed: _isLoading ? null : _submit,
          child: Text(
            "Didn't get it? Resend email",
            style: AimTextStyles.bodyMd.copyWith(
              color: AimColors.primary500,
              fontWeight: AimFontWeights.semibold,
            ),
          ),
        ),
      ],
    );
  }
}
