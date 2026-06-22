// P10-064: Reusable deadline status widgets — badge, card, and countdown text.
// All status values are backend-supplied; Flutter never computes deadline status.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/assessments/logic/entity/student_deadline.dart';

// ---------------------------------------------------------------------------
// DeadlineStatusBadge
// ---------------------------------------------------------------------------

/// A small chip showing the deadline status text with a tinted background.
class DeadlineStatusBadge extends StatelessWidget {
  const DeadlineStatusBadge({required this.status, super.key});

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
        style:
            Theme.of(context).textTheme.labelSmall?.copyWith(color: color),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// DeadlineStatusCard
// ---------------------------------------------------------------------------

/// A card displaying a [StudentDeadlineItem] with title, dates, and status.
class DeadlineStatusCard extends StatelessWidget {
  const DeadlineStatusCard({
    required this.item,
    this.onTap,
    super.key,
  });

  final StudentDeadlineItem item;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final statusColor = _colorForStatus(item.status);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: '${item.assessmentTitle} — ${item.status}',
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
                Icons.event_note,
                size: AimSizes.iconMd,
                color: statusColor,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.assessmentTitle,
                  style: Theme.of(context).textTheme.titleMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AimSpacing.space4),
                  child: Text(
                    'Opens: ${item.opensAt}  •  Closes: ${item.closesAt}',
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AimSpacing.space4),
                  child: DeadlineStatusBadge(status: item.status),
                ),
              ],
            ),
          ),
          if (onTap != null) ...[
            const SizedBox(width: AimSpacing.space8),
            Icon(
              Icons.chevron_right,
              size: AimSizes.iconSm,
              color: surfaces.textSecondary,
            ),
          ],
        ],
      ),
    );
  }

  static Color _colorForStatus(String status) {
    return switch (status) {
      'open' => AimColors.success500,
      'upcoming' => AimColors.info500,
      'closed' || 'expired' => AimColors.neutral500,
      'late' => AimColors.warning500,
      'missed' => AimColors.error500,
      _ => AimColors.neutral500,
    };
  }
}

// ---------------------------------------------------------------------------
// DeadlineCountdownText
// ---------------------------------------------------------------------------

/// Shows human-readable time remaining until [closesAt].
///
/// Display-only — does NOT enforce deadlines.
class DeadlineCountdownText extends StatelessWidget {
  const DeadlineCountdownText({
    required this.closesAt,
    this.style,
    super.key,
  });

  final String closesAt;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    final closesDate = DateTime.tryParse(closesAt);
    if (closesDate == null) {
      return Text('—', style: style);
    }

    final now = DateTime.now().toUtc();
    final difference = closesDate.toUtc().difference(now);

    final String text;
    if (difference.isNegative) {
      text = 'Closed';
    } else if (difference.inDays > 0) {
      text = '${difference.inDays}d remaining';
    } else if (difference.inHours > 0) {
      text = '${difference.inHours}h remaining';
    } else if (difference.inMinutes > 0) {
      text = '${difference.inMinutes}m remaining';
    } else {
      text = 'Less than a minute';
    }

    return Text(
      text,
      style: style ?? Theme.of(context).textTheme.bodySmall,
    );
  }
}
