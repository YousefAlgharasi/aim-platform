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
import 'package:aim_mobile/l10n/app_localizations.dart';

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
    final l10n = AppLocalizations.of(context);

    return Semantics(
      label: l10n.aiTeacherOpenSemantic,
      button: true,
      child: AIMCard(
        variant: AIMCardVariant.elevated,
        onTap: onTap,
        semanticLabel: l10n.aiTeacherOpenSemantic,
        child: Row(
          children: [
            DecoratedBox(
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                borderRadius: AimRadius.borderX2l,
              ),
              child: const Padding(
                padding: EdgeInsets.all(AimSpacing.space12),
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
                    l10n.aiTeacherName,
                    style: AimTextStyles.title
                        .copyWith(color: surfaces.textPrimary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AimSpacing.space2),
                  Text(
                    l10n.aiTeacherEntrySubtitle,
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
