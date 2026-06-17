// Phase 4 — P4-069
// PlacementResultPage — student-facing placement result screen.
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   Display the backend-generated placement result:
//     - estimatedLevel (displayed as-is — never recalculated by Flutter)
//     - skillMasteryMap entries: skill name + mastery signal (received from
//       backend — never derived locally from masteryScore)
//     - weaknesses (top weaknesses ranked by backend, skill name + priority)
//     - initialPathReady indicator
//
// Security rules:
// - All values are displayed exactly as returned by the backend.
// - Flutter NEVER calculates or infers estimatedLevel, mastery, or weaknesses.
// - Raw masteryScore is NOT shown as a number — only a qualitative signal badge
//   (strong / developing / emerging) is displayed per P4-012 §4 safety rules.
// - is_correct and correct_answer are NEVER present in any response.
// - student_id is JWT-resolved server-side — never sent by Flutter.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/data/models/placement_result_model.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_skill_mastery.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_result_notifier.dart';

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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      ref.read(placementResultProvider.notifier).loadResult(
            token,
            attemptId: widget.attemptId,
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementResultProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Placement Result'),
        automaticallyImplyLeading: false,
      ),
      body: switch (state) {
        PlacementResultIdle() ||
        PlacementResultLoading() =>
          const Center(child: CircularProgressIndicator()),
        PlacementResultPending(:final attempt) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const CircularProgressIndicator(),
                const SizedBox(height: 20),
                Text(
                  'Scoring in progress… ($attempt/$_maxPollAttempts)',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  'The backend is evaluating your answers.',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context)
                            .colorScheme
                            .onSurface
                            .withValues(alpha: 0.5),
                      ),
                ),
              ],
            ),
          ),
        PlacementResultError(:final message) => _ErrorBody(
            message: message,
            onRetry: () {
              final token = ref.read(authFlowProvider).accessToken ?? '';
              ref.read(placementResultProvider.notifier).loadResult(
                    token,
                    attemptId: widget.attemptId,
                  );
            },
          ),
        PlacementResultReady(:final result) => _ResultBody(result: result),
      },
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
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Estimated level card — backend-assigned, displayed as-is
          _LevelCard(estimatedLevel: result.estimatedLevel),
          const SizedBox(height: 24),

          // Section skill summary
          if (result.skillMasteryMap.isNotEmpty) ...[
            Text(
              'Section Summary',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...result.skillMasteryMap.entries.map(
              (entry) => _SkillRow(
                skillCode: entry.key,
                mastery: entry.value,
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Priority weaknesses (top 3)
          if (result.weaknesses.isNotEmpty) ...[
            Text(
              'Areas to Focus On',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Identified by your backend evaluation — displayed in priority order.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
              ),
            ),
            const SizedBox(height: 12),
            ...result.weaknesses
                .take(3)
                .map((w) => _WeaknessRow(weakness: w)),
            const SizedBox(height: 24),
          ],

          // Initial path indicator
          _InitialPathCard(
            initialPathId: result.initialPathId,
          ),
          const SizedBox(height: 24),

          // Backend authority disclaimer
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color:
                  theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Your level and study plan were determined by the backend '
              'based on your answers. Flutter displays these results '
              'exactly as received — no local calculations are performed.',
              style: theme.textTheme.bodySmall?.copyWith(
                color:
                    theme.colorScheme.onSurface.withValues(alpha: 0.5),
              ),
              textAlign: TextAlign.center,
            ),
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
    final theme = Theme.of(context);
    final displayName =
        _displayNames[estimatedLevel] ?? estimatedLevel;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text(
            'Your Estimated Level',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onPrimaryContainer
                  .withValues(alpha: 0.7),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            displayName,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onPrimaryContainer,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Assigned by the backend based on your placement test',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onPrimaryContainer
                  .withValues(alpha: 0.6),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Skill row — shows backend-provided signal (never locally computed)
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

  // P4-070: Signal comes from mastery.signal (backend-provided).
  // The _signal() helper that computed signal from masteryScore using
  // threshold constants (0.75, 0.40) has been removed — that is backend
  // config and must never appear in Flutter code (P4-035 §4).
  Color _signalColor(String signal, BuildContext context) {
    return switch (signal) {
      'strong' => const Color(0xFF27AE60),
      'developing' => const Color(0xFFF39C12),
      _ => const Color(0xFFE74C3C),
    };
  }

  @override
  Widget build(BuildContext context) {
    // Use backend-provided signal directly — never compute from masteryScore.
    final signal = mastery.signal;
    final color = _signalColor(signal, context);
    final name = _names[skillCode] ?? skillCode;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Row(
        children: [
          Expanded(child: Text(name, style: const TextStyle(fontSize: 15))),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withValues(alpha: 0.4)),
            ),
            child: Text(
              signal[0].toUpperCase() + signal.substring(1),
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
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
    final name = _names[weakness.skillCode] ?? weakness.skillCode;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: const Color(0xFFE74C3C).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              '${weakness.priority}',
              style: const TextStyle(
                color: Color(0xFFE74C3C),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(name, style: const TextStyle(fontSize: 15)),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Initial path card
// ---------------------------------------------------------------------------

class _InitialPathCard extends StatelessWidget {
  const _InitialPathCard({required this.initialPathId});

  final String initialPathId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isReady = initialPathId.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(
          color: isReady
              ? const Color(0xFF27AE60).withValues(alpha: 0.4)
              : theme.colorScheme.outline.withValues(alpha: 0.3),
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            isReady ? Icons.check_circle_outline : Icons.hourglass_empty,
            color: isReady
                ? const Color(0xFF27AE60)
                : theme.colorScheme.onSurface.withValues(alpha: 0.4),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isReady
                      ? 'Initial Study Path Ready'
                      : 'Study Path Pending',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  isReady
                      ? 'Your personalised starting path has been assigned by the backend.'
                      : 'Your study path is being prepared by the backend.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color:
                        theme.colorScheme.onSurface.withValues(alpha: 0.5),
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

// ---------------------------------------------------------------------------
// Error body
// ---------------------------------------------------------------------------

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}

/// Expose poll attempt constant for the UI.
const _maxPollAttempts = 10;
