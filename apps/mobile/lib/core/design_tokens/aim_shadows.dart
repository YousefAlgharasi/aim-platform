import 'package:flutter/painting.dart';

import 'aim_colors.dart';

final class AimShadows {
  const AimShadows._();

  static const List<BoxShadow> none = <BoxShadow>[];

  static const List<BoxShadow> card = <BoxShadow>[
    BoxShadow(
      color: Color(0x0A181C26),
      offset: Offset(0, 1),
      blurRadius: 2,
    ),
    BoxShadow(
      color: Color(0x0F181C26),
      offset: Offset(0, 2),
      blurRadius: 8,
    ),
  ];

  static const List<BoxShadow> cardHover = <BoxShadow>[
    BoxShadow(
      color: Color(0x0F181C26),
      offset: Offset(0, 2),
      blurRadius: 4,
    ),
    BoxShadow(
      color: Color(0x1A181C26),
      offset: Offset(0, 8),
      blurRadius: 20,
    ),
  ];

  static const List<BoxShadow> dropdown = <BoxShadow>[
    BoxShadow(
      color: Color(0x1A181C26),
      offset: Offset(0, 4),
      blurRadius: 12,
    ),
    BoxShadow(
      color: Color(0x1F181C26),
      offset: Offset(0, 12),
      blurRadius: 28,
    ),
  ];

  static const List<BoxShadow> modal = <BoxShadow>[
    BoxShadow(
      color: Color(0x24181C26),
      offset: Offset(0, 8),
      blurRadius: 24,
    ),
    BoxShadow(
      color: Color(0x33181C26),
      offset: Offset(0, 24),
      blurRadius: 56,
    ),
  ];

  static const List<BoxShadow> sheet = <BoxShadow>[
    BoxShadow(
      color: Color(0x0F181C26),
      offset: Offset(0, -2),
      blurRadius: 8,
    ),
    BoxShadow(
      color: Color(0x24181C26),
      offset: Offset(0, -12),
      blurRadius: 32,
    ),
  ];

  static const List<BoxShadow> fab = <BoxShadow>[
    BoxShadow(
      color: Color(0x474762EE),
      offset: Offset(0, 4),
      blurRadius: 10,
    ),
    BoxShadow(
      color: Color(0x384762EE),
      offset: Offset(0, 8),
      blurRadius: 24,
    ),
  ];

  static const List<BoxShadow> focus = <BoxShadow>[
    BoxShadow(
      color: Color(0x666B82FB),
      spreadRadius: 3,
    ),
  ];

  // CSS inset shadows have no direct BoxShadow equivalent in Flutter
  // decorations. Use this color with subtle inner borders/fills if needed.
  static const Color insetColor = Color(0x0F181C26);

  static const Color focusRing = AimColors.primary400;
}
