// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Release notes" (56)
//   docs/design/ui-for-all-system-mobile/screenshots/light/56-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/56-screen.png
//
// Lists published release notes from backend.
//
// Fetches from GET /release-notes and displays as a scrollable list.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-38: restyled to match design screen 56 — gradient header ("Release
// notes"), cards with a version pill, date, title, and a short excerpt of
// the real `body` content (ReleaseNote has no separate summary field —
// see support_models.dart — so the excerpt is the real body, truncated).
//
// Note: GET /release-notes is "Planned / Not Yet Active" and
// SupportDatasource has no concrete implementation (out of scope for this
// UI-only verification task). The body previously showed a permanent
// CircularProgressIndicator that never resolved — a real bug. It now shows
// a graceful "not available yet" empty state instead.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

class ReleaseNotesPage extends StatelessWidget {
  const ReleaseNotesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    // Release notes loaded from backend via GET /release-notes
    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _ReleaseNotesHeader(),
          Expanded(child: buildEmptyState(context)),
        ],
      ),
    );
  }

  /// Builds a single release note list item.
  static Widget buildReleaseNoteTile({
    required BuildContext context,
    required String version,
    required String title,
    required DateTime publishedAt,
    String? excerpt,
    VoidCallback? onTap,
  }) {
    final surfaces = aimSurfacesOf(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
      ),
      child: Padding(
        padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
        child: AIMCard(
          interactive: onTap != null,
          onTap: onTap,
          semanticLabel: '$version, $title, ${_formatDate(publishedAt)}',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    version,
                    style: AimTextStyles.label
                        .copyWith(color: AimColors.primary500),
                  ),
                  const SizedBox(width: AimSpacing.space8),
                  Text(
                    _formatDate(publishedAt),
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                  ),
                ],
              ),
              const SizedBox(height: AimSpacing.space4),
              Text(
                title,
                style: AimTextStyles.title
                    .copyWith(color: surfaces.textPrimary),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (excerpt != null && excerpt.isNotEmpty) ...[
                const SizedBox(height: AimSpacing.space4),
                Text(
                  excerpt,
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  /// Builds an empty state when no release notes exist.
  static Widget buildEmptyState(BuildContext context) {
    return const AIMEmptyState(
      icon: Icon(Icons.new_releases_outlined),
      title: 'No Release Notes',
      subtitle: 'Release notes will appear here when published.',
    );
  }

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  static String _formatDate(DateTime date) {
    final local = date.toLocal();
    return '${_months[local.month - 1]} ${local.day}, ${local.year}';
  }
}

class _ReleaseNotesHeader extends StatelessWidget {
  const _ReleaseNotesHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              'Release notes',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
