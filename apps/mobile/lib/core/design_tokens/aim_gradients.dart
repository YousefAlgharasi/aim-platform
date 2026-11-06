import 'package:flutter/painting.dart';

import 'aim_colors.dart';

final class AimGradients {
  const AimGradients._();

  static const Alignment begin135 = Alignment.topLeft;
  static const Alignment end135 = Alignment.bottomRight;

  /// Official brand gradient (same blues as the app icon).
  static const LinearGradient ai = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      AimColors.primary400,
      AimColors.primary600,
    ],
  );

  static const LinearGradient aiSoft = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      AimColors.primary50,
      AimColors.primary100,
    ],
  );

  static const LinearGradient growth = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      AimColors.accent500,
      AimColors.primary500,
    ],
  );

  /// Launch-screen backdrop. MUST stay identical to the radial gradient in
  /// android/app/src/main/res/drawable*/launch_background.xml (center 50%/45%,
  /// radius = shortest side) so the native splash hands off to the first
  /// Flutter frame without a visible jump.
  static const RadialGradient splash = RadialGradient(
    center: Alignment(0.0, -0.1),
    radius: 1.0,
    colors: <Color>[
      AimColors.primary400,
      AimColors.primary600,
    ],
  );

  // Gen Z gradients — see docs/design/ui-for-all-system-mobile/README.md.
  /// Hero gradient — now the official brand blues (previously purple → sky),
  /// so every hero surface matches the app icon and launch screens.
  static const LinearGradient gzHero = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      AimColors.primary400,
      AimColors.primary500,
      AimColors.primary600,
    ],
  );

  static const LinearGradient gzFire = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      Color(0xFFFFB14E),
      Color(0xFFFF6B8A),
    ],
  );

  static const LinearGradient gzLime = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      Color(0xFFC8FF3D),
      Color(0xFF74E08A),
    ],
  );

  static const LinearGradient gzCoral = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      Color(0xFFFF6B8A),
      Color(0xFFFF9F45),
    ],
  );
}
