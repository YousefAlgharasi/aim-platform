// Phase 4 — P4-065
// PlacementStartPage — student-facing placement start screen.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → placementStart
//   docs/design/ui-for-all-system-mobile/screenshots/light/19-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/19-screen.png
// Endpoints: GET /placement/active, GET /placement/active/sections,
//   POST /placement/attempts
// Widgets: AIMGradientButton, AIMFullScreenLoading, AIMFullScreenError
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Load the active placement test (+ its sections, for the preview list)
//      on mount.
//   2. Display test info (title, sections, estimated time) and a "SECTIONS"
//      preview list.
//   3. Let the student start the attempt via a single "Start" button.
//   4. Navigate to the section page once the attempt is created (P4-066).
//
// Security rules:
// - Displays only data returned from the backend via placementStartProvider.
// - estimatedLevel, scores, and mastery values are never shown or computed here.
// - Per-section duration is a cosmetic client-side pacing estimate derived
//   from totalQuestions (see placement_skill_display.dart) — never a scored
//   or backend value.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/data/models/placement_section_model.dart';
import 'package:aim_mobile/features/placement/data/models/placement_test_model.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_start_notifier.dart';
import 'package:aim_mobile/features/placement/ui/widgets/placement_skill_display.dart';

class PlacementStartPage extends ConsumerStatefulWidget {
  const PlacementStartPage({super.key});

  @override
  ConsumerState<PlacementStartPage> createState() => _PlacementStartPageState();
}

