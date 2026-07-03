// HomeQuickStartLessonCard — renders the backend-recommended next lesson.
//
// lessonTitle, lessonDescription, and skillName are all backend-derived from
// the student's placement result. Flutter never selects the lesson locally.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/home/logic/entity/home_quick_start_lesson.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class HomeQuickStartLessonCard extends StatelessWidget {
  const HomeQuickStartLessonCard({
    required this.lesson,
    required this.onTap,
    super.key,
  });

  final HomeQuickStartLesson lesson;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          AppLocalizations.of(context).homeQuickStartSemantic(lesson.lessonTitle),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(AimSpacing.space8),
            decoration: BoxDecoration(
              color: AimColors.primary100,
              borderRadius: BorderRadius.circular(AimRadius.md),
            ),
            child: const Icon(
              Icons.play_circle_outline,
              size: AimSizes.iconMd,
              color: AimColors.primary600,
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (lesson.skillName != null) ...[
                  Text(
                    lesson.skillName!,
                    style: AimTextStyles.label.copyWith(
                      color: AimColors.primary600,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space4),
                ],
                Text(
                  lesson.lessonTitle,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  lesson.lessonDescription,
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
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
