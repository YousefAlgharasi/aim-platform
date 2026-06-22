// Phase 6 — P6-098
// ProgressReviewScheduleCard — renders a backend-persisted review schedule.
// dueAt and intervalDays are AIM Engine outputs; displayed verbatim.

import 'package:flutter/material.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';

class ProgressReviewScheduleCard extends StatelessWidget {
  const ProgressReviewScheduleCard({required this.model, super.key});
  final AimReviewScheduleModel model;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '${model.skillId} review due ${model.dueAt}',
      child: Row(
        children: [
          const Icon(Icons.schedule_outlined,
              size: AimSizes.iconMd, color: AimColors.primary500),
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
                  'Due: ${model.dueAt}',
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          AIMBadge(
            tone: AIMBadgeTone.primary,
            variant: AIMBadgeVariant.soft,
            pill: true,
            child: Text('${model.intervalDays}d'),
          ),
        ],
      ),
    );
  }
}
