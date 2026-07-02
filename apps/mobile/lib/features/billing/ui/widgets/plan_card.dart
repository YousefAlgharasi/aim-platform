import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

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
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: isRecommended ? AIMCardVariant.elevated : AIMCardVariant.standard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                planName,
                style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
              ),
              if (isRecommended) ...[
                const SizedBox(width: AimSpacing.space8),
                const AIMBadge(
                  tone: AIMBadgeTone.primary,
                  pill: true,
                  child: Text('Popular'),
                ),
              ],
            ],
          ),
          if (description != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(
              description!,
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            ),
          ],
          const SizedBox(height: AimSpacing.space12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                price,
                style: AimTextStyles.display.copyWith(color: surfaces.textPrimary),
              ),
              const SizedBox(width: AimSpacing.space4),
              Text(
                '/$interval',
                style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space16),
          ...features.map(
            (feature) => Padding(
              padding: const EdgeInsets.only(bottom: AimSpacing.space8),
              child: Row(
                children: [
                  const Icon(
                    Icons.check,
                    size: AimSizes.iconSm,
                    color: AimColors.success500,
                  ),
                  const SizedBox(width: AimSpacing.space8),
                  Expanded(
                    child: Text(
                      feature,
                      style:
                          AimTextStyles.bodySm.copyWith(color: surfaces.textPrimary),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AimSpacing.space16),
          if (isCurrentPlan)
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: null,
                child: const Text('Current plan'),
              ),
            )
          else
            AIMGradientButton(
              label: 'Subscribe',
              onPressed: onSelect,
              enabled: onSelect != null,
              fullWidth: true,
              semanticLabel: 'Subscribe to $planName',
            ),
        ],
      ),
    );
  }
}
