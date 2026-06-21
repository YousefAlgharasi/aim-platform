import 'package:flutter/material.dart';

class CheckoutStartPage extends StatefulWidget {
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
  State<CheckoutStartPage> createState() => _CheckoutStartPageState();
}

class _CheckoutStartPageState extends State<CheckoutStartPage> {
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
      // Call backend checkout API via BillingRepository
      // On success, redirect to provider checkout URL or open in-app browser
      // Backend is the authority — UI only initiates the request
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to start checkout. Please try again.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
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
