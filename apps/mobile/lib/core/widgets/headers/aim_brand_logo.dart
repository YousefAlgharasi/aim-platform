import 'package:flutter/material.dart';

/// Prototype-aligned AIM Brand Logo Badge widget.
/// Renders a squircle badge with solid/gradient primary background (#653BFF) and bold white text.
class AimBrandLogo extends StatelessWidget {
  const AimBrandLogo({
    this.size = 38,
    this.fontSize = 11,
    this.borderRadius = 12,
    super.key,
  });

  final double size;
  final double fontSize;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFF653BFF),
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF653BFF).withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Text(
        'AIM',
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w900,
          fontSize: fontSize,
          letterSpacing: -0.3,
        ),
      ),
    );
  }
}
