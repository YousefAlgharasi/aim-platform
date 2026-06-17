import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../../logic/provider/login_provider.dart';

/// Login screen — Phase 2: Auth, Users, Roles.
///
/// Allows a student to sign in through the mobile app flow.
///
/// - Calls Supabase Auth for the bearer token.
/// - Syncs and loads the current user from the backend via [AuthContextNotifier].
/// - Transitions the global [authFlowProvider] to signedIn on success.
///
/// Security rules:
/// - No service-role keys, JWT secrets, or backend credentials appear here.
/// - Role and permission checks are backend-enforced; this UI is UX only.
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
  Widget build(BuildContext context, ) {
    final formState = ref.watch(loginProvider);
    final authFlow = ref.watch(authFlowProvider);

    ref.listen(authFlowProvider, (_, next) {
      if (next.isSignedIn && mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutePaths.mainShell,
          (route) => false,
        );
      }
    });

    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
            vertical: AimSpacing.space32,
          ),
          children: [
            const _AimLogo(),
            SizedBox(height: AimSpacing.space32),
            Text(
              'Sign in to AIM',
              style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: AimSpacing.sectionGap),

            // Email field
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
            SizedBox(height: AimSpacing.formFieldGap),

            // Password field
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
            SizedBox(height: AimSpacing.sectionGap),

            // Error message
            if (formState.errorMessage != null) ...[
              AIMAlertBanner(
                tone: AIMAlertTone.error,
                child: Text(formState.errorMessage!),
              ),
              SizedBox(height: AimSpacing.formFieldGap),
            ],

            // Submit button
            AIMButton(
              onPressed: (formState.isValid && !formState.isSubmitting)
                  ? _submit
                  : null,
              fullWidth: true,
              loading: formState.isSubmitting,
              semanticLabel: 'Sign in',
              child: const Text('Sign In'),
            ),

            // Auth-checking progress indicator
            if (authFlow.isChecking) ...[
              SizedBox(height: AimSpacing.componentGap),
              const LinearProgressIndicator(),
            ],

            SizedBox(height: AimSpacing.innerGap),

            // Register link
            TextButton(
              onPressed: () =>
                  Navigator.pushNamed(context, AppRoutePaths.register),
              child: const Text("Don't have an account? Create one"),
            ),
          ],
        ),
      ),
    );
  }
}

class _AimLogo extends StatelessWidget {
  const _AimLogo();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Center(
      child: Column(
        children: [
          Icon(
            Icons.school_outlined,
            size: AimSizes.iconLg * 3,
            color: AimColors.primary500,
          ),
          SizedBox(height: AimSpacing.innerGap),
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
