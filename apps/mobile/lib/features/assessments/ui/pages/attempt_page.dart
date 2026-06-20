// P10-058: AttemptPage — displays an active assessment attempt.
// Resumes the attempt on load, shows status, and allows submission.
// Question rendering is a future task; a placeholder is shown.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
  bool _submitting = false;

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

  void _submitAttempt() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    setState(() => _submitting = true);

    ref.read(submitAttemptProvider.notifier).submit(
          bearerToken: token,
          attemptId: widget.attemptId,
        );
  }

  void _onSubmitSuccess(SubmitAttemptResult result) {
    Navigator.of(context).pushReplacementNamed(
      '/student/assessments/result',
      arguments: {
        'attemptId': result.attemptId,
        'resultId': result.resultId,
        'assessmentTitle': widget.assessmentTitle,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final resumeState = ref.watch(resumeAttemptProvider);

    ref.listen<AppAsyncState<SubmitAttemptResult>>(
      submitAttemptProvider,
      (_, next) {
        switch (next) {
          case AppAsyncSuccess(:final data):
            _onSubmitSuccess(data);
          case AppAsyncFailure(:final message):
            setState(() => _submitting = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(message)),
            );
          case _:
            break;
        }
      },
    );

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.assessmentTitle),
      body: switch (resumeState) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: 'Resuming attempt',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _resumeAttempt,
          ),
        AppAsyncSuccess(:final data) => _AttemptContent(
            result: data,
            expiresAt: widget.expiresAt,
            submitting: _submitting,
            onSubmit: _submitAttempt,
          ),
        AppAsyncIdle() => AIMFullScreenLoading(
            semanticLabel: 'Resuming attempt',
          ),
      },
    );
  }
}

class _AttemptContent extends StatelessWidget {
  const _AttemptContent({
    required this.result,
    required this.expiresAt,
    required this.submitting,
    required this.onSubmit,
  });

  final ResumeAttemptResult result;
  final String? expiresAt;
  final bool submitting;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AIMCard(
            variant: AIMCardVariant.elevated,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.assignment_outlined,
                      size: AimSizes.iconSm,
                      color: AimColors.primary500,
                    ),
                    const SizedBox(width: AimSpacing.space8),
                    Text(
                      'Attempt Status',
                      style: AimTextStyles.h3
                          .copyWith(color: surfaces.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.componentGap),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AimSpacing.space8,
                    vertical: AimSpacing.space2,
                  ),
                  decoration: BoxDecoration(
                    color: AimColors.info500.withOpacity(0.12),
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
                if (expiresAt != null) ...[
                  const SizedBox(height: AimSpacing.space8),
                  Text(
                    'Expires: $expiresAt',
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          Expanded(
            child: AIMEmptyState(
              icon: Icons.quiz_outlined,
              title: 'Questions',
              message:
                  'Question rendering will be available in a future update.',
            ),
          ),
          AIMButton(
            onPressed: submitting ? null : onSubmit,
            loading: submitting,
            fullWidth: true,
            size: AIMButtonSize.large,
            semanticLabel: 'Submit attempt',
            child: const Text('Submit'),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
        ],
      ),
    );
  }
}
