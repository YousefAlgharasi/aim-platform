// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Attempt" (27)
//   docs/design/ui-for-all-system-mobile/screenshots/light/27-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/27-screen.png
// Endpoints: GET /student/assessments/attempts/:attemptId/resume
//   GET /student/assessments/attempts/:attemptId/questions
//   POST /student/assessments/attempts/:attemptId/answers
// Widgets: AIMFullScreenLoading, AIMFullScreenError, AIMCard, AIMEmptyState,
//   AIMGradientButton
//
// P10-058: AttemptPage — displays an active assessment attempt.
// Resumes the attempt on load, loads the question list, shows status and a
// live countdown, and allows submission. Selecting an option submits the
// answer to the backend immediately — Flutter never grades or scores it.
//
// TASK-23: Submit no longer fires inline — it pushes the SubmitAttemptPage
// confirmation screen (design screen 28), which owns the actual submission
// and its loading state, per the design flow 27 → 28 → 29.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

class AttemptPage extends ConsumerStatefulWidget {
  const AttemptPage({
    required this.attemptId,
    required this.assessmentTitle,
    this.expiresAt,
    super.key,
  });

  final String attemptId;
  final String assessmentTitle;
  final String? expiresAt;

  @override
  ConsumerState<AttemptPage> createState() => _AttemptPageState();
}

class _AttemptPageState extends ConsumerState<AttemptPage> {
  bool _questionsRequested = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _resumeAttempt());
  }

  void _resumeAttempt() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(resumeAttemptProvider.notifier).resume(
          bearerToken: token,
          attemptId: widget.attemptId,
        );
  }

  void _loadQuestions() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(attemptQuestionsProvider.notifier).load(
          bearerToken: token,
          attemptId: widget.attemptId,
        );
  }

  void _submitAnswer({
    required String assessmentQuestionLinkId,
    required String responseValue,
  }) {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(submitAnswerProvider.notifier).submit(
          bearerToken: token,
          attemptId: widget.attemptId,
          assessmentQuestionLinkId: assessmentQuestionLinkId,
          responseValue: responseValue,
        );
  }

  /// Pushes the SubmitAttemptPage confirmation screen (design screen 28)
  /// instead of submitting inline; the confirmation page owns the submit
  /// call, its loading state, and navigation to the result screen.
  void _openSubmitConfirmation() {
    context.push(
      AppRoutePaths.assessmentSubmit,
      extra: {
        'attemptId': widget.attemptId,
        'assessmentTitle': widget.assessmentTitle,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final resumeState = ref.watch(resumeAttemptProvider);
    // Keep attemptQuestionsProvider alive for the page's lifetime — it's
    // autoDispose, so it must be watched continuously from the moment the
    // load is kicked off, otherwise Riverpod tears it down (no listener)
    // before the network response arrives and the result is lost.
    ref.watch(attemptQuestionsProvider);

    if (resumeState is AppAsyncSuccess && !_questionsRequested) {
      _questionsRequested = true;
      WidgetsBinding.instance.addPostFrameCallback((_) => _loadQuestions());
    }

    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _AttemptHeader(
            title: widget.assessmentTitle,
            expiresAt: widget.expiresAt,
          ),
          Expanded(
            child: switch (resumeState) {
              AppAsyncLoading() => const AIMFullScreenLoading(
                  semanticLabel: 'Resuming attempt',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _resumeAttempt,
                ),
              AppAsyncSuccess(:final data) => _AttemptContent(
                  result: data,
                  attemptId: widget.attemptId,
                  onSubmit: _openSubmitConfirmation,
                  onAnswerSelect: _submitAnswer,
                ),
              AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Resuming attempt',
                ),
            },
          ),
        ],
      ),
    );
  }
}

// ── Gradient header ─────────────────────────────────────────────────────────

/// Hero header mirroring [RegisterPage]'s back-button/title pattern, with a
/// live-updating countdown pill sourced from the real `expiresAt` field
/// returned by the resume endpoint.
class _AttemptHeader extends StatefulWidget {
  const _AttemptHeader({required this.title, required this.expiresAt});

  final String title;
  final String? expiresAt;

  @override
  State<_AttemptHeader> createState() => _AttemptHeaderState();
}

class _AttemptHeaderState extends State<_AttemptHeader> {
  Timer? _ticker;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateRemaining();
    if (widget.expiresAt != null) {
      _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
        if (!mounted) return;
        _updateRemaining();
      });
    }
  }

  @override
  void didUpdateWidget(covariant _AttemptHeader oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.expiresAt != widget.expiresAt) {
      _ticker?.cancel();
      _updateRemaining();
      if (widget.expiresAt != null) {
        _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
          if (!mounted) return;
          _updateRemaining();
        });
      }
    }
  }

  void _updateRemaining() {
    final expiresAt = widget.expiresAt;
    if (expiresAt == null) return;
    final deadline = DateTime.tryParse(expiresAt);
    if (deadline == null) return;
    final diff = deadline.difference(DateTime.now());
    setState(() {
      _remaining = diff.isNegative ? Duration.zero : diff;
    });
  }

  String get _formatted {
    final totalSeconds = _remaining.inSeconds;
    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;
    final mm = minutes.toString().padLeft(2, '0');
    final ss = seconds.toString().padLeft(2, '0');
    if (hours > 0) {
      final hh = hours.toString().padLeft(2, '0');
      return '$hh:$mm:$ss';
    }
    return '$mm:$ss';
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

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
                onTap: () => context.pop(),
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
              child: Text(
                widget.title,
                style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (widget.expiresAt != null) ...[
              const SizedBox(width: AimSpacing.space8),
              _CountdownPill(label: _formatted),
            ],
          ],
        ),
      ),
    );
  }
}

