// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Attempt" (27)
//   docs/design/ui-for-all-system-mobile/screenshots/light/27-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/27-screen.png
// Endpoint: GET /student/assessments/attempts/:attemptId/resume
//   NOTE: response has no question content; question rendering is blocked
//   on a backend gap, see code comment below.
// Widgets: AIMFullScreenLoading, AIMFullScreenError, AIMCard, AIMEmptyState,
//   AIMGradientButton
//
// P10-058: AttemptPage — displays an active assessment attempt.
// Resumes the attempt on load, shows status and a live countdown, and
// allows submission. Question rendering is blocked on a backend gap
// (see comment in _AttemptContent below) — a placeholder is shown instead.
//
// TASK-23: Submit no longer fires inline — it pushes the SubmitAttemptPage
// confirmation screen (design screen 28), which owns the actual submission
// and its loading state, per the design flow 27 → 28 → 29.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/features/assessments/ui/pages/submit_attempt_page.dart';

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

  /// Pushes the SubmitAttemptPage confirmation screen (design screen 28)
  /// instead of submitting inline; the confirmation page owns the submit
  /// call, its loading state, and navigation to the result screen.
  void _openSubmitConfirmation() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => SubmitAttemptPage(
          attemptId: widget.attemptId,
          assessmentTitle: widget.assessmentTitle,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final resumeState = ref.watch(resumeAttemptProvider);

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
                  onSubmit: _openSubmitConfirmation,
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
                onTap: () => Navigator.of(context).pop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
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

class _AttemptContent extends StatelessWidget {
  const _AttemptContent({
    required this.result,
    required this.onSubmit,
  });

  final ResumeAttemptResult result;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

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
          const Expanded(
            child: AIMEmptyState(
              icon: Icon(Icons.quiz_outlined),
              title: 'Questions',
              subtitle:
                  'Question rendering isn’t available yet for this '
                  'attempt.',
              // ─────────────────────────────────────────────────────────
              // BACKEND GAP — not a UI gap.
              //
              // Question rendering cannot be implemented: `ResumeAttemptResult`
              // (the model for `GET /student/assessments/attempts/:attemptId
              // /resume`) has exactly three fields — `attemptId`, `status`,
              // `expiresAt` — see
              // apps/mobile/lib/features/assessments/logic/entity/attempt_result.dart.
              // There is no question-content field on this response, and no
              // endpoint anywhere in this backend (confirmed against
              // docs/mobile-app-api-endpoints.md, June 2026 snapshot) returns
              // question stems/options/type for an assessment attempt — no
              // `.../attempts/:id/questions` or equivalent exists.
              //
              // The `question_answer` and `placement` features' question
              // widgets are NOT a substitute: they consume unrelated
              // endpoints (`/sessions/*`, `/placement/questions`) that have
              // nothing to do with assessment attempts, and wiring them here
              // would silently fabricate content the backend never sent.
              //
              // Until the backend adds an attempt-questions endpoint (and a
              // corresponding field/model), this placeholder is the correct,
              // honest UI state. A future engineer should treat this as
              // blocked-on-backend, not as unfinished frontend work.
              // ─────────────────────────────────────────────────────────
            ),
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
