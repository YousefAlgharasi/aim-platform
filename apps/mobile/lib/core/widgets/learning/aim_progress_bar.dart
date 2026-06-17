import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Fill tone for [AIMProgressBar].
enum AIMProgressBarTone {
  /// AIM primary blue.
  primary,

  /// Growth gradient (accent → primary).
  gradient,

  /// Semantic success green.
  success,

  /// Semantic warning amber.
  warning,
}

/// Track height variant for [AIMProgressBar].
enum AIMProgressBarSize {
  /// 5 dp track.
  sm,

  /// 8 dp track (default).
  md,

  /// 12 dp track.
  lg,
}

/// Linear progress bar for lesson completion, XP, and skill mastery.
///
/// Matches the `ProgressBar` design-system contract:
/// label · showValue · tone (primary/gradient/success/warning) · size (sm/md/lg)
/// · custom [valueFormat].
///
/// ```dart
/// AIMProgressBar(value: 70, label: 'Lesson progress', showValue: true)
/// AIMProgressBar(
///   value: 320, max: 500,
///   tone: AIMProgressBarTone.gradient,
///   label: 'XP to next level',
///   showValue: true,
///   valueFormat: (v, m) => '$v/$m XP',
/// )
/// ```
class AIMProgressBar extends StatelessWidget {
  const AIMProgressBar({
    required this.value,
    super.key,
    this.max = 100,
    this.label,
    this.showValue = false,
    this.tone = AIMProgressBarTone.primary,
    this.size = AIMProgressBarSize.md,
    this.valueFormat,
  });

  /// Current value.
  final double value;

  /// Maximum value. Defaults to 100.
  final double max;

  /// Label shown above the bar.
  final String? label;

  /// Show a percentage / custom readout.
  final bool showValue;

  /// Fill colour / gradient. Defaults to [AIMProgressBarTone.primary].
  final AIMProgressBarTone tone;

  /// Track height. Defaults to [AIMProgressBarSize.md] (8 dp).
  final AIMProgressBarSize size;

  /// Custom formatter. Receives (value, max); returns the display string.
  /// When null the default `"XX%"` is shown.
  final String Function(double value, double max)? valueFormat;

  double get _pct => (value / max).clamp(0.0, 1.0);

  double get _trackHeight {
    return switch (size) {
      AIMProgressBarSize.sm => 5,
      AIMProgressBarSize.md => 8,
      AIMProgressBarSize.lg => 12,
    };
  }

  String _defaultLabel() {
    if (valueFormat != null) return valueFormat!(value, max);
    return '${(_pct * 100).round()}%';
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final gradients = aimGradientsOf(context);
    final showHeader = label != null || showValue;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (showHeader) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (label != null)
                Text(
                  label!,
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textSecondary),
                ),
              if (showValue)
                Text(
                  _defaultLabel(),
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textPrimary),
                ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
        ],
        Semantics(
          value: _defaultLabel(),
          child: _ProgressTrack(
            pct: _pct,
            trackHeight: _trackHeight,
            tone: tone,
            surfaces: surfaces,
            gradients: gradients,
          ),
        ),
      ],
    );
  }
}

class _ProgressTrack extends StatelessWidget {
  const _ProgressTrack({
    required this.pct,
    required this.trackHeight,
    required this.tone,
    required this.surfaces,
    required this.gradients,
  });

  final double pct;
  final double trackHeight;
  final AIMProgressBarTone tone;
  final AimSurfaceTheme surfaces;
  final AimGradientTheme gradients;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: AimRadius.borderPill,
      child: SizedBox(
        height: trackHeight,
        child: Stack(
          children: [
            // track background
            Container(
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                borderRadius: AimRadius.borderPill,
              ),
            ),
            // fill
            FractionallySizedBox(
              widthFactor: pct,
              child: AnimatedContainer(
                duration: AimMotion.durationSlow,
                curve: AimMotion.easeStandard,
                decoration: BoxDecoration(
                  borderRadius: AimRadius.borderPill,
                  color: tone == AIMProgressBarTone.primary
                      ? AimColors.primary500
                      : tone == AIMProgressBarTone.success
                          ? AimColors.success500
                          : tone == AIMProgressBarTone.warning
                              ? AimColors.warning500
                              : null,
                  gradient: tone == AIMProgressBarTone.gradient
                      ? gradients.growth
                      : null,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
