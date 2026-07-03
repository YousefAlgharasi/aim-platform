// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Login"
//   docs/design/ui-for-all-system-mobile/screenshots/light/02-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/02-screen.png
// Endpoint: POST /auth/login (POST /auth/test-login outside production only)
// Widgets: AIMInput, AIMGradientButton, AIMAlertBanner, AIMButton
//
// Security:
// - The backend (NestJS, services/backend-api) is the sole auth authority.
//   This screen never talks to Supabase (or any identity provider) directly,
//   never stores a service-role key/JWT secret, and never decides
//   authorization — it only initiates the flow and reacts to the result.
// - Session tokens are handed to [SessionStore] only after the backend has
//   confirmed identity (see [LoginNotifier.submit]/[submitTestLogin]).
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/config/app_config_provider.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../logic/provider/auth_flow_provider.dart';
import '../../logic/provider/login_provider.dart';

/// Login screen — Student Mobile App MVP.
///
/// A student enters their email and password, [LoginNotifier] validates the
/// input locally and then calls the backend's `POST /auth/login`. On
/// success the notifier syncs the auth context, persists the session, and
/// flips [authFlowProvider] to signed-in; this widget's only job after that
/// is to notice the transition and navigate to [AppRoutePaths.mainShell].
///
/// A separate, non-production-only "test mode" section lets developers sign
/// in as a fixed student/admin/parent account (`POST /auth/test-login`) or
/// jump to the API endpoint tester, without touching the real password
/// form. It is hidden entirely in production builds.
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

  void _onEmailChanged(String value) {
    ref.read(loginProvider.notifier).setEmail(value);
  }

  void _onPasswordChanged(String value) {
    ref.read(loginProvider.notifier).setPassword(value);
  }

  Future<void> _submit() async {
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    await ref.read(loginProvider.notifier).submit();
  }

  Future<void> _enterAsTestRole(String role) async {
    _emailFocus.unfocus();
    _passwordFocus.unfocus();
    await ref.read(loginProvider.notifier).submitTestLogin(role);
  }

  void _openRegister() {
    Navigator.of(context).pushNamed(AppRoutePaths.register);
  }

  void _openEndpointTester() {
    Navigator.of(context).pushNamed(AppRoutePaths.endpointTester);
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(loginProvider);
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);
    final isTestModeAvailable = !ref.watch(appConfigProvider).isProduction;

    // The root MaterialApp also watches authFlowProvider (to decide which
    // route onGenerateRoute resolves to), and it hasn't rebuilt yet at the
    // moment this listener fires. Navigating synchronously here would push
    // against that stale, still-signed-out closure and immediately bounce
    // back to sign-in, so the actual push is deferred to the next frame.
    ref.listen(authFlowProvider, (_, next) {
      if (!next.isSignedIn || !mounted) return;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutePaths.mainShell,
          (route) => false,
        );
      });
    });

    // Paints light status-bar icons over the gradient header; without this
    // the OS falls back to dark icons on an assumed light background.
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: AutofillGroup(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              const _WelcomeHeader(),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AimSpacing.screenPaddingMobile,
                  0,
                  AimSpacing.screenPaddingMobile,
                  AimSpacing.sectionGap,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // The form is its own floating card — rounded on all
                    // four corners with a drop shadow — separate from the
                    // plain page background beneath it, pulled up over the
                    // hero via Transform.translate (paint-only — the card's
                    // *layout* box stays where the Column put it). Both
                    // Container.margin and Padding assert their insets are
                    // non-negative, so neither can express this overlap
                    // directly. The SizedBox that would normally separate
                    // the card from the social-sign-in section below is
                    // omitted instead: since the translate doesn't move the
                    // card's layout box, the gap between the card's
                    // (shifted-up) visible bottom edge and the next
                    // sibling's untouched position naturally comes out to
                    // exactly sectionGap — the same amount the card is
                    // shifted up by.
                    Transform.translate(
                      offset: const Offset(0, -AimSpacing.sectionGap),
                      child: Container(
                        padding:
                            const EdgeInsets.all(AimSpacing.cardPaddingLg),
                        decoration: BoxDecoration(
                          color: surfaces.surface,
                          borderRadius: AimRadius.borderX2l,
                          boxShadow: shadows.card,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (formState.errorMessage != null) ...[
                            AIMAlertBanner(
                              tone: AIMAlertTone.error,
                              child: Text(formState.errorMessage!),
                            ),
                            const SizedBox(height: AimSpacing.formFieldGap),
                          ],
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
                          // There is no forgot-password endpoint or route
                          // yet, so this is styled as a link but is plain,
                          // non-tappable text rather than a dead-end button.
                          Align(
                            alignment: AlignmentDirectional.centerEnd,
                            child: Text(
                              'Forgot password?',
                              style: AimTextStyles.label.copyWith(
                                color: surfaces.textLink,
                              ),
                            ),
                          ),
                          const SizedBox(height: AimSpacing.sectionGap),
                          AIMGradientButton(
                            label: 'Sign In',
                            fullWidth: true,
                            loading: formState.isSubmitting,
                            enabled: formState.isValid,
                            onPressed: _submit,
                            semanticLabel: 'Sign in',
                          ),
                        ],
                      ),
                    ),
                    ),
                    _SocialSignInSection(surfaces: surfaces),
                    const SizedBox(height: AimSpacing.sectionGap),
                    Center(
                      child: TextButton(
                        onPressed: _openRegister,
                        child: Text.rich(
                          TextSpan(
                            style: AimTextStyles.bodySm
                                .copyWith(color: surfaces.textSecondary),
                            children: [
                              const TextSpan(
                                text: "Don't have an account? ",
                              ),
                              TextSpan(
                                text: 'Create one',
                                style: TextStyle(
                                  color: surfaces.textLink,
                                  fontWeight: AimFontWeights.semibold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
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
                        child: const Text('Open API Endpoint Tester'),
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

// ── Header ───────────────────────────────────────────────────────────────

/// The purple-to-blue gradient hero: badge icon, "Welcome back", and the
/// supporting streak line beneath it.
///
/// The mockup also shows two soft, low-opacity decorative circles behind
/// this content (one large one clipped at the top-right corner, a fainter
/// one at bottom-left) — [_HeroBlob] reproduces those. Their exact
/// size/position/opacity can't be extracted precisely from the source
/// screenshot (924×540, ~244px-wide phone screen — too low-resolution for
/// pixel measurement); values below are a close visual match, not a
/// measured one.
class _WelcomeHeader extends StatelessWidget {
  const _WelcomeHeader();

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: Container(
        width: double.infinity,
        padding: const EdgeInsetsDirectional.fromSTEB(
          AimSpacing.screenPaddingMobile,
          AimSpacing.space64,
          AimSpacing.screenPaddingMobile,
          AimSpacing.sectionGap * 2,
        ),
        decoration: const BoxDecoration(gradient: AimGradients.gzHero),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            const PositionedDirectional(
              top: -50,
              end: -60,
              child: _HeroBlob(size: 180, opacity: 0.14),
            ),
            const PositionedDirectional(
              bottom: -60,
              start: -50,
              child: _HeroBlob(size: 150, opacity: 0.08),
            ),
            SafeArea(
              bottom: false,
              child: Column(
                children: [
                  DecoratedBox(
                    decoration: BoxDecoration(
                      color: AimColors.neutral0.withValues(alpha: 0.18),
                      borderRadius: AimRadius.borderXl,
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
                    style:
                        AimTextStyles.h2.copyWith(color: AimColors.neutral0),
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
          ],
        ),
      ),
    );
  }
}

/// A soft, low-opacity decorative circle behind [_WelcomeHeader]'s content.
class _HeroBlob extends StatelessWidget {
  const _HeroBlob({required this.size, required this.opacity});

  final double size;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AimColors.neutral0.withValues(alpha: opacity),
        ),
      ),
    );
  }
}

// ── Social sign-in (visual only — no backend yet) ──────────────────────────

/// "OR CONTINUE WITH" plus the Google / Apple / Facebook buttons.
///
/// None of these have a backend endpoint yet, so every button must be
/// genuinely untappable while still looking exactly like a normal,
/// legible outline button (per the design mock) and still being announced
/// to screen readers as a "(coming soon)" affordance.
///
/// `AIMButton(onPressed: null, ...)` would satisfy "untappable" but is the
/// wrong tool: `AIMButton` treats a null [AIMButton.onPressed] as a *true*
/// disabled state and renders `surfaces.disabledBg/disabledFg/disabledBorder`
/// — in dark mode that is a near-invisible dark-gray-on-navy combination,
/// which does not match the mock and fails contrast. Passing a no-op
/// `() {}` callback instead keeps [AIMButton.isEnabled] true, so the button
/// paints its normal, legible outline spec (visible border, primary-colored
/// label). [IgnorePointer] then blocks the tap from ever reaching that
/// callback, while `ignoringSemantics: false` keeps the button in the
/// accessibility tree so the semantic label is still announced.
class _SocialSignInSection extends StatelessWidget {
  const _SocialSignInSection({required this.surfaces});

  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'OR CONTINUE WITH',
          style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AimSpacing.formFieldGap),
        IgnorePointer(
          ignoringSemantics: false,
          child: AIMButton(
            onPressed: () {},
            variant: AIMButtonVariant.outline,
            fullWidth: true,
            semanticLabel: 'Continue with Google (coming soon)',
            child: const Text('Continue with Google'),
          ),
        ),
        const SizedBox(height: AimSpacing.innerGap),
        Row(
          children: [
            Expanded(
              child: IgnorePointer(
                ignoringSemantics: false,
                child: AIMButton(
                  onPressed: () {},
                  variant: AIMButtonVariant.outline,
                  semanticLabel: 'Continue with Apple (coming soon)',
                  child: const Text('Apple'),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.innerGap),
            Expanded(
              child: IgnorePointer(
                ignoringSemantics: false,
                child: AIMButton(
                  onPressed: () {},
                  variant: AIMButtonVariant.outline,
                  semanticLabel: 'Continue with Facebook (coming soon)',
                  child: const Text('Facebook'),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ── Developer test mode (non-production builds only) ──────────────────────

/// Visual divider that keeps the test-mode shortcut from being mistaken
/// for part of the real sign-in flow.
class _DeveloperTestModeDivider extends StatelessWidget {
  const _DeveloperTestModeDivider();

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

/// Three shortcuts that sign in as a fixed student/admin/parent test
/// account via `POST /auth/test-login`, bypassing the password form. The
/// backend only serves that route outside production, so [LoginPage] only
/// ever mounts this widget when `appConfigProvider` reports non-production.
class _DeveloperTestModeRoleButtons extends StatelessWidget {
  const _DeveloperTestModeRoleButtons({
    required this.isSubmitting,
    required this.onSelectRole,
  });

  final bool isSubmitting;
  final ValueChanged<String> onSelectRole;

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
