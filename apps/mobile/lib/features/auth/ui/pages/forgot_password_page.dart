import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/errors/app_exception.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/auth_context_provider.dart';
import '../../logic/provider/session_store_provider.dart';

/// State of the forgot password flow (matching prototype's 4 steps).
enum _ForgotPasswordStep {
  email,
  sent,
  reset,
  success,
}

/// Forgot Password Screen — 4-step prototype implementation.
///
/// Steps:
/// 1. Email entry (`email`) -> sends reset link via AuthRepository.
/// 2. Email sent confirmation (`sent`) -> check email info & preview shortcut.
/// 3. Create new password (`reset`) -> validates password strength & match.
/// 4. Success confirmation (`success`) -> password reset success hero & sign in CTA.
class ForgotPasswordPage extends ConsumerStatefulWidget {
  const ForgotPasswordPage({
    super.key,
    this.initialStepName,
  });

  final String? initialStepName;

  @override
  ConsumerState<ForgotPasswordPage> createState() =>
      _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends ConsumerState<ForgotPasswordPage> {
  final _emailController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _emailFocus = FocusNode();
  final _newPasswordFocus = FocusNode();
  final _confirmPasswordFocus = FocusNode();

  _ForgotPasswordStep _step = _ForgotPasswordStep.email;
  bool _isLoading = false;
  bool _showPassword = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.initialStepName == 'reset' ||
        widget.initialStepName == 'recovery') {
      _step = _ForgotPasswordStep.reset;
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _emailFocus.dispose();
    _newPasswordFocus.dispose();
    _confirmPasswordFocus.dispose();
    super.dispose();
  }

