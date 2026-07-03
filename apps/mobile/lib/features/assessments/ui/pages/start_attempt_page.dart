// P10-057: StartAttemptPage — confirms and starts an assessment attempt.
// Calls backend start attempt endpoint; Flutter never evaluates eligibility.
//
// TASK-22: restyled to match design screen 26 — gradient header ("Start
// attempt"), a soft-warning clock badge, "Ready to begin?" copy that names
// the real time limit when the assessment has one, and a gradient Start
// Attempt button.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
    this.timeLimitSeconds,
  });

  final String assessmentId;
  final String assessmentTitle;

  /// The assessment's real time limit, passed from the detail page. Null
  /// when the assessment has no time limit — the confirmation copy falls
  /// back to a generic sentence rather than fabricating a duration.
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

    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final timeLimitSeconds = widget.timeLimitSeconds;
    final bodyCopy = timeLimitSeconds != null
        ? 'Once you start, the ${_formatMinutes(timeLimitSeconds)}-minute '
            'timer runs continuously — even if you leave the app. Make sure '
            'you have time to finish.'
        : 'Once you start, the attempt will be recorded. Make sure you are '
            'ready before proceeding.';

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _StartAttemptHeader(title: 'Start attempt'),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.sectionGap,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Spacer(),
                  Center(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: soft.warning,
                        shape: BoxShape.circle,
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(AimSpacing.space16),
                        child: Icon(
                          Icons.access_time,
                          size: AimSizes.iconLg,
                          color: soft.onWarning,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  Text(
                    'Ready to begin?',
                    style: AimTextStyles.h2.copyWith(
                      color: surfaces.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  Text(
                    bodyCopy,
                    style: AimTextStyles.bodyMd.copyWith(
                      color: surfaces.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const Spacer(),
                  AIMGradientButton(
                    label: 'Start Attempt',
                    loading: _starting,
                    fullWidth: true,
                    onPressed: _startAttempt,
                    semanticLabel:
                        'Start attempt for ${widget.assessmentTitle}',
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  AIMButton(
                    variant: AIMButtonVariant.outline,
                    onPressed: () => context.pop(),
                    fullWidth: true,
                    child: const Text('Go Back'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatMinutes(int seconds) => (seconds / 60).round().toString();
}

// ── Gradient header ─────────────────────────────────────────────────────────

class _StartAttemptHeader extends StatelessWidget {
  const _StartAttemptHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Container(
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
                child: Text(
                  title,
                  style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
