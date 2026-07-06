// HomePageSkeleton — loading placeholder for HomePage.
//
// Replaces the bare full-screen spinner with a content-shaped skeleton
// (greeting header, hero card, a few list rows) using the shared
// AIMSkeleton shimmer block, so the loading screen previews the shape of
// what's coming rather than a spinner floating on an empty page.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

class HomePageSkeleton extends StatelessWidget {
  const HomePageSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const AIMSkeleton(shape: AIMSkeletonShape.circle, width: 48, height: 48),
              const SizedBox(width: AimSpacing.componentGap),
              const Expanded(
                child: AIMSkeleton(shape: AIMSkeletonShape.text, lines: 2),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          const AIMSkeleton(
            shape: AIMSkeletonShape.rect,
            height: 140,
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          const AIMSkeleton(shape: AIMSkeletonShape.text, width: 120),
          const SizedBox(height: AimSpacing.componentGap),
          for (var i = 0; i < 3; i++) ...[
            const AIMSkeleton(shape: AIMSkeletonShape.rect, height: 72),
            const SizedBox(height: AimSpacing.componentGap),
          ],
        ],
      ),
    );
  }
}
