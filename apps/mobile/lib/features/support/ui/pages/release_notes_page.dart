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
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

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
    final l10n = AppLocalizations.of(context);
    final formattedDate = _formatDate(context, publishedAt);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
      ),
      child: Padding(
        padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
        child: AIMCard(
          interactive: onTap != null,
          onTap: onTap,
          semanticLabel:
              l10n.supportReleaseNoteTileSemantic(version, title, formattedDate),
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
                    formattedDate,
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
    final l10n = AppLocalizations.of(context);
    return AIMEmptyState(
      icon: const Icon(Icons.new_releases_outlined),
      title: l10n.supportNoReleaseNotesTitle,
      subtitle: l10n.supportNoReleaseNotesSubtitle,
    );
  }

  static String _formatDate(BuildContext context, DateTime date) {
    return DateFormat.yMMMd(
      Localizations.localeOf(context).toString(),
    ).format(date.toLocal());
  }
}

class _ReleaseNotesHeader extends StatelessWidget {
  const _ReleaseNotesHeader();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
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
              label: l10n.commonBack,
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              l10n.supportReleaseNotesTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
