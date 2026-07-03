// Phase 6 — P6-062
// HomeSkillStateCard — renders a single AIM skill-state summary card.
//
// Displays skillId, masteryScore, and masteryTrend exactly as returned by
// the backend. Flutter never computes or infers these values locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class HomeSkillStateCard extends StatelessWidget {
  const HomeSkillStateCard({
    required this.model,
    super.key,
  });

  final HomeSkillStateModel model;

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
    final l10n = AppLocalizations.of(context);
    final scorePercent = (model.masteryScore * 100).toStringAsFixed(0);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: l10n.homeSkillMasterySemantic(model.skillId, scorePercent),
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
                Icons.auto_stories_outlined,
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
                  l10n.homeMasteryPercentLabel(scorePercent),
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
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
