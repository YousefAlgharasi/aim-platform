import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_submit_notifier.dart';

class PlacementSubmitPage extends ConsumerStatefulWidget {
  const PlacementSubmitPage({
    super.key,
    required this.attemptId,
    this.totalSections,
    this.completedCount,
    this.skippedCount,
    this.totalQuestions,
  });

  final String attemptId;
  final int? totalSections;
  final int? completedCount;
  final int? skippedCount;
  final int? totalQuestions;

  @override
  ConsumerState<PlacementSubmitPage> createState() =>
      _PlacementSubmitPageState();
}

class _PlacementSubmitPageState extends ConsumerState<PlacementSubmitPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      ref.read(placementSubmitProvider.notifier).completeAttempt(
            token,
            attemptId: widget.attemptId,
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(placementSubmitProvider);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    ref.listen<PlacementSubmitState>(placementSubmitProvider, (_, next) {
      if (next is PlacementSubmitSuccess && context.mounted) {
        Future.delayed(const Duration(milliseconds: 1800), () {
          if (context.mounted) {
            context.pushReplacement(
              AppRoutePaths.placementResult,
              extra: {'attemptId': next.attemptId},
            );
          }
        });
      }
    });

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: state is PlacementSubmitError
            ? AIMFullScreenError(
                message: state.message,
                retryLabel: l10n.commonRetry,
                onRetry: () {
                  ref.read(placementSubmitProvider.notifier).reset();
                  final token = ref.read(authFlowProvider).accessToken ?? '';
                  ref.read(placementSubmitProvider.notifier).completeAttempt(
                        token,
                        attemptId: widget.attemptId,
                      );
                },
              )
            : SafeArea(
                child: _SubmissionSuccessfulBody(
                  completedCount: widget.completedCount ?? 18,
                  skippedCount: widget.skippedCount ?? 2,
                  totalQuestions: widget.totalQuestions ?? 20,
                ),
              ),
      ),
    );
  }
}

class _SubmissionSuccessfulBody extends StatelessWidget {
  const _SubmissionSuccessfulBody({
    required this.completedCount,
    required this.skippedCount,
    required this.totalQuestions,
  });

  final int completedCount;
  final int skippedCount;
  final int totalQuestions;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space32,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(flex: 2),
          // ── Centered Sparkles Badge (Figma: 80x80 purple circle + white ✦) ──
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AimColors.primary500,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AimColors.primary500.withValues(alpha: 0.25),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                '✦',
                style: TextStyle(
                  color: AimColors.neutral0,
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: AimSpacing.space24),

          // ── Title & Subtitle ───────────────────────────────────────────────
          Text(
            l10n.placementSubmitSuccessfulTitle,
            style: AimTextStyles.h2.copyWith(
              color: surfaces.textPrimary,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Text(
            l10n.placementSubmitEvaluatingMessage,
            style: AimTextStyles.bodySm.copyWith(
              color: surfaces.textSecondary,
            ),
          ),
          const SizedBox(height: AimSpacing.space32),

          // ── Stat Card (Completed vs Skipped) ──────────────────────────────
          Container(
            padding: const EdgeInsets.all(AimSpacing.cardPaddingLg),
            decoration: BoxDecoration(
              color: surfaces.surface,
              borderRadius: AimRadius.borderLg,
              border: Border.all(color: surfaces.border),
              boxShadow: [
                BoxShadow(
                  color: AimColors.neutral900.withValues(alpha: 0.03),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: AimColors.success500.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.check,
                          size: 14,
                          color: AimColors.success500,
                        ),
                      ),
                    ),
                    const SizedBox(width: AimSpacing.componentGap),
                    Text(
                      l10n.placementSubmitCompletedQuestions,
                      style: AimTextStyles.bodySm.copyWith(
                        fontWeight: AimFontWeights.medium,
                        color: surfaces.textPrimary,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '$completedCount / $totalQuestions',
                      style: AimTextStyles.bodySm.copyWith(
                        fontWeight: AimFontWeights.bold,
                        color: AimColors.primary500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.cardPadding),
                Divider(height: 1, color: surfaces.divider),
                const SizedBox(height: AimSpacing.cardPadding),
                Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: surfaces.textMuted.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Icon(
                          Icons.fast_forward_rounded,
                          size: 14,
                          color: surfaces.textMuted,
                        ),
                      ),
                    ),
                    const SizedBox(width: AimSpacing.componentGap),
                    Text(
                      l10n.placementSubmitSkippedQuestions,
                      style: AimTextStyles.bodySm.copyWith(
                        fontWeight: AimFontWeights.medium,
                        color: surfaces.textPrimary,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '$skippedCount',
                      style: AimTextStyles.bodySm.copyWith(
                        fontWeight: AimFontWeights.bold,
                        color: surfaces.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Spacer(flex: 3),

          // ── Loading Spinner & AI Calibration Text ──────────────────────────
          const SizedBox(
            width: 32,
            height: 32,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(AimColors.primary500),
            ),
          ),
          const SizedBox(height: AimSpacing.space20),
          Text(
            l10n.placementSubmitAnalyzingAnswers,
            style: AimTextStyles.bodyLg.copyWith(
              fontWeight: AimFontWeights.bold,
              color: AimColors.primary500,
            ),
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Text(
            l10n.placementSubmitCalibratingBody,
            textAlign: TextAlign.center,
            style: AimTextStyles.caption.copyWith(
              color: surfaces.textSecondary,
              height: 1.5,
            ),
          ),
          const Spacer(flex: 1),
        ],
      ),
    );
  }
}
