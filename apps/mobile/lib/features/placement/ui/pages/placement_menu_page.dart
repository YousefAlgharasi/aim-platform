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

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/data/models/placement_result_model.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_menu_notifier.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';

const _displayNames = {
  'beginner': 'Beginner',
  'elementary': 'Elementary',
  'intermediate': 'Intermediate',
  'upper_intermediate': 'Upper Intermediate',
  'advanced': 'Advanced',
};

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
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Retake the placement test?'),
        content: const Text(
          'Your current result will stay on record, but a new attempt will '
          'replace it as your latest placement result.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Retake'),
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
                  const AIMFullScreenLoading(
                    semanticLabel: 'Checking placement test status',
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
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: Row(
        children: [
          Semantics(
            button: true,
            label: 'Back',
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
          const SizedBox(width: AimSpacing.componentGap),
          Text(
            'Placement Test',
            style: AimTextStyles.h2.copyWith(color: AimColors.neutral0),
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
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.school_outlined, size: AimSizes.iconLg, color: surfaces.textMuted),
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            "You haven't taken the placement test yet",
            style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            'A short adaptive test places you at the right level so every '
            'lesson fits you.',
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          AIMGradientButton(
            label: 'Take the Placement Test',
            fullWidth: true,
            semanticLabel: 'Take the Placement Test',
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

  /// Starts a fresh attempt (the backend auto-abandons the existing
  /// active one) — there is no mid-section resume flow in this app today,
  /// so "continue" honestly means "start again," not "pick up exactly
  /// where you left off."
  final VoidCallback onContinue;

  /// Re-runs the status check — used while a submitted attempt is still
  /// being scored server-side, since a new attempt can't be started until
  /// scoring finishes.
  final VoidCallback onCheckAgain;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isSubmitted = status == 'submitted';

    final title = isSubmitted
        ? 'Your placement test is being scored'
        : 'You have a placement test in progress';
    final body = isSubmitted
        ? 'This usually only takes a moment. Check again shortly.'
        : 'Pick up your placement test, or start over — your progress in '
            'this attempt is not saved section by section.';

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
            AIMGradientButton(
              label: 'Check Again',
              fullWidth: true,
              semanticLabel: 'Check Again',
              onPressed: onCheckAgain,
            )
          else
            AIMGradientButton(
              label: 'Continue Placement Test',
              fullWidth: true,
              semanticLabel: 'Continue Placement Test',
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
    final displayName = _displayNames[result.estimatedLevel] ?? result.estimatedLevel;
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
            label: 'Your level: $displayName, total score $totalScore out of 100',
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
                    'YOUR LEVEL',
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
                    '$displayName · Total score $totalScore / 100',
                    style: AimTextStyles.bodySm.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.85),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          AIMGradientButton(
            label: 'View Full Result',
            fullWidth: true,
            semanticLabel: 'View Full Result',
            onPressed: () => context.push(
              AppRoutePaths.placementResult,
              extra: {'attemptId': result.placementAttemptId},
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          OutlinedButton(
            onPressed: onRetake,
            child: const Text('Retake Test?'),
          ),
        ],
      ),
    );
  }
}
