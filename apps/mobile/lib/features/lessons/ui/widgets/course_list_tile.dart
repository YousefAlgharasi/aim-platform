// Phase 6 — P6-073
// CourseListTile — renders a single published course as a tappable card.
//
// Displays title and status exactly as returned by the backend.
// Flutter never computes status or sortOrder.
//
// RTL/Arabic: Row is directionality-aware; trailing icon mirrors under RTL
// via Directionality-aware Icon(Icons.chevron_right) which flips on RTL
// automatically in Flutter. Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

/// Tappable card for a single published course.
///
/// [onTap] is called with the backend-supplied [CourseModel] when tapped.
/// Navigation to chapter list is driven by the backend-supplied [model.id].
class CourseListTile extends StatelessWidget {
  const CourseListTile({
    required this.model,
    required this.onTap,
    super.key,
  });

  final CourseModel model;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: 'Course: ${model.title}',
      child: Row(
        children: [
          // Course icon
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderX2l,
            ),
            child: const Padding(
              padding: EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.menu_book_outlined,
                size: AimSizes.iconMd,
                color: AimColors.primary500,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          // Title and status
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
                if (model.description != null &&
                    model.description!.isNotEmpty) ...[
                  const SizedBox(height: AimSpacing.space2),
                  Text(
                    model.description!,
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
