// Phase 6 — P6-074
// ChapterListTile — renders a single chapter as a tappable card.
//
// Displays title and optional description exactly as returned by the backend.
// Flutter never computes status or sortOrder.
//
// Real-data-only redesign: the design screenshots show a level badge, a
// progress bar with percentage, a lesson count, and a completion status
// chip ("Completed"/"In progress"). None of those fields exist on the
// backend's ChapterModel (no level, no per-student progress, no lesson
// count, no completion flag — see
// services/backend-api/src/features/curriculum/chapters). Rather than
// fabricate placeholder values for them, this tile omits them entirely and
// only surfaces real fields: title and description. The numbered circle
// below is a legitimate real value — it is the chapter's position
// (index + 1) in the already backend-ordered list, mirroring the design's
// numbered-badge treatment for chapters — it is not a fabricated value.
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

/// Deterministic-but-varied gradient tokens cycled by list index to give
/// each chapter row a distinct numbered tile. Purely decorative color
/// choice — the number itself is the real (index + 1) chapter position.
const List<LinearGradient> _kChapterNumberGradients = [
  AimGradients.gzHero,
  AimGradients.gzFire,
  AimGradients.gzLime,
  AimGradients.gzCoral,
];

/// Tappable card for a single backend-supplied chapter.
///
/// [onTap] is called when tapped. Navigation to the lesson list is driven
/// by the backend-supplied [model.id] (chapterId).
///
/// [index] is the chapter's position in the already backend-ordered list;
/// it is shown as `index + 1` in the numbered circle (a real value) and
/// also used to cycle the circle's decorative gradient.
class ChapterListTile extends StatelessWidget {
  const ChapterListTile({
    required this.model,
    required this.onTap,
    this.index = 0,
    super.key,
  });

  final ChapterModel model;
  final VoidCallback onTap;
  final int index;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final gradient =
        _kChapterNumberGradients[index % _kChapterNumberGradients.length];

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: 'Chapter: ${model.title}',
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Numbered circle tile — `index + 1` is the chapter's real
          // position in the already backend-ordered list; the gradient is
          // purely decorative.
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: gradient,
              shape: BoxShape.circle,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: SizedBox(
                width: AimSizes.iconMd,
                height: AimSizes.iconMd,
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: AimTextStyles.title.copyWith(
                      color: AimColors.neutral0,
                      fontWeight: AimFontWeights.bold,
                    ),
                  ),
                ),
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
