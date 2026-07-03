// P10-057: StartAttemptPage — confirms and starts an assessment attempt.
// Calls backend start attempt endpoint; Flutter never evaluates eligibility.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

class StartAttemptPage extends ConsumerStatefulWidget {
  const StartAttemptPage({
    required this.assessmentId,
    required this.assessmentTitle,
    super.key,
  });

  final String assessmentId;
  final String assessmentTitle;

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
          case AppAsyncFailure(:final message):
            setState(() => _starting = false);
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
            const Icon(
              Icons.play_circle_outline,
              size: AimSizes.avatarLg,
              color: AimColors.primary500,
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            const Text(
              'Ready to start?',
              style: AimTextStyles.h2,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.componentGap),
            const Text(
              'Once you start, the attempt will be recorded. '
              'Make sure you are ready before proceeding.',
              style: AimTextStyles.bodyMd,
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            AIMButton(
              onPressed: _starting ? null : _startAttempt,
              loading: _starting,
              fullWidth: true,
              size: AIMButtonSize.large,
              semanticLabel: 'Start attempt for ${widget.assessmentTitle}',
              child: const Text('Start Attempt'),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMButton(
              variant: AIMButtonVariant.outline,
              onPressed: () => context.pop(),
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
