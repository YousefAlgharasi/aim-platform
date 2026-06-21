import 'package:flutter/painting.dart';

final class AimSpacing {
  const AimSpacing._();

  static const double space0 = 0;
  static const double space2 = 2;
  static const double space4 = 4;
  static const double space8 = 8;
  static const double space12 = 12;
  static const double space16 = 16;
  static const double space20 = 20;
  static const double space24 = 24;
  static const double space32 = 32;
  static const double space40 = 40;
  static const double space48 = 48;
  static const double space64 = 64;

  static const double screenPaddingMobile = space16;
  static const double screenPaddingWeb = space24;
  static const double cardPadding = space16;
  static const double cardPaddingLg = space20;
  static const double sectionGap = space24;
  static const double componentGap = space12;
  static const double innerGap = space8;
  static const double listItemGap = space12;
  static const double formFieldGap = space16;

  static const double contentMaxWeb = 1200;
  static const double sidebarWidth = 260;
  static const double bottomNavHeight = 64;
  static const double topBarHeight = 56;

  static const EdgeInsets screenMobile = EdgeInsets.all(screenPaddingMobile);
  static const EdgeInsets screenWeb = EdgeInsets.all(screenPaddingWeb);
  static const EdgeInsets card = EdgeInsets.all(cardPadding);
  static const EdgeInsets cardLg = EdgeInsets.all(cardPaddingLg);
}
