// Phase 6 — P6-098
// ProgressSkillStateCard — renders a backend-persisted AIM skill state.
//
// masteryScore, masteryTrend, masteryConfidence are AIM Engine outputs.
// Flutter displays them verbatim. No local mastery computation.

import 'package:flutter/material.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';

class ProgressSkillStateCard extends StatelessWidget {
  const ProgressSkillStateCard({required this.model, super.key});
  final AimSkillStateModel model;

  AIMBadgeTone get _trendTone => switch (model.masteryTrend) {
        'improving' => AIMBadgeTone.success,
        'declining' => AIMBadgeTone.error,
        'stable' => AIMBadgeTone.neutral,
        _ => AIMBadgeTone.neutral,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final pct = (model.masteryScore * 100).roundToDouble();

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '${model.skillId} mastery ${pct.toInt()}%',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  model.skillId,
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: AimSpacing.innerGap),
              AIMBadge(
                tone: _trendTone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(model.masteryTrend),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space12),
          AIMProgressBar(
            value: pct,
            max: 100,
            showValue: true,
            label: 'Mastery',
            tone: AIMProgressBarTone.primary,
          ),
        ],
      ),
    );
  }
}
