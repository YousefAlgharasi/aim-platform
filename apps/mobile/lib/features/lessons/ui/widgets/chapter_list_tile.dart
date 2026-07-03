// Phase 6 — P6-074
// ChapterListTile — renders a single chapter as a tappable card.
//
// Displays title and optional description exactly as returned by the backend.
// Flutter never computes status or sortOrder.
//
// Design ref: docs/design/ui-for-all-system-mobile/screenshots/light|dark/07-screen.png
//
// The design shows a per-chapter progress bar, lesson count, and a
// completion chip ("Completed"/"In progress"/"Start"). None of those fields
// exist on the backend's ChapterModel (no per-student progress, no lesson
// count — see services/backend-api/src/features/curriculum/chapters), so
// [progress] is a cosmetic [ChapterProgressMock] passed in by the caller —
// see curriculum_progress_mock.dart and TODO_BACKEND_PROGRESS.md for the
// real endpoint this should be replaced with. Title/description remain
// real, backend-supplied fields.
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'curriculum_progress_mock.dart';

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
///
/// [progress] is a cosmetic, UI-only placeholder (see
/// curriculum_progress_mock.dart) until a real per-student progress
/// endpoint exists.
class ChapterListTile extends StatelessWidget {
  const ChapterListTile({
    required this.model,
    required this.onTap,
    required this.progress,
    this.index = 0,
    super.key,
  });

  final ChapterModel model;
  final VoidCallback onTap;
  final ChapterProgressMock progress;
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Numbered circle tile — `index + 1` is the chapter's real
              // position in the already backend-ordered list; the gradient
              // is purely decorative.
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
          const SizedBox(height: AimSpacing.componentGap),
          // Cosmetic progress bar — see ChapterProgressMock doc comment.
          AIMProgressBar(
            value: progress.percent.toDouble(),
            showValue: true,
            tone: progress.completed
                ? AIMProgressBarTone.success
                : AIMProgressBarTone.gradient,
            size: AIMProgressBarSize.sm,
          ),
          const SizedBox(height: AimSpacing.space8),
          Row(
            children: [
              Icon(
                Icons.menu_book_outlined,
                size: AimSizes.iconSm,
                color: surfaces.textSecondary,
              ),
              const SizedBox(width: AimSpacing.space4),
              Text(
                '${progress.lessonCount} lessons',
                style: AimTextStyles.caption
                    .copyWith(color: surfaces.textSecondary),
              ),
              const Spacer(),
              AIMBadge(
                tone: progress.completed
                    ? AIMBadgeTone.success
                    : progress.inProgress
                        ? AIMBadgeTone.info
                        : AIMBadgeTone.neutral,
                pill: true,
                semanticLabel: progress.statusLabel,
                child: Text(progress.statusLabel),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
