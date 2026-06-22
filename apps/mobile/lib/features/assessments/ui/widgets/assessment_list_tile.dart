// P10-054: AssessmentListTile — renders a single assessment as a tappable card.
// Displays title, type, and deadline status exactly as returned by the backend.
// Flutter never computes deadline status.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';

class AssessmentListTile extends StatelessWidget {
  const AssessmentListTile({
    required this.item,
    required this.onTap,
    super.key,
  });

  final AssessmentListItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: '${item.type == 'exam' ? 'Exam' : 'Quiz'}: ${item.title}',
      child: Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderX2l,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                item.type == 'exam' ? Icons.assignment : Icons.quiz_outlined,
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
                  item.title,
                  style: Theme.of(context).textTheme.titleMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.description != null && item.description!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: AimSpacing.space4),
                    child: Text(
                      item.description!,
                      style: Theme.of(context).textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                if (item.deadlineStatus != null)
                  Padding(
                    padding: const EdgeInsets.only(top: AimSpacing.space4),
                    child: _DeadlineStatusChip(status: item.deadlineStatus!),
                  ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.space8),
          Icon(
            Icons.chevron_right,
            size: AimSizes.iconSm,
            color: surfaces.textSecondary,
          ),
        ],
      ),
    );
  }
}

class _DeadlineStatusChip extends StatelessWidget {
  const _DeadlineStatusChip({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final (color, label) = switch (status) {
      'open' => (AimColors.success500, 'Open'),
      'upcoming' => (AimColors.info500, 'Upcoming'),
      'closed' || 'expired' => (AimColors.neutral500, 'Closed'),
      'late' => (AimColors.warning500, 'Late'),
      'missed' => (AimColors.error500, 'Missed'),
      _ => (AimColors.neutral500, status),
    };

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.space8,
        vertical: AimSpacing.space2,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: AimRadius.borderSm,
      ),
      child: Text(
        label,
        style: Theme.of(context)
            .textTheme
            .labelSmall
            ?.copyWith(color: color),
      ),
    );
  }
}
