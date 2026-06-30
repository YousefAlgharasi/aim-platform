import 'package:flutter/painting.dart';

import 'aim_colors.dart';

final class AimGradients {
  const AimGradients._();

  static const Alignment begin135 = Alignment.topLeft;
  static const Alignment end135 = Alignment.bottomRight;

  static const LinearGradient ai = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      AimColors.primary500,
      AimColors.secondary500,
    ],
  );

  static const LinearGradient aiSoft = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      AimColors.primary50,
      AimColors.secondary50,
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

  // Gen Z gradients — see docs/design/ui-for-all-system-mobile/README.md.
  static const LinearGradient gzHero = LinearGradient(
    begin: begin135,
    end: end135,
    colors: <Color>[
      Color(0xFF8B5CF6),
      Color(0xFF6C63FF),
      Color(0xFF5AC8FA),
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
