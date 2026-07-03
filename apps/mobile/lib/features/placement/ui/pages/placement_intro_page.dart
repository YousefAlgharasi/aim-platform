// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Placement intro"
//   docs/design/ui-for-all-system-mobile/screenshots/light/18-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/18-screen.png
//   NOTE: the screenshot is a literal pre-implementation stub ("Placement
//   Intro — Coming soon — Preview start screen"), not a final design — see
//   TASK_LIST.md row 18. This screen instead follows its own documented
//   responsibility below (gradient header + static info + Start CTA).
// Endpoint: none (static screen — no backend call required)
// Widgets: AIMGradientButton
//
// PlacementIntroPage — static explainer screen before [PlacementStartPage].
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Display a gradient hero header with the screen title and subtitle.
//   2. Show static info rows: 3 sections, ~15 min.
//   3. Navigate to [AppRoutePaths.placementStart] on CTA tap.
//
// Security rules:
// - No backend calls are made by this screen.
// - Flutter must not display or compute placement score, CEFR thresholds,
//   skill mastery, weakness map, or initial path.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Static introduction screen shown before [PlacementStartPage].
///
/// Design system: all colours, typography, spacing, and interactive widgets
/// use AIM Mobile Design System tokens. No hard-coded values.
///
/// RTL/Arabic: no [TextDirection] is hard-coded. [EdgeInsetsDirectional] and
/// [AlignmentDirectional] are used throughout so the layout mirrors correctly.
class PlacementIntroPage extends StatelessWidget {
  const PlacementIntroPage({super.key});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final loc = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _IntroHeader(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsetsDirectional.all(
                AimSpacing.screenPaddingMobile,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _InfoRow(
                    icon: Icons.layers_outlined,
                    label: loc.placementSectionsLabel,
                    value: loc.placementSectionsValue(3),
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  _InfoRow(
                    icon: Icons.timer_outlined,
                    label: loc.placementEstimatedTimeLabel,
                    value: loc.placementEstimatedTimeValue(15),
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  Container(
                    padding:
                        const EdgeInsetsDirectional.all(AimSpacing.space12),
                    decoration: BoxDecoration(
                      color: surfaces.surfaceSunken,
                      borderRadius: AimRadius.borderSm,
                    ),
                    child: Text(
                      loc.placementBackendNote,
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  AIMGradientButton(
                    label: loc.commonStart,
                    gradient: AimGradients.gzHero,
                    fullWidth: true,
                    semanticLabel: loc.placementStartTestSemantic,
                    onPressed: () =>
                        context.push(AppRoutePaths.placementStart),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Gradient header
// ---------------------------------------------------------------------------

class _IntroHeader extends StatelessWidget {
  const _IntroHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.sectionGap,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Semantics(
              button: true,
              label: AppLocalizations.of(context).commonBack,
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
                    padding: const EdgeInsets.all(AimSpacing.space12),
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
            const SizedBox(height: AimSpacing.componentGap),
            Text(
              AppLocalizations.of(context).placementIntroHeaderTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              AppLocalizations.of(context).placementIntroHeaderSubtitle,
              style: AimTextStyles.bodySm.copyWith(
                color: AimColors.neutral0.withValues(alpha: 0.85),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Info row
// ---------------------------------------------------------------------------

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Row(
      children: [
        Icon(icon, size: AimSizes.iconMd, color: AimColors.primary500),
        const SizedBox(width: AimSpacing.space12),
        Text(
          label,
          style: AimTextStyles.bodyMd.copyWith(
            color: surfaces.textSecondary,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: AimTextStyles.bodyMd.copyWith(
            color: surfaces.textPrimary,
            fontWeight: AimFontWeights.semibold,
          ),
        ),
      ],
    );
  }
}
