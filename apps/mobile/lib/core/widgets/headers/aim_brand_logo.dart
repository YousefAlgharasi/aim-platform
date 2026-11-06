import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/design_tokens.dart';

/// AIM brand badge: a squircle with the official brand gradient
/// ([AimGradients.ai]) and bold white "AIM" text.
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
        gradient: AimGradients.ai,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: [
          BoxShadow(
            color: AimColors.primary500.withValues(alpha: 0.3),
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
