// Phase 6 — P6-079
// LessonAssetTile — renders a single published lesson asset entry.
//
// Displays asset type, title, and description as returned by the backend.
// Actual media rendering (image/audio/video) is handled by P6-080.
// This tile is a metadata-only entry for the lesson detail page MVP.
//
// Flutter never computes type, status, or order. All values are backend-
// supplied verbatim.
//
// RTL/Arabic: Row is directionality-aware; icon selection is type-based
// but purely decorative. Padding uses symmetric EdgeInsets.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Card entry for a single published lesson asset.
///
/// Media content rendering is deferred to P6-080 (LessonContentRenderer).
class LessonAssetTile extends StatelessWidget {
  const LessonAssetTile({
    required this.asset,
    super.key,
  });

  final LessonAsset asset;

  /// Maps backend asset type to a decorative icon.
  /// Type is backend-supplied verbatim; icon is purely decorative.
  IconData get _icon {
    return switch (asset.type) {
      'image' => Icons.image_outlined,
      'audio' => Icons.headphones_outlined,
      'video' => Icons.play_circle_outlined,
      'document' => Icons.description_outlined,
      'external_reference' => Icons.open_in_new,
      _ => Icons.attachment_outlined,
    };
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.standard,
      semanticLabel:
          AppLocalizations.of(context).lessonsAssetSemantic(asset.type, asset.title),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Asset type icon
          Padding(
            padding: const EdgeInsets.only(top: AimSpacing.space2),
            child: Icon(
              _icon,
              size: AimSizes.iconMd,
              color: AimColors.primary500,
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          // Title and description
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  asset.title,
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (asset.description != null &&
                    asset.description!.isNotEmpty) ...[
                  const SizedBox(height: AimSpacing.space2),
                  Text(
                    asset.description!,
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
