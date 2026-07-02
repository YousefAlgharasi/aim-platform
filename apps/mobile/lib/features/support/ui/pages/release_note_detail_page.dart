// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Release note" (57)
//   docs/design/ui-for-all-system-mobile/screenshots/light/57-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/57-screen.png
//
// Displays a single release note's full detail.
//
// Shows version, title, and body content.
// RTL/Arabic ready via Directionality-aware layout.
//
// TASK-38: restyled to match design screen 57 — gradient header ("Release
// note"), version label, "Released <date>" subtitle, and the body content
// rendered as intro paragraph(s) plus a bullet list. Lines in the real
// `body` field that start with "-"/"*"/"•" render as bullets; everything
// else renders as plain paragraph text — a display-only parse of the real
// content, never invented copy.
//
// Note: GET /release-notes/:id is "Planned / Not Yet Active" and
// SupportDatasource has no concrete implementation (out of scope for this
// UI-only verification task). The body previously showed a permanent
// CircularProgressIndicator that never resolved — a real bug. It now shows
// a graceful "not available yet" empty state instead.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

class ReleaseNoteDetailPage extends StatelessWidget {
  final String noteId;

  const ReleaseNoteDetailPage({super.key, required this.noteId});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    // Release note loaded from backend via GET /release-notes/:id
    return Scaffold(
      backgroundColor: surfaces.background,
      body: const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _ReleaseNoteDetailHeader(),
          Expanded(
            child: AIMEmptyState(
              icon: Icon(Icons.new_releases_outlined),
              title: 'Release note is not available yet',
              subtitle: 'This release note will appear here once release '
                  'notes are live.',
            ),
          ),
        ],
      ),
    );
  }

  /// Builds the release note detail view with version badge, title, and body.
  static Widget buildNoteDetail({
    required BuildContext context,
    required String version,
    required String title,
    required String body,
    required DateTime publishedAt,
  }) {
    final surfaces = aimSurfacesOf(context);
    final (paragraphs, bullets) = _parseBody(body);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            version,
            style: AimTextStyles.label.copyWith(color: AimColors.primary500),
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            title,
            style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            'Released ${_formatDate(publishedAt)}',
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          for (final paragraph in paragraphs)
            Padding(
              padding: const EdgeInsets.only(bottom: AimSpacing.space8),
              child: Text(
                paragraph,
                style: AimTextStyles.bodyMd
                    .copyWith(color: surfaces.textSecondary),
              ),
            ),
          if (bullets.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.space4),
            for (final bullet in bullets)
              Padding(
                padding: const EdgeInsets.only(bottom: AimSpacing.space8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(
                        top: AimSpacing.space8,
                        right: AimSpacing.space8,
                      ),
                      child: Container(
                        width: AimSpacing.space4,
                        height: AimSpacing.space4,
                        decoration: const BoxDecoration(
                          color: AimColors.primary500,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Text(
                        bullet,
                        style: AimTextStyles.bodyMd
                            .copyWith(color: surfaces.textPrimary),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ],
      ),
    );
  }

  /// Splits real body text into intro paragraphs and bullet lines.
  static (List<String>, List<String>) _parseBody(String body) {
    final lines = body.split('\n').map((l) => l.trim()).where((l) => l.isNotEmpty);
    final paragraphs = <String>[];
    final bullets = <String>[];
    for (final line in lines) {
      if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
        bullets.add(line.replaceFirst(RegExp(r'^[-*•]\s*'), ''));
      } else {
        paragraphs.add(line);
      }
    }
    return (paragraphs, bullets);
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

class _ReleaseNoteDetailHeader extends StatelessWidget {
  const _ReleaseNoteDetailHeader();

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
              'Release note',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
