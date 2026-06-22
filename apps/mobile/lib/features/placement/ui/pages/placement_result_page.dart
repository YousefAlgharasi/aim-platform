// PlacementResultPage — student-facing placement result screen.
//
// Scope: Placement Test phase only.
//
// Security rules:
// - All values are displayed exactly as returned by the backend.
// - Flutter NEVER calculates or infers estimatedLevel, mastery, or weaknesses.
// - Raw masteryScore is never shown as a number — only the backend-provided
//   qualitative signal (strong / developing / emerging) is displayed.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Your Placement Result'),
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

class _ResultBody extends StatelessWidget {
  const _ResultBody({required this.result});

  final PlacementResultModel result;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _LevelCard(estimatedLevel: result.estimatedLevel),
          const SizedBox(height: AimSpacing.sectionGap),
          if (result.skillMasteryMap.isNotEmpty) ...[
            Text(
              'Section Summary',
              style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final (i, entry)
                      in result.skillMasteryMap.entries.indexed) ...[
                    _SkillRow(skillCode: entry.key, mastery: entry.value),
                    if (i != result.skillMasteryMap.length - 1)
                      const SizedBox(height: AimSpacing.componentGap),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (result.weaknesses.isNotEmpty) ...[
            Text(
              'Areas to Focus On',
              style: AimTextStyles.title.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              'Identified by your backend evaluation — displayed in priority order.',
              style:
                  AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final (i, weakness)
                      in result.weaknesses.take(3).indexed) ...[
                    _WeaknessRow(weakness: weakness),
                    if (i != result.weaknesses.take(3).length - 1)
                      const SizedBox(height: AimSpacing.componentGap),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          _InitialPathBanner(initialPathId: result.initialPathId),
          const SizedBox(height: AimSpacing.sectionGap),
          AIMButton(
            fullWidth: true,
            semanticLabel: 'Continue to home',
            onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil(
              AppRoutePaths.mainShell,
              (route) => false,
            ),
            child: const Text('Continue to Home'),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            'Your level and study plan were determined by the backend based '
            'on your answers. Flutter displays these results exactly as '
            'received — no local calculations are performed.',
            style: AimTextStyles.helper.copyWith(color: surfaces.textMuted),
            textAlign: TextAlign.center,
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
  const _LevelCard({required this.estimatedLevel});

  final String estimatedLevel;

  static const _displayNames = {
    'beginner': 'Beginner',
    'elementary': 'Elementary',
    'intermediate': 'Intermediate',
    'upper_intermediate': 'Upper Intermediate',
    'advanced': 'Advanced',
  };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final displayName = _displayNames[estimatedLevel] ?? estimatedLevel;

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: 'Estimated level: $displayName',
      child: Column(
        children: [
          Text(
            'Your Estimated Level',
            style: AimTextStyles.label.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Text(
            displayName,
            style: AimTextStyles.h1.copyWith(color: AimColors.primary600),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            'Assigned by the backend based on your placement test',
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Skill row — shows the backend-provided signal as-is
// ---------------------------------------------------------------------------

class _SkillRow extends StatelessWidget {
  const _SkillRow({required this.skillCode, required this.mastery});

  final String skillCode;
  final PlacementSkillMastery mastery;

  static const _names = {
    'grammar': 'Grammar',
    'vocabulary': 'Vocabulary',
    'reading': 'Reading',
    'listening': 'Listening',
  };

  static const _tones = {
    'strong': AIMBadgeTone.success,
    'developing': AIMBadgeTone.warning,
  };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final signal = mastery.signal;
    final name = _names[skillCode] ?? skillCode;
    final tone = _tones[signal] ?? AIMBadgeTone.error;
    final label = signal.isEmpty
        ? signal
        : signal[0].toUpperCase() + signal.substring(1);

    return Row(
      children: [
        Expanded(
          child: Text(
            name,
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
          ),
        ),
        AIMBadge(
          tone: tone,
          pill: true,
          semanticLabel: '$name mastery: $label',
          child: Text(label),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Weakness row
// ---------------------------------------------------------------------------

class _WeaknessRow extends StatelessWidget {
  const _WeaknessRow({required this.weakness});

  final PlacementWeakness weakness;

  static const _names = {
    'grammar': 'Grammar',
    'vocabulary': 'Vocabulary',
    'reading': 'Reading',
    'listening': 'Listening',
  };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final name = _names[weakness.skillCode] ?? weakness.skillCode;

    return Row(
      children: [
        AIMBadge(
          tone: AIMBadgeTone.error,
          pill: true,
          semanticLabel: 'Priority ${weakness.priority}',
          child: Text('${weakness.priority}'),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: Text(
            name,
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Initial path banner
// ---------------------------------------------------------------------------

class _InitialPathBanner extends StatelessWidget {
  const _InitialPathBanner({required this.initialPathId});

  final String initialPathId;

  @override
  Widget build(BuildContext context) {
    final isReady = initialPathId.isNotEmpty;

    return AIMAlertBanner(
      tone: isReady ? AIMAlertTone.success : AIMAlertTone.info,
      title: isReady ? 'Initial Study Path Ready' : 'Study Path Pending',
      semanticLabel: isReady
          ? 'Your personalised starting path has been assigned'
          : 'Your study path is being prepared',
      child: Text(
        isReady
            ? 'Your personalised starting path has been assigned by the backend.'
            : 'Your study path is being prepared by the backend.',
      ),
    );
  }
}
