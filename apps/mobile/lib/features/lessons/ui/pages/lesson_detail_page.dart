// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Lesson detail"
//   docs/design/ui-for-all-system-mobile/screenshots/light/09-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/09-screen.png
// Endpoint: GET /curriculum/lesson-assets?lessonId=:lessonId&status=published
//   (LessonDetail = Lesson + LessonAsset list; see lessons_provider.dart)
// Widgets: AIMTopAppBar (disabled bookmark action), AIMCard/LessonStepTile,
//   LessonContentRenderer (in modal bottom sheet), AIMButton, AIMBadge
//
// Phase 6 — P6-079
// LessonDetailPage — lesson overview screen.
//
// Displays a gradient hero (description + duration/steps/XP pills), a
// "What's inside" step list (one row per published asset), and a
// "Start practice" CTA that opens the AI Teacher chat with this lesson as
// context. Tapping a step row opens a modal bottom sheet that renders that
// asset's full content via LessonContentRenderer — this screen itself
// remains an overview, not the content viewer.
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
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
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
    context.push(
      AppRoutePaths.aiTeacherChat,
      extra: {
        'contextRef': 'lesson:${detail.lesson.id}',
        'lessonTitle': detail.lesson.title,
        'contextLabel': AppLocalizations.of(context).lessonsPracticeContextLabel,
      },
    );
  }

  // P21-017: the same contextRef used for the chat entry point above — the
  // backend's get-or-create-by-(studentId, contextRef) path (P21-007)
  // resolves both to the identical ai_chat_sessions row, so a lesson's chat
  // and voice turns share one conversation regardless of which entry point
  // the student taps first.
  void _startVoicePractice(LessonDetail detail) {
    context.push(
      AppRoutePaths.voiceTeacher,
      extra: {
        'contextRef': 'lesson:${detail.lesson.id}',
      },
    );
  }

  void _openStep(LessonAsset asset, int stepNumber) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _LessonStepSheet(
        asset: asset,
        stepNumber: stepNumber,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(lessonDetailProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AIMTopAppBar(
        title: l10n.lessonsLessonAppBarTitle,
        onBack: () {
          if (context.canPop()) context.pop();
        },
        actions: [
          // Visual only — no bookmark/save-lesson endpoint exists yet, so
          // this action is disabled rather than a dead-end tap.
          AIMIconButton(
            icon: const Icon(Icons.bookmark_border_rounded),
            semanticLabel: l10n.lessonsSaveLessonComingSoonSemantic,
            onPressed: null,
          ),
        ],
      ),
      body: switch (state) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: l10n.lessonsLoadingLessonSemantic,
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _LessonDetailContent(
            detail: data,
            onRefresh: _refresh,
            onStartPractice: () => _startPractice(data),
            onStartVoicePractice: () => _startVoicePractice(data),
            onOpenStep: _openStep,
          ),
        AppAsyncIdle() => AIMFullScreenLoading(
            semanticLabel: l10n.lessonsLoadingLessonSemantic,
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
    required this.onStartVoicePractice,
    required this.onOpenStep,
  });

  final LessonDetail detail;
  final Future<void> Function() onRefresh;
  final VoidCallback onStartPractice;
  final VoidCallback onStartVoicePractice;
  final void Function(LessonAsset asset, int stepNumber) onOpenStep;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

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
                      l10n.lessonsWhatsInsideTitle,
                      style: AimTextStyles.h3.copyWith(
                        color: surfaces.textPrimary,
                      ),
                    ),
                    Text(
                      l10n.lessonsStepsCountLabel(detail.assets.length),
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.componentGap),
                if (detail.hasNoContent)
                  AIMEmptyState(
                    icon: const Icon(Icons.play_lesson_outlined),
                    title: l10n.lessonsNoContentTitle,
                    subtitle: l10n.lessonsNoContentSubtitle,
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
                            onTap: () => onOpenStep(entry.value, entry.key + 1),
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
            child: Row(
              children: [
                Expanded(
                  child: AIMButton(
                    onPressed: detail.hasNoContent ? null : onStartPractice,
                    fullWidth: true,
                    leadingIcon: const Icon(Icons.play_arrow, color: Colors.white),
                    child: Text(l10n.lessonsStartPracticeButton),
                  ),
                ),
                const SizedBox(width: AimSpacing.space8),
                // P21-017: voice entry point, same contextRef as the text
                // chat CTA above.
                AIMIconButton(
                  icon: const Icon(Icons.mic_rounded),
                  semanticLabel: 'Practice by voice',
                  onPressed: detail.hasNoContent ? null : onStartVoicePractice,
                ),
              ],
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
    final l10n = AppLocalizations.of(context);
    final totalSeconds = detail.assets.fold<int>(
      0,
      (sum, asset) => sum + (asset.durationSeconds ?? 0),
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AimSpacing.sectionGap),
      decoration: const BoxDecoration(
        gradient: AimGradients.ai,
        borderRadius: AimRadius.borderXl,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // "Lesson {sortOrder}" — sortOrder is the lesson's real
          // backend-supplied position within its chapter. The design
          // screenshot also shows a "· A2" CEFR-level suffix, but no
          // level field exists on this endpoint's Lesson entity, so it is
          // intentionally omitted rather than fabricated (see the
          // real-data-only precedent in lesson_list_tile.dart).
          _HeroPill(text: l10n.lessonsLessonNumberPill(detail.lesson.sortOrder)),
          const SizedBox(height: AimSpacing.space8),
          Text(
            detail.lesson.title,
            style: AimTextStyles.h2.copyWith(color: Colors.white),
          ),
          const SizedBox(height: AimSpacing.space4),
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
              if (totalSeconds > 0)
                _HeroPill(text: _formatMinutes(l10n, totalSeconds)),
              _HeroPill(text: l10n.lessonsBlocksCountLabel(detail.assets.length)),
              if (detail.lesson.xpValue > 0)
                AIMBadge(
                  tone: AIMBadgeTone.success,
                  variant: AIMBadgeVariant.solid,
                  pill: true,
                  child: Text(l10n.lessonsXpBadge(detail.lesson.xpValue)),
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatMinutes(AppLocalizations l10n, int seconds) {
    final minutes = (seconds / 60).ceil();
    return l10n.lessonsMinutesLabel(minutes);
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

// ---------------------------------------------------------------------------
// Step content bottom sheet — wraps the already-tested LessonContentRenderer
// ---------------------------------------------------------------------------

/// Modal bottom sheet shown when a [LessonStepTile] row is tapped.
///
/// Renders the tapped step's full content via [LessonContentRenderer] (image
/// preview, audio/video info card, etc.) — all values are backend-supplied
/// verbatim; this sheet only adds a drag handle, title, and close affordance
/// around the existing renderer. Styling mirrors [AIMNotificationsSheet],
/// the codebase's existing showModalBottomSheet convention.
class _LessonStepSheet extends StatelessWidget {
  const _LessonStepSheet({
    required this.asset,
    required this.stepNumber,
  });

  final LessonAsset asset;
  final int stepNumber;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);
    final l10n = AppLocalizations.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(AimRadius.x2l),
          topEnd: Radius.circular(AimRadius.x2l),
        ),
        boxShadow: shadows.sheet,
      ),
      child: SafeArea(
        top: false,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.sizeOf(context).height * 0.85,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Drag handle
              Padding(
                padding: const EdgeInsets.only(top: AimSpacing.space12),
                child: Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: surfaces.border,
                      borderRadius: AimRadius.borderPill,
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(
                  AimSpacing.screenPaddingMobile,
                  AimSpacing.space12,
                  AimSpacing.space8,
                  AimSpacing.space8,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        l10n.lessonsStepTitleLabel(stepNumber),
                        style: AimTextStyles.h3.copyWith(
                          color: surfaces.textPrimary,
                        ),
                      ),
                    ),
                    AIMIconButton(
                      icon: const Icon(Icons.close_rounded),
                      semanticLabel: l10n.commonClose,
                      onPressed: () => context.pop(),
                    ),
                  ],
                ),
              ),
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsetsDirectional.fromSTEB(
                    AimSpacing.screenPaddingMobile,
                    0,
                    AimSpacing.screenPaddingMobile,
                    AimSpacing.sectionGap,
                  ),
                  child: LessonContentRenderer(asset: asset),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
