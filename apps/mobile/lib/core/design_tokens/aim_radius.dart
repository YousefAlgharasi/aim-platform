import 'package:flutter/painting.dart';

final class AimRadius {
  const AimRadius._();

  static const double xs = 6;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double x2l = 32;
  static const double pill = 999;

  // CSS --radius-full is 50%; Flutter uses circle shapes or circular borders.
  static const double full = 0.5;

  static const Radius radiusXs = Radius.circular(xs);
  static const Radius radiusSm = Radius.circular(sm);
  static const Radius radiusMd = Radius.circular(md);
  static const Radius radiusLg = Radius.circular(lg);
  static const Radius radiusXl = Radius.circular(xl);
  static const Radius radiusX2l = Radius.circular(x2l);
  static const Radius radiusPill = Radius.circular(pill);

  static const BorderRadius borderXs = BorderRadius.all(radiusXs);
  static const BorderRadius borderSm = BorderRadius.all(radiusSm);
  static const BorderRadius borderMd = BorderRadius.all(radiusMd);
  static const BorderRadius borderLg = BorderRadius.all(radiusLg);
  static const BorderRadius borderXl = BorderRadius.all(radiusXl);
  static const BorderRadius borderX2l = BorderRadius.all(radiusX2l);
  static const BorderRadius borderPill = BorderRadius.all(radiusPill);
}
