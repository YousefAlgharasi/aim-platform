// Phase 6 — P6-062
// HomeReviewScheduleCard — renders a single AIM review schedule reminder.
//
// dueAt and status are backend-computed.
// Flutter displays them verbatim — no local reordering or priority inference.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class HomeReviewScheduleCard extends StatelessWidget {
  const HomeReviewScheduleCard({
    required this.model,
    super.key,
  });

  final HomeReviewScheduleModel model;

  AIMBadgeTone get _statusTone {
    return switch (model.status.toLowerCase()) {
      'overdue' => AIMBadgeTone.error,
      'due_soon' => AIMBadgeTone.warning,
      _ => AIMBadgeTone.accent,
    };
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      semanticLabel: AppLocalizations.of(context)
          .homeReviewScheduleSemantic(model.skillId, model.dueAt),
      child: Row(
        children: [
          const Icon(
            Icons.schedule_outlined,
            size: AimSizes.iconMd,
            color: AimColors.accent500,
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
                  model.dueAt,
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
            tone: _statusTone,
            variant: AIMBadgeVariant.soft,
            pill: true,
            child: Text(model.status),
          ),
        ],
      ),
    );
  }
}
