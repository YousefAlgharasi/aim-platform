// Phase 6 — P6-113
// NotificationsPlaceholderPage — design system placeholder for the
// Notifications feature.
//
// P6-112 created the feature skeleton with a generic stub. P6-113 replaces it
// with a proper "coming soon" layout using AIM Mobile Design System tokens and
// widgets directly.
//
// Backend authority:
// - Notification delivery, read/unread state, push token registration, and
//   badge counts are backend-owned. Flutter NEVER computes these locally.
//
// RTL/Arabic rules:
// - AIMTopAppBar handles icon mirroring internally.
// - AIMAlertBanner and AIMCard respect ambient Directionality.
// - EdgeInsetsDirectional used for asymmetric padding — RTL-safe.
// - No hard-coded LTR alignment or TextDirection.ltr overrides.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Design system placeholder for the Notifications tab.
///
/// Shown in Phase 6 while the Notifications feature is not yet implemented.
/// Replace with the real Notifications page when the feature is built.
class NotificationsPlaceholderPage extends StatelessWidget {
  const NotificationsPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Notifications'),
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
              const AIMAlertBanner(
                tone: AIMAlertTone.info,
                title: 'Coming in a future update',
                child: Text(
                  'Notifications are not available yet. '
                  'Keep learning — session reminders and progress '
                  'updates will appear here when this feature launches.',
                ),
              ),

              const SizedBox(height: AimSpacing.sectionGap),

              AIMCard(
                variant: AIMCardVariant.elevated,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.notifications_rounded,
                      size: 48,
                      color: surfaces.disabledFg,
                      semanticLabel: 'Notifications bell icon',
                    ),

                    const SizedBox(height: AimSpacing.componentGap),

                    const AIMBadge(
                      tone: AIMBadgeTone.neutral,
                      variant: AIMBadgeVariant.soft,
                      pill: true,
                      icon: Icon(Icons.schedule_rounded),
                      child: Text('Coming Soon'),
                    ),

                    const SizedBox(height: AimSpacing.componentGap),

                    Text(
                      'Notifications',
                      style: AimTextStyles.h2.copyWith(
                        color: surfaces.textPrimary,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: AimSpacing.innerGap),

                    Text(
                      'Stay on track with session reminders, skill '
                      'progress updates, and AIM recommendations. '
                      'All notification logic is managed by the backend.',
                      style: AimTextStyles.bodyMd.copyWith(
                        color: surfaces.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: AimSpacing.sectionGap),

                    _FeaturePreviewItem(
                      icon: Icons.access_alarm_rounded,
                      label: 'Session reminders',
                      surfaces: surfaces,
                    ),
                    const SizedBox(height: AimSpacing.innerGap),
                    _FeaturePreviewItem(
                      icon: Icons.trending_up_rounded,
                      label: 'Skill progress updates',
                      surfaces: surfaces,
                    ),
                    const SizedBox(height: AimSpacing.innerGap),
                    _FeaturePreviewItem(
                      icon: Icons.lightbulb_outline_rounded,
                      label: 'AIM recommendations',
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
