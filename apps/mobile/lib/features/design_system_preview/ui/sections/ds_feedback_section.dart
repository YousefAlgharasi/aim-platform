import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../widgets/ds_section.dart';

class DSFeedbackSection extends StatelessWidget {
  const DSFeedbackSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Alert banners
        DSSection(
          title: 'Alert Banners',
          children: [
            const AIMAlertBanner(
              tone: AIMAlertTone.info,
              title: 'Information',
              child: Text('This is an informational message.'),
            ),
            const AIMAlertBanner(
              tone: AIMAlertTone.success,
              title: 'Success',
              child: Text('Your answer was correct!'),
            ),
            const AIMAlertBanner(
              tone: AIMAlertTone.warning,
              title: 'Warning',
              child: Text('Your session expires in 5 minutes.'),
            ),
            const AIMAlertBanner(
              tone: AIMAlertTone.error,
              title: 'Error',
              child: Text('Could not save your progress.'),
            ),
            AIMAlertBanner(
              tone: AIMAlertTone.info,
              dismissible: true,
              onDismiss: () {},
              child: const Text('Dismissible banner without title.'),
            ),
          ],
        ),
        // Badges
        DSSection(
          title: 'Badges',
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final tone in AIMBadgeTone.values)
                  AIMBadge(
                    tone: tone,
                    child: Text(tone.name),
                  ),
              ],
            ),
            const Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                AIMBadge(
                  tone: AIMBadgeTone.primary,
                  variant: AIMBadgeVariant.solid,
                  child: Text('Solid'),
                ),
                AIMBadge(
                  tone: AIMBadgeTone.primary,
                  variant: AIMBadgeVariant.outline,
                  child: Text('Outline'),
                ),
                AIMBadge(
                  tone: AIMBadgeTone.success,
                  pill: true,
                  dot: true,
                  child: Text('Pill + dot'),
                ),
                AIMBadge(
                  tone: AIMBadgeTone.secondary,
                  icon: Icon(Icons.star_rounded, size: 12),
                  child: Text('With icon'),
                ),
              ],
            ),
          ],
        ),
        // Chips
        DSSection(
          title: 'Chips',
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                AIMChip(
                  onPressed: () {},
                  child: const Text('Default'),
                ),
                AIMChip(
                  selected: true,
                  onPressed: () {},
                  child: const Text('Selected'),
                ),
                AIMChip(
                  icon: const Icon(Icons.bookmark_outline, size: 14),
                  onPressed: () {},
                  child: const Text('With icon'),
                ),
                AIMChip(
                  removable: true,
                  onPressed: () {},
                  onRemove: () {},
                  child: const Text('Removable'),
                ),
                const AIMChip(
                  disabled: true,
                  child: Text('Disabled'),
                ),
              ],
            ),
          ],
        ),
        // Skeleton
        const DSSection(
          title: 'Skeleton Loaders',
          children: [
            AIMSkeleton(width: double.infinity, height: 20),
            AIMSkeleton(width: 200, height: 20),
            AIMSkeleton(width: 120, height: 20),
            Row(
              children: [
                AIMSkeleton(
                  width: 48,
                  height: 48,
                  shape: AIMSkeletonShape.circle,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    children: [
                      AIMSkeleton(width: double.infinity, height: 16),
                      SizedBox(height: 6),
                      AIMSkeleton(width: double.infinity, height: 12),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