  Future<void> _submitEmail() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() {
        _errorMessage = AppLocalizations.of(context).authEmailInvalid;
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
    } on AppException catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = e.message;
      });
    } catch (e) {
      if (!mounted) return;
      final raw = e.toString().replaceAll('Exception: ', '');
      final match = RegExp(r'message:\s*([^)]+)').firstMatch(raw);
      setState(() {
        _isLoading = false;
        _errorMessage = match?.group(1)?.trim() ?? raw;
      });
    }
  }

  Future<void> _submitNewPassword() async {
    final newPassword = _newPasswordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (newPassword.length < 8) {
      setState(() {
        _errorMessage = AppLocalizations.of(context).authPasswordMinEight;
      });
      return;
    }

    if (newPassword != confirmPassword) {
      setState(() {
        _errorMessage = AppLocalizations.of(context).authPasswordsDoNotMatch;
      });
      return;
    }

    _newPasswordFocus.unfocus();
    _confirmPasswordFocus.unfocus();

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final session = await ref.read(sessionStoreProvider).read();
      final token = session?.accessToken ?? '';

      if (token.isNotEmpty) {
        await ref.read(authRepositoryProvider).resetPassword(
              newPassword: newPassword,
              bearerToken: token,
            );
      }

      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _step = _ForgotPasswordStep.success;
      });
    } on AppException catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = e.message;
      });
    } catch (e) {
      if (!mounted) return;
      final raw = e.toString().replaceAll('Exception: ', '');
      final match = RegExp(r'message:\s*([^)]+)').firstMatch(raw);
      setState(() {
        _isLoading = false;
        _errorMessage = match?.group(1)?.trim() ?? raw;
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
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isDark
                ? const [
                    Color(0xFF0F172A),
                    Color(0xFF0F172A),
                    Color(0xFF020617),
                  ]
                : const [
                    Color(0x22EEF2FF),
                    Colors.white,
                    Color(0x40F8FAFC),
                  ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Scaffold(
          backgroundColor: Colors.transparent,
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.space20,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Brand Header + Back Button (hidden on success step)
                  if (_step != _ForgotPasswordStep.success) ...[
                    _buildHeader(isDark, surfaces),
                    const SizedBox(height: AimSpacing.space24),
                  ],

                  Expanded(
                    child: switch (_step) {
                      _ForgotPasswordStep.email =>
                        _buildEmailStep(l10n, surfaces, isDark),
                      _ForgotPasswordStep.sent =>
                        _buildSentStep(l10n, surfaces, isDark),
                      _ForgotPasswordStep.reset =>
                        _buildResetStep(l10n, surfaces, isDark),
                      _ForgotPasswordStep.success =>
                        _buildSuccessStep(l10n, surfaces, isDark),
                    },
                  ),
                ],
              ),
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
                    l10n.authForgotPasswordBadge,
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
                    l10n.authResetPasswordTitle,
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
                    l10n.authResetPasswordSubtitle,
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
                      hintText: l10n.authEmailAddressHint,
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
                    onSubmitted: (_) => _submitEmail(),
                  ),
                  const SizedBox(height: AimSpacing.space16),

                  // Submit CTA Button
                  AIMButton(
                    variant: AIMButtonVariant.primary,
                    fullWidth: true,
                    size: AIMButtonSize.large,
                    loading: _isLoading,
                    disabled: _isLoading,
                    onPressed: _submitEmail,
                    child: Text(l10n.authSendResetLinkButton),
                  ),

                  const Spacer(),

                  // Bottom Navigation Link
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.only(
                          top: AimSpacing.space16,
                          bottom: AimSpacing.space12),
                      child: Wrap(
                        alignment: WrapAlignment.center,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(
                            l10n.authRememberedPasswordPrompt,
                            style: AimTextStyles.bodySm.copyWith(
                              color: surfaces.textSecondary,
                            ),
                          ),
                          GestureDetector(
                            onTap: _backToLogin,
                            child: Text(
                              l10n.authBackToSignIn,
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
                    l10n.authCheckYourEmailTitle,
                    style: AimTextStyles.h2.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: AimFontWeights.extrabold,
                      fontSize: 24,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space8),
                  Text(
                    l10n.authPasswordResetLinkSentTo,
                    textAlign: TextAlign.center,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textMuted,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _emailController.text.trim().isEmpty
                        ? l10n.authYourEmailFallback
                        : _emailController.text.trim(),
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
                    onPressed: _isLoading ? null : _submitEmail,
                    child: Text(l10n.authResendEmailButton),
                  ),
                  const SizedBox(height: AimSpacing.space12),

                  AIMButton(
                    variant: AIMButtonVariant.primary,
                    fullWidth: true,
                    size: AIMButtonSize.large,
                    onPressed: _backToLogin,
                    child: Text(l10n.authBackToSignIn),
                  ),
                  const SizedBox(height: AimSpacing.space12),

                  // Demo / Prototype Shortcut to test password reset UI directly
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _errorMessage = null;
                        _step = _ForgotPasswordStep.reset;
                      });
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: surfaces.border,
                          style: BorderStyle.solid,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        l10n.authResetPasswordPreviewShortcut,
                        style: AimTextStyles.caption.copyWith(
                          color: primaryColor,
                          fontWeight: AimFontWeights.semibold,
                        ),
                      ),
                    ),
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

  Widget _buildResetStep(
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
                  Text(
                    l10n.authResetPasswordBadge,
                    style: AimTextStyles.caption.copyWith(
                      color: primaryColor,
                      fontWeight: AimFontWeights.extrabold,
                      fontSize: 11,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),

                  Text(
                    l10n.authCreateNewPasswordTitle,
                    style: AimTextStyles.h1.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: AimFontWeights.extrabold,
                      fontSize: 28,
                      height: 1.15,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space8),

                  Text(
                    l10n.authCreateNewPasswordSubtitle,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textMuted,
                      fontSize: 14,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space24),

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

                  // New Password Input
                  TextField(
                    controller: _newPasswordController,
                    focusNode: _newPasswordFocus,
                    obscureText: !_showPassword,
                    enabled: !_isLoading,
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textPrimary),
                    decoration: InputDecoration(
                      hintText: l10n.authNewPasswordHint,
                      hintStyle: AimTextStyles.bodyMd
                          .copyWith(color: surfaces.textMuted),
                      filled: true,
                      fillColor: surfaces.surface,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _showPassword
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: surfaces.textMuted,
                          size: 20,
                        ),
                        onPressed: () {
                          setState(() {
                            _showPassword = !_showPassword;
                          });
                        },
                      ),
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
                  ),
                  const SizedBox(height: AimSpacing.space12),

                  // Confirm Password Input
                  TextField(
                    controller: _confirmPasswordController,
                    focusNode: _confirmPasswordFocus,
                    obscureText: !_showPassword,
                    enabled: !_isLoading,
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textPrimary),
                    decoration: InputDecoration(
                      hintText: l10n.authConfirmNewPasswordHint,
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
                    onSubmitted: (_) => _submitNewPassword(),
                  ),
                  const SizedBox(height: AimSpacing.space20),

                  AIMButton(
                    variant: AIMButtonVariant.primary,
                    fullWidth: true,
                    size: AIMButtonSize.large,
                    loading: _isLoading,
                    disabled: _isLoading,
                    onPressed: _submitNewPassword,
                    child: Text(l10n.authResetPasswordButton),
                  ),
                  const Spacer(),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSuccessStep(
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
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Spacer(),
                  Transform.rotate(
                    angle: 0.05,
                    child: Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF34D399), Color(0xFF4F46E5)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color:
                                const Color(0xFF4F46E5).withValues(alpha: 0.35),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        Icons.check_rounded,
                        color: AimColors.neutral0,
                        size: 48,
                      ),
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space24),

                  Text(
                    l10n.authPasswordResetSuccessTitle,
                    textAlign: TextAlign.center,
                    style: AimTextStyles.h1.copyWith(
                      color: surfaces.textPrimary,
                      fontWeight: AimFontWeights.extrabold,
                      fontSize: 28,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space8),

                  Text(
                    l10n.authPasswordResetSuccessBody,
                    textAlign: TextAlign.center,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textMuted,
                      fontSize: 14,
                      height: 1.45,
                    ),
                  ),
                  const Spacer(),

                  AIMButton(
                    variant: AIMButtonVariant.primary,
                    fullWidth: true,
                    size: AIMButtonSize.large,
                    onPressed: _backToLogin,
                    child: Text(l10n.authBackToSignIn),
                  ),
                  const SizedBox(height: AimSpacing.space16),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
