// PlacementResultPage — student-facing placement result screen.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → placementResult
//   docs/design/ui-for-all-system-mobile/screenshots/light/23-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/23-screen.png
// Endpoint: GET /placement/attempts/:id/result
// Widgets: AIMGradientButton, AIMFullScreenLoading, AIMFullScreenError
//
// Scope: Placement Test phase only.
//
// Security rules:
// - All values are displayed exactly as returned by the backend.
// - Flutter NEVER calculates or infers estimatedLevel, mastery, or weaknesses.
// - Raw masteryScore (0.0–1.0) is never shown as a number — only the
//   backend-provided correctAnswers/totalQuestions counts (per-section) and
//   the backend-provided qualitative signal (strong/developing/emerging),
//   mapped only to a display color, are used.
// - "Total score" is a plain arithmetic sum of the backend's real
//   correctAnswers/totalQuestions across sections, shown as a percentage —
//   it is not a backend field, but it is not an inferred mastery/level
//   judgement either; estimatedLevel itself always comes from the backend
//   verbatim.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/placement_result_model.dart';
import '../../logic/entity/placement_skill_mastery.dart';
import '../../logic/provider/placement_provider.dart';
import '../../logic/provider/placement_result_notifier.dart';

class PlacementResultPage extends ConsumerStatefulWidget {
  const PlacementResultPage({
    super.key,
    required this.attemptId,
  });

  final String attemptId;

  @override
  ConsumerState<PlacementResultPage> createState() =>
      _PlacementResultPageState();
}

class _PlacementResultPageState extends ConsumerState<PlacementResultPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadResult());
  }

  void _loadResult() {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(placementResultProvider.notifier).loadResult(
          token,
          attemptId: widget.attemptId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementResultProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        child: switch (state) {
          PlacementResultIdle() ||
          PlacementResultLoading() =>
            const AIMFullScreenLoading(semanticLabel: 'Loading your result'),
          PlacementResultPending() => const _PendingBody(),
          PlacementResultError(:final message) => AIMFullScreenError(
              message: message,
              onRetry: _loadResult,
            ),
          PlacementResultReady(:final result) => _ResultBody(result: result),
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Pending — backend still scoring
// ---------------------------------------------------------------------------

class _PendingBody extends StatelessWidget {
  const _PendingBody();

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Semantics(
      label: 'Scoring in progress',
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(color: AimColors.primary500),
              const SizedBox(height: AimSpacing.sectionGap),
              Text(
                'Scoring in progress…',
                style: AimTextStyles.title.copyWith(
                  color: surfaces.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AimSpacing.innerGap),
              Text(
                'The backend is evaluating your answers.',
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Result body — displayed once result is ready
// ---------------------------------------------------------------------------

const _cefrCodes = {
  'beginner': 'A1',
  'elementary': 'A2',
  'intermediate': 'B1',
  'upper_intermediate': 'B2',
  'advanced': 'C1',
};

const _displayNames = {
  'beginner': 'Beginner',
  'elementary': 'Elementary',
  'intermediate': 'Intermediate',
  'upper_intermediate': 'Upper Intermediate',
  'advanced': 'Advanced',
};

const _skillNames = {
  'grammar': 'Grammar',
  'vocabulary': 'Vocabulary',
  'reading': 'Reading',
  'listening': 'Listening',
};

class _ResultBody extends StatelessWidget {
  const _ResultBody({required this.result});

  final PlacementResultModel result;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
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
          _LevelCard(
            estimatedLevel: result.estimatedLevel,
            totalScore: totalScore,
          ),
          if (masteries.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              'SECTION BREAKDOWN',
              style: AimTextStyles.caption.copyWith(
                color: surfaces.textMuted,
                fontWeight: AimFontWeights.semibold,
                letterSpacing: 0.6,
              ),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            for (final entry in masteries.entries) ...[
              _SectionBreakdownRow(skillCode: entry.key, mastery: entry.value),
              const SizedBox(height: AimSpacing.componentGap),
            ],
          ],
          const SizedBox(height: AimSpacing.sectionGap),
          AIMGradientButton(
            label: 'Continue to AIM',
            fullWidth: true,
            semanticLabel: 'Continue to AIM',
            onPressed: () => context.go(AppRoutePaths.mainShell),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Level card
// ---------------------------------------------------------------------------

class _LevelCard extends StatelessWidget {
  const _LevelCard({required this.estimatedLevel, required this.totalScore});

  final String estimatedLevel;
  final int totalScore;

  @override
  Widget build(BuildContext context) {
    final displayName = _displayNames[estimatedLevel] ?? estimatedLevel;
    final code = _cefrCodes[estimatedLevel] ?? estimatedLevel;

    return Semantics(
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
    );
  }
}

// ---------------------------------------------------------------------------
// Section breakdown row — real per-section correct/total from the backend,
// signal mapped only to a display color (never to a computed value).
// ---------------------------------------------------------------------------

class _SectionBreakdownRow extends StatelessWidget {
  const _SectionBreakdownRow({required this.skillCode, required this.mastery});

  final String skillCode;
  final PlacementSkillMastery mastery;

  static const _signalColors = {
    'strong': AimColors.success500,
    'emerging': AimColors.warning500,
  };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final name = _skillNames[skillCode] ?? skillCode;
    final color = _signalColors[mastery.signal] ?? AimColors.primary500;
    final progress = mastery.totalQuestions > 0
        ? mastery.correctAnswers / mastery.totalQuestions
        : 0.0;

    return Semantics(
      label: '$name: ${mastery.correctAnswers} of '
          '${mastery.totalQuestions} correct',
      child: Container(
        padding: const EdgeInsets.all(AimSpacing.cardPadding),
        decoration: BoxDecoration(
          color: surfaces.surface,
          border: Border.all(color: surfaces.border),
          borderRadius: AimRadius.borderLg,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    name,
                    style: AimTextStyles.title.copyWith(
                      color: surfaces.textPrimary,
                    ),
                  ),
                ),
                Text(
                  '${mastery.correctAnswers} / ${mastery.totalQuestions}',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.space8),
            ClipRRect(
              borderRadius: AimRadius.borderXs,
              child: LinearProgressIndicator(
                value: progress,
                minHeight: AimSpacing.space8,
                backgroundColor: surfaces.surfaceSunken,
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
