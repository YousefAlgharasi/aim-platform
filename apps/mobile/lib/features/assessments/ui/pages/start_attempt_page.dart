// P10-057: StartAttemptPage — confirms and starts an assessment attempt.
// Calls backend start attempt endpoint; Flutter never evaluates eligibility.
//
// TASK-22: restyled to match design screen 26 — gradient header ("Start
// attempt"), a soft-warning clock badge, "Ready to begin?" copy that names
// the real time limit when the assessment has one, and a gradient Start
// Attempt button.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class StartAttemptPage extends ConsumerStatefulWidget {
  const StartAttemptPage({
    required this.assessmentId,
    required this.assessmentTitle,
    super.key,
    this.timeLimitSeconds,
  });

  final String assessmentId;
  final String assessmentTitle;
  final int? timeLimitSeconds;

  @override
  ConsumerState<StartAttemptPage> createState() => _StartAttemptPageState();
}

class _StartAttemptPageState extends ConsumerState<StartAttemptPage> {
  bool _starting = false;

  void _startAttempt() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    setState(() => _starting = true);
    ref.read(startAttemptProvider.notifier).start(
          bearerToken: token,
          assessmentId: widget.assessmentId,
        );
  }

  void _onStartSuccess(StartAttemptResult result) {
    context.pushReplacement(
      AppRoutePaths.assessmentAttempt,
      extra: {
        'attemptId': result.attemptId,
        'assessmentId': result.assessmentId,
        'assessmentTitle': widget.assessmentTitle,
        'expiresAt': result.expiresAt,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AppAsyncState<StartAttemptResult>>(
      startAttemptProvider,
      (_, next) {
        switch (next) {
          case AppAsyncSuccess(:final data):
            _onStartSuccess(data);
          case AppAsyncFailure(:final message, :final code):
            setState(() => _starting = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(_startErrorMessage(code, message)),
                backgroundColor: AimColors.error500,
              ),
            );
          case _:
            break;
        }
      },
    );

    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final timeLimitSeconds = widget.timeLimitSeconds;
    final subtitle = timeLimitSeconds != null
        ? l10n.assessmentsStartSubtitleTimed((timeLimitSeconds / 60).ceil())
        : l10n.assessmentsStartSubtitleUntimed;

    return Scaffold(
      backgroundColor: surfaces.background,
      appBar: AIMTopAppBar(
        title: AppLocalizations.of(context).assessmentsStartAttemptTitle,
        onBack: () => context.pop(),
      ),
      body: SafeArea(top: false, child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: AimSpacing.sectionGap),
            Center(
              child: Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AimColors.primary500.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.timer_outlined,
                  size: 36,
                  color: AimColors.primary500,
                ),
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              widget.assessmentTitle,
              style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space8),
            Text(
              subtitle,
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            AIMButton(
              variant: AIMButtonVariant.primary,
              size: AIMButtonSize.large,
              loading: _starting,
              fullWidth: true,
              onPressed: _startAttempt,
              semanticLabel:
                  '${AppLocalizations.of(context).assessmentsStartAttempt} ${widget.assessmentTitle}',
              child: Text(AppLocalizations.of(context).assessmentsStartAttempt),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMButton(
              variant: AIMButtonVariant.outline,
              size: AIMButtonSize.large,
              onPressed: () => context.pop(),
              fullWidth: true,
              child: Text(AppLocalizations.of(context).assessmentsGoBack),
            ),
          ],
        ),
      )),
    );
  }

  /// Backend start errors arrive as codes (or, from older responses, the code
  /// as the message); show the student a sentence instead.
  String _startErrorMessage(String? code, String message) {
    final l10n = AppLocalizations.of(context);
    final key = code == 'MAX_ATTEMPTS_REACHED' || message == 'MAX_ATTEMPTS_REACHED'
        ? 'MAX_ATTEMPTS_REACHED'
        : code;
    return switch (key) {
      'MAX_ATTEMPTS_REACHED' => l10n.assessmentsBlockedMaxAttempts,
      'CHAPTER_NOT_COMPLETE' => l10n.assessmentsBlockedChapter,
      'COURSE_NOT_COMPLETE' => l10n.assessmentsBlockedCourse,
      _ => message.isNotEmpty ? message : l10n.assessmentsStartFailed,
    };
  }
}
