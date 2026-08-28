import 'dart:async';
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

class _SubmissionSuccessfulBody extends StatefulWidget {
  const _SubmissionSuccessfulBody({
    required this.completedCount,
    required this.skippedCount,
    required this.totalQuestions,
  });

  final int completedCount;
  final int skippedCount;
  final int totalQuestions;

  @override
  State<_SubmissionSuccessfulBody> createState() =>
      _SubmissionSuccessfulBodyState();
}

class _SubmissionSuccessfulBodyState extends State<_SubmissionSuccessfulBody> {
  int _analysisStep = 0;
  Timer? _stepTimer;

  static const _steps = [
    'Evaluating response accuracy...',
    'Calibrating skill level...',
    'Generating personalized roadmap...',
  ];

  @override
  void initState() {
    super.initState();
    _stepTimer = Timer.periodic(const Duration(milliseconds: 900), (timer) {
      if (!mounted) return;
      setState(() {
        if (_analysisStep < _steps.length - 1) {
          _analysisStep++;
        }
      });
    });
  }

  @override
  void dispose() {
    _stepTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space24,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: AimSpacing.space20),
          // ── Animated Hero Check Badge ─────────────────────────────────────
          Stack(
            alignment: Alignment.center,
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: AimColors.primary500.withValues(alpha: 0.25),
                      blurRadius: 24,
                      spreadRadius: 4,
                    ),
                  ],
                ),
              ),
              Transform.rotate(
                angle: 0.08,
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: AimGradients.gzHero,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AimColors.primary500.withValues(alpha: 0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.check_rounded,
                      color: AimColors.neutral0,
                      size: 44,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space24),

          // ── Title & Subtitle ───────────────────────────────────────────────
          Text(
            l10n.placementSubmitSuccessfulTitle,
            style: AimTextStyles.h2.copyWith(
              color: surfaces.textPrimary,
              fontSize: 24,
              fontWeight: AimFontWeights.extrabold,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            'Your placement test results have been recorded and saved.',
            textAlign: TextAlign.center,
            style: AimTextStyles.bodySm.copyWith(
              color: surfaces.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: AimSpacing.space24),

          // ── 2-Column Stats Summary Grid ──────────────────────────────────
          Row(
            children: [
              // Completed Card
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(AimSpacing.space16),
                  decoration: BoxDecoration(
                    color: surfaces.surface,
                    borderRadius: AimRadius.borderLg,
                    border: Border.all(color: surfaces.border),
                    boxShadow: [
                      BoxShadow(
                        color: AimColors.neutral900.withValues(alpha: 0.03),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.check_circle_outline_rounded,
                            size: 18,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ),
                      const SizedBox(height: AimSpacing.space12),
                      Text(
                        l10n.placementSubmitCompletedQuestions.toUpperCase(),
                        style: AimTextStyles.caption.copyWith(
                          fontSize: 10,
                          fontWeight: AimFontWeights.extrabold,
                          color: surfaces.textMuted,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text.rich(
                        TextSpan(
                          text: '${widget.completedCount} ',
                          style: AimTextStyles.h2.copyWith(
                            color: surfaces.textPrimary,
                            fontSize: 20,
                            fontWeight: AimFontWeights.extrabold,
                          ),
                          children: [
                            TextSpan(
                              text: '/ ${widget.totalQuestions}',
                              style: AimTextStyles.caption.copyWith(
                                color: surfaces.textMuted,
                                fontSize: 12,
                                fontWeight: AimFontWeights.medium,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: AimSpacing.space12),
              // Skipped Card
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(AimSpacing.space16),
                  decoration: BoxDecoration(
                    color: surfaces.surface,
                    borderRadius: AimRadius.borderLg,
                    border: Border.all(color: surfaces.border),
                    boxShadow: [
                      BoxShadow(
                        color: AimColors.neutral900.withValues(alpha: 0.03),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.error_outline_rounded,
                            size: 18,
                            color: Color(0xFFF59E0B),
                          ),
                        ),
                      ),
                      const SizedBox(height: AimSpacing.space12),
                      Text(
                        l10n.placementSubmitSkippedQuestions.toUpperCase(),
                        style: AimTextStyles.caption.copyWith(
                          fontSize: 10,
                          fontWeight: AimFontWeights.extrabold,
                          color: surfaces.textMuted,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text.rich(
                        TextSpan(
                          text: '${widget.skippedCount} ',
                          style: AimTextStyles.h2.copyWith(
                            color: surfaces.textPrimary,
                            fontSize: 20,
                            fontWeight: AimFontWeights.extrabold,
                          ),
                          children: [
                            TextSpan(
                              text: Localizations.localeOf(context).languageCode == 'ar'
                                  ? 'سؤالاً'
                                  : 'questions',
                              style: AimTextStyles.caption.copyWith(
                                color: surfaces.textMuted,
                                fontSize: 12,
                                fontWeight: AimFontWeights.medium,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space24),

          // ── AI Calibration Banner ─────────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(AimSpacing.space20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [
                        AimColors.primary500.withValues(alpha: 0.15),
                        const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                      ]
                    : [
                        const Color(0xFFEEF2FF),
                        const Color(0xFFF3E8FF),
                      ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: AimRadius.borderLg,
              border: Border.all(
                color: AimColors.primary500.withValues(alpha: 0.25),
              ),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(AimColors.primary500),
                      ),
                    ),
                    const SizedBox(width: AimSpacing.space8),
                    Text(
                      'AI Engine Active',
                      style: AimTextStyles.bodyMd.copyWith(
                        color: AimColors.primary600,
                        fontWeight: AimFontWeights.bold,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.auto_awesome,
                      size: 16,
                      color: AimColors.primary500,
                    ),
                  ],
                ),
                const SizedBox(height: AimSpacing.space12),
                Text(
                  _steps[_analysisStep],
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: AimFontWeights.semibold,
                  ),
                ),
                const SizedBox(height: AimSpacing.space12),
                // Progress Track
                ClipRRect(
                  borderRadius: BorderRadius.circular(100),
                  child: LinearProgressIndicator(
                    value: (_analysisStep + 1) / _steps.length,
                    minHeight: 6,
                    backgroundColor: AimColors.primary500.withValues(alpha: 0.15),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AimColors.primary500,
                    ),
                  ),
                ),
                const SizedBox(height: AimSpacing.space12),
                Text(
                  l10n.placementSubmitCalibratingBody,
                  textAlign: TextAlign.center,
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textSecondary,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
