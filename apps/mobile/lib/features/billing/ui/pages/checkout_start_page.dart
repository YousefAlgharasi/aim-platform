// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Checkout" (45)
//   docs/design/ui-for-all-system-mobile/screenshots/light/45-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/45-screen.png
//
// TASK-33: restyled to match design screen 45 — gradient header, order
// summary card, gradient "Proceed to Payment" button.
//
// Deviation from the mockup (never fabricate data): the design shows a
// "VAT (15%)" line and a computed "Total today" that includes it. No tax
// field or tax-inclusive total exists anywhere in the checkout contract
// (CheckoutSessionModel only carries id/status/checkoutUrl/expiresAt; the
// price itself has no tax breakdown) — Stripe (or whichever processor is
// behind checkoutUrl) computes and shows the real, final charged amount on
// its own hosted payment page. Fabricating a VAT figure here could show the
// student a wrong total. Only the real plan name/price/interval are shown.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class CheckoutStartPage extends ConsumerStatefulWidget {
  final String planName;
  final String priceId;
  final String formattedPrice;
  final String interval;

  const CheckoutStartPage({
    super.key,
    required this.planName,
    required this.priceId,
    required this.formattedPrice,
    required this.interval,
  });

  @override
  ConsumerState<CheckoutStartPage> createState() => _CheckoutStartPageState();
}

class _CheckoutStartPageState extends ConsumerState<CheckoutStartPage> {
  final _promoController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _promoController.dispose();
    super.dispose();
  }

  Future<void> _startCheckout() async {
    final l10n = AppLocalizations.of(context);
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(billingRepositoryProvider);
      final session = await repository.createCheckoutSession(
        priceId: widget.priceId,
        successUrl: 'aim://billing/checkout/success',
        cancelUrl: 'aim://billing/checkout/cancel',
        promotionCode: _promoController.text.trim().isEmpty
            ? null
            : _promoController.text.trim(),
      );

      final checkoutUrl = session.checkoutUrl;
      if (checkoutUrl != null && checkoutUrl.isNotEmpty) {
        final launched = await launchUrl(
          Uri.parse(checkoutUrl),
          mode: LaunchMode.externalApplication,
        );
        if (!launched) {
          if (!mounted) return;
          setState(() {
            _errorMessage = l10n.billingCouldNotOpenPaymentPageError;
          });
          return;
        }
      }

      if (!mounted) return;
      context.pushReplacement(
        AppRoutePaths.checkoutStatus,
        extra: {
          'sessionId': session.id,
          'planName': widget.planName,
        },
      );
    } on AppException catch (e) {
      setState(() {
        _errorMessage = e.message;
      });
    } catch (e) {
      setState(() {
        _errorMessage = l10n.billingCheckoutFailedGeneric;
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
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _CheckoutHeader(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.sectionGap,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AIMCard(
                    variant: AIMCardVariant.elevated,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              widget.planName,
                              style: AimTextStyles.title
                                  .copyWith(color: surfaces.textPrimary),
                            ),
                            Text(
                              widget.formattedPrice,
                              style: AimTextStyles.title
                                  .copyWith(color: surfaces.textPrimary),
                            ),
                          ],
                        ),
                        const SizedBox(height: AimSpacing.space8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              l10n.billingBillingIntervalLabel,
                              style: AimTextStyles.bodySm
                                  .copyWith(color: surfaces.textSecondary),
                            ),
                            Text(
                              _capitalize(widget.interval),
                              style: AimTextStyles.bodySm
                                  .copyWith(color: surfaces.textSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  Text(
                    l10n.billingTermsAgreementNotice,
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  AIMInput(
                    controller: _promoController,
                    label: l10n.billingPromoCodeLabel,
                    placeholder: l10n.billingPromoCodePlaceholder,
                  ),
                  if (_errorMessage != null) ...[
                    const SizedBox(height: AimSpacing.componentGap),
                    Text(
                      _errorMessage!,
                      style: AimTextStyles.bodySm
                          .copyWith(color: AimColors.error500),
                    ),
                  ],
                  const SizedBox(height: AimSpacing.sectionGap),
                  AIMGradientButton(
                    label: l10n.billingProceedToPaymentButton,
                    onPressed: _isLoading ? null : _startCheckout,
                    loading: _isLoading,
                    fullWidth: true,
                    semanticLabel: l10n.billingProceedToPaymentSemantic,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _capitalize(String value) =>
    value.isEmpty ? value : '${value[0].toUpperCase()}${value.substring(1)}';

class _CheckoutHeader extends StatelessWidget {
  const _CheckoutHeader();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: l10n.commonBack,
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              l10n.billingCheckoutTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
