import 'package:flutter/material.dart';

import 'aim_dark_theme.dart';
import 'aim_light_theme.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData get light => aimLightTheme;

  static ThemeData get dark => aimDarkTheme;
}
