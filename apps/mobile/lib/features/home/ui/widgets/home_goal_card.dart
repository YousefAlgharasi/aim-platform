// HomeGoalCard — renders the student's backend-computed daily lesson goal
// and learning streak.
//
// targetLessons, completedToday, and streakDays are backend-computed.
// Flutter never computes streak or goal progress locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';

class HomeGoalCard extends StatelessWidget {
  const HomeGoalCard({required this.goal, super.key});

  final HomeEngagementGoal goal;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final progress = goal.targetLessons == 0
        ? 0.0
        : (goal.completedToday / goal.targetLessons).clamp(0.0, 1.0);
    final goalMet = goal.completedToday >= goal.targetLessons;

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          'Daily goal: ${goal.completedToday} of ${goal.targetLessons} lessons, ${goal.streakDays} day streak',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.flag_outlined,
                size: AimSizes.iconMd,
                color: goalMet ? AimColors.success500 : AimColors.primary500,
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: Text(
                  "Today's Goal",
                  style:
                      AimTextStyles.title.copyWith(color: surfaces.textPrimary),
                ),
              ),
              if (goal.streakDays > 0)
                AIMBadge(
                  tone: AIMBadgeTone.warning,
                  variant: AIMBadgeVariant.soft,
                  pill: true,
                  child: Text('🔥 ${goal.streakDays}'),
                ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            '${goal.completedToday} of ${goal.targetLessons} lessons completed today',
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
          const SizedBox(height: AimSpacing.space8),
          ClipRRect(
            borderRadius: AimRadius.borderSm,
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: surfaces.surfaceSunken,
              color: goalMet ? AimColors.success500 : AimColors.primary500,
            ),
          ),
        ],
      ),
    );
  }
}
