// HomeDailyChallengeCard — renders the student's backend-selected daily
// challenge and backend-computed progress toward it.
//
// title, description, targetCount, progressCount, and completed are all
// backend-computed. Flutter never picks the challenge or computes progress
// locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';

class HomeDailyChallengeCard extends StatelessWidget {
  const HomeDailyChallengeCard({required this.challenge, super.key});

  final HomeDailyChallenge challenge;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          'Daily challenge: ${challenge.title}, ${challenge.progressCount} of ${challenge.targetCount}',
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            challenge.completed
                ? Icons.check_circle_outline
                : Icons.bolt_outlined,
            size: AimSizes.iconMd,
            color: challenge.completed
                ? AimColors.success500
                : AimColors.primary500,
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  challenge.title,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  challenge.description,
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.innerGap),
          AIMBadge(
            tone: challenge.completed
                ? AIMBadgeTone.success
                : AIMBadgeTone.primary,
            variant: AIMBadgeVariant.soft,
            pill: true,
            child: Text('${challenge.progressCount}/${challenge.targetCount}'),
          ),
        ],
      ),
    );
  }
}
