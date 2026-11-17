// The tour itself: dims the screen, draws a soft glow around one element at a
// time and shows a small card beside it (counter, Skip, Back, Next/Done).
//
// Behaves like the web GuidedTour: the dimming is visual only (taps still
// reach the screen underneath), the glow and card glide to each new element,
// a step whose element is gone is skipped, and closing the tour any way counts
// as seen. Layout uses start/end, never left/right, so it mirrors in Arabic.

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import '../../../core/localization/inline_tr.dart';
import '../../../core/widgets/widgets.dart';
import '../data/tour_definitions.dart';
import 'tour_target.dart';

const double _spotPad = 8;
const double _gap = 14;
const double _margin = 12;
const double _cardMaxWidth = 340;

/// Time constant of the glide, as on the web (about a third of a second).
const double _glideMs = 90;

class GuidedTourSpotlight extends StatefulWidget {
  const GuidedTourSpotlight({
    super.key,
    required this.steps,
    required this.onFinish,
  });

  /// Only the steps whose element is on screen when the tour begins.
  final List<TourStep> steps;

  /// Called once when the tour ends, by Done, Skip or running out of steps.
  final VoidCallback onFinish;

  @override
  State<GuidedTourSpotlight> createState() => _GuidedTourSpotlightState();
}

class _GuidedTourSpotlightState extends State<GuidedTourSpotlight>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  final GlobalKey _cardKey = GlobalKey();

  int _index = 0;
  int _direction = 1;
  bool _finished = false;
  bool _shown = false;

  BuildContext? _targetContext;
  Rect? _glide;
  Offset? _cardPos;
  double _cardWidth = _cardMaxWidth;
  double _radius = 14;
  Duration _last = Duration.zero;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker(_tick)..start();
    WidgetsBinding.instance.addPostFrameCallback((_) => _pointAtStep());
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _finish() {
    if (_finished) return;
    _finished = true;
    widget.onFinish();
  }

  void _go(int delta) {
    _direction = delta;
    setState(() => _index += delta);
    _pointAtStep();
  }

  /// Find the current step's element and bring it into view. A step whose
  /// element went away is skipped in the direction of travel.
  void _pointAtStep() {
    if (!mounted || _finished) return;
    if (_index < 0 || _index >= widget.steps.length) {
      _finish();
      return;
    }
    final context = TourTargets.find(widget.steps[_index].target);
    if (context == null) {
      final next = _index + _direction;
      if (next < 0 || next >= widget.steps.length) {
        _finish();
      } else {
        setState(() => _index = next);
        _pointAtStep();
      }
      return;
    }
    _targetContext = context;
    final rect = TourTargets.rectOf(context);
    final screen = MediaQuery.sizeOf(this.context);
    final tall = rect != null && rect.height > screen.height * 0.7;
    final reduced = MediaQuery.disableAnimationsOf(this.context);
    Scrollable.ensureVisible(
      context,
      alignment: tall ? 0.0 : 0.4,
      duration: reduced ? Duration.zero : const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
    _radius = _radiusOf(context, rect);
  }

  /// Match the glow's corners to the element's own where we can tell.
  double _radiusOf(BuildContext target, Rect? rect) {
    if (rect == null) return 14;
    return math.min(18, math.min(rect.width, rect.height) / 2);
  }

  void _tick(Duration elapsed) {
    if (!mounted || _finished) return;
    final dt = math.min((elapsed - _last).inMicroseconds / 1000.0, 64.0);
    _last = elapsed;

    var rect = TourTargets.rectOf(_targetContext);
    if (rect == null) {
      // The element left the screen tree: look it up again, else skip.
      final again = TourTargets.find(widget.steps[_index].target);
      if (again == null) {
        _pointAtStep();
        return;
      }
      _targetContext = again;
      rect = TourTargets.rectOf(again);
      if (rect == null) return;
    }

    final media = MediaQuery.of(context);
    final size = media.size;
    final reduced = media.disableAnimations;

    final spot = Rect.fromLTWH(
      rect.left - _spotPad,
      rect.top - _spotPad,
      rect.width + _spotPad * 2,
      rect.height + _spotPad * 2,
    );

    final cardWidth = math.min(_cardMaxWidth, size.width - _margin * 2);
    final cardHeight = (_cardKey.currentContext?.size?.height) ?? 200;
    final topLimit = media.padding.top + _margin;
    final bottomLimit = size.height - media.padding.bottom - _margin;
    double cy;
    if (bottomLimit - spot.bottom >= cardHeight + _gap) {
      cy = spot.bottom + _gap;
    } else if (spot.top - topLimit >= cardHeight + _gap) {
      cy = spot.top - _gap - cardHeight;
    } else {
      cy = bottomLimit - cardHeight;
    }
    cy = math.max(cy, topLimit);
    final cx = (spot.center.dx - cardWidth / 2)
        .clamp(_margin, math.max(_margin, size.width - cardWidth - _margin));
    final cardTarget = Offset(cx.toDouble(), cy);

    final g = _glide;
    final p = _cardPos;
    final k = reduced || g == null || p == null
        ? 1.0
        : 1 - math.exp(-dt / _glideMs);
    setState(() {
      _glide = g == null ? spot : Rect.lerp(g, spot, k);
      _cardPos = p == null ? cardTarget : Offset.lerp(p, cardTarget, k);
      _cardWidth = cardWidth;
      _shown = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final glide = _glide;
    final pos = _cardPos;
    final arabic = context.isArabic;
    final step = widget.steps[_index.clamp(0, widget.steps.length - 1)];
    final total = widget.steps.length;
    final last = _index == total - 1;
    final title = step.title.of(arabic);
    final surfaces = aimSurfacesOf(context);

    return Stack(
      fit: StackFit.expand,
      children: [
        if (glide != null)
          Positioned.fill(
            child: IgnorePointer(
              child: AnimatedOpacity(
                opacity: _shown ? 1 : 0,
                duration: const Duration(milliseconds: 200),
                child: CustomPaint(
                  painter: _SpotlightPainter(
                    rect: glide,
                    radius: _radius + _spotPad,
                    glow: AimColors.primary500,
                  ),
                ),
              ),
            ),
          ),
        if (pos != null)
          Positioned(
            left: pos.dx,
            top: pos.dy,
            width: _cardWidth,
            child: AnimatedOpacity(
              opacity: _shown ? 1 : 0,
              duration: const Duration(milliseconds: 200),
              child: Semantics(
                container: true,
                liveRegion: true,
                label: '${fill(TourStrings.stepOf.of(arabic), {
                      'n': _index + 1,
                      'total': total
                    })}: $title',
                child: Material(
                  key: _cardKey,
                  color: surfaces.surface,
                  elevation: 12,
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsetsDirectional.all(20),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: surfaces.border),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          textAlign: TextAlign.start,
                          style: AimTextStyles.h3.copyWith(
                            color: surfaces.textPrimary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          step.body.of(arabic),
                          textAlign: TextAlign.start,
                          style: AimTextStyles.bodySm.copyWith(
                            color: surfaces.textMuted,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                fill(TourStrings.counter.of(arabic), {
                                  'n': _index + 1,
                                  'total': total,
                                }),
                                style: AimTextStyles.bodySm.copyWith(
                                  color: surfaces.textMuted,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            TextButton(
                              onPressed: _finish,
                              child: Text(TourStrings.skip.of(arabic)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            if (_index > 0) ...[
                              OutlinedButton(
                                onPressed: () => _go(-1),
                                child: Text(TourStrings.back.of(arabic)),
                              ),
                              const SizedBox(width: 8),
                            ],
                            FilledButton(
                              onPressed: last ? _finish : () => _go(1),
                              child: Text(
                                last
                                    ? TourStrings.done.of(arabic)
                                    : TourStrings.next.of(arabic),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Dims everything except [rect], with a white edge and a soft glow around it.
class _SpotlightPainter extends CustomPainter {
  const _SpotlightPainter({
    required this.rect,
    required this.radius,
    required this.glow,
  });

  final Rect rect;
  final double radius;
  final Color glow;

  @override
  void paint(Canvas canvas, Size size) {
    final hole = RRect.fromRectAndRadius(
      rect,
      Radius.circular(math.min(radius, math.min(rect.width, rect.height) / 2)),
    );
    final dim = Path.combine(
      PathOperation.difference,
      Path()..addRect(Offset.zero & size),
      Path()..addRRect(hole),
    );
    canvas.drawPath(dim, Paint()..color = const Color(0x99000000));
    canvas.drawRRect(
      hole.inflate(2),
      Paint()
        ..color = glow.withValues(alpha: 0.45)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10),
    );
    canvas.drawRRect(
      hole,
      Paint()
        ..color = Colors.white.withValues(alpha: 0.92)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(_SpotlightPainter old) =>
      old.rect != rect || old.radius != radius || old.glow != glow;
}