/// Amber countdown pill matching the screenshot's "⏱ 14:32" affordance.
///
/// Display-only: reaching `00:00` does not trigger auto-submission or any
/// other business logic — that would be new scope beyond this UI task.
class _CountdownPill extends StatelessWidget {
  const _CountdownPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Time remaining: $label',
      child: Container(
        constraints: const BoxConstraints(minHeight: AimSizes.touchTarget),
        padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AimSpacing.space12,
          vertical: AimSpacing.space8,
        ),
        decoration: BoxDecoration(
          color: AimColors.warning500.withValues(alpha: 0.18),
          borderRadius: AimRadius.borderPill,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.timer_outlined,
              size: AimSizes.iconSm,
              color: AimColors.warning500,
            ),
            const SizedBox(width: AimSpacing.space4),
            Text(
              label,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: AimColors.warning500,
                    fontWeight: FontWeight.w700,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Body content ────────────────────────────────────────────────────────────

class _AttemptContent extends ConsumerWidget {
  const _AttemptContent({
    required this.result,
    required this.attemptId,
    required this.onSubmit,
    required this.onAnswerSelect,
  });

  final ResumeAttemptResult result;
  final String attemptId;
  final VoidCallback onSubmit;
  final void Function({
    required String assessmentQuestionLinkId,
    required String responseValue,
  }) onAnswerSelect;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final questionsState = ref.watch(attemptQuestionsProvider);
    final draftState = ref.watch(answerDraftProvider(attemptId));
    final draftNotifier = ref.read(answerDraftProvider(attemptId).notifier);

    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.sectionGap,
        AimSpacing.screenPaddingMobile,
        AimSpacing.sectionGap,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AIMCard(
            variant: AIMCardVariant.elevated,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _StatusRow(
                  label: 'Status',
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.space8,
                      vertical: AimSpacing.space2,
                    ),
                    decoration: BoxDecoration(
                      color: AimColors.info500.withValues(alpha: 0.12),
                      borderRadius: AimRadius.borderSm,
                    ),
                    child: Text(
                      result.status == 'in_progress'
                          ? 'In Progress'
                          : result.status,
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(color: AimColors.info500),
                    ),
                  ),
                ),
                // Note: ResumeAttemptResult has no "started at" field, so a
                // "Started" row (present in the design mockup) is
                // intentionally omitted rather than fabricated — see the
                // backend-gap comment below for why the entity is this
                // minimal.
                if (result.expiresAt != null) ...[
                  const SizedBox(height: AimSpacing.componentGap),
                  _StatusRow(
                    label: 'Expires',
                    trailing: Text(
                      result.expiresAt!,
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          Expanded(
            child: switch (questionsState) {
              AppAsyncLoading() || AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading questions',
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: () => ref
                      .read(attemptQuestionsProvider.notifier)
                      .load(
                        bearerToken:
                            ref.read(authFlowProvider).accessToken ?? '',
                        attemptId: attemptId,
                      ),
                ),
              AppAsyncSuccess(:final data) => data.isEmpty
                  ? const AIMEmptyState(
                      icon: Icon(Icons.quiz_outlined),
                      title: 'Questions',
                      subtitle: 'No questions found for this attempt.',
                    )
                  : ListView.separated(
                      itemCount: data.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: AimSpacing.componentGap),
                      itemBuilder: (context, index) {
                        final question = data[index];
                        final selectedOptionId = draftState
                            .drafts[question.assessmentQuestionLinkId]
                            ?.selectedOptionId;
                        return _QuestionCard(
                          index: index,
                          question: question,
                          selectedOptionId: selectedOptionId,
                          onOptionSelected: (optionId) {
                            draftNotifier.setAnswer(
                              question.assessmentQuestionLinkId,
                              selectedOptionId: optionId,
                            );
                            onAnswerSelect(
                              assessmentQuestionLinkId:
                                  question.assessmentQuestionLinkId,
                              responseValue: optionId,
                            );
                          },
                        );
                      },
                    ),
            },
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          AIMGradientButton(
            label: 'Submit',
            onPressed: onSubmit,
            fullWidth: true,
            semanticLabel: 'Submit attempt',
          ),
        ],
      ),
    );
  }
}

/// Renders a single question with its options. Selecting an option submits
/// the answer to the backend immediately — Flutter never grades or scores
/// it locally, only collects and forwards the selection verbatim.
class _QuestionCard extends StatelessWidget {
  const _QuestionCard({
    required this.index,
    required this.question,
    required this.selectedOptionId,
    required this.onOptionSelected,
  });

  final int index;
  final AttemptQuestion question;
  final String? selectedOptionId;
  final ValueChanged<String> onOptionSelected;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Question ${index + 1}',
            style: AimTextStyles.bodySm.copyWith(
              color: surfaces.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            question.prompt,
            style: AimTextStyles.bodyMd.copyWith(
              color: surfaces.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (question.options.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.componentGap),
            for (final option in question.options)
              Padding(
                padding: const EdgeInsets.only(bottom: AimSpacing.space8),
                child: AIMAnswerOption(
                  optionKey: option.label,
                  state: option.id == selectedOptionId
                      ? AIMAnswerOptionState.selected
                      : AIMAnswerOptionState.defaultState,
                  onTap: () => onOptionSelected(option.id),
                  semanticLabel: option.text,
                  child: Text(option.text),
                ),
              ),
          ],
        ],
      ),
    );
  }
}

/// Clean two-column key/value row matching the screenshot's status card.
class _StatusRow extends StatelessWidget {
  const _StatusRow({required this.label, required this.trailing});

  final String label;
  final Widget trailing;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
        ),
        trailing,
      ],
    );
  }
}
