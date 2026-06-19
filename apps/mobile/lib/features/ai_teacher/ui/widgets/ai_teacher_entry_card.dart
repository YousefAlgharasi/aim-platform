// Phase 8 — P8-084
// AiTeacherEntryCard — tappable card that lets a student open the AI Teacher
// text chat from elsewhere in the app (e.g. a lesson page).
//
// This widget contains no AI provider calls, no AIM Engine calculations, and
// no chat state of its own — it only renders a call-to-action and invokes
// [onTap] when pressed. Opening the actual chat session (P8-085+) is the
// caller's responsibility.
//
// RTL/Arabic: layout uses EdgeInsetsDirectional/Row with no hard-coded
// TextDirection; the trailing chevron mirrors automatically under RTL via
// Directionality.of(context), matching the convention used by
// features/lessons/ui/widgets/course_list_tile.dart.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Entry point card for the AI Teacher feature.
///
/// [onTap] is invoked when the student taps the card to open AI Teacher.
class AiTeacherEntryCard extends StatelessWidget {
  const AiTeacherEntryCard({
    required this.onTap,
    super.key,
  });

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Semantics(
      label: 'Open AI Teacher',
      button: true,
      child: AIMCard(
        variant: AIMCardVariant.elevated,
        onTap: onTap,
        semanticLabel: 'Open AI Teacher',
        child: Row(
          children: [
            DecoratedBox(
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                borderRadius: AimRadius.borderX2l,
              ),
              child: Padding(
                padding: const EdgeInsets.all(AimSpacing.space12),
                child: Icon(
                  Icons.auto_awesome_rounded,
                  size: AimSizes.iconMd,
                  color: AimColors.primary500,
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'AI Teacher',
                    style: AimTextStyles.title
                        .copyWith(color: surfaces.textPrimary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AimSpacing.space2),
                  Text(
                    'Ask questions and get guidance on this lesson.',
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: AimSpacing.innerGap),
            Icon(
              Icons.chevron_right,
              color: surfaces.textSecondary,
              size: AimSizes.iconMd,
              textDirection: Directionality.of(context),
            ),
          ],
        ),
      ),
    );
  }
}
