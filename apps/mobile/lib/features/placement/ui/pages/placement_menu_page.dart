// PlacementMenuPage — entry point for the drawer's "Placement Test" menu
// item.
//
// Endpoint: GET /placement/attempts/latest
//
// Responsibility:
//   Check the student's overall placement status on mount and route/render
//   accordingly:
//     - 'none'                → fresh start flow (PlacementStartPage).
//     - 'active'/'submitted'  → in-progress message + a way back into the
//                                flow (starting a new attempt; the backend
//                                auto-abandons any existing active/submitted
//                                attempt when a new one is started).
//     - 'completed'           → a compact result summary plus a "Retake
//                                Test?" confirmation button.
//
// Security rules:
// - All values (status, estimatedLevel, etc.) are displayed exactly as
//   returned by the backend. Flutter never decides "has this student
//   already taken placement" locally.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/data/models/placement_result_model.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_menu_notifier.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';

import 'package:aim_mobile/features/placement/ui/widgets/placement_primary_button.dart';

const _cefrCodes = {
  'beginner': 'A1',
  'elementary': 'A2',
  'intermediate': 'B1',
  'upper_intermediate': 'B2',
  'advanced': 'C1',
};

class PlacementMenuPage extends ConsumerStatefulWidget {
  const PlacementMenuPage({super.key});

  @override
  ConsumerState<PlacementMenuPage> createState() => _PlacementMenuPageState();
}

class _PlacementMenuPageState extends ConsumerState<PlacementMenuPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _check());
  }

  void _check() {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(placementMenuProvider.notifier).check(token);
  }

  Future<void> _confirmRetake() async {
    final l10n = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.placementMenuRetakeTitle),
        content: Text(l10n.placementMenuRetakeMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.commonCancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.placementMenuRetakeButton),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      context.push(AppRoutePaths.placementStart);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(placementMenuProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _MenuHeader(),
            Expanded(
              child: switch (state) {
                PlacementMenuIdle() ||
                PlacementMenuLoading() =>
                  AIMFullScreenLoading(
                    semanticLabel: l10n.placementMenuCheckingStatusSemantic,
                  ),
                PlacementMenuError(:final message) => AIMFullScreenError(
                    message: message,
                    onRetry: _check,
                  ),
                PlacementMenuReady(:final status, :final result) =>
                  switch (status) {
                    'completed' when result != null => _CompletedBody(
                        result: result,
                        onRetake: _confirmRetake,
                      ),
                    'active' || 'submitted' => _InProgressBody(
                        status: status,
                        onContinue: () =>
                            context.push(AppRoutePaths.placementStart),
                        onCheckAgain: _check,
                      ),
                    _ => _NotTakenBody(
                        onStart: () =>
                            context.push(AppRoutePaths.placementStart),
                      ),
                  },
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

class _MenuHeader extends StatelessWidget {
  const _MenuHeader();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    return Container(
      height: AimSizes.topBarHeight,
      padding: const EdgeInsets.symmetric(horizontal: AimSpacing.space8),
      child: Row(
        children: [
          IconButton(
            icon: Icon(
              isRtl ? Icons.chevron_right_rounded : Icons.chevron_left_rounded,
              color: surfaces.textPrimary,
              size: 26,
            ),
            onPressed: () {
              if (context.canPop()) context.pop();
            },
          ),
          const SizedBox(width: AimSpacing.space4),
          Text(
            l10n.placementMenuHeaderTitle,
            style: AimTextStyles.title.copyWith(
              color: surfaces.textPrimary,
              fontSize: 18,
              fontWeight: AimFontWeights.bold,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Never taken — fresh start
// ---------------------------------------------------------------------------

class _NotTakenBody extends StatelessWidget {
  const _NotTakenBody({required this.onStart});

  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.school_outlined, size: AimSizes.iconLg, color: surfaces.textMuted),
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            l10n.placementMenuNotTakenTitle,
            style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            l10n.placementMenuNotTakenSub,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          PlacementPrimaryButton(
            label: l10n.placementMenuTakeTestBtn,
            onPressed: onStart,
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// In progress — active or submitted (backend still scoring)
// ---------------------------------------------------------------------------

class _InProgressBody extends StatelessWidget {
  const _InProgressBody({
    required this.status,
    required this.onContinue,
    required this.onCheckAgain,
  });

  final String status;

  final VoidCallback onContinue;
  final VoidCallback onCheckAgain;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final isSubmitted = status == 'submitted';

    final title = isSubmitted
        ? l10n.placementMenuInScoringTitle
        : l10n.placementMenuInProgressTitle;
    final body = isSubmitted
        ? l10n.placementMenuInScoringSub
        : l10n.placementMenuInProgressSub;

    return Padding(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSubmitted ? Icons.hourglass_top : Icons.assignment_outlined,
            size: AimSizes.iconLg,
            color: surfaces.textMuted,
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            title,
            style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            body,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          if (isSubmitted)
            PlacementPrimaryButton(
              label: l10n.placementMenuCheckAgainBtn,
              onPressed: onCheckAgain,
            )
          else
            PlacementPrimaryButton(
              label: l10n.placementMenuContinueBtn,
              onPressed: onContinue,
            ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Completed — compact result summary + retake
// ---------------------------------------------------------------------------

class _CompletedBody extends StatelessWidget {
  const _CompletedBody({required this.result, required this.onRetake});

  final PlacementResultModel result;
  final VoidCallback onRetake;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final displayName = switch (result.estimatedLevel) {
      'beginner' => l10n.placementMenuLevelBeginner,
      'elementary' => l10n.placementMenuLevelElementary,
      'intermediate' => l10n.placementMenuLevelIntermediate,
      'upper_intermediate' => l10n.placementMenuLevelUpperIntermediate,
      'advanced' => l10n.placementMenuLevelAdvanced,
      _ => result.estimatedLevel,
    };
    final code = _cefrCodes[result.estimatedLevel] ?? result.estimatedLevel;

    final masteries = result.skillMasteryMap;
    final totalCorrect =
        masteries.values.fold(0, (sum, m) => sum + m.correctAnswers);
    final totalQuestions =
        masteries.values.fold(0, (sum, m) => sum + m.totalQuestions);
    final totalScore =
        totalQuestions > 0 ? (100 * totalCorrect / totalQuestions).round() : 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Semantics(
            label: l10n.placementMenuScoreSummary(displayName, totalScore),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AimSpacing.cardPaddingLg),
              decoration: BoxDecoration(
                gradient: AimGradients.gzHero,
                borderRadius: AimRadius.borderXl,
              ),
              child: Column(
                children: [
                  Text(
                    l10n.placementMenuYourLevelLabel,
                    style: AimTextStyles.caption.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.85),
                      fontWeight: AimFontWeights.semibold,
                      letterSpacing: 0.6,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    code,
                    style: AimTextStyles.display.copyWith(color: AimColors.neutral0),
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    l10n.placementMenuScoreSummary(displayName, totalScore),
                    style: AimTextStyles.bodySm.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.85),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          PlacementPrimaryButton(
            label: l10n.placementMenuViewFullResult,
            onPressed: () => context.push(
              AppRoutePaths.placementResult,
              extra: {'attemptId': result.placementAttemptId},
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          OutlinedButton(
            onPressed: onRetake,
            child: Text(l10n.placementMenuRetakeButton),
          ),
        ],
      ),
    );
  }
}
