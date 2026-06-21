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
}
