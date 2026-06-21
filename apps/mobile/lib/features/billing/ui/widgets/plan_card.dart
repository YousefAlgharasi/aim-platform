import 'package:flutter/material.dart';

class PlanCard extends StatelessWidget {
  final String planName;
  final String? description;
  final String price;
  final String interval;
  final List<String> features;
  final bool isCurrentPlan;
  final bool isRecommended;
  final VoidCallback? onSelect;

  const PlanCard({
    super.key,
    required this.planName,
    this.description,
    required this.price,
    required this.interval,
    required this.features,
    this.isCurrentPlan = false,
    this.isRecommended = false,
    this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      elevation: isRecommended ? 4 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isRecommended
            ? BorderSide(color: colorScheme.primary, width: 2)
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isRecommended)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: colorScheme.primary,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'Recommended',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: colorScheme.onPrimary,
                  ),
                ),
              ),
            if (isRecommended) const SizedBox(height: 8),
            Text(
              planName,
              style: theme.textTheme.titleLarge,
            ),
            if (description != null) ...[
              const SizedBox(height: 4),
              Text(
                description!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(price, style: theme.textTheme.headlineMedium),
                const SizedBox(width: 4),
                Text(
                  '/ $interval',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...features.map(
              (feature) => Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    Icon(Icons.check_circle,
                        size: 16, color: colorScheme.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(feature, style: theme.textTheme.bodyMedium),
                    ),
                  ],
                ),
              ),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: isCurrentPlan ? null : onSelect,
                child: Text(isCurrentPlan ? 'Current Plan' : 'Select Plan'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
