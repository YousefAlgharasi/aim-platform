import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Texts printed on the certificate (already in the viewer's language).
class CertificateLabels {
  const CertificateLabels({
    required this.brand,
    required this.title,
    required this.presentedTo,
    required this.forCompleting,
    required this.finalScore,
    required this.issued,
    required this.reference,
  });

  final String brand;
  final String title;
  final String presentedTo;
  final String forCompleting;
  final String finalScore;
  final String issued;
  final String reference;
}

/// Draws the certificate exactly like the student web app does (landscape A4,
/// brand frame, gold inner line, seal, issue date and final mark). Everything
/// printed comes from the data passed in; it never prints a link.
class CertificatePainter extends CustomPainter {
  const CertificatePainter({
    required this.studentName,
    required this.courseTitle,
    required this.scorePercent,
    required this.issuedText,
    required this.reference,
    required this.rtl,
    required this.scoreText,
    required this.labels,
  });

  /// Same coordinate space the web canvas uses.
  static const double w = 1754;
  static const double h = 1240;
  static const double aspect = w / h;

  final String? studentName;
  final String courseTitle;

  /// Final mark out of 100, or null when there is no score yet.
  final int? scorePercent;
  final String issuedText;
  final String reference;
  final bool rtl;

  /// "73 / 100" already formatted for the viewer's digits.
  final String? scoreText;
  final CertificateLabels labels;

  static const _ink = Color(0xFF111827);
  static const _muted = Color(0xFF5B6475);
  static const _brand = Color(0xFF4762EE);
  static const _gold = Color(0xFFC8A24A);
  static const _goldDark = Color(0xFF8A6B1F);
  static const _paper = Color(0xFFFFFEFB);

  TextDirection get _dir => rtl ? TextDirection.rtl : TextDirection.ltr;

  TextPainter _layout(String text, double weight, double px, Color color,
      {double spacing = 0}) {
    final tp = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          fontSize: px,
          fontWeight: FontWeight.values[((weight / 100).round() - 1).clamp(0, 8)],
          color: color,
          letterSpacing: spacing,
          height: 1.0,
        ),
      ),
      textDirection: _dir,
      textAlign: TextAlign.center,
    )..layout();
    return tp;
  }

  /// Largest size (down to [minPx]) at which the text fits in [maxWidth].
  TextPainter _fit(String text, double weight, double maxPx, double minPx,
      double maxWidth, Color color) {
    var px = maxPx;
    for (;;) {
      final tp = _layout(text, weight, px, color);
      if (px <= minPx || tp.width <= maxWidth) return tp;
      px -= 2;
    }
  }

  /// Draws centred on [cx] with its alphabetic baseline at [baseline].
  void _drawCentered(Canvas canvas, TextPainter tp, double cx, double baseline) {
    final ascent = tp.computeDistanceToActualBaseline(TextBaseline.alphabetic);
    tp.paint(canvas, Offset(cx - tp.width / 2, baseline - ascent));
  }

  List<String> _wrap(String text, double weight, double px, double maxWidth,
      int maxLines) {
    final words = text.split(RegExp(r'\s+')).where((e) => e.isNotEmpty);
    final lines = <String>[];
    var line = '';
    for (final word in words) {
      final next = line.isEmpty ? word : '$line $word';
      if (line.isNotEmpty &&
          _layout(next, weight, px, _brand).width > maxWidth &&
          lines.length < maxLines - 1) {
        lines.add(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line.isNotEmpty) lines.add(line);
    return lines;
  }

  Path _star(double cx, double cy, double outer, double inner) {
    final path = Path();
    for (var i = 0; i < 10; i++) {
      final r = i.isEven ? outer : inner;
      final a = (math.pi / 5) * i - math.pi / 2;
      final x = cx + math.cos(a) * r;
      final y = cy + math.sin(a) * r;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    return path..close();
  }

  void _seal(Canvas canvas, double cx, double cy) {
    final brand = Paint()..color = _brand;
    for (final dir in [-1, 1]) {
      final p = Path()
        ..moveTo(cx + dir * 18, cy + 60)
        ..lineTo(cx + dir * 70, cy + 150)
        ..lineTo(cx + dir * 38, cy + 138)
        ..lineTo(cx + dir * 4, cy + 156)
        ..close();
      canvas.drawPath(p, brand);
    }
    const teeth = 28;
    final edge = Path();
    for (var i = 0; i < teeth * 2; i++) {
      final r = i.isEven ? 96.0 : 88.0;
      final a = (math.pi / teeth) * i;
      final x = cx + math.cos(a) * r;
      final y = cy + math.sin(a) * r;
      if (i == 0) {
        edge.moveTo(x, y);
      } else {
        edge.lineTo(x, y);
      }
    }
    edge.close();
    canvas.drawPath(edge, Paint()..color = _gold);
    canvas.drawCircle(
      Offset(cx, cy),
      72,
      Paint()
        ..color = _paper
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3,
    );
    canvas.drawPath(_star(cx, cy, 44, 18), Paint()..color = _paper);
  }

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / w, size.height / h);
    const cx = w / 2;

    // Paper, with a soft wash of brand colour in two corners.
    canvas.drawRect(const Rect.fromLTWH(0, 0, w, h), Paint()..color = _paper);
    canvas.save();
    canvas.clipRect(const Rect.fromLTWH(46, 46, w - 92, h - 92));
    final wash = Paint()..color = const Color(0x0F4762EE);
    canvas.drawCircle(Offset.zero, 420, wash);
    canvas.drawCircle(const Offset(w, h), 420, wash);
    canvas.restore();

    // Frame: strong brand line outside, fine gold line inside, gold corners.
    canvas.drawRect(
      const Rect.fromLTWH(46, 46, w - 92, h - 92),
      Paint()
        ..color = _brand
        ..style = PaintingStyle.stroke
        ..strokeWidth = 10,
    );
    canvas.drawRect(
      const Rect.fromLTWH(76, 76, w - 152, h - 152),
      Paint()
        ..color = _gold
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3,
    );
    final goldFill = Paint()..color = _gold;
    for (final p in const [
      Offset(76, 76),
      Offset(w - 76, 76),
      Offset(76, h - 76),
      Offset(w - 76, h - 76),
    ]) {
      canvas.drawRect(Rect.fromCenter(center: p, width: 22, height: 22), goldFill);
    }

    // Brand and title.
    _drawCentered(canvas, _layout(labels.brand, 700, 54, _brand, spacing: rtl ? 0 : 2), cx, 188);
    _drawCentered(
      canvas,
      _layout(rtl ? labels.title : labels.title.toUpperCase(), 600, rtl ? 42 : 30, _goldDark,
          spacing: rtl ? 0 : 9),
      cx,
      262,
    );

    // Divider with a small star.
    final line = Paint()
      ..color = _gold
      ..strokeWidth = 2;
    canvas.drawLine(const Offset(cx - 280, 312), const Offset(cx - 36, 312), line);
    canvas.drawLine(const Offset(cx + 36, 312), const Offset(cx + 280, 312), line);
    canvas.drawPath(_star(cx, 312, 15, 6), goldFill);

    // Who it is for.
    _drawCentered(canvas, _layout(labels.presentedTo, 400, 32, _muted), cx, 392);
    final name = studentName?.trim();
    if (name != null && name.isNotEmpty) {
      _drawCentered(canvas, _fit(name, 600, 112, 54, 1280, _ink), cx, 520);
      canvas.drawLine(
        const Offset(cx - 460, 584),
        const Offset(cx + 460, 584),
        Paint()
          ..color = _gold
          ..strokeWidth = 3,
      );
    }

    // What for.
    _drawCentered(canvas, _layout(labels.forCompleting, 400, 32, _muted), cx, 648);
    final single = _fit(courseTitle, 700, 72, 52, 1300, _brand);
    final fitsOneLine = single.width <= 1300;
    final lines = fitsOneLine
        ? [courseTitle]
        : _wrap(courseTitle, 700, single.text!.style!.fontSize!, 1300, 2);
    final titlePx = single.text!.style!.fontSize!;
    for (var i = 0; i < lines.length; i++) {
      _drawCentered(canvas, _layout(lines[i], 700, titlePx, _brand), cx, 738 + i * 74);
    }
    final titleBottom = 738 + (lines.length - 1) * 74;

    // Footer: date on one side, seal in the middle, mark on the other
    // (mirrored in right-to-left).
    const left = 400.0;
    const right = w - 400.0;
    final issuedX = rtl ? right : left;
    final scoreX = rtl ? left : right;
    final footerY = math.max(990, titleBottom + 170).toDouble();

    _seal(canvas, cx, footerY - 50);

    void column(double x, String label, String value, Color color, double px) {
      _drawCentered(canvas, _layout(label, 400, 26, _muted), x, footerY - 100);
      _drawCentered(canvas, _fit(value, 600, px, 28, 420, color), x, footerY - 22);
      canvas.drawLine(Offset(x - 200, footerY + 14), Offset(x + 200, footerY + 14), line);
    }

    column(issuedX, labels.issued, issuedText, _ink, 40);
    if (scorePercent != null && scoreText != null) {
      column(scoreX, labels.finalScore, scoreText!, _brand, 60);
    }

    // Reference, small (never a link).
    _drawCentered(
      canvas,
      _layout('${labels.reference}: $reference', 400, 22, _muted, spacing: rtl ? 0 : 1),
      cx,
      h - 104,
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(CertificatePainter old) =>
      old.studentName != studentName ||
      old.courseTitle != courseTitle ||
      old.scorePercent != scorePercent ||
      old.issuedText != issuedText ||
      old.reference != reference ||
      old.rtl != rtl ||
      old.scoreText != scoreText;
}

/// The certificate picture at the right aspect ratio.
class CertificateView extends StatelessWidget {
  const CertificateView({
    super.key,
    required this.painter,
    this.semanticLabel,
  });

  final CertificatePainter painter;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      image: true,
      label: semanticLabel,
      child: DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.10),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: AspectRatio(
            aspectRatio: CertificatePainter.aspect,
            child: CustomPaint(painter: painter),
          ),
        ),
      ),
    );
  }
}
