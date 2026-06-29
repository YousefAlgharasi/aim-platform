import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/billing/logic/entity/billing_data.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import '../widgets/plan_card.dart';
import 'checkout_start_page.dart';

class PricingPage extends ConsumerStatefulWidget {
  const PricingPage({super.key});

  @override
  ConsumerState<PricingPage> createState() => _PricingPageState();
}

class _PricingPageState extends ConsumerState<PricingPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() => ref.read(pricingProvider.notifier).load();

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(pricingProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Plans & Pricing')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Choose Your Plan',
                style: Theme.of(context).textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Select the plan that works best for you',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Expanded(
                child: switch (state) {
                  AppAsyncLoading() || AppAsyncIdle() =>
                    const AIMFullScreenLoading(
                      semanticLabel: 'Loading plans',
                    ),
                  AppAsyncFailure(:final message) => AIMFullScreenError(
                      message: message,
                      onRetry: _load,
                    ),
                  AppAsyncSuccess(:final data) => PlansList(data: data),
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Renders the list of selectable billing plans. Shared by [PricingPage]
/// and [SubscriptionPage] (when the user has no active subscription) so
/// the plans are shown directly without an extra "View Plans" hop.
class PlansList extends StatelessWidget {
  const PlansList({super.key, required this.data});

  final PricingData data;

  @override
  Widget build(BuildContext context) {
    if (data.plans.isEmpty) {
      return const Center(child: Text('No plans are available right now.'));
    }

    return ListView.separated(
      itemCount: data.plans.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final plan = data.plans[index];
        final matchingPrices =
            data.prices.where((p) => p.id == plan.priceId);
        final price =
            plan.price ?? (matchingPrices.isEmpty ? null : matchingPrices.first);
        return PlanCard(
          planName: plan.name,
          description: plan.description,
          price: price?.formattedAmount ?? '\$0.00',
          interval: price?.billingInterval ?? 'month',
          features: plan.features.keys.toList(),
          onSelect: price == null
              ? null
              : () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => CheckoutStartPage(
                        planName: plan.name,
                        priceId: price.id,
                        formattedPrice: price.formattedAmount,
                        interval: price.billingInterval,
                      ),
                    ),
                  ),
        );
      },
    );
  }
}
