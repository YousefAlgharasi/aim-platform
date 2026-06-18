// Phase 6 — P6-067
// LearningPathPage — Student learning path screen MVP.
//
// Renders three backend-sourced data sections via [learningPathProvider]:
//   1. Skill states       — AIM band / mastery summary cards with coverage bar
//   2. Weakness areas     — AIM weakness topic chips
//   3. Recommendations    — AIM-generated action cards
//
// Flutter never calculates or infers any AIM value. All values come from the
// backend verbatim through LearningPathNotifier → LearningPathRepository →
// backend API.
//
// Security rules:
// - studentId sourced from authContextProvider (JWT-resolved).
// - Bearer token from authFlowProvider. Never stored in this widget.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets in this file.
//
// RTL/Arabic rules:
// - Uses Directionality-aware widgets only (Row, Column, CrossAxisAlignment).
// - Text widgets respect ambient directionality; no explicit LTR overrides.
// - AIMTopAppBar handles RTL navigation icon mirroring internally.
// - Padding uses symmetric EdgeInsets so it mirrors correctly under RTL.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/learning_path/logic/entity/learning_path_data.dart';
import 'package:aim_mobile/features/learning_path/logic/provider/learning_path_provider.dart';
import '../widgets/learning_path_widgets.dart';

/// Student learning path screen MVP.
///
/// Auto-loads learning path data on first build by reading studentId from
/// [authContextProvider] (JWT-resolved by backend) and the bearer token from
/// [authFlowProvider].
class LearningPathPage extends ConsumerStatefulWidget {
  const LearningPathPage({super.key});

  @override
  ConsumerState<LearningPathPage> createState() => _LearningPathPageState();
}

class _LearningPathPageState extends ConsumerState<LearningPathPage> {
  @override
  void initState() {
    super.initState();
    // Kick off the load after the first frame so providers are settled.
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final authContext = ref.read(authContextProvider);
    final authFlow = ref.read(authFlowProvider);

    // Only load when auth context has resolved and a token is available.
    if (authContext is! AppAsyncSuccess) return;
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    ref.read(learningPathProvider.notifier).load(
          bearerToken: token,
          studentId: authContext.data.user.id,
        );
  }

  Future<void> _refresh() async {
    final authContext = ref.read(authContextProvider);
    final authFlow = ref.read(authFlowProvider);

    if (authContext is! AppAsyncSuccess) return;
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    await ref.read(learningPathProvider.notifier).refresh(
          bearerToken: token,
          studentId: authContext.data.user.id,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(learningPathProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: 'My Learning Path'),
      body: switch (state) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: 'Loading learning path data',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _LearningPathContent(
            data: data,
            onRefresh: _refresh,
          ),
        AppAsyncIdle() => AIMFullScreenLoading(
            semanticLabel: 'Loading learning path data',
          ),
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Main content — only rendered on success state.
// ---------------------------------------------------------------------------

class _LearningPathContent extends StatelessWidget {
  const _LearningPathContent({
    required this.data,
    required this.onRefresh,
  });

  final LearningPathData data;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return AIMEmptyState(
        icon: const Icon(Icons.route_outlined),
        title: 'Your learning path is empty',
        subtitle:
            'Complete your placement test to generate a personalised learning path.',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        children: [
          if (data.skillStates.isNotEmpty) ...[
            const LearningPathSectionHeader(title: 'Skill States'),
            const SizedBox(height: AimSpacing.componentGap),
            ...data.skillStates.map(
              (m) => Padding(
                padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: LearningPathSkillStateCard(model: m),
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.weaknessRecords.isNotEmpty) ...[
            const LearningPathSectionHeader(title: 'Focus Areas'),
            const SizedBox(height: AimSpacing.componentGap),
            Wrap(
              spacing: AimSpacing.space8,
              runSpacing: AimSpacing.space8,
              children: data.weaknessRecords
                  .map((m) => LearningPathWeaknessChip(model: m))
                  .toList(),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.recommendations.isNotEmpty) ...[
            const LearningPathSectionHeader(title: 'AIM Recommendations'),
            const SizedBox(height: AimSpacing.componentGap),
            ...data.recommendations.map(
              (m) => Padding(
                padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: LearningPathRecommendationCard(model: m),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
