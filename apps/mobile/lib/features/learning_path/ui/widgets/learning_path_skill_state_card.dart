// Phase 6 — P6-067
// LearningPathSkillStateCard — renders a single AIM skill-state summary card.
//
// Displays topic, band, masteryLevel, and coveragePercent exactly as returned
// by the backend. Flutter never computes or infers these values locally.
//
// RTL/Arabic: Row uses directionality-aware layout; EdgeInsets.symmetric.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

/// Card showing a single backend-computed AIM learning path skill state.
///
/// All displayed values (band, masteryLevel, coveragePercent) are
/// backend-supplied verbatim.
class LearningPathSkillStateCard extends StatelessWidget {
  const LearningPathSkillStateCard({
    required this.model,
    super.key,
  });

  final LearningPathSkillStateModel model;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          '${model.topic} skill state: ${model.band}, ${model.masteryLevel}',
      child: Row(
        children: [
          // Topic icon circle
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderX2l,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.school_outlined,
                size: AimSizes.iconMd,
                color: AimColors.primary500,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          // Topic and mastery details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  model.topic,
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  model.masteryLevel,
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space4),
                // Coverage progress bar
                ClipRRect(
                  borderRadius: AimRadius.borderMd,
                  child: LinearProgressIndicator(
                    value: (model.coveragePercent / 100).clamp(0.0, 1.0),
                    backgroundColor: surfaces.surfaceSunken,
                    color: AimColors.primary500,
                    minHeight: AimSpacing.space4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.innerGap),
          // Band badge
          AIMBadge(
            tone: AIMBadgeTone.primary,
            variant: AIMBadgeVariant.soft,
            pill: true,
            child: Text(model.band),
          ),
        ],
      ),
    );
  }
}
