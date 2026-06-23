import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../../logic/provider/login_provider.dart';

/// Login screen — Student Mobile App MVP.
///
/// Flow:
/// 1. Student enters email + password.
/// 2. [LoginNotifier] validates locally, then calls Supabase Auth.
/// 3. On success the bearer token is synced with the backend and
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

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(loginProvider);
    final surfaces = aimSurfacesOf(context);

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
      body: SafeArea(
        child: AutofillGroup(
          child: ListView(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.screenPaddingMobile,
              vertical: AimSpacing.space32,
            ),
            children: [
              // ── Branding ──────────────────────────────────────────────
              const _AimLogo(),
              const SizedBox(height: AimSpacing.space32),
              Text(
                'Sign in to AIM',
                style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AimSpacing.sectionGap),

              // ── Email ─────────────────────────────────────────────────
              AIMInput(
                controller: _emailController,
                focusNode: _emailFocus,
                label: 'Email',
                placeholder: 'you@example.com',
                type: AIMInputType.email,
                leadingIcon: const Icon(Icons.email_outlined),
                onChanged: _onEmailChanged,
                onSubmitted: (_) => _passwordFocus.requestFocus(),
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.email],
                semanticLabel: 'Email address',
              ),
              const SizedBox(height: AimSpacing.formFieldGap),

              // ── Password ──────────────────────────────────────────────
              AIMInput(
                controller: _passwordController,
                focusNode: _passwordFocus,
                label: 'Password',
                type: AIMInputType.password,
                leadingIcon: const Icon(Icons.lock_outline),
                onChanged: _onPasswordChanged,
                onSubmitted: (_) => _submit(),
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.password],
                semanticLabel: 'Password',
              ),
              const SizedBox(height: AimSpacing.sectionGap),

              // ── Error banner ──────────────────────────────────────────
              if (formState.errorMessage != null) ...[
                AIMAlertBanner(
                  tone: AIMAlertTone.error,
                  child: Text(formState.errorMessage!),
                ),
                const SizedBox(height: AimSpacing.formFieldGap),
              ],

              // ── Submit ────────────────────────────────────────────────
              AIMButton(
                onPressed:
                    (formState.isValid && !formState.isSubmitting) ? _submit : null,
                fullWidth: true,
                loading: formState.isSubmitting,
                semanticLabel: 'Sign in',
                child: const Text('Sign In'),
              ),
              const SizedBox(height: AimSpacing.innerGap),

              // ── Register link ─────────────────────────────────────────
              // TextAlign.center is direction-neutral (RTL/LTR safe).
              TextButton(
                onPressed: () =>
                    Navigator.of(context).pushNamed(AppRoutePaths.register),
                child: const Text(
                  "Don't have an account? Create one",
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Supporting widgets ────────────────────────────────────────────────────────

class _AimLogo extends StatelessWidget {
  const _AimLogo();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Center(
      child: Column(
        children: [
          const Icon(
            Icons.school_outlined,
            size: AimSizes.iconLg * 3,
            color: AimColors.primary500,
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Text(
            'AIM',
            style: AimTextStyles.h1.copyWith(
              color: surfaces.textPrimary,
              letterSpacing: 2,
            ),
          ),
          Text(
            'Adaptive Intelligence for Mastery',
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
