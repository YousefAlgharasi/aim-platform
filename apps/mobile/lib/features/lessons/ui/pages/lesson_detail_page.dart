// Phase 6 — P6-079
// LessonDetailPage — lesson overview screen.
//
// Displays a gradient hero (description + duration/steps/XP pills), a
// "What's inside" step list (one row per published asset), and a
// "Start practice" CTA that opens the AI Teacher chat with this lesson as
// context. Full inline asset content (image/audio/etc.) is intentionally not
// rendered here — this screen is an overview, not the content viewer.
//
// Security rules:
// - lessonId is always the backend-supplied value from LessonModel; never
//   from user input or local computation.
// - Flutter never computes type, status, order, or asset values; duration
//   total and step count are simple sums/counts of backend-supplied fields,
//   never inferred mastery/AIM values.
// - Bearer token from authFlowProvider; never stored here.
// - xpValue is backend-supplied and display-only — never read by the AIM
//   Engine, mastery scoring, or any local computation here.
// - The AI Teacher chat session itself is created entirely backend-side;
//   Flutter only navigates with a contextRef/lessonTitle hint.
// - No secrets here.
//
// RTL/Arabic rules:
// - Directionality-aware Column/ListView throughout.
// - AIMTopAppBar handles back-arrow mirroring internally.
// - EdgeInsets.symmetric mirrors correctly under RTL.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import '../widgets/lessons_widgets.dart';

/// Lesson detail screen MVP.
///
/// Expects route arguments: `{'lessonId': String, 'lessonTitle': String}`.
/// [lessonId] must be backend-supplied; never constructed from user input.
class LessonDetailPage extends ConsumerStatefulWidget {
  const LessonDetailPage({
    required this.lessonId,
    required this.lessonTitle,
    super.key,
  });

  /// Backend-supplied lesson UUID from the prior LessonModel response.
  final String lessonId;

  /// Display title for the AppBar (from the prior LessonModel).
  final String lessonTitle;

  @override
  ConsumerState<LessonDetailPage> createState() => _LessonDetailPageState();
}

class _LessonDetailPageState extends ConsumerState<LessonDetailPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(lessonDetailProvider.notifier).load(
          bearerToken: token,
          lessonId: widget.lessonId,
        );
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(lessonDetailProvider.notifier).refresh(
          bearerToken: token,
          lessonId: widget.lessonId,
        );
  }

  void _startPractice(LessonDetail detail) {
    Navigator.of(context).pushNamed(
      AppRoutePaths.aiTeacherChat,
      arguments: {
        'contextRef': 'lesson:${detail.lesson.id}',
        'lessonTitle': detail.lesson.title,
        'contextLabel': 'Lesson practice',
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(lessonDetailProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.lessonTitle),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading lesson',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _LessonDetailContent(
            detail: data,
            onRefresh: _refresh,
            onStartPractice: () => _startPractice(data),
          ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading lesson',
          ),
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

class _LessonDetailContent extends StatelessWidget {
  const _LessonDetailContent({
    required this.detail,
    required this.onRefresh,
    required this.onStartPractice,
  });

  final LessonDetail detail;
  final Future<void> Function() onRefresh;
  final VoidCallback onStartPractice;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Column(
      children: [
        Expanded(
          child: RefreshIndicator(
            onRefresh: onRefresh,
            child: ListView(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.sectionGap,
              ),
              children: [
                _LessonHero(detail: detail),
                const SizedBox(height: AimSpacing.sectionGap),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "What's inside",
                      style: AimTextStyles.h3.copyWith(
                        color: surfaces.textPrimary,
                      ),
                    ),
                    Text(
                      '${detail.assets.length} steps',
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.componentGap),
                if (detail.hasNoContent)
                  const AIMEmptyState(
                    icon: Icon(Icons.play_lesson_outlined),
                    title: 'No content yet',
                    subtitle: 'Published lesson content will appear here.',
                  )
                else
                  ...detail.assets.asMap().entries.map(
                        (entry) => Padding(
                          padding: const EdgeInsets.only(
                            bottom: AimSpacing.listItemGap,
                          ),
                          child: LessonStepTile(
                            asset: entry.value,
                            stepNumber: entry.key + 1,
                          ),
                        ),
                      ),
              ],
            ),
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.screenPaddingMobile,
              vertical: AimSpacing.componentGap,
            ),
            child: AIMButton(
              onPressed: detail.hasNoContent ? null : onStartPractice,
              fullWidth: true,
              leadingIcon: const Icon(Icons.play_arrow, color: Colors.white),
              child: const Text('Start practice'),
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Hero banner — description + duration/steps/XP pills
// ---------------------------------------------------------------------------

class _LessonHero extends StatelessWidget {
  const _LessonHero({required this.detail});

  final LessonDetail detail;

  @override
  Widget build(BuildContext context) {
    final totalSeconds = detail.assets.fold<int>(
      0,
      (sum, asset) => sum + (asset.durationSeconds ?? 0),
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AimSpacing.sectionGap),
      decoration: BoxDecoration(
        gradient: AimGradients.ai,
        borderRadius: AimRadius.borderXl,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (detail.lesson.description.isNotEmpty)
            Text(
              detail.lesson.description,
              style: AimTextStyles.bodyMd.copyWith(color: Colors.white),
            ),
          const SizedBox(height: AimSpacing.componentGap),
          Wrap(
            spacing: AimSpacing.space8,
            runSpacing: AimSpacing.space8,
            children: [
              if (totalSeconds > 0) _HeroPill(text: _formatMinutes(totalSeconds)),
              _HeroPill(text: '${detail.assets.length} blocks'),
              if (detail.lesson.xpValue > 0)
                AIMBadge(
                  tone: AIMBadgeTone.success,
                  variant: AIMBadgeVariant.solid,
                  pill: true,
                  child: Text('+${detail.lesson.xpValue} XP'),
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatMinutes(int seconds) {
    final minutes = (seconds / 60).ceil();
    return '$minutes min';
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.space12,
        vertical: AimSpacing.space4,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: AimRadius.borderPill,
      ),
      child: Text(
        text,
        style: AimTextStyles.bodySm.copyWith(color: Colors.white),
      ),
    );
  }
}
