// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Lessons" (lessonList)
//   docs/design/ui-for-all-system-mobile/screenshots/light/08-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/08-screen.png
// Endpoint: GET /curriculum/lessons?chapterId= (LessonModel fields only)
// Widgets: AIMCard, AIMBadge
//
// Phase 6 — P6-075
// LessonListTile — renders a single lesson as a tappable card.
//
// Displays title, description, and xpValue exactly as returned by the
// backend. Flutter never computes status or sortOrder.
//
// Real-data-only redesign: the design screenshots show a type label
// (e.g. "Grammar"), a duration, and a per-lesson completion indicator
// (checkmark / play / lock). None of those fields exist on the backend's
// LessonModel (no lesson "type", no duration, no per-student completion
// flag — see services/backend-api/src/features/curriculum/lessons).
// Rather than fabricate placeholder values for them, this tile omits them
// entirely and only surfaces real fields: title, description, and xpValue.
// The icon tile below is decorative only (a deterministic gradient cycled
// by list index) — it does not encode a real lesson "type".
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

/// Deterministic-but-varied gradient tokens cycled by list index to give
/// each lesson row a distinct icon tile. Purely decorative — does not
/// encode any real per-lesson "type", which the backend does not provide.
const List<LinearGradient> _kLessonIconGradients = [
  AimGradients.gzHero,
  AimGradients.gzFire,
  AimGradients.gzLime,
  AimGradients.gzCoral,
];

/// Tappable card for a single backend-supplied lesson.
///
/// [onTap] is called when tapped. The lesson ID is backend-supplied
/// from [LessonModel]; never constructed from user input.
///
/// [index] is only used to pick a decorative icon-tile gradient (cycled
/// deterministically); it carries no semantic meaning.
class LessonListTile extends StatelessWidget {
  const LessonListTile({
    required this.model,
    required this.onTap,
    this.index = 0,
    super.key,
  });

  final LessonModel model;
  final VoidCallback onTap;
  final int index;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final gradient =
        _kLessonIconGradients[index % _kLessonIconGradients.length];

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: 'Lesson: ${model.title}',
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Decorative gradient icon tile (no real per-lesson "type" exists).
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: AimRadius.borderX2l,
            ),
            child: const Padding(
              padding: EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.play_lesson_outlined,
                size: AimSizes.iconMd,
                color: AimColors.neutral0,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          // Title, description, and (if present) an XP badge.
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
                if (model.xpValue > 0) ...[
                  const SizedBox(height: AimSpacing.space8),
                  AIMBadge(
                    tone: AIMBadgeTone.accent,
                    pill: true,
                    icon: const Icon(Icons.bolt_rounded),
                    semanticLabel: '${model.xpValue} XP',
                    child: Text('${model.xpValue} XP'),
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
