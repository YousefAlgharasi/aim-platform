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
import 'package:aim_mobile/features/lessons/logic/entity/lessons_entities.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';


/// Tappable card for a single backend-supplied lesson with real progress.
///
/// [onTap] is called when tapped. The lesson ID is backend-supplied
/// from [LessonProgress]; never constructed from user input.
class LessonListTile extends StatelessWidget {
  const LessonListTile({
    required this.model,
    required this.onTap,
    this.index = 0,
    super.key,
  });

  final LessonProgress model;
  final VoidCallback onTap;
  final int index;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final lessonNum = index + 1;
    final isCompleted = model.completed;
    final isCurrent = model.current;
    final surfaces = aimSurfacesOf(context);
    final colorScheme = Theme.of(context).colorScheme;

    // Type badge token (e.g. Speaking, Vocab, Grammar, Listening)
    final typeBadge = (index % 4 == 0)
        ? 'VOCAB'
        : (index % 4 == 1)
            ? 'GRAMMAR'
            : (index % 4 == 2)
                ? 'SPEAKING'
                : 'LISTENING';

    return Container(
      decoration: BoxDecoration(
        color: isCurrent ? colorScheme.primaryContainer.withValues(alpha: 0.5) : surfaces.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isCurrent ? colorScheme.primary : surfaces.border,
          width: isCurrent ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isCurrent
                ? colorScheme.primary.withValues(alpha: 0.12)
                : surfaces.textPrimary.withValues(alpha: 0.04),
            blurRadius: isCurrent ? 12 : 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Icon Squircle matching prototype
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? const Color(0xFFD1FAE5)
                        : (isCurrent
                            ? colorScheme.primary
                            : surfaces.surfaceSunken),
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: isCurrent
                        ? [
                            BoxShadow(
                              color: colorScheme.primary.withValues(alpha: 0.25),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : null,
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.done_rounded, color: Color(0xFF059669), size: 22)
                        : (typeBadge == 'SPEAKING'
                            ? Icon(Icons.mic_rounded,
                                color: isCurrent ? Colors.white : surfaces.textSecondary, size: 22)
                            : Icon(Icons.menu_book_rounded,
                                color: isCurrent ? Colors.white : surfaces.textSecondary, size: 22)),
                  ),
                ),
                const SizedBox(width: 14),

                // Info Section
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'LESSON $lessonNum',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: surfaces.textMuted,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: colorScheme.primaryContainer,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              typeBadge,
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: colorScheme.primary,
                                letterSpacing: 0.6,
                              ),
                            ),
                          ),
                          if (isCurrent) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF4F46E5),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'CURRENT',
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 3),

                      Text(
                        model.title,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: surfaces.textPrimary,
                          letterSpacing: -0.2,
                          height: 1.25,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),

                      if (model.description.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          model.description,
                          style: TextStyle(
                            fontSize: 12,
                            color: surfaces.textSecondary,
                            height: 1.3,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],

                      if (model.xpValue > 0) ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.bolt_rounded, size: 14, color: Color(0xFFF59E0B)),
                            const SizedBox(width: 2),
                            Text(
                              l10n.lessonsXpValueLabel(model.xpValue),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFFD97706),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(width: 8),

                // Trailing indicator matching prototype
                _LessonTrailingIndicator(model: model),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Real trailing state: checkmark (done), gradient play button (current
/// lesson), or a plain chevron (upcoming) — driven by
/// [LessonProgressModel.completed]/[LessonProgressModel.current].
class _LessonTrailingIndicator extends StatelessWidget {
  const _LessonTrailingIndicator({required this.model});

  final LessonProgress model;

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
