// AimLogoMark — the AIM "A" mark drawn in code (no image asset needed, so it
// stays sharp at any size and in both themes).

import 'package:flutter/material.dart';

class AimLogoMark extends StatelessWidget {
  const AimLogoMark({super.key, this.size = 30});

  final double size;

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: SizedBox(
        width: size,
        height: size,
        child: CustomPaint(painter: _AimLogoPainter()),
      ),
    );
  }
}

class _AimLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final stroke = w * 0.2;

    final main = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF4F8BFF), Color(0xFF1D4ED8)],
      ).createShader(Offset.zero & size)
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // The two legs of the A, meeting at the top.
    final legs = Path()
      ..moveTo(w * 0.12, h * 0.9)
      ..lineTo(w * 0.5, h * 0.1)
      ..lineTo(w * 0.88, h * 0.9);
    canvas.drawPath(legs, main);

    // A lighter swoosh for the crossbar.
    final swoosh = Paint()
      ..color = const Color(0xFF7DB4FF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke * 0.62
      ..strokeCap = StrokeCap.round;
    final bar = Path()
      ..moveTo(w * 0.34, h * 0.66)
      ..quadraticBezierTo(w * 0.52, h * 0.52, w * 0.68, h * 0.66);
    canvas.drawPath(bar, swoosh);
  }

  @override
  bool shouldRepaint(_AimLogoPainter old) => false;
}
