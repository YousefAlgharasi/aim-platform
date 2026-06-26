// Phase 6 — P6-067
// LearningPathSkillStateCard — renders a single AIM skill-state summary card.
//
// Displays skillId, masteryScore, and masteryTrend exactly as returned
// by the backend. Flutter never computes or infers these values locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

class LearningPathSkillStateCard extends StatelessWidget {
  const LearningPathSkillStateCard({
    required this.model,
    super.key,
  });

  final LearningPathSkillStateModel model;

  AIMBadgeTone get _trendTone {
    return switch (model.masteryTrend.toLowerCase()) {
      'improving' => AIMBadgeTone.success,
      'stable' => AIMBadgeTone.primary,
      'declining' => AIMBadgeTone.error,
      _ => AIMBadgeTone.neutral,
    };
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final scorePercent = (model.masteryScore * 100).toStringAsFixed(0);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '${model.skillId} mastery: $scorePercent%',
      child: Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderX2l,
            ),
            child: const Padding(
              padding: EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.school_outlined,
                size: AimSizes.iconMd,
                color: AimColors.primary500,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  model.skillId,
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  '$scorePercent% mastery',
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space4),
                ClipRRect(
                  borderRadius: AimRadius.borderMd,
                  child: LinearProgressIndicator(
                    value: model.masteryScore.clamp(0.0, 1.0),
                    backgroundColor: surfaces.surfaceSunken,
                    color: AimColors.primary500,
                    minHeight: AimSpacing.space4,
                  ),
                ),
              ],
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
    );
  }
}
