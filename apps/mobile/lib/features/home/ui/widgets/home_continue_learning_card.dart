// HomeContinueLearningCard — renders a shortcut back into the student's
// most recently active, incomplete lesson.
//
// lessonTitle and percent are backend-stored. Flutter never decides which
// lesson to resume locally — it always reflects lesson_progress verbatim.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/logic/entity/home_continue_learning.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class HomeContinueLearningCard extends StatelessWidget {
  const HomeContinueLearningCard({required this.lesson, super.key});

  final HomeContinueLearning lesson;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: l10n.homeContinueLearningCardSemantic(
          lesson.lessonTitle, lesson.percent),
      onTap: () => context.push(
        AppRoutePaths.lessonDetail,
        extra: {
          'lessonId': lesson.lessonId,
          'lessonTitle': lesson.lessonTitle,
        },
      ),
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
                Icons.play_circle_outline,
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
                  lesson.lessonTitle,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  l10n.homePercentCompleteLabel(lesson.percent),
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: surfaces.textMuted),
        ],
      ),
    );
  }
}
