// Phase 6 — P6-067
// LearningPathRecommendationCard — renders a single AIM recommendation.
//
// All recommendation content is backend-computed. Flutter never generates or
// rewrites recommendation content locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

class LearningPathRecommendationCard extends StatelessWidget {
  const LearningPathRecommendationCard({
    required this.model,
    super.key,
  });

  final LearningPathRecommendationModel model;

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      variant: AIMCardVariant.ai,
      semanticLabel:
          'AIM recommendation: ${model.kind} for ${model.targetSkillId}',
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
                model.targetSkillId,
                style:
                    AimTextStyles.label.copyWith(color: AimColors.primary500),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            model.kind,
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
