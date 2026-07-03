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
// - Padding uses symmetric EdgeInsets so it mirrors correctly under RTL.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Learning path" (37)
//   docs/design/ui-for-all-system-mobile/screenshots/light/37-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/37-screen.png
//
// TASK-31: restyled to match design screen 37 — gradient header ("Learning
// Path" / "Your personalized roadmap"), section titles renamed to match the
// mockup's copy ("Skill coverage", "Focus Areas", "Next up").
//
// Deviation from the mockup (never fabricate data): the design's hero card
// ("Your goal level" with a circular ring gauge) has no backing field
// anywhere in LearningPathData — there is no "goal level" concept in this
// payload. It is omitted rather than fabricated.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
    final contextData = switch (authContext) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (contextData == null) return;
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    ref.read(learningPathProvider.notifier).load(
          bearerToken: token,
          studentId: contextData.user.id,
        );
  }

  Future<void> _refresh() async {
    final authContext = ref.read(authContextProvider);
    final authFlow = ref.read(authFlowProvider);

    final contextData = switch (authContext) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (contextData == null) return;
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    await ref.read(learningPathProvider.notifier).refresh(
          bearerToken: token,
          studentId: contextData.user.id,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(learningPathProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _LearningPathHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => const AIMFullScreenLoading(
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
              AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading learning path data',
                ),
            },
          ),
        ],
      ),
    );
  }
}

class _LearningPathHeader extends StatelessWidget {
  const _LearningPathHeader();

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
      child: SafeArea(
        bottom: false,
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
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Learning Path',
                    style:
                        AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                  ),
                  Text(
                    'Your personalized roadmap',
                    style: AimTextStyles.bodySm.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.85),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
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
      return const AIMEmptyState(
        icon: Icon(Icons.route_outlined),
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
            const LearningPathSectionHeader(title: 'Skill coverage'),
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
            // "AI picked" is descriptive chrome, not a fabricated field —
            // every card in this list already is a backend AIM-generated
            // recommendation by definition (see file header).
            const LearningPathSectionHeader(
              title: 'Next up',
              trailing: AIMBadge(
                tone: AIMBadgeTone.primary,
                variant: AIMBadgeVariant.soft,
                pill: true,
                icon: Icon(Icons.auto_awesome_outlined),
                child: Text('AI picked'),
              ),
            ),
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
