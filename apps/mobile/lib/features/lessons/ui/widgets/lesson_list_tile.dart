// Phase 6 — P6-075
// LessonListTile — renders a single lesson as a tappable card.
//
// Displays title, description, xpValue, completed, and current exactly as
// returned by the backend (GET /student/lessons?chapterId=,
// LessonProgressModel). Flutter never computes any of these.
//
// The design also shows a per-lesson "type" label (e.g. "Grammar") and a
// duration caption. Neither exists on the backend today (see
// apps/mobile/TODO_BACKEND_PROGRESS.md's now-resolved progress items —
// type/duration were called out there as optional and lower priority than
// real progress, and were intentionally left out of this pass since they'd
// otherwise have to be fabricated client-side). The leading icon tile below
// is a plain, non-data-bearing decoration — it never claims a lesson type
// the backend hasn't provided.
//
// Design ref: docs/design/ui-for-all-system-mobile/screenshots/light|dark/08-screen.png
//
// RTL/Arabic: Row is directionality-aware; chevron mirrors via
// Directionality.of(context). Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Deterministic-but-varied gradient tokens cycled by list index — purely
/// decorative, not derived from any backend "lesson type" field.
const List<LinearGradient> _kLessonIconGradients = [
  AimGradients.gzHero,
  AimGradients.growth,
  AimGradients.gzFire,
  AimGradients.gzLime,
];

/// Tappable card for a single backend-supplied lesson with real progress.
///
/// [onTap] is called when tapped. The lesson ID is backend-supplied
/// from [LessonProgressModel]; never constructed from user input.
class LessonListTile extends StatelessWidget {
  const LessonListTile({
    required this.model,
    required this.onTap,
    this.index = 0,
    super.key,
  });

  final LessonProgressModel model;
  final VoidCallback onTap;
  final int index;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final gradient = _kLessonIconGradients[index % _kLessonIconGradients.length];

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel: l10n.lessonsLessonSemantic(model.title),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Decorative icon tile — cycled by index only; not a claimed
          // lesson "type" (the backend has no such field).
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
                    semanticLabel: l10n.lessonsXpValueLabel(model.xpValue),
                    child: Text(l10n.lessonsXpValueLabel(model.xpValue)),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.innerGap),
          _LessonTrailingIndicator(model: model),
        ],
      ),
    );
  }
}

/// Real trailing state: checkmark (done), gradient play button (current
/// lesson), or a plain chevron (upcoming) — driven by
/// [LessonProgressModel.completed]/[LessonProgressModel.current].
class _LessonTrailingIndicator extends StatelessWidget {
  const _LessonTrailingIndicator({required this.model});

  final LessonProgressModel model;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final direction = Directionality.of(context);

    if (model.completed) {
      return Semantics(
        label: AppLocalizations.of(context).lessonsCompletedLabel,
        child: CircleAvatar(
          radius: 16,
          backgroundColor: soft.success,
          child: const Icon(
            Icons.check_rounded,
            color: AimColors.success500,
            size: AimSizes.iconSm,
          ),
        ),
      );
    }

    if (model.current) {
      return Semantics(
        button: true,
        label: AppLocalizations.of(context).lessonsStartLessonSemantic,
        child: const DecoratedBox(
          decoration: BoxDecoration(
            gradient: AimGradients.gzHero,
            shape: BoxShape.circle,
          ),
          child: Padding(
            padding: EdgeInsets.all(AimSpacing.space8),
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
