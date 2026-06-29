import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
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
          builder: (_) => CheckoutStatusPage(sessionId: session.id),
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
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Order Summary',
                        style: theme.textTheme.titleMedium,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(widget.planName, style: theme.textTheme.bodyLarge),
                          Text(
                            '${widget.formattedPrice} / ${widget.interval}',
                            style: theme.textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _promoController,
                decoration: InputDecoration(
                  labelText: 'Promotion Code (optional)',
                  hintText: 'Enter code',
                  border: const OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.check),
                    onPressed: () {},
                    tooltip: 'Apply code',
                  ),
                ),
              ),
              const SizedBox(height: 16),
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Text(
                    _errorMessage!,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.error,
                    ),
                  ),
                ),
              const Spacer(),
              Text(
                'You will be redirected to our secure payment provider to complete your purchase.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: _isLoading ? null : _startCheckout,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Proceed to Payment'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
