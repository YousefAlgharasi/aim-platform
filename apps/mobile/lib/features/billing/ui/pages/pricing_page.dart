// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Pricing" (43)
//   docs/design/ui-for-all-system-mobile/screenshots/light/43-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/43-screen.png
//
// TASK-26: restyled to match design screen 43 — gradient header ("Plans &
// Pricing"), plan cards with a "Popular" badge on the premium tier and a
// disabled "Current plan" button on the subscriber's active plan.
//
// Security/data rules:
// - Plan names, prices, and feature flags are all backend-supplied; nothing
//   here is fabricated. The "Popular" badge is a display-only highlight of
//   the premium tier, not a backend field.
// - Feature bullets are derived from the real `features` map on each plan:
//   only truthy entries are shown (a false/zero entry is not "included"),
//   formatted for display only.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/billing/logic/entity/billing_data.dart';
import 'package:aim_mobile/features/billing/logic/provider/billing_provider.dart';
import '../widgets/plan_card.dart';
import 'checkout_start_page.dart';

/// Turns a snake_case backend feature key into a readable label, e.g.
/// "ai_teacher_access" → "Ai teacher access".
String _humanizeFeatureKey(String key) {
  final words = key.split('_').where((w) => w.isNotEmpty);
  return words
      .map((w) => '${w[0].toUpperCase()}${w.substring(1)}')
      .join(' ');
}

/// Builds display bullets from a plan's real `features` map. Only truthy
/// entries are shown: `false`/`0` means the feature is not included, so it
/// must not render a checkmark. Negative numbers are the backend's
/// convention for "unlimited".
List<String> _includedFeatureLabels(Map<String, dynamic> features) {
  final labels = <String>[];
  for (final entry in features.entries) {
    final label = _humanizeFeatureKey(entry.key);
    final value = entry.value;
    if (value == true) {
      labels.add(label);
    } else if (value is num && value != 0) {
      labels.add(value < 0 ? 'Unlimited $label' : '$value $label');
    } else if (value is String && value.isNotEmpty) {
      labels.add('$label: $value');
    }
  }
  return labels;
}

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

  void _load() {
    ref.read(pricingProvider.notifier).load();
    ref.read(subscriptionProvider.notifier).load();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(pricingProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _PricingHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() || AppAsyncIdle() => const AIMFullScreenLoading(
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
    );
  }
}

class _PricingHeader extends StatelessWidget {
  const _PricingHeader();

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
                onTap: () => Navigator.of(context).pop(),
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
              'Plans & Pricing',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}

/// Renders the list of selectable billing plans. Shared by [PricingPage]
/// and [SubscriptionPage] (when the user has no active subscription) so
/// the plans are shown directly without an extra "View Plans" hop.
class PlansList extends ConsumerWidget {
  const PlansList({super.key, required this.data});

  final PricingData data;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (data.plans.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.storefront_outlined),
        title: 'No plans available',
        subtitle: 'Check back later for available plans.',
      );
    }

    final subscriptionState = ref.watch(subscriptionProvider);
    final String? currentPlanId = subscriptionState is AppAsyncSuccess<SubscriptionData>
        ? subscriptionState.data.currentSubscription?.planId
        : null;

    return ListView.separated(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      itemCount: data.plans.length,
      separatorBuilder: (_, __) => const SizedBox(height: AimSpacing.componentGap),
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
          features: _includedFeatureLabels(plan.features),
          isCurrentPlan: plan.id == currentPlanId,
          isRecommended: plan.planType == 'premium',
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
