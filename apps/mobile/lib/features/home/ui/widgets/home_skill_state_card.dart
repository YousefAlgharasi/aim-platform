// Phase 6 — P6-062
// HomeSkillStateCard — renders a single AIM skill-state summary card.
//
// Displays topic, band, and masteryLevel exactly as returned by the backend.
// Flutter never computes or infers these values locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';

/// Card showing a single backend-computed AIM skill state.
///
/// All displayed values (band, masteryLevel) are backend-supplied verbatim.
class HomeSkillStateCard extends StatelessWidget {
  const HomeSkillStateCard({
    required this.model,
    super.key,
  });

  final HomeSkillStateModel model;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '${model.topic} skill state: ${model.band}',
      child: Row(
        children: [
          // Topic icon circle
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderX2l,
            ),
            child: const Padding(
              padding: EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.auto_stories_outlined,
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
