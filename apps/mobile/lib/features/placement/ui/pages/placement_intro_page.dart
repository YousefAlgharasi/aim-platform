// Design ref: Modern Auth Pages (3)-1 → AssessmentIntroPage.tsx
// Endpoint: none (static screen — no backend call required)
//
// PlacementIntroPage — static explainer screen before [PlacementStartPage].
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Display a gradient hero badge icon + "Placement Test" pill + h1 title.
//   2. Show 3 white info cards: 25 min, 20 adaptive questions, Helpful Tip.
//   3. Show "Assessment Honor Code" note at the bottom of the cards.
//   4. Navigate to [AppRoutePaths.placementStart] on CTA tap.
//
// Security rules:
// - No backend calls are made by this screen.
// - Flutter must not display or compute placement score, CEFR thresholds,
//   skill mastery, weakness map, or initial path.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';

/// Static introduction screen matching the AssessmentIntroPage design.
///
/// Layout:
///   - Light gradient background (indigo-50/white/slate-50)
///   - Hero icon badge with gradient + glow
///   - "Placement Test" pill badge
///   - h1: "Level Assessment"
///   - Subtitle text
///   - 3 white info cards with icons (time, questions, tip)
///   - "Assessment Honor Code" footer note
///   - Primary CTA button: "Start Assessment"
class PlacementIntroPage extends StatelessWidget {
  const PlacementIntroPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(
              AimSpacing.screenPaddingMobile,
              AimSpacing.space32,
              AimSpacing.screenPaddingMobile,
              AimSpacing.space40,
            ),
            children: [
              // ── Hero Icon Badge ──────────────────────────────────────────
              _HeroBadge(),
              const SizedBox(height: AimSpacing.space24),

              // ── "Placement Test" pill ───────────────────────────────────
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.space12,
                      vertical: AimSpacing.space4,
                    ),
                    decoration: BoxDecoration(
                      color: isDark
                          ? AimColors.primary500.withValues(alpha: 0.18)
                          : const Color(0xFFEEF2FF),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      'Placement Test',
                      style: AimTextStyles.caption.copyWith(
                        color: AimColors.primary600,
                        fontWeight: AimFontWeights.extrabold,
                        letterSpacing: 0.6,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AimSpacing.space8),

              // ── Title ────────────────────────────────────────────────────
              Text(
                'Level Assessment',
                style: AimTextStyles.h1.copyWith(
                  color: surfaces.textPrimary,
                  fontSize: 28,
                  height: 1.15,
                ),
              ),
              const SizedBox(height: AimSpacing.space8),

              // ── Subtitle ─────────────────────────────────────────────────
              Text(
                'Calibrate your AI tutor to find your optimal starting point.',
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: AimSpacing.sectionGap),

              // ── Info Cards ───────────────────────────────────────────────
              const _InfoCard(
                icon: Icons.timer_outlined,
                iconColor: AimColors.primary500,
                title: '25 Minutes',
                subtitle:
                    'Estimated duration for a full calibrated assessment.',
              ),
              const SizedBox(height: AimSpacing.componentGap),
              const _InfoCard(
                icon: Icons.assignment_outlined,
                iconColor: AimColors.primary500,
                title: '20 Adaptive Questions',
                subtitle: 'Questions dynamically adapt to your skill level.',
              ),
              const SizedBox(height: AimSpacing.componentGap),
              const _InfoCard(
                icon: Icons.lightbulb_outline_rounded,
                iconColor: Color(0xFFF59E0B),
                title: 'Helpful Tip',
                subtitle:
                    "If you don't know an answer, it is okay to skip and let the AI adjust.",
              ),
              const SizedBox(height: AimSpacing.space20),

              // ── Honor Code note ──────────────────────────────────────────
              Center(
                child: Text.rich(
                  TextSpan(
                    text: 'By starting, you agree to our ',
                    style: AimTextStyles.caption.copyWith(
                      color: surfaces.textMuted,
                    ),
                    children: [
                      WidgetSpan(
                        child: GestureDetector(
                          onTap: () {},
                          child: Text(
                            'Assessment Honor Code',
                            style: AimTextStyles.caption.copyWith(
                              color: AimColors.primary500,
                              fontWeight: AimFontWeights.semibold,
                              decoration: TextDecoration.underline,
                              decorationColor: AimColors.primary500,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: AimSpacing.space32),

              // ── CTA Button ───────────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: AimSizes.buttonLg,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: AimGradients.gzHero,
                    borderRadius: AimRadius.borderMd,
                    boxShadow: [
                      BoxShadow(
                        color: AimColors.primary500.withValues(alpha: 0.25),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    borderRadius: AimRadius.borderMd,
                    child: InkWell(
                      onTap: () => context.push(AppRoutePaths.placementStart),
                      borderRadius: AimRadius.borderMd,
                      child: Center(
                        child: Text(
                          'Start Assessment',
                          style: AimTextStyles.button.copyWith(
                            color: AimColors.neutral0,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Hero Badge ──────────────────────────────────────────────────────────────

class _HeroBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 70,
          height: 70,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              // Outer glow
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Container(
                    margin: const EdgeInsets.all(-6),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(26),
                      boxShadow: [
                        BoxShadow(
                          color:
                              const Color(0xFF6366F1).withValues(alpha: 0.35),
                          blurRadius: 16,
                          spreadRadius: 0,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              // Badge itself
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  gradient: AimGradients.gzHero,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFF818CF8).withValues(alpha: 0.3),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AimColors.primary500.withValues(alpha: 0.25),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(
                    Icons.assignment_turned_in_outlined,
                    size: 32,
                    color: AimColors.neutral0,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Info Card ───────────────────────────────────────────────────────────────

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Container(
      padding: const EdgeInsets.all(AimSpacing.space16),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: AimRadius.borderLg,
        border: Border.all(color: surfaces.border),
        boxShadow: [
          BoxShadow(
            color: AimColors.neutral900.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon container
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.09),
              borderRadius: AimRadius.borderMd,
            ),
            child: Center(
              child: Icon(icon, size: AimSizes.iconMd, color: iconColor),
            ),
          ),
          const SizedBox(width: AimSpacing.space12),
          // Text
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: AimFontWeights.bold,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  subtitle,
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textSecondary,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
