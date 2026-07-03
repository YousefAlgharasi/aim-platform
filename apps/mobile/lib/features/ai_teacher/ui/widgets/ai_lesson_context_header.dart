// Phase 8 — P8-090
// AiLessonContextHeader — lesson-aware context header for AI Teacher chat.
//
// Shows only caller-provided, backend-approved display labels. It does not
// parse or trust client-submitted learning state, and it never displays AIM
// Engine values such as mastery, level, weakness, difficulty,
// recommendations, or review schedule.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class AiLessonContextHeader extends StatelessWidget {
  const AiLessonContextHeader({
    required this.lessonTitle,
    super.key,
    this.contextLabel,
  });

  final String lessonTitle;
  final String? contextLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final safeContextLabel = contextLabel?.trim();

    return AIMCard(
      variant: AIMCardVariant.standard,
      semanticLabel: l10n.aiTeacherLessonContextSemantic(lessonTitle),
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.space16,
        AimSpacing.space12,
        AimSpacing.space16,
        AimSpacing.space12,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderLg,
            ),
            child: const Padding(
              padding: EdgeInsets.all(AimSpacing.space8),
              child: Icon(
                Icons.menu_book_outlined,
                size: AimSizes.iconSm,
                color: AimColors.primary500,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.space12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  l10n.aiTeacherCurrentLessonLabel,
                  style: AimTextStyles.label.copyWith(
                    color: surfaces.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  lessonTitle,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (safeContextLabel != null &&
                    safeContextLabel.isNotEmpty) ...[
                  const SizedBox(height: AimSpacing.space2),
                  Text(
                    safeContextLabel,
                    style: AimTextStyles.bodySm.copyWith(
                      color: surfaces.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
