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
import 'package:url_launcher/url_launcher.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import 'checkout_status_page.dart';

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
            _errorMessage = 'Could not open the payment page. Please try again.';
          });
          return;
        }
      }

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => CheckoutStatusPage(
            sessionId: session.id,
            planName: widget.planName,
          ),
        ),
      );
    } on AppException catch (e) {
      setState(() {
        _errorMessage = e.message;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to start checkout. Please try again.';
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
                              'Billing',
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
                    "By continuing you agree to AIM's Terms of Service and "
                    'authorise a recurring charge. Cancel anytime.',
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  AIMInput(
                    controller: _promoController,
                    label: 'Promotion code (optional)',
                    placeholder: 'Enter code',
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
                    label: 'Proceed to Payment',
                    onPressed: _isLoading ? null : _startCheckout,
                    loading: _isLoading,
                    fullWidth: true,
                    semanticLabel: 'Proceed to payment',
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
              label: 'Back',
              child: InkWell(
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              'Checkout',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
