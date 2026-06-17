import 'package:flutter/material.dart';

import '../../theme/theme.dart';

enum AIMSkeletonShape {
  text,
  rect,
  circle,
}

class AIMSkeleton extends StatefulWidget {
  const AIMSkeleton({
    super.key,
    this.shape = AIMSkeletonShape.text,
    this.width,
    this.height,
    this.lines = 1,
  });

  final AIMSkeletonShape shape;
  final double? width;
  final double? height;
  final int lines;

  @override
  State<AIMSkeleton> createState() => _AIMSkeletonState();
}

class _AIMSkeletonState extends State<AIMSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1300),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.maybeOf(context);
    final reduceMotion = (mediaQuery?.disableAnimations ?? false) ||
        (mediaQuery?.accessibleNavigation ?? false);

    if (reduceMotion && _controller.isAnimating) {
      _controller.stop();
    } else if (!reduceMotion && !_controller.isAnimating) {
      _controller.repeat();
    }

    if (widget.shape == AIMSkeletonShape.text && widget.lines > 1) {
      return SizedBox(
        width: widget.width,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: List.generate(widget.lines, (index) {
            final isLast = index == widget.lines - 1;
            final line = _SkeletonBlock(
              animation: _controller,
              reduceMotion: reduceMotion,
              shape: AIMSkeletonShape.text,
              height: widget.height ?? 12,
            );

            return Padding(
              padding: EdgeInsets.only(
                bottom: index == widget.lines - 1 ? 0 : AimSpacing.space8,
              ),
              child: isLast
                  ? FractionallySizedBox(
                      alignment: AlignmentDirectional.centerStart,
                      widthFactor: 0.6,
                      child: line,
                    )
                  : line,
            );
          }),
        ),
      );
    }

    return _SkeletonBlock(
      animation: _controller,
      reduceMotion: reduceMotion,
      shape: widget.shape,
      width: widget.width,
      height: widget.height ?? widget.shape.defaultHeight,
    );
  }
}

class _SkeletonBlock extends StatelessWidget {
  const _SkeletonBlock({
    required this.animation,
    required this.reduceMotion,
    required this.shape,
    this.width,
    this.height,
  });

  final Animation<double> animation;
  final bool reduceMotion;
  final AIMSkeletonShape shape;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final radius = switch (shape) {
      AIMSkeletonShape.text => AimRadius.borderXs,
      AIMSkeletonShape.rect => AimRadius.borderMd,
      AIMSkeletonShape.circle => null,
    };

    Widget block = SizedBox(
      width: width,
      height: height,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: surfaces.surfaceSunken,
          borderRadius: radius,
          shape: shape == AIMSkeletonShape.circle
              ? BoxShape.circle
              : BoxShape.rectangle,
        ),
      ),
    );

    if (reduceMotion) return block;

    block = AnimatedBuilder(
      animation: animation,
      child: block,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            final width = bounds.width <= 0 ? 1.0 : bounds.width;
            final progress = animation.value;
            final start = -width + (width * 2 * progress);

            return LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                surfaces.surfaceSunken,
                surfaces.border,
                surfaces.surfaceSunken,
              ],
              stops: const [0, 0.5, 1],
              transform: _SlidingGradientTransform(start),
            ).createShader(bounds);
          },
          child: child,
        );
      },
    );

    return block;
  }
}

class _SlidingGradientTransform extends GradientTransform {
  const _SlidingGradientTransform(this.dx);

  final double dx;

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(dx, 0, 0);
  }
}

extension on AIMSkeletonShape {
  double get defaultHeight {
    return switch (this) {
      AIMSkeletonShape.text => 12,
      AIMSkeletonShape.rect => 80,
      AIMSkeletonShape.circle => 40,
    };
  }
}
