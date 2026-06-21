import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../theme/theme.dart';

/// Fill tone for [AIMCircularProgress].
enum AIMCircularProgressTone {
  /// AIM primary blue.
  primary,

  /// Accent → primary gradient ring.
  gradient,

  /// Semantic success green.
  success,
}

/// Circular progress dial for daily goals and quiz scores.
///
/// Matches the `CircularProgress` design-system contract.
///
/// ```dart
/// AIMCircularProgress(value: 68, tone: AIMCircularProgressTone.gradient, caption: 'daily goal')
/// AIMCircularProgress(
///   value: 9, max: 10,
///   tone: AIMCircularProgressTone.success,
///   caption: 'score',
///   label: Text('9/10', style: AimTextStyles.h2),
/// )
/// ```
class AIMCircularProgress extends StatelessWidget {
  const AIMCircularProgress({
    required this.value,
    super.key,
    this.max = 100,
    this.size = 96,
    this.thickness = 9,
    this.tone = AIMCircularProgressTone.primary,
    this.label,
    this.caption,
    this.showValue = true,
  });

  /// Current value.
  final double value;

  /// Maximum value. Defaults to 100.
  final double max;

  /// Diameter in logical pixels. Defaults to 96.
  final double size;

  /// Stroke width in logical pixels. Defaults to 9.
  final double thickness;

  /// Ring colour. Defaults to [AIMCircularProgressTone.primary].
  final AIMCircularProgressTone tone;

  /// Custom center widget. Overrides the default percentage readout.
  final Widget? label;

  /// Small caption rendered beneath the center value/label.
  final String? caption;

  /// Show the percentage value in the centre. Defaults to true.
  final bool showValue;

  double get _pct => (value / max).clamp(0.0, 1.0);

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final pct = _pct;
    final displayPct = '${(pct * 100).round()}%';

    return Semantics(
      value: displayPct,
      child: SizedBox(
        width: size,
        height: size,
        child: Stack(
          alignment: Alignment.center,
          children: [
            CustomPaint(
              size: Size(size, size),
              painter: _RingPainter(
                pct: pct,
                thickness: thickness,
                tone: tone,
                trackColor: surfaces.surfaceSunken,
                primaryColor: AimColors.primary500,
                successColor: AimColors.success500,
                accentColor: AimColors.accent500,
              ),
            ),
            // center content
            if (showValue || label != null || caption != null)
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (label != null)
                    label!
                  else if (showValue)
                    Text(
                      displayPct,
                      style: AimTextStyles.h2.copyWith(
                        color: surfaces.textPrimary,
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                  if (caption != null)
                    Text(
                      caption!,
                      style: AimTextStyles.caption
                          .copyWith(color: surfaces.textMuted),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  const _RingPainter({
    required this.pct,
    required this.thickness,
    required this.tone,
    required this.trackColor,
    required this.primaryColor,
    required this.successColor,
    required this.accentColor,
  });

  final double pct;
  final double thickness;
  final AIMCircularProgressTone tone;
  final Color trackColor;
  final Color primaryColor;
  final Color successColor;
  final Color accentColor;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - thickness) / 2;
    final rect =
        Rect.fromCircle(center: center, radius: radius);

    // track
    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = thickness
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, trackPaint);

    if (pct <= 0) return;

    // fill
    final sweepAngle = 2 * math.pi * pct;
    const startAngle = -math.pi / 2; // 12 o'clock

    final fillPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = thickness
      ..strokeCap = StrokeCap.round;

    if (tone == AIMCircularProgressTone.gradient) {
      // accent→primary gradient along the arc
      fillPaint.shader = SweepGradient(
        startAngle: startAngle,
        endAngle: startAngle + sweepAngle,
        colors: [accentColor, primaryColor],
        tileMode: TileMode.clamp,
      ).createShader(rect);
    } else if (tone == AIMCircularProgressTone.success) {
      fillPaint.color = successColor;
    } else {
      fillPaint.color = primaryColor;
    }

    canvas.drawArc(rect, startAngle, sweepAngle, false, fillPaint);
  }

  @override
  bool shouldRepaint(_RingPainter oldDelegate) =>
      oldDelegate.pct != pct ||
      oldDelegate.tone != tone ||
      oldDelegate.trackColor != trackColor;
}
