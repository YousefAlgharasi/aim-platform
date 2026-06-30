import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Size variant for [AIMSkillBlob].
enum AIMSkillBlobSize {
  /// 56 dp diameter — for compact grids/rows.
  sm,

  /// 72 dp diameter (default).
  md,

  /// 96 dp diameter — for hero/profile placements.
  lg,
}

/// Circular mastery indicator for a single skill, used on the skill-state and
/// profile screens.
///
/// Renders [skillName] under a ring whose fill represents [masteryLevel]
/// (0.0–1.0). Generalized from the feature-local `ProgressSkillStateCard` so
/// it can be reused outside the progress feature.
///
/// ```dart
/// AIMSkillBlob(
///   skillName: 'Listening',
///   masteryLevel: 0.72,
///   color: AimColors.accent500,
/// )
/// ```
class AIMSkillBlob extends StatelessWidget {
  const AIMSkillBlob({
    required this.skillName,
    required this.masteryLevel,
    super.key,
    this.color,
    this.size = AIMSkillBlobSize.md,
    this.semanticLabel,
  }) : assert(
          masteryLevel >= 0.0 && masteryLevel <= 1.0,
          'masteryLevel must be between 0.0 and 1.0',
        );

  /// Name of the skill, shown beneath the ring.
  final String skillName;

  /// Mastery fraction, 0.0–1.0.
  final double masteryLevel;

  /// Ring/value color. Defaults to [AimColors.primary500].
  final Color? color;

  final AIMSkillBlobSize size;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final accent = color ?? AimColors.primary500;
    final diameter = size.diameter;
    final pct = (masteryLevel * 100).round();

    return Semantics(
      label: semanticLabel ?? '$skillName mastery $pct%',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: diameter,
            height: diameter,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox.expand(
                  child: CircularProgressIndicator(
                    value: masteryLevel,
                    strokeWidth: size.strokeWidth,
                    backgroundColor: surfaces.surfaceSunken,
                    valueColor: AlwaysStoppedAnimation<Color>(accent),
                  ),
                ),
                Text(
                  '$pct%',
                  style: (size == AIMSkillBlobSize.sm
                          ? AimTextStyles.caption
                          : AimTextStyles.label)
                      .copyWith(color: surfaces.textPrimary),
                ),
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.space8),
          SizedBox(
            width: diameter + AimSpacing.space16,
            child: Text(
              skillName,
              style: AimTextStyles.caption.copyWith(color: surfaces.textSecondary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}

extension on AIMSkillBlobSize {
  double get diameter {
    return switch (this) {
      AIMSkillBlobSize.sm => 56,
      AIMSkillBlobSize.md => 72,
      AIMSkillBlobSize.lg => 96,
    };
  }

  double get strokeWidth {
    return switch (this) {
      AIMSkillBlobSize.sm => 4,
      AIMSkillBlobSize.md => 5,
      AIMSkillBlobSize.lg => 6,
    };
  }
}
