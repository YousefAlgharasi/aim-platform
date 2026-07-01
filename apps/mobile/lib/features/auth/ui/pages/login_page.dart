// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Login"
//   docs/design/ui-for-all-system-mobile/screenshots/light/02-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/02-screen.png
// Endpoint: POST /auth/login (POST /auth/test-login outside production only)
// Widgets: AIMInput, AIMGradientButton, AIMAlertBanner, AIMButton (test mode)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/config/app_config_provider.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../../logic/provider/login_provider.dart';

/// Login screen — Student Mobile App MVP.
///
/// Flow:
/// 1. Student enters email + password.
/// 2. [LoginNotifier] validates locally, then calls the backend's
///    `POST /auth/login` (the backend is the sole auth authority).
/// 3. On success the session is synced (bootstrap + me) and
///    [authFlowProvider] transitions to signedIn.
/// 4. [ref.listen] on [authFlowProvider] navigates to [AppRoutePaths.mainShell].
///
/// Design system: all colours, typography, spacing, and interactive widgets
/// use AIM Mobile Design System tokens.  No hard-coded values.
///
/// RTL/Arabic: no [TextDirection] is hard-coded.  [ListView] and all children
/// respect the ambient locale direction.  Icons are direction-neutral.
///
/// Security:
/// - No service-role keys, JWT secrets, or backend credentials here.
/// - Role and permission checks are backend-enforced.
/// - The form never decides authorisation.
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
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    await ref.read(loginProvider.notifier).submit();
  }

  Future<void> _submitTestLogin(String role) async {
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    await ref.read(loginProvider.notifier).submitTestLogin(role);
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(loginProvider);
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);
    final isTestModeAvailable = !ref.watch(appConfigProvider).isProduction;

    // Navigate to main shell once sign-in succeeds.
    //
    // Deferred via addPostFrameCallback: this listener fires synchronously
    // on state change, before the root MaterialApp (which watches
    // authFlowProvider to build onGenerateRoute) has rebuilt. Pushing
    // immediately would route against the stale (signed-out) closure and
    // get redirected straight back to sign-in.
    ref.listen(authFlowProvider, (_, next) {
      if (next.isSignedIn && mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted) return;
          Navigator.of(context).pushNamedAndRemoveUntil(
            AppRoutePaths.mainShell,
            (route) => false,
          );
        });
      }
    });

    return Scaffold(
      backgroundColor: surfaces.background,
      body: AutofillGroup(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            // ── Gradient welcome header ───────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.screenPaddingMobile,
                AimSpacing.space64,
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap * 2,
              ),
              decoration: const BoxDecoration(gradient: AimGradients.gzHero),
              child: SafeArea(
                bottom: false,
                child: Column(
                  children: [
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: AimColors.neutral0.withValues(alpha: 0.18),
                        shape: BoxShape.circle,
                      ),
                      child: const Padding(
                        padding: EdgeInsets.all(AimSpacing.space16),
                        child: Icon(
                          Icons.school_outlined,
                          size: AimSizes.iconLg,
                          color: AimColors.neutral0,
                        ),
                      ),
                    ),
                    const SizedBox(height: AimSpacing.componentGap),
                    Text(
                      'Welcome back',
                      style: AimTextStyles.h2.copyWith(
                        color: AimColors.neutral0,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AimSpacing.space4),
                    Text(
                      'Sign in to keep your streak alive',
                      style: AimTextStyles.bodySm.copyWith(
                        color: AimColors.neutral0.withValues(alpha: 0.85),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),

            // ── Form card ──────────────────────────────────────────────
            Transform.translate(
              offset: const Offset(0, -AimSpacing.sectionGap),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.screenPaddingMobile,
                  vertical: AimSpacing.sectionGap,
                ),
                decoration: BoxDecoration(
                  color: surfaces.surface,
                  borderRadius: const BorderRadiusDirectional.only(
                    topStart: Radius.circular(AimRadius.x2l),
                    topEnd: Radius.circular(AimRadius.x2l),
                  ),
                  boxShadow: shadows.card,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // ── Error banner ───────────────────────────────────
                    if (formState.errorMessage != null) ...[
                      AIMAlertBanner(
                        tone: AIMAlertTone.error,
                        child: Text(formState.errorMessage!),
                      ),
                      const SizedBox(height: AimSpacing.formFieldGap),
                    ],

                    // ── Email ──────────────────────────────────────────
                    AIMInput(
                      controller: _emailController,
                      focusNode: _emailFocus,
                      label: 'Email',
                      placeholder: 'you@example.com',
                      type: AIMInputType.email,
                      disabled: formState.isSubmitting,
                      leadingIcon: const Icon(Icons.email_outlined),
                      onChanged: _onEmailChanged,
                      onSubmitted: (_) => _passwordFocus.requestFocus(),
                      textInputAction: TextInputAction.next,
                      autofillHints: const [AutofillHints.email],
                      semanticLabel: 'Email address',
                    ),
                    const SizedBox(height: AimSpacing.formFieldGap),

                    // ── Password ───────────────────────────────────────
                    AIMInput(
                      controller: _passwordController,
                      focusNode: _passwordFocus,
                      label: 'Password',
                      type: AIMInputType.password,
                      disabled: formState.isSubmitting,
                      leadingIcon: const Icon(Icons.lock_outline),
                      onChanged: _onPasswordChanged,
                      onSubmitted: (_) => _submit(),
                      textInputAction: TextInputAction.done,
                      autofillHints: const [AutofillHints.password],
                      semanticLabel: 'Password',
                    ),
                    const SizedBox(height: AimSpacing.space8),

                    // Visible per design, but there is no forgot-password
                    // endpoint or route yet, so this is a non-interactive
                    // placeholder rather than a dead-end action.
                    Align(
                      alignment: AlignmentDirectional.centerEnd,
                      child: Text(
                        'Forgot password?',
                        style: AimTextStyles.label.copyWith(
                          color: surfaces.textMuted,
                        ),
                      ),
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),

                    // ── Submit ─────────────────────────────────────────
                    AIMGradientButton(
                      label: 'Sign In',
                      fullWidth: true,
                      loading: formState.isSubmitting,
                      enabled: formState.isValid,
                      onPressed: _submit,
                      semanticLabel: 'Sign in',
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),

                    // ── Social sign-in (visual only — no backend yet) ───
                    Text(
                      'OR CONTINUE WITH',
                      style:
                          AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AimSpacing.formFieldGap),
                    const AIMButton(
                      onPressed: null,
                      variant: AIMButtonVariant.outline,
                      fullWidth: true,
                      semanticLabel: 'Continue with Google (coming soon)',
                      child: Text('Continue with Google'),
                    ),
                    const SizedBox(height: AimSpacing.innerGap),
                    const Row(
                      children: [
                        Expanded(
                          child: AIMButton(
                            onPressed: null,
                            variant: AIMButtonVariant.outline,
                            semanticLabel: 'Continue with Apple (coming soon)',
                            child: Text('Apple'),
                          ),
                        ),
                        SizedBox(width: AimSpacing.innerGap),
                        Expanded(
                          child: AIMButton(
                            onPressed: null,
                            variant: AIMButtonVariant.outline,
                            semanticLabel:
                                'Continue with Facebook (coming soon)',
                            child: Text('Facebook'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),

                    // ── Register link ───────────────────────────────────
                    Center(
                      child: TextButton(
                        onPressed: () => Navigator.of(context)
                            .pushNamed(AppRoutePaths.register),
                        child: const Text("Don't have an account? Create one"),
                      ),
                    ),

                    // ── Test mode (non-production builds only) ──────────
                    // Lets a developer/tester sign in as a fixed
                    // student/admin/parent test account without a real
                    // password. The backend returns 404 for this route in
                    // production, so this button never appears (and would
                    // be a dead end if it did).
                    if (isTestModeAvailable) ...[
                      const SizedBox(height: AimSpacing.sectionGap),
                      const _TestModeDivider(),
                      const SizedBox(height: AimSpacing.formFieldGap),
                      _TestModeButtonRow(
                        isSubmitting: formState.isSubmitting,
                        onSelectRole: _submitTestLogin,
                      ),
                      const SizedBox(height: AimSpacing.formFieldGap),
                      AIMButton(
                        onPressed: () => Navigator.of(context)
                            .pushNamed(AppRoutePaths.endpointTester),
                        variant: AIMButtonVariant.outline,
                        fullWidth: true,
                        child: const Text('Open API Endpoint Tester'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Supporting widgets ────────────────────────────────────────────────────────

/// Visual separator between real sign-in and the test-mode shortcut, so
/// testers can't mistake it for part of the real auth flow.
class _TestModeDivider extends StatelessWidget {
  const _TestModeDivider();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Row(
      children: [
        Expanded(child: Divider(color: surfaces.textSecondary)),
        Padding(
          padding: const EdgeInsetsDirectional.symmetric(
            horizontal: AimSpacing.innerGap,
          ),
          child: Text(
            'Test mode',
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ),
        Expanded(child: Divider(color: surfaces.textSecondary)),
      ],
    );
  }
}

/// Three buttons that sign in as a fixed student/admin/parent test account,
/// bypassing the real password form entirely. Only ever shown outside
/// production (see [isTestModeAvailable] in [LoginPage]).
class _TestModeButtonRow extends StatelessWidget {
  const _TestModeButtonRow({
    required this.isSubmitting,
    required this.onSelectRole,
  });

  final bool isSubmitting;
  final void Function(String role) onSelectRole;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: AIMButton(
            onPressed: isSubmitting ? null : () => onSelectRole('student'),
            variant: AIMButtonVariant.secondary,
            semanticLabel: 'Enter as test student',
            child: const Text('Student'),
          ),
        ),
        const SizedBox(width: AimSpacing.innerGap),
        Expanded(
          child: AIMButton(
            onPressed: isSubmitting ? null : () => onSelectRole('parent'),
            variant: AIMButtonVariant.secondary,
            semanticLabel: 'Enter as test parent',
            child: const Text('Parent'),
          ),
        ),
        const SizedBox(width: AimSpacing.innerGap),
        Expanded(
          child: AIMButton(
            onPressed: isSubmitting ? null : () => onSelectRole('admin'),
            variant: AIMButtonVariant.secondary,
            semanticLabel: 'Enter as test admin',
            child: const Text('Admin'),
          ),
        ),
      ],
    );
  }
}