class _PlacementStartPageState extends ConsumerState<PlacementStartPage> {
  @override
  void initState() {
    super.initState();
    // Load active test after first frame so the provider is ready.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      ref.read(placementStartProvider.notifier).loadActivePlacementTest(token);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementStartProvider);
    final surfaces = aimSurfacesOf(context);

    // Navigate once attempt is started — handle in listener to avoid
    // mid-build navigation.
    ref.listen<PlacementStartState>(placementStartProvider, (_, next) {
      if (next is PlacementStarted && context.mounted) {
        Navigator.of(context).pushNamed(
          AppRoutePaths.placementSection,
          arguments: {
            'attemptId': next.attempt.id,
            'testId': next.test.id,
          },
        );
      }
    });

    return Scaffold(
      backgroundColor: surfaces.background,
      body: switch (state) {
        PlacementStartIdle() || PlacementStartLoading() => Column(
            children: [
              const _GradientTopBar(title: 'Placement Test'),
              const Expanded(child: AIMFullScreenLoading()),
            ],
          ),
        PlacementStartError(:final message) => Column(
            children: [
              const _GradientTopBar(title: 'Placement Test'),
              Expanded(
                child: AIMFullScreenError(
                  message: message,
                  retryLabel: 'Retry',
                  onRetry: () {
                    final token = ref.read(authFlowProvider).accessToken ?? '';
                    ref
                        .read(placementStartProvider.notifier)
                        .loadActivePlacementTest(token);
                  },
                ),
              ),
            ],
          ),
        PlacementStartReady(:final test, :final sections) => _ReadyBody(
            test: test,
            sections: sections,
            onStart: () {
              final token = ref.read(authFlowProvider).accessToken ?? '';
              ref.read(placementStartProvider.notifier).startAttempt(token);
            },
          ),
        PlacementStarted() => Column(
            children: [
              const _GradientTopBar(title: 'Placement Test'),
              const Expanded(child: AIMFullScreenLoading()),
            ],
          ),
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Gradient top bar — back chevron + title, matches the mockup's hero bar.
// ---------------------------------------------------------------------------

class _GradientTopBar extends StatelessWidget {
  const _GradientTopBar({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    // Without this, the OS paints its default status bar background above
    // the gradient instead of light icons sitting transparently on it.
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Container(
        width: double.infinity,
        decoration: const BoxDecoration(gradient: AimGradients.gzHero),
        child: SafeArea(
          bottom: false,
          child: SizedBox(
            height: AimSizes.topBarHeight,
            child: Row(
              children: [
                const SizedBox(width: AimSpacing.space8),
                AIMIconButton(
                  semanticLabel: 'Back',
                  icon: Icon(
                    isRtl ? Icons.chevron_right : Icons.chevron_left,
                    color: AimColors.neutral0,
                  ),
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
                const SizedBox(width: AimSpacing.space4),
                Text(
                  title,
                  style:
                      AimTextStyles.title.copyWith(color: AimColors.neutral0),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Body — ready state
// ---------------------------------------------------------------------------

class _ReadyBody extends StatelessWidget {
  const _ReadyBody({
    required this.test,
    required this.sections,
    required this.onStart,
  });

  final PlacementTestModel test;
  final List<PlacementSectionModel> sections;
  final VoidCallback onStart;

  int get _totalQuestions =>
      sections.fold(0, (sum, s) => sum + s.totalQuestions);

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Column(
      children: [
        const _GradientTopBar(title: 'Placement Test'),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.screenPaddingMobile,
              vertical: AimSpacing.sectionGap,
            ),
            children: [
              // ── Hero card ──────────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AimSpacing.cardPaddingLg),
                decoration: BoxDecoration(
                  gradient: AimGradients.gzHero,
                  borderRadius: AimRadius.borderXl,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Find your level',
                      style: AimTextStyles.h3.copyWith(
                        color: AimColors.neutral0,
                      ),
                    ),
                    const SizedBox(height: AimSpacing.space8),
                    Text(
                      'A short adaptive test places you at the right CEFR '
                      'level so every lesson fits you.',
                      style: AimTextStyles.bodySm.copyWith(
                        color: AimColors.neutral0.withValues(alpha: 0.85),
                      ),
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),
                    Row(
                      children: [
                        Expanded(
                          child: _HeroStat(
                            value: '${test.totalSections}',
                            label: 'sections',
                          ),
                        ),
                        Expanded(
                          child: _HeroStat(
                            value: '~${test.estimatedMinutes}',
                            label: 'minutes',
                          ),
                        ),
                        Expanded(
                          child: _HeroStat(
                            value: '$_totalQuestions',
                            label: 'questions',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AimSpacing.sectionGap),

              // ── Sections preview list ──────────────────────────────────
              Text(
                'SECTIONS',
                style: AimTextStyles.caption.copyWith(
                  color: surfaces.textMuted,
                  fontWeight: AimFontWeights.semibold,
                  letterSpacing: 0.6,
                ),
              ),
              const SizedBox(height: AimSpacing.componentGap),
              for (final section in sections) ...[
                _SectionPreviewRow(section: section),
                const SizedBox(height: AimSpacing.componentGap),
              ],
              const SizedBox(height: AimSpacing.sectionGap),

              // ── Start / Not now ─────────────────────────────────────────
              AIMGradientButton(
                label: 'Start Placement Test',
                fullWidth: true,
                onPressed: onStart,
                semanticLabel: 'Start Placement Test',
              ),
              const SizedBox(height: AimSpacing.componentGap),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.of(context).maybePop(),
                  child: const Text('Not now'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HeroStat extends StatelessWidget {
  const _HeroStat({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
        ),
        Text(
          label,
          style: AimTextStyles.caption.copyWith(
            color: AimColors.neutral0.withValues(alpha: 0.85),
          ),
        ),
      ],
    );
  }
}

class _SectionPreviewRow extends StatelessWidget {
  const _SectionPreviewRow({required this.section});

  final PlacementSectionModel section;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final minutes = placementEstimatedMinutes(section.totalQuestions);

    return Container(
      padding: const EdgeInsets.all(AimSpacing.cardPadding),
      decoration: BoxDecoration(
        color: surfaces.surface,
        border: Border.all(color: surfaces.border),
        borderRadius: AimRadius.borderLg,
      ),
      child: Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: soft.primary,
              borderRadius: AimRadius.borderMd,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space8),
              child: Icon(
                placementSkillIcon(section.skillCode),
                size: AimSizes.iconMd,
                color: soft.onPrimary,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  section.title,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${placementSkillCategoryLabel(section.skillCode)} · '
                  '$minutes min',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
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
