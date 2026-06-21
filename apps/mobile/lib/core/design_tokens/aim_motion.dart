import 'package:flutter/animation.dart';

final class AimMotion {
  const AimMotion._();

  static const Duration durationFast = Duration(milliseconds: 120);
  static const Duration durationBase = Duration(milliseconds: 180);
  static const Duration durationSlow = Duration(milliseconds: 260);

  static const Curve easeStandard = Cubic(0.2, 0, 0, 1);
  static const Curve easeEmphasis = Cubic(0.2, 0, 0, 1.2);
}
