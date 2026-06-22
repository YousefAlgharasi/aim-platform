// Phase 6 — P6-107
// AiTeacherPlaceholderPage — disabled-state placeholder for the AI Teacher feature.
//
// P6-106 created the feature shell. P6-107 replaces the generic stub with a
// proper "disabled / coming soon" layout using AIM Mobile Design System tokens
// and widgets directly.
//
// SHELL RULES (P6-105 / P6-106):
// - No AI provider imports (OpenAI, Anthropic, Gemini, etc.).
// - No AIM Engine calls from Flutter.
// - No conversation state, message history, or chat input.
// - No API keys or credentials.
// - Placeholder UI only — real AI Teacher text mode ships in Phase 8.
//
// RTL/Arabic rules:
// - AIMTopAppBar handles icon mirroring internally.
// - AIMAlertBanner respects ambient Directionality via EdgeInsetsDirectional.
// - No hard-coded LTR alignment or TextDirection.ltr overrides.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Disabled-state placeholder for the AI Teacher tab.
///
/// Shown in Phase 6 while the AI Teacher feature is not yet implemented.
/// Replace with the real AI Teacher page when Phase 8 is executed.
class AiTeacherPlaceholderPage extends StatelessWidget {
  const AiTeacherPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: AIMTopAppBar(title: 'AI Teacher'),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsetsDirectional.fromSTEB(
            AimSpacing.screenPaddingMobile,
            AimSpacing.sectionGap,
            AimSpacing.screenPaddingMobile,
            AimSpacing.sectionGap,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── Info banner ──────────────────────────────────────────────
              AIMAlertBanner(
                tone: AIMAlertTone.info,
                title: 'Coming in a future update',
                child: Text(
                  'AI Teacher is not available yet. '
                  'Your progress data is being prepared so that '
                  'personalised tutoring can begin as soon as '
                  'the feature launches.',
                ),
              ),

              SizedBox(height: AimSpacing.sectionGap),

              // ── Disabled feature card ────────────────────────────────────
              _AiTeacherDisabledCard(),
            ],
          ),
        ),
      ),
    );
  }
}

/// Visual "disabled / locked" card for the AI Teacher feature.
class _AiTeacherDisabledCard extends StatelessWidget {
  const _AiTeacherDisabledCard();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Semantics(
      label: 'AI Teacher — not yet available',
      child: AIMCard(
        variant: AIMCardVariant.elevated,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Lock icon in a rounded container with disabled background
            Container(
              width: AimSizes.iconLg * 3,
              height: AimSizes.iconLg * 3,
              decoration: BoxDecoration(
                color: surfaces.disabledBg,
                borderRadius: AimRadius.borderMd,
                border: Border.all(color: surfaces.disabledBorder),
              ),
              child: Icon(
                Icons.lock_outline_rounded,
                size: AimSizes.iconLg,
                color: surfaces.disabledFg,
              ),
            ),

            const SizedBox(height: AimSpacing.componentGap),

            // "Coming Soon" badge
            const AIMBadge(
              tone: AIMBadgeTone.info,
              variant: AIMBadgeVariant.soft,
              pill: true,
              icon: Icon(Icons.schedule_rounded),
              child: Text('Coming Soon'),
            ),

            const SizedBox(height: AimSpacing.componentGap),

            // Feature title
            Text(
              'AI Teacher',
              style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AimSpacing.innerGap),

            // Description
            Text(
              'Your personalised AI Teacher will guide you through '
              'lessons, answer questions, and adapt to your learning '
              'style in real time. Available in a future phase.',
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AimSpacing.sectionGap),

            // Feature preview list
            _FeaturePreviewItem(
              icon: Icons.auto_awesome_rounded,
              label: 'Personalised lesson explanations',
              surfaces: surfaces,
            ),
            const SizedBox(height: AimSpacing.innerGap),
            _FeaturePreviewItem(
              icon: Icons.record_voice_over_rounded,
              label: 'Voice and text interaction',
              surfaces: surfaces,
            ),
            const SizedBox(height: AimSpacing.innerGap),
            _FeaturePreviewItem(
              icon: Icons.track_changes_rounded,
              label: 'Real-time progress tracking',
              surfaces: surfaces,
            ),
          ],
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
