// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Checkout status" (46)
//   docs/design/ui-for-all-system-mobile/screenshots/light/46-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/46-screen.png
//
// TASK-33: restyled to match design screen 46 — no top bar (matches the
// mockup, which has none), soft-circle status icon, gradient "Go to Home"
// button. The design's "Toggle success / failure (demo)" link is an
// obvious mockup/demo-only affordance and is not implemented.
//
// planName is optional and real: it's the exact value the previous screen
// (CheckoutStartPage) already had from the plan the student selected, not a
// backend field on the checkout session itself (CheckoutSessionModel only
// carries id/status/checkoutUrl/expiresAt). When absent, a generic message
// is shown instead of guessing a plan name.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';

class CheckoutStatusPage extends ConsumerStatefulWidget {
  final String sessionId;
  final String? planName;

  const CheckoutStatusPage({
    super.key,
    required this.sessionId,
    this.planName,
  });

  @override
  ConsumerState<CheckoutStatusPage> createState() =>
      _CheckoutStatusPageState();

  static Widget buildSuccessState(BuildContext context, {String? planName}) {
    final surfaces = aimSurfacesOf(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const DecoratedBox(
          decoration: BoxDecoration(
            color: AimColors.success100,
            shape: BoxShape.circle,
          ),
          child: Padding(
            padding: EdgeInsets.all(AimSpacing.space20),
            child: Icon(Icons.check, size: AimSizes.iconLg, color: AimColors.success500),
          ),
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        Text(
          'Payment successful!',
          style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(
          planName != null
              ? 'Welcome to $planName — all features are now unlocked.'
              : 'Your subscription is now active.',
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  static Widget buildFailureState(BuildContext context, {VoidCallback? onRetry}) {
    final surfaces = aimSurfacesOf(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const DecoratedBox(
          decoration: BoxDecoration(
            color: AimColors.error100,
            shape: BoxShape.circle,
          ),
          child: Padding(
            padding: EdgeInsets.all(AimSpacing.space20),
            child: Icon(Icons.close, size: AimSizes.iconLg, color: AimColors.error500),
          ),
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        Text(
          'Payment failed',
          style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(
          'Your payment could not be processed. Please try again.',
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          textAlign: TextAlign.center,
        ),
        if (onRetry != null) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          AIMGradientButton(
            label: 'Try again',
            onPressed: onRetry,
            fullWidth: true,
            semanticLabel: 'Retry payment',
          ),
        ],
        const SizedBox(height: AimSpacing.componentGap),
        AIMButton(
          variant: AIMButtonVariant.ghost,
          onPressed: () =>
              context.go(AppRoutePaths.mainShell),
          fullWidth: true,
          child: const Text('Go back'),
        ),
      ],
    );
  }

  static Widget buildPendingState(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            color: surfaces.surfaceSunken,
            shape: BoxShape.circle,
          ),
          child: const Padding(
            padding: EdgeInsets.all(AimSpacing.space20),
            child: Icon(
              Icons.hourglass_top,
              size: AimSizes.iconLg,
              color: AimColors.warning500,
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        Text(
          'Payment pending',
          style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(
          "Your payment is being processed. We'll notify you when it's "
          'complete.',
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _CheckoutStatusPageState extends ConsumerState<CheckoutStatusPage> {
  String _status = 'pending';
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkStatus());
    ref.listenManual(checkoutReturnSignalProvider, (_, __) => _checkStatus());
  }

  Future<void> _checkStatus() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final repository = ref.read(billingRepositoryProvider);
      final session = await repository.getCheckoutStatus(widget.sessionId);
      if (!mounted) return;
      setState(() {
        _status = session.status;
      });
    } on AppException catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.message;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isSuccess = !_isLoading && _errorMessage == null && _status == 'completed';

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
                  child: _buildStatusContent(context),
                ),
              ),
            ),
            if (isSuccess)
              Padding(
                padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
                child: AIMGradientButton(
                  label: 'Go to Home',
                  onPressed: () =>
                      context.go(AppRoutePaths.mainShell),
                  fullWidth: true,
                  semanticLabel: 'Go to home',
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusContent(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    if (_isLoading) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            'Checking payment status...',
            style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            'Please wait while we verify your payment.',
            style:
                AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      );
    }

    if (_errorMessage != null) {
      return CheckoutStatusPage.buildFailureState(context, onRetry: _checkStatus);
    }

    switch (_status) {
      case 'completed':
        return CheckoutStatusPage.buildSuccessState(
          context,
          planName: widget.planName,
        );
      case 'failed':
      case 'expired':
        return CheckoutStatusPage.buildFailureState(
          context,
          onRetry: _checkStatus,
        );
      default:
        return CheckoutStatusPage.buildPendingState(context);
    }
  }
}
