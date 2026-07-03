// LessonStepTile — compact "What's inside" step row for the lesson detail
// overview screen.
//
// Renders a single published lesson asset as a numbered step row (icon,
// title, subtitle, step number). Tapping a row (when [onTap] is provided)
// opens the full content view — rendered elsewhere via
// LessonContentRenderer, which renders full inline content (used inside the
// step detail view). All values are backend-supplied verbatim; Flutter only
// chooses icon/color per type.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class LessonStepTile extends StatelessWidget {
  const LessonStepTile({
    required this.asset,
    required this.stepNumber,
    super.key,
    this.onTap,
  });

  final LessonAsset asset;
  final int stepNumber;

  /// Called when the row is tapped. Optional so this tile can still be used
  /// as a non-interactive row where no content view is available.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final style = _styleFor(asset.type);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      semanticLabel:
          AppLocalizations.of(context).lessonsStepSemantic(stepNumber, asset.title),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: style.gradient,
              borderRadius: BorderRadius.circular(AimRadius.md),
            ),
            alignment: Alignment.center,
            child: Icon(style.icon, color: Colors.white, size: AimSizes.iconMd),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  asset.title,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                if (asset.description != null &&
                    asset.description!.isNotEmpty) ...[
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    asset.description!,
                    style: AimTextStyles.bodySm.copyWith(
                      color: surfaces.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.innerGap),
          CircleAvatar(
            radius: 12,
            backgroundColor: surfaces.surfaceSunken,
            child: Text(
              '$stepNumber',
              style: AimTextStyles.caption.copyWith(
                color: surfaces.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  _StepStyle _styleFor(String type) {
    return switch (type) {
      'text' => const _StepStyle(Icons.notes_outlined, AimGradients.gzHero),
      'image' => const _StepStyle(Icons.image_outlined, AimGradients.growth),
      'audio' =>
        const _StepStyle(Icons.headphones_outlined, AimGradients.gzCoral),
      'video' =>
        const _StepStyle(Icons.play_circle_outline, AimGradients.gzCoral),
      'vocabulary' =>
        const _StepStyle(Icons.menu_book_outlined, AimGradients.gzFire),
      'exercise' =>
        const _StepStyle(Icons.check_circle_outline, AimGradients.gzLime),
      'document' =>
        const _StepStyle(Icons.description_outlined, AimGradients.gzHero),
      'external_reference' =>
        const _StepStyle(Icons.open_in_new, AimGradients.gzHero),
      _ => const _StepStyle(Icons.attachment_outlined, AimGradients.gzHero),
    };
  }
}

class _StepStyle {
  const _StepStyle(this.icon, this.gradient);
  final IconData icon;
  final LinearGradient gradient;
}
