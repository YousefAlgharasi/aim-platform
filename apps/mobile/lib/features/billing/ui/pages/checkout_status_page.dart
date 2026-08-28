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
import 'package:aim_mobile/l10n/app_localizations.dart';

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
    final l10n = AppLocalizations.of(context);
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
          l10n.billingPaymentSuccessful,
          style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(
          planName != null
              ? '$planName - ${l10n.billingPaymentSuccessful}'
              : l10n.billingPaymentSuccessful,
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  static Widget buildFailureState(BuildContext context, {VoidCallback? onRetry}) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
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
          l10n.billingPaymentFailed,
          style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(
          l10n.billingPaymentFailedMessage,
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          textAlign: TextAlign.center,
        ),
        if (onRetry != null) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          AIMGradientButton(
            label: l10n.commonRetry,
            onPressed: onRetry,
            fullWidth: true,
            semanticLabel: l10n.commonRetry,
          ),
        ],
        const SizedBox(height: AimSpacing.componentGap),
        AIMButton(
          variant: AIMButtonVariant.ghost,
          onPressed: () =>
              context.go(AppRoutePaths.mainShell),
          fullWidth: true,
          child: Text(l10n.commonBack),
        ),
      ],
    );
  }

  static Widget buildPendingState(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
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
          l10n.billingPaymentPending,
          style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(
          l10n.billingPaymentProcessingMessage,
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  static Widget buildCheckingState(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const CircularProgressIndicator(),
        const SizedBox(height: AimSpacing.sectionGap),
        Text(
          l10n.billingPaymentPending,
          style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
        ),
        const SizedBox(height: AimSpacing.space8),
        Text(
          l10n.billingPaymentVerifying,
          style:
              AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _CheckoutStatusPageState extends ConsumerState<CheckoutStatusPage> {
  String? _status;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkStatus());
  }

  Future<void> _checkStatus() async {
    final sessionId = widget.sessionId;
    if (sessionId.isEmpty) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _status = 'failed';
          _errorMessage = 'No session ID provided';
        });
      }
      return;
    }

    try {
      final repository = ref.read(billingRepositoryProvider);
      final session = await repository.getCheckoutStatus(sessionId);
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
                  label: AppLocalizations.of(context).billingGoBack,
                  onPressed: () =>
                      context.go(AppRoutePaths.mainShell),
                  fullWidth: true,
                  semanticLabel: AppLocalizations.of(context).billingGoBack,
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
