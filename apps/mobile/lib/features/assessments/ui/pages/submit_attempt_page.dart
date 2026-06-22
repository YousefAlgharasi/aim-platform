// P10-061: SubmitAttemptPage — confirmation and submission flow for assessments.
// Submits the attempt to the backend; Flutter never evaluates correctness or
// computes scores. Backend is the final authority for grading and results.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

class SubmitAttemptPage extends ConsumerStatefulWidget {
  const SubmitAttemptPage({
    required this.attemptId,
    required this.assessmentTitle,
    super.key,
  });

  final String attemptId;
  final String assessmentTitle;

  @override
  ConsumerState<SubmitAttemptPage> createState() => _SubmitAttemptPageState();
}

class _SubmitAttemptPageState extends ConsumerState<SubmitAttemptPage> {
  bool _submitting = false;

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
      body: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Icon(
              Icons.assignment_turned_in_outlined,
              size: AimSizes.avatarLg,
              color: AimColors.primary500,
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              'Are you sure you want to submit?',
              style: AimTextStyles.h2,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.componentGap),
            Text(
              'Once submitted, you will not be able to change your answers. '
              'Your responses will be sent to the server for grading.',
              style: AimTextStyles.bodyMd,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.componentGap),
            // Finality warning
            Container(
              padding: const EdgeInsets.all(AimSpacing.componentGap),
              decoration: BoxDecoration(
                color: AimColors.error100,
                borderRadius: AimRadius.borderSm,
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    size: AimSizes.iconSm,
                    color: AimColors.error500,
                  ),
                  const SizedBox(width: AimSpacing.space8),
                  Expanded(
                    child: Text(
                      'This action is final and cannot be undone.',
                      style: AimTextStyles.bodySm.copyWith(
                        color: AimColors.error700,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            AIMButton(
              onPressed: _submitting ? null : _submitAttempt,
              loading: _submitting,
              fullWidth: true,
              size: AIMButtonSize.large,
              semanticLabel:
                  'Submit attempt for ${widget.assessmentTitle}',
              child: const Text('Submit'),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMButton(
              variant: AIMButtonVariant.outline,
              onPressed: _submitting ? null : () => Navigator.of(context).pop(),
              disabled: _submitting,
              fullWidth: true,
              child: const Text('Go Back'),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
        ),
      ),
    );
  }
}
