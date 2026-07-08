// FinalExamCard — always-shown card at the end of the chapter list for the
// course's final exam (GET /student/chapters?levelId= — sibling `finalExam`
// field). Locked/greyed until [model.unlocked] (backend-computed: every
// chapter in the course is fully complete), then tappable.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class FinalExamCard extends StatelessWidget {
  const FinalExamCard({
    required this.model,
    required this.onTap,
    super.key,
  });

  final FinalExamSummaryModel model;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final locked = !model.unlocked;

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: locked ? null : onTap,
      semanticLabel: locked
          ? '${l10n.lessonsFinalExamTitle}: ${l10n.lessonsFinalExamLockedSubtitle}'
          : l10n.lessonsFinalExamTitle,
      child: Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: locked ? null : AimGradients.gzHero,
              color: locked ? surfaces.textMuted.withValues(alpha: 0.15) : null,
              shape: BoxShape.circle,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                locked ? Icons.lock_outline : Icons.emoji_events_outlined,
                size: AimSizes.iconMd,
                color: locked ? surfaces.textMuted : AimColors.neutral0,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  model.title,
                  style: AimTextStyles.title.copyWith(
                    color: locked ? surfaces.textMuted : surfaces.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  locked
                      ? l10n.lessonsFinalExamLockedSubtitle
                      : l10n.commonStart,
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                ),
              ],
            ),
          ),
          if (!locked)
            Icon(Icons.chevron_right, color: surfaces.textMuted),
        ],
      ),
    );
  }
}
