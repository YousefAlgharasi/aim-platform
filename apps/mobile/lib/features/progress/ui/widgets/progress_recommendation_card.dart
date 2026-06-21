// Phase 6 — P6-098
// ProgressRecommendationCard — renders a backend-persisted AIM recommendation.
// kind and reason are AIM Engine outputs; displayed verbatim.

import 'package:flutter/material.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';

class ProgressRecommendationCard extends StatelessWidget {
  const ProgressRecommendationCard({required this.model, super.key});
  final AimRecommendationModel model;

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      variant: AIMCardVariant.ai,
      semanticLabel: 'AIM recommendation: ${model.kind} ${model.targetSkillId}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome_outlined,
                  size: AimSizes.iconSm, color: AimColors.primary400),
              const SizedBox(width: AimSpacing.space4),
              Expanded(
                child: Text(
                  model.targetSkillId,
                  style: AimTextStyles.label
                      .copyWith(color: AimColors.primary500),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text('#${model.rank}'),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            model.kind,
            style:
                AimTextStyles.title.copyWith(color: AimColors.neutral900),
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            model.reason,
            style:
                AimTextStyles.bodySm.copyWith(color: AimColors.neutral700),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
