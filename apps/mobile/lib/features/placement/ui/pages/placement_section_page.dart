// Phase 4 — P4-066
// PlacementSectionPage — student-facing placement section screen.
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Load the ordered placement sections on mount.
//   2. Display the current section title, skill area, question count, and
//      section progress (e.g. "Section 2 of 4").
//   3. Provide a "Start Section" button that navigates to the question page
//      (P4-067) with the current section ID and attempt ID.
//   4. After the question page returns, advance to the next section or
//      navigate to the completion flow (P4-068).
//
// Security rules:
// - Displays only data returned from the backend via placementSectionProvider.
// - estimatedLevel, mastery scores, is_correct, and correct_answer are never
//   shown, computed, or forwarded to any widget.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_section_notifier.dart';

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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Placement Test'),
        automaticallyImplyLeading: false,
      ),
      body: switch (state) {
        PlacementSectionIdle() ||
        PlacementSectionLoading() =>
          const Center(child: CircularProgressIndicator()),
        PlacementSectionError(:final message) => _ErrorBody(
            message: message,
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
            onStartSection: () => _navigateToQuestions(
              context,
              state,
            ),
          ),
      },
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
    final theme = Theme.of(context);
    final section = state.currentSection;

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Progress indicator
          _SectionProgressBar(
            current: state.displayIndex,
            total: state.totalSections,
          ),
          const SizedBox(height: 32),

          // Section header
          Text(
            'Section ${state.displayIndex} of ${state.totalSections}',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            section.title,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // Skill area badge
          _SkillBadge(skillCode: section.skillCode),
          const SizedBox(height: 24),

          // Question count info
          Row(
            children: [
              const Icon(Icons.quiz_outlined, size: 20),
              const SizedBox(width: 8),
              Text(
                '${section.totalQuestions} questions',
                style: theme.textTheme.bodyLarge,
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Backend authority note — important for security compliance
          Text(
            'Your answers are submitted to the backend for evaluation. '
            'All scoring is performed by the server.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
            ),
          ),

          const Spacer(),

          // Start section button
          FilledButton(
            onPressed: onStartSection,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4.0),
              child: Text(
                state.isLastSection
                    ? 'Start Final Section'
                    : 'Start Section',
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

class _SectionProgressBar extends StatelessWidget {
  const _SectionProgressBar({required this.current, required this.total});

  final int current;
  final int total;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = total > 0 ? current / total : 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Section progress',
              style: theme.textTheme.labelMedium,
            ),
            Text(
              '$current / $total',
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        LinearProgressIndicator(
          value: progress,
          backgroundColor:
              theme.colorScheme.onSurface.withValues(alpha: 0.12),
          minHeight: 6,
          borderRadius: BorderRadius.circular(3),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Skill area badge
// ---------------------------------------------------------------------------

class _SkillBadge extends StatelessWidget {
  const _SkillBadge({required this.skillCode});

  final String skillCode;

  static const _labels = {
    'grammar': 'Grammar',
    'vocabulary': 'Vocabulary',
    'reading': 'Reading',
    'listening': 'Listening',
  };

  static const _colors = {
    'grammar': Color(0xFF4A90D9),
    'vocabulary': Color(0xFF27AE60),
    'reading': Color(0xFF8E44AD),
    'listening': Color(0xFFE67E22),
  };

  @override
  Widget build(BuildContext context) {
    final label = _labels[skillCode] ?? skillCode;
    final color = _colors[skillCode] ?? Colors.grey;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
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
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: onRetry,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
