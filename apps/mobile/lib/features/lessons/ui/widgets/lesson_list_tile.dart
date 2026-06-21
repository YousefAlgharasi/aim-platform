// Phase 6 — P6-075
// LessonListTile — renders a single lesson as a tappable card.
//
// Displays title and description exactly as returned by the backend.
// Flutter never computes status or sortOrder.
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

/// Tappable card for a single backend-supplied lesson.
///
/// [onTap] is called when tapped. The lesson ID is backend-supplied
/// from [LessonModel]; never constructed from user input.
class LessonListTile extends StatelessWidget {
  const LessonListTile({
    required this.model,
    required this.onTap,
    super.key,
  });

  final LessonModel model;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: 'Lesson: ${model.title}',
      child: Row(
        children: [
          // Lesson icon
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderX2l,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.play_lesson_outlined,
                size: AimSizes.iconMd,
                color: AimColors.primary500,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          // Title and description
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  model.title,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (model.description.isNotEmpty) ...[
                  const SizedBox(height: AimSpacing.space2),
                  Text(
                    model.description,
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.innerGap),
          // RTL-mirrored chevron
          Icon(
            Icons.chevron_right,
            color: surfaces.textSecondary,
            size: AimSizes.iconMd,
            textDirection: Directionality.of(context),
          ),
        ],
      ),
    );
  }
}
