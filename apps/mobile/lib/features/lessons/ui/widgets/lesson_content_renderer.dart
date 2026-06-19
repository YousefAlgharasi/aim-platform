// Phase 6 — P6-080
// LessonContentRenderer — safe content renderer for published lesson assets.
//
// Renders each asset type using only Flutter built-in widgets (no third-party
// media packages). The renderer is defensive and safe:
//
//   image           → Image.network with loading/error fallback
//   audio           → non-playback info card (no audio package available)
//   video           → non-playback info card (no video package available)
//   document        → description card with optional external link indicator
//   external_reference → link-out info card
//   unknown         → unsupported asset fallback card
//
// Security rules:
// - All asset values (type, url, title, altText) are backend-supplied verbatim.
// - Flutter never constructs, rewrites, or appends query params to asset URLs.
// - Image.network uses the backend-supplied url directly; no URL manipulation.
// - altText is used as semanticLabel when provided; Flutter never generates it.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.
//
// RTL/Arabic rules:
// - Column/Row layouts are Directionality-aware.
// - Text widgets respect ambient directionality.
// - EdgeInsets.symmetric mirrors under RTL.
// - Icon placement is RTL-safe (no explicit directional icons that require
//   mirroring beyond what Flutter handles automatically).

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';

/// Renders a single published [LessonAsset] using safe built-in widgets.
///
/// All content is sourced verbatim from the backend. No media values are
/// computed or modified by Flutter.
class LessonContentRenderer extends StatelessWidget {
  const LessonContentRenderer({
    required this.asset,
    super.key,
  });

  final LessonAsset asset;

  @override
  Widget build(BuildContext context) {
    return switch (asset.type) {
      'image' => _ImageRenderer(asset: asset),
      'audio' => _AudioInfoCard(asset: asset),
      'video' => _VideoInfoCard(asset: asset),
      'document' => _DocumentCard(asset: asset),
      'external_reference' => _ExternalReferenceCard(asset: asset),
      _ => _UnsupportedAssetCard(asset: asset),
    };
  }
}

// ---------------------------------------------------------------------------
// Image renderer
// ---------------------------------------------------------------------------

class _ImageRenderer extends StatelessWidget {
  const _ImageRenderer({required this.asset});
  final LessonAsset asset;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    // url is required for image assets (enforced by backend P3-013).
    // If missing (defensive), show error card instead of crashing.
    if (asset.url == null || asset.url!.isEmpty) {
      return _AssetErrorCard(
        message: 'Image URL is missing for asset: ${asset.title}',
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          asset.title,
          style: AimTextStyles.label.copyWith(color: surfaces.textPrimary),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: AimSpacing.space8),
        ClipRRect(
          borderRadius: AimRadius.borderLg,
          child: Image.network(
            // Backend-supplied URL; never constructed or modified by Flutter.
            asset.url!,
            semanticLabel:
                asset.altText ?? asset.title, // altText is backend-supplied
            fit: BoxFit.contain,
            loadingBuilder: (context, child, progress) {
              if (progress == null) return child;
              return Container(
                height: 200,
                color: surfaces.surfaceSunken,
                alignment: Alignment.center,
                child: CircularProgressIndicator(
                  value: progress.expectedTotalBytes != null
                      ? progress.cumulativeBytesLoaded /
                          progress.expectedTotalBytes!
                      : null,
                  color: AimColors.primary500,
                ),
              );
            },
            errorBuilder: (context, error, stackTrace) {
              return _AssetErrorCard(
                message: 'Failed to load image: ${asset.title}',
              );
            },
          ),
        ),
        if (asset.description != null && asset.description!.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.space8),
          Text(
            asset.description!,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.start,
          ),
        ],
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Audio info card (no playback — package not available)
// ---------------------------------------------------------------------------

class _AudioInfoCard extends StatelessWidget {
  const _AudioInfoCard({required this.asset});
  final LessonAsset asset;

  @override
  Widget build(BuildContext context) {
    return _MediaInfoCard(
      icon: Icons.headphones_outlined,
      asset: asset,
      subtitleSuffix: asset.durationSeconds != null
          ? _formatDuration(asset.durationSeconds!)
          : null,
    );
  }
}

// ---------------------------------------------------------------------------
// Video info card (no playback — package not available)
// ---------------------------------------------------------------------------

class _VideoInfoCard extends StatelessWidget {
  const _VideoInfoCard({required this.asset});
  final LessonAsset asset;

  @override
  Widget build(BuildContext context) {
    return _MediaInfoCard(
      icon: Icons.play_circle_outlined,
      asset: asset,
      subtitleSuffix: asset.durationSeconds != null
          ? _formatDuration(asset.durationSeconds!)
          : null,
    );
  }
}

// ---------------------------------------------------------------------------
// Document card
// ---------------------------------------------------------------------------

class _DocumentCard extends StatelessWidget {
  const _DocumentCard({required this.asset});
  final LessonAsset asset;

  @override
  Widget build(BuildContext context) {
    return _MediaInfoCard(
      icon: Icons.description_outlined,
      asset: asset,
    );
  }
}

// ---------------------------------------------------------------------------
// External reference card
// ---------------------------------------------------------------------------

class _ExternalReferenceCard extends StatelessWidget {
  const _ExternalReferenceCard({required this.asset});
  final LessonAsset asset;

  @override
  Widget build(BuildContext context) {
    return _MediaInfoCard(
      icon: Icons.open_in_new,
      asset: asset,
    );
  }
}

// ---------------------------------------------------------------------------
// Unsupported asset fallback
// ---------------------------------------------------------------------------

class _UnsupportedAssetCard extends StatelessWidget {
  const _UnsupportedAssetCard({required this.asset});
  final LessonAsset asset;

  @override
  Widget build(BuildContext context) {
    return _MediaInfoCard(
      icon: Icons.attachment_outlined,
      asset: asset,
    );
  }
}

// ---------------------------------------------------------------------------
// Shared media info card (audio / video / document / external / unsupported)
// ---------------------------------------------------------------------------

class _MediaInfoCard extends StatelessWidget {
  const _MediaInfoCard({
    required this.icon,
    required this.asset,
    this.subtitleSuffix,
  });

  final IconData icon;
  final LessonAsset asset;
  final String? subtitleSuffix;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.standard,
      semanticLabel: '${asset.type} asset: ${asset.title}',
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: AimSizes.iconLg, color: AimColors.primary500),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  asset.title,
                  style:
                      AimTextStyles.label.copyWith(color: surfaces.textPrimary),
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
                if (subtitleSuffix != null) ...[
                  const SizedBox(height: AimSpacing.space2),
                  Text(
                    subtitleSuffix!,
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
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

// ---------------------------------------------------------------------------
// Error card
// ---------------------------------------------------------------------------

class _AssetErrorCard extends StatelessWidget {
  const _AssetErrorCard({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      variant: AIMCardVariant.standard,
      child: Row(
        children: [
          const Icon(Icons.error_outline,
              size: AimSizes.iconMd, color: AimColors.error500),
          const SizedBox(width: AimSpacing.innerGap),
          Expanded(
            child: Text(
              message,
              style: AimTextStyles.bodySm.copyWith(color: AimColors.error600),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/// Formats backend-supplied durationSeconds as mm:ss display string.
/// Value is backend-supplied; Flutter never computes duration.
String _formatDuration(int seconds) {
  final m = seconds ~/ 60;
  final s = seconds % 60;
  return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
}
