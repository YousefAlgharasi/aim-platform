import 'package:flutter/material.dart';

class CheckoutStatusPage extends StatelessWidget {
  final String sessionId;

  const CheckoutStatusPage({
    super.key,
    required this.sessionId,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Status will be fetched from backend via GET /billing/checkout/:sessionId/status
    // Backend is the authority for payment status — UI only displays
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Status'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: _buildStatusContent(context, theme),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusContent(BuildContext context, ThemeData theme) {
    // Placeholder — will show loading then real status from backend
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const CircularProgressIndicator(),
        const SizedBox(height: 24),
        Text(
          'Checking payment status...',
          style: theme.textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(
          'Please wait while we verify your payment.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  static Widget buildSuccessState(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.check_circle, size: 80, color: theme.colorScheme.primary),
        const SizedBox(height: 24),
        Text('Payment Successful!', style: theme.textTheme.headlineSmall),
        const SizedBox(height: 8),
        Text(
          'Your subscription is now active.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 32),
        FilledButton(
          onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
          child: const Text('Go to Home'),
        ),
      ],
    );
  }

  static Widget buildFailureState(BuildContext context, {VoidCallback? onRetry}) {
    final theme = Theme.of(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.error_outline, size: 80, color: theme.colorScheme.error),
        const SizedBox(height: 24),
        Text('Payment Failed', style: theme.textTheme.headlineSmall),
        const SizedBox(height: 8),
        Text(
          'Your payment could not be processed. Please try again.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        if (onRetry != null)
          FilledButton(onPressed: onRetry, child: const Text('Try Again')),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
          child: const Text('Go Back'),
        ),
      ],
    );
  }

  static Widget buildPendingState(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.hourglass_top, size: 80, color: theme.colorScheme.tertiary),
        const SizedBox(height: 24),
        Text('Payment Pending', style: theme.textTheme.headlineSmall),
        const SizedBox(height: 8),
        Text(
          'Your payment is being processed. We\'ll notify you when it\'s complete.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        OutlinedButton(
          onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
          child: const Text('Go to Home'),
        ),
      ],
    );
  }
}
