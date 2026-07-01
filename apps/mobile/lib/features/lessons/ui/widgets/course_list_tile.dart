// Phase 6 — P6-073
// CourseListTile — renders a single published course as a tappable card.
//
// Displays title and description exactly as returned by the backend.
// Flutter never computes status or sortOrder.
//
// Real-data-only redesign: the design screenshots show a level badge
// (A1/A2/B1/B2), a progress bar with percentage, a lesson count, a
// completion status chip ("Completed"/"In progress"), and a locked-course
// padlock treatment. None of those fields exist on the backend's
// CourseModel (no level, no per-student progress, no lesson count, no
// completion flag — see services/backend-api/src/features/curriculum/courses).
// Rather than fabricate placeholder values for them, this tile omits them
// entirely and only surfaces real fields: title and description. The icon
// tile below is decorative only (a deterministic gradient cycled by list
// index) — it does not encode a real course "type" or level.
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

/// Deterministic-but-varied gradient tokens cycled by list index to give
/// each course row a distinct icon tile. Purely decorative — does not
/// encode any real per-course "type" or level, which the backend does not
/// provide.
const List<LinearGradient> _kCourseIconGradients = [
  AimGradients.gzHero,
  AimGradients.gzFire,
  AimGradients.gzLime,
  AimGradients.gzCoral,
];

/// Tappable card for a single published course.
///
/// [onTap] is called with the backend-supplied [CourseModel] when tapped.
/// Navigation to chapter list is driven by the backend-supplied [model.id].
///
/// [index] is only used to pick a decorative icon-tile gradient (cycled
/// deterministically); it carries no semantic meaning.
class CourseListTile extends StatelessWidget {
  const CourseListTile({
    required this.model,
    required this.onTap,
    this.index = 0,
    super.key,
  });

  final CourseModel model;
  final VoidCallback onTap;
  final int index;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final gradient =
        _kCourseIconGradients[index % _kCourseIconGradients.length];

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: 'Course: ${model.title}',
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Decorative gradient icon tile (no real per-course "type" exists).
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: AimRadius.borderX2l,
            ),
            child: const Padding(
              padding: EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.menu_book_outlined,
                size: AimSizes.iconMd,
                color: AimColors.neutral0,
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
