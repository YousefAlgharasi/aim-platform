import 'package:flutter/material.dart';

import '../../theme/theme.dart';
import '../feedback/aim_skeleton.dart';

/// Full-screen loading state.
///
/// Renders a centred column of [AIMSkeleton] lines to convey that content is
/// being fetched. Use this widget as the body of a screen while an
/// [AppAsyncLoading] state is active.
///
/// Example:
/// ```dart
/// switch (state) {
///   AppAsyncLoading() => const AIMFullScreenLoading(),
///   AppAsyncSuccess(:final data) => MyContent(data: data),
///   AppAsyncFailure(:final message) => AIMFullScreenError(message: message),
///   AppAsyncIdle() => const SizedBox.shrink(),
/// }
/// ```
class AIMFullScreenLoading extends StatelessWidget {
  const AIMFullScreenLoading({
    super.key,
    this.skeletonLines = 4,
    this.semanticLabel = 'Loading',
  });

  /// Number of skeleton text lines to render.
  final int skeletonLines;

  /// Accessibility label announced to screen readers.
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: semanticLabel,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const AIMSkeleton(
                shape: AIMSkeletonShape.rect,
              ),
              const SizedBox(height: AimSpacing.componentGap),
              AIMSkeleton(
                shape: AIMSkeletonShape.text,
                lines: skeletonLines,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
