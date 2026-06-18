// Phase 6 — P6-111
// AchievementsPlaceholderPage — disabled-state placeholder for the
// Achievements feature.
//
// P6-110 created the feature skeleton. P6-111 replaces the generic stub with
// a proper "coming soon" layout using AIM Mobile Design System tokens and
// widgets directly.
//
// Backend authority:
// - Achievement unlocking, badge criteria, XP, streaks, and milestone
//   tracking are backend-owned. Flutter NEVER computes these locally.
//
// RTL/Arabic rules:
// - AIMTopAppBar handles icon mirroring internally.
// - AIMAlertBanner and AIMCard respect ambient Directionality.
// - EdgeInsetsDirectional used for asymmetric padding — RTL-safe.
// - No hard-coded LTR alignment or TextDirection.ltr overrides.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Disabled-state placeholder for the Achievements tab.
///
/// Shown in Phase 6 while the Achievements feature is not yet implemented.
/// Replace with the real Achievements page when the feature is built.
class AchievementsPlaceholderPage extends StatelessWidget {
  const AchievementsPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Achievements'),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsetsDirectional.fromSTEB(
            AimSpacing.screenPaddingMobile,
            AimSpacing.sectionGap,
            AimSpacing.screenPaddingMobile,
            AimSpacing.sectionGap,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── Info banner ──────────────────────────────────────────────
              const AIMAlertBanner(
                tone: AIMAlertTone.info,
                title: 'Coming in a future update',
                child: Text(
                  'Achievements are not available yet. '
                  'Keep learning to build the progress that will '
                  'unlock badges and milestones when this feature launches.',
                ),
              ),

              const SizedBox(height: AimSpacing.sectionGap),

              // ── Disabled feature card ────────────────────────────────────
              AIMCard(
                variant: AIMCardVariant.elevated,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Icon
                    Icon(
                      Icons.emoji_events_rounded,
                      size: 48,
                      color: surfaces.disabledFg,
                      semanticLabel: 'Achievements trophy icon',
                    ),

                    const SizedBox(height: AimSpacing.componentGap),

                    // Badge
                    AIMBadge(
                      tone: AIMBadgeTone.neutral,
                      variant: AIMBadgeVariant.soft,
                      pill: true,
                      icon: const Icon(Icons.schedule_rounded),
                      child: const Text('Coming Soon'),
                    ),

                    const SizedBox(height: AimSpacing.componentGap),

                    // Title
                    Text(
                      'Achievements',
                      style: AimTextStyles.h2.copyWith(
                        color: surfaces.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: AimSpacing.innerGap),

                    // Description
                    Text(
                      'Earn badges for completing lessons, maintaining '
                      'streaks, and reaching learning milestones. '
                      'All progress is tracked by the backend.',
                      style: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: AimSpacing.sectionGap),

                    // Feature preview list
                    _FeaturePreviewItem(
                      icon: Icons.military_tech_rounded,
                      label: 'Skill mastery badges',
                      surfaces: surfaces,
                    ),
                    const SizedBox(height: AimSpacing.innerGap),
                    _FeaturePreviewItem(
                      icon: Icons.local_fire_department_rounded,
                      label: 'Daily streak rewards',
                      surfaces: surfaces,
                    ),
                    const SizedBox(height: AimSpacing.innerGap),
                    _FeaturePreviewItem(
                      icon: Icons.star_rounded,
                      label: 'Milestone celebrations',
                      surfaces: surfaces,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Single row in the "coming soon" feature preview list.
class _FeaturePreviewItem extends StatelessWidget {
  const _FeaturePreviewItem({
    required this.icon,
    required this.label,
    required this.surfaces,
    super.key,
  });

  final IconData icon;
  final String label;
  final AimSurfaceTheme surfaces;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: AimSizes.iconMd, color: surfaces.disabledFg),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: Text(
            label,
            style: AimTextStyles.bodySm.copyWith(
              color: surfaces.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}
