import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/data/placement_mock_data.dart';
import 'package:aim_mobile/features/placement/data/models/placement_test_model.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_start_notifier.dart';
import 'package:aim_mobile/features/placement/ui/widgets/placement_page_header.dart';
import 'package:aim_mobile/features/placement/ui/widgets/placement_primary_button.dart';

class PlacementStartPage extends ConsumerStatefulWidget {
  const PlacementStartPage({super.key});

  @override
  ConsumerState<PlacementStartPage> createState() => _PlacementStartPageState();
}

class _PlacementStartPageState extends ConsumerState<PlacementStartPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      ref.read(placementStartProvider.notifier).loadActivePlacementTest(token);
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(placementStartProvider);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    ref.listen<PlacementStartState>(placementStartProvider, (_, next) {
      if (next is PlacementStarted && context.mounted) {
        context.pushReplacement(
          AppRoutePaths.placementSection,
          extra: {
            'attemptId': next.attempt.id,
            'testId': next.test.id,
            if (next.attempt.expiresAt != null)
              'expiresAt': next.attempt.expiresAt!,
          },
        );
      }
    });

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: isDark
                  ? [
                      surfaces.background,
                      surfaces.background,
                    ]
                  : [
                      const Color(0xFFEEF2FF).withValues(alpha: 0.4),
                      AimColors.neutral0,
                      const Color(0xFFF8FAFC).withValues(alpha: 0.5),
                    ],
            ),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: -120,
                right: -120,
                child: Container(
                  width: 350,
                  height: 350,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        isDark
                            ? const Color(0xFF8B5CF6).withValues(alpha: 0.12)
                            : const Color(0xFF8B5CF6).withValues(alpha: 0.38),
                        isDark
                            ? const Color(0xFF6366F1).withValues(alpha: 0.04)
                            : const Color(0xFFC7D2FE).withValues(alpha: 0.18),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.5, 1.0],
                    ),
                  ),
                ),
              ),
              SafeArea(
                child: switch (state) {
                  PlacementStartLoading() => AIMFullScreenLoading(
                      semanticLabel: l10n.placementStartLoadingGuidelines,
                    ),
                  PlacementStartError(:final message) => AIMFullScreenError(
                      message: message,
                      retryLabel: l10n.commonRetry,
                      onRetry: () {
                        final token = ref.read(authFlowProvider).accessToken ?? '';
                        ref.read(placementStartProvider.notifier).loadActivePlacementTest(token);
                      },
                    ),
                  PlacementStartIdle() ||
                  PlacementStartReady() =>
                    _AssessmentIntroBody(
                      test: state is PlacementStartReady
                          ? (state as PlacementStartReady).test
                          : PlacementMockData.mockTest,
                      onStart: () {
                        final token = ref.read(authFlowProvider).accessToken ?? '';
                        if (token.isEmpty ||
                            token.startsWith('mock-') ||
                            state is PlacementStartError ||
                            state is PlacementStartIdle) {
                          context.push(
                            AppRoutePaths.placementQuestion,
                            extra: {
                              'sectionId': 'mock-section-1',
                              'attemptId':
                                  'mock-attempt-${DateTime.now().millisecondsSinceEpoch}',
                              'sectionTitle': 'Adaptive English Placement Test',
                              'sectionIndex': 1,
                              'totalSections': 1,
                            },
                          );
                          return;
                        }
                        ref.read(placementStartProvider.notifier).startAttempt(token);
                      },
                    ),
                  PlacementStarted() => AIMFullScreenLoading(
                      semanticLabel: l10n.placementStartStartingTest,
                    ),
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AssessmentIntroBody extends StatelessWidget {
  const _AssessmentIntroBody({
    required this.test,
    required this.onStart,
  });

  final PlacementTestModel test;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final badgeBg = isDark ? const Color(0xFF312E81) : const Color(0xFFEEF2FF);
    final badgeText = isDark ? const Color(0xFFC7D2FE) : const Color(0xFF4F46E5);

    final items = [
      {
        'iconData': Icons.access_time_rounded,
        'iconColor': const Color(0xFF4F46E5),
        'bgColor': isDark ? const Color(0xFF312E81).withValues(alpha: 0.4) : const Color(0xFFEEF2FF),
        'title': l10n.placementStartLimitTitle(25),
        'desc': l10n.placementStartLimitDesc,
      },
      {
        'iconData': Icons.assignment_outlined,
        'iconColor': const Color(0xFF4F46E5),
        'bgColor': isDark ? const Color(0xFF312E81).withValues(alpha: 0.4) : const Color(0xFFEEF2FF),
        'title': l10n.placementStartQuestionsTitle(20),
        'desc': l10n.placementStartQuestionsDesc,
      },
      {
        'iconData': Icons.lightbulb_outline_rounded,
        'iconColor': const Color(0xFFF59E0B),
        'bgColor': isDark ? const Color(0xFF78350F).withValues(alpha: 0.4) : const Color(0xFFFEF3C7),
        'title': l10n.placementStartCalibrationTitle,
        'desc': l10n.placementStartCalibrationDesc,
      },
    ];

    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final prefix = isArabic ? 'ببدء التقييم، فإنك توافق على ' : 'By starting, you agree to our ';
    final linkText = isArabic ? 'ميثاق شرف التقييم الخاص بنا' : 'Assessment Honor Code';

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space32,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                onPressed: () => context.pop(),
                icon: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  color: surfaces.textPrimary,
                  size: 20,
                ),
              ),
            ],
          ),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: AimSpacing.space16),
                  // Hero Icon Badge
                  Stack(
                    alignment: Alignment.center,
                    clipBehavior: Clip.none,
                    children: [
                      // Blurry Glow background
                      Positioned(
                        child: ImageFiltered(
                          imageFilter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                          child: Container(
                            width: 76,
                            height: 76,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              gradient: LinearGradient(
                                colors: [
                                  const Color(0xFF6366F1).withValues(alpha: 0.25),
                                  const Color(0xFF8B5CF6).withValues(alpha: 0.25),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Main Badge Container
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          gradient: const LinearGradient(
                            colors: [
                              Color(0xFF6366F1),
                              Color(0xFF8B5CF6),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                          border: Border.all(
                            color: const Color(0xFF818CF8).withValues(alpha: 0.3),
                            width: 1.5,
                          ),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.assignment_outlined,
                            color: AimColors.neutral0,
                            size: 30,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AimSpacing.space24),
                  // Placement Test Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: badgeBg,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'PLACEMENT TEST',
                      style: AimTextStyles.caption.copyWith(
                        color: badgeText,
                        fontWeight: AimFontWeights.extrabold,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space12),
                  Text(
                    l10n.placementStartAssessmentTitle,
                    style: AimTextStyles.display.copyWith(
                      fontSize: 32,
                      fontWeight: AimFontWeights.extrabold,
                      color: surfaces.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space8),
                  Text(
                    l10n.placementStartAssessmentSubtitle,
                    style: AimTextStyles.bodySm.copyWith(
                      color: surfaces.textSecondary,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space24),
                  // Feature cards stack
                  ...items.map((item) {
                    final iconData = item['iconData'] as IconData;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AimSpacing.componentGap),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: surfaces.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isDark
                                ? surfaces.border
                                : const Color(0xFFE2E8F0).withValues(alpha: 0.8),
                            width: 1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AimColors.primary500.withValues(alpha: 0.02),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: item['bgColor'] as Color,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Icon(
                                  iconData,
                                  color: item['iconColor'] as Color,
                                  size: 22,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title'] as String,
                                    style: AimTextStyles.bodyLg.copyWith(
                                      fontWeight: AimFontWeights.bold,
                                      color: surfaces.textPrimary,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    item['desc'] as String,
                                    style: AimTextStyles.bodySm.copyWith(
                                      color: surfaces.textSecondary,
                                      fontSize: 12,
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: AimSpacing.space16),
                    child: Center(
                      child: RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: AimTextStyles.caption.copyWith(
                            color: surfaces.textMuted,
                            fontSize: 12,
                          ),
                          children: [
                            TextSpan(text: prefix),
                            TextSpan(
                              text: linkText,
                              style: TextStyle(
                                color: isDark ? const Color(0xFF818CF8) : const Color(0xFF4F46E5),
                                fontWeight: AimFontWeights.semibold,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space24),
                ],
              ),
            ),
          ),
          const SizedBox(height: AimSpacing.space8),
          PlacementPrimaryButton(
            label: l10n.placementStartBtnLabel,
            onPressed: onStart,
          ),
        ],
      ),
    );
  }
}
