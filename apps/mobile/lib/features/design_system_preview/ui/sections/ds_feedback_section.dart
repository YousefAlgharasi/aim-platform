import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../../l10n/app_localizations.dart';
import '../widgets/ds_section.dart';

class DSFeedbackSection extends StatelessWidget {
  const DSFeedbackSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Alert banners
        DSSection(
          title: l10n.dsPreviewSectionAlertBanners,
          children: [
            AIMAlertBanner(
              tone: AIMAlertTone.info,
              title: l10n.dsPreviewWordInformation,
              child: Text(l10n.dsPreviewAlertInfoBody),
            ),
            AIMAlertBanner(
              tone: AIMAlertTone.success,
              title: l10n.dsPreviewWordSuccess,
              child: Text(l10n.dsPreviewAlertSuccessBody),
            ),
            AIMAlertBanner(
              tone: AIMAlertTone.warning,
              title: l10n.dsPreviewWordWarning,
              child: Text(l10n.dsPreviewAlertWarningBody),
            ),
            AIMAlertBanner(
              tone: AIMAlertTone.error,
              title: l10n.dsPreviewWordError,
              child: Text(l10n.dsPreviewAlertErrorBody),
            ),
            AIMAlertBanner(
              tone: AIMAlertTone.info,
              dismissible: true,
              onDismiss: () {},
              child: Text(l10n.dsPreviewAlertDismissibleBody),
            ),
          ],
        ),
        // Badges
        DSSection(
          title: l10n.dsPreviewSectionBadges,
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
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                AIMBadge(
                  tone: AIMBadgeTone.primary,
                  variant: AIMBadgeVariant.solid,
                  child: Text(l10n.dsPreviewBadgeSolid),
                ),
                AIMBadge(
                  tone: AIMBadgeTone.primary,
                  variant: AIMBadgeVariant.outline,
                  child: Text(l10n.dsPreviewWordOutline),
                ),
                AIMBadge(
                  tone: AIMBadgeTone.success,
                  pill: true,
                  dot: true,
                  child: Text(l10n.dsPreviewBadgePillDot),
                ),
                AIMBadge(
                  tone: AIMBadgeTone.secondary,
                  icon: const Icon(Icons.star_rounded, size: 12),
                  child: Text(l10n.dsPreviewWithIcon),
                ),
              ],
            ),
          ],
        ),
        // Chips
        DSSection(
          title: l10n.dsPreviewSectionChips,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                AIMChip(
                  onPressed: () {},
                  child: Text(l10n.dsPreviewStateDefault),
                ),
                AIMChip(
                  selected: true,
                  onPressed: () {},
                  child: Text(l10n.dsPreviewStateSelected),
                ),
                AIMChip(
                  icon: const Icon(Icons.bookmark_outline, size: 14),
                  onPressed: () {},
                  child: Text(l10n.dsPreviewWithIcon),
                ),
                AIMChip(
                  removable: true,
                  onPressed: () {},
                  onRemove: () {},
                  child: Text(l10n.dsPreviewChipRemovable),
                ),
                AIMChip(
                  disabled: true,
                  child: Text(l10n.dsPreviewStateDisabled),
                ),
              ],
            ),
          ],
        ),
        // Skeleton
        DSSection(
          title: l10n.dsPreviewSectionSkeletonLoaders,
          children: const [
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
