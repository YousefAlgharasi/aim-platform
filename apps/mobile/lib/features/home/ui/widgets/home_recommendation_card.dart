// Phase 6 — P6-062
// HomeRecommendationCard — renders a single AIM recommendation.
//
// action and reason are backend-computed. Flutter never generates or
// rewrites recommendation content locally.

import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_sizes.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_typography.dart';
import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';

/// Card for a single backend-computed AIM recommendation.
///
/// All content (action, reason) is backend-supplied verbatim.
/// Uses the AI card variant to signal AIM-sourced content.
class HomeRecommendationCard extends StatelessWidget {
  const HomeRecommendationCard({
    required this.model,
    super.key,
  });

  final HomeRecommendationModel model;

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      variant: AIMCardVariant.ai,
      semanticLabel: 'AIM recommendation: ${model.action} ${model.topic}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.auto_awesome_outlined,
                size: AimSizes.iconSm,
                color: AimColors.primary400,
              ),
              const SizedBox(width: AimSpacing.space4),
              Text(
                model.topic,
                style:
                    AimTextStyles.label.copyWith(color: AimColors.primary500),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            model.action,
            style: AimTextStyles.title.copyWith(color: AimColors.neutral900),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            model.reason,
            style: AimTextStyles.bodySm.copyWith(color: AimColors.neutral700),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
