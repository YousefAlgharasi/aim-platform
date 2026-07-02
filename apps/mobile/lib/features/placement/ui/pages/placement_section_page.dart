// Phase 4 — P4-066
// PlacementSectionPage — student-facing placement section screen.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → placementSection
//   docs/design/ui-for-all-system-mobile/screenshots/light/20-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/20-screen.png
// Endpoint: GET /placement/active/sections
// Widgets: AIMGradientButton, AIMFullScreenLoading, AIMFullScreenError
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Load the ordered placement sections on mount.
//   2. Display the current section title, skill category, and question
//      count/pacing estimate, plus a segmented section-progress indicator.
//   3. Provide a "Begin Section" button that navigates to the question page
//      (P4-067) with the current section ID and attempt ID.
//   4. After the question page returns, advance to the next section or
//      navigate to the completion flow (P4-068).
//
// Security rules:
// - Displays only data returned from the backend via placementSectionProvider.
// - estimatedLevel, mastery scores, is_correct, and correct_answer are never
//   shown, computed, or forwarded to any widget.
// - Per-section duration is a cosmetic client-side pacing estimate derived
//   from totalQuestions (see placement_skill_display.dart) — never a scored
//   or backend value.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_section_notifier.dart';
import 'package:aim_mobile/features/placement/ui/widgets/placement_skill_display.dart';

class PlacementSectionPage extends ConsumerStatefulWidget {
  const PlacementSectionPage({
    super.key,
    required this.attemptId,
  });

  /// The active placement attempt ID — passed from the start page.
  final String attemptId;

  @override
  ConsumerState<PlacementSectionPage> createState() =>
      _PlacementSectionPageState();
}

class _PlacementSectionPageState extends ConsumerState<PlacementSectionPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      ref.read(placementSectionProvider.notifier).loadSections(
            token,
            attemptId: widget.attemptId,
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementSectionProvider);
    final surfaces = aimSurfacesOf(context);
    final title = state is PlacementSectionReady
        ? 'Section ${state.displayIndex} of ${state.totalSections}'
        : 'Placement Test';

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        children: [
          _GradientTopBar(title: title),
          Expanded(
            child: switch (state) {
              PlacementSectionIdle() ||
              PlacementSectionLoading() =>
                const AIMFullScreenLoading(),
              PlacementSectionError(:final message) => AIMFullScreenError(
                  message: message,
                  retryLabel: 'Retry',
                  onRetry: () {
                    final token = ref.read(authFlowProvider).accessToken ?? '';
                    ref.read(placementSectionProvider.notifier).loadSections(
                          token,
                          attemptId: widget.attemptId,
                        );
                  },
                ),
              PlacementSectionReady() => _SectionBody(
                  state: state,
                  onStartSection: () => _navigateToQuestions(context, state),
                ),
            },
          ),
        ],
      ),
    );
  }

  /// Navigate to the question page for the current section.
  /// On return, check if we should advance to the next section or go to submit.
  Future<void> _navigateToQuestions(
    BuildContext context,
    PlacementSectionReady state,
  ) async {
    await Navigator.of(context).pushNamed(
      AppRoutePaths.placementQuestion,
      arguments: {
        'sectionId': state.currentSection.id,
        'attemptId': state.attemptId,
        'sectionTitle': state.currentSection.title,
        'sectionIndex': state.displayIndex,
        'totalSections': state.totalSections,
      },
    );

    if (!mounted) return;

    if (state.isLastSection) {
      // All sections complete — navigate to submit/complete flow (P4-068).
      Navigator.of(context).pushReplacementNamed(
        AppRoutePaths.placementSubmit,
        arguments: {'attemptId': state.attemptId},
      );
    } else {
      // Advance to the next section.
      ref.read(placementSectionProvider.notifier).advanceToNextSection();
    }
  }
}

// ---------------------------------------------------------------------------
// Gradient top bar — back chevron + "Section X of Y".
// ---------------------------------------------------------------------------

class _GradientTopBar extends StatelessWidget {
  const _GradientTopBar({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    return Container(
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
                style: AimTextStyles.title.copyWith(color: AimColors.neutral0),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Section body widget
// ---------------------------------------------------------------------------

class _SectionBody extends StatelessWidget {
  const _SectionBody({
    required this.state,
    required this.onStartSection,
  });

  final PlacementSectionReady state;
  final VoidCallback onStartSection;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final section = state.currentSection;
    final minutes = placementEstimatedMinutes(section.totalQuestions);

    return Padding(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _SegmentedProgress(
            total: state.totalSections,
            currentIndex: state.currentIndex,
          ),
          const Spacer(),
          Center(
            child: Column(
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: soft.primary,
                    borderRadius: AimRadius.borderXl,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AimSpacing.space16),
                    child: Icon(
                      placementSkillIcon(section.skillCode),
                      size: AimSizes.iconLg,
                      color: soft.onPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: AimSpacing.componentGap),
                Text(
                  section.title,
                  style:
                      AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  '${placementSkillCategoryLabel(section.skillCode)} · '
                  '${section.totalQuestions} questions · about $minutes minutes',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          const Spacer(),
          AIMGradientButton(
            label: state.isLastSection ? 'Begin Final Section' : 'Begin Section',
            fullWidth: true,
            onPressed: onStartSection,
            semanticLabel:
                state.isLastSection ? 'Begin Final Section' : 'Begin Section',
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Segmented progress bar — one pill segment per section.
// ---------------------------------------------------------------------------

class _SegmentedProgress extends StatelessWidget {
  const _SegmentedProgress({required this.total, required this.currentIndex});

  final int total;
  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Semantics(
      label: 'Section ${currentIndex + 1} of $total',
      child: Row(
        children: [
          for (var i = 0; i < total; i++) ...[
            if (i > 0) const SizedBox(width: AimSpacing.space4),
            Expanded(
              child: SizedBox(
                height: AimSpacing.space4,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: i <= currentIndex
                        ? AimColors.primary500
                        : surfaces.border,
                    borderRadius: AimRadius.borderXs,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
