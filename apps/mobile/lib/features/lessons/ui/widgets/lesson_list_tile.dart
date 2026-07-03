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
// The design shows a type label (e.g. "Grammar"), a duration, and a
// per-lesson completion indicator (checkmark / play / lock). None of those
// fields exist on the backend's LessonModel (no lesson "type", no
// duration, no per-student completion flag — see
// services/backend-api/src/features/curriculum/lessons), so [progress] is
// a cosmetic [LessonProgressMock] passed in by the caller — see
// curriculum_progress_mock.dart and TODO_BACKEND_PROGRESS.md for the real
// endpoint this should be replaced with. Title, description, and xpValue
// remain real, backend-supplied fields.
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'curriculum_progress_mock.dart';

/// Tappable card for a single backend-supplied lesson.
///
/// [onTap] is called when tapped. The lesson ID is backend-supplied
/// from [LessonModel]; never constructed from user input.
///
/// [progress] is a cosmetic, UI-only placeholder (see
/// curriculum_progress_mock.dart) until a real per-student progress
/// endpoint exists.
class LessonListTile extends StatelessWidget {
  const LessonListTile({
    required this.model,
    required this.onTap,
    required this.progress,
    this.index = 0,
    super.key,
  });

  final LessonModel model;
  final VoidCallback onTap;
  final LessonProgressMock progress;
  final int index;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: 'Lesson: ${model.title}',
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Cosmetic type icon tile — see LessonProgressMock doc comment;
          // the backend has no real per-lesson "type" field.
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: progress.gradient,
              borderRadius: AimRadius.borderX2l,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                progress.typeIcon,
                size: AimSizes.iconMd,
                color: AimColors.neutral0,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          // Type/duration caption, title, description, and (if present)
          // an XP badge.
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${progress.typeLabel} · ${progress.durationMinutes} min',
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textSecondary,
                    fontWeight: AimFontWeights.semibold,
                  ),
                ),
                const SizedBox(height: AimSpacing.space2),
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
          _LessonTrailingIndicator(progress: progress),
        ],
      ),
    );
  }
}

/// Cosmetic trailing state: checkmark (done), gradient play button
/// (current lesson), or a plain chevron (upcoming). See
/// [LessonProgressMock] doc comment — completion/current are UI-only
/// placeholders, not backend fields.
class _LessonTrailingIndicator extends StatelessWidget {
  const _LessonTrailingIndicator({required this.progress});

  final LessonProgressMock progress;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final direction = Directionality.of(context);

    if (progress.completed) {
      return Semantics(
        label: 'Completed',
        child: CircleAvatar(
          radius: 16,
          backgroundColor: soft.success,
          child: Icon(
            Icons.check_rounded,
            color: AimColors.success500,
            size: AimSizes.iconSm,
          ),
        ),
      );
    }

    if (progress.current) {
      return Semantics(
        button: true,
        label: 'Start lesson',
        child: DecoratedBox(
          decoration: const BoxDecoration(
            gradient: AimGradients.gzHero,
            shape: BoxShape.circle,
          ),
          child: Padding(
            padding: const EdgeInsets.all(AimSpacing.space8),
            child: Icon(
              Icons.play_arrow_rounded,
              color: AimColors.neutral0,
              size: AimSizes.iconMd,
            ),
          ),
        ),
      );
    }

    return Icon(
      Icons.chevron_right,
      color: surfaces.textSecondary,
      size: AimSizes.iconMd,
      textDirection: direction,
    );
  }
}
