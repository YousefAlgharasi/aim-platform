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
        backgroundColor: surfaces.background,
        body: SafeArea(
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
                    ? state.test
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
    final items = [
      {
        'iconData': Icons.timer_outlined,
        'title': l10n.placementStartLimitTitle(25),
        'desc': l10n.placementStartLimitDesc,
      },
      {
        'iconData': Icons.quiz_outlined,
        'title': l10n.placementStartQuestionsTitle(20),
        'desc': l10n.placementStartQuestionsDesc,
      },
      {
        'iconData': Icons.auto_awesome,
        'title': l10n.placementStartCalibrationTitle,
        'desc': l10n.placementStartCalibrationDesc,
      },
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space32,
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
                  Icons.arrow_back,
                  color: surfaces.textPrimary,
                ),
              ),
              const SizedBox(width: AimSpacing.innerGap),
              Text(
                l10n.placementStartTestOverview,
                style:
                    AimTextStyles.title.copyWith(color: surfaces.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space16),
          PlacementPageHeader(
            title: l10n.placementStartAssessmentTitle,
            subtitle: l10n.placementStartAssessmentSubtitle,
            padding: EdgeInsets.zero,
          ),
          const SizedBox(height: AimSpacing.space24),
          Expanded(
            child: ListView.separated(
              itemCount: items.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AimSpacing.componentGap),
              itemBuilder: (context, i) {
                final item = items[i];
                final iconData = item['iconData'] as IconData;
                return Container(
                  padding: const EdgeInsets.all(AimSpacing.cardPadding),
                  decoration: BoxDecoration(
                    color: surfaces.surface,
                    borderRadius: AimRadius.borderLg,
                    border: Border.all(
                      color: surfaces.border,
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AimColors.primary500.withValues(alpha: 0.03),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AimColors.primary500.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Icon(
                            iconData,
                            color: AimColors.primary500,
                            size: AimSizes.iconMd + 2,
                          ),
                        ),
                      ),
                      const SizedBox(width: AimSpacing.cardPadding),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['title'] as String,
                              style: AimTextStyles.bodyLg.copyWith(
                                fontWeight: AimFontWeights.bold,
                                color: surfaces.textPrimary,
                              ),
                            ),
                            const SizedBox(height: AimSpacing.space4),
                            Text(
                              item['desc'] as String,
                              style: AimTextStyles.bodySm.copyWith(
                                color: surfaces.textSecondary,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: AimSpacing.space16),
            child: Center(
              child: Text(
                l10n.placementStartHonorCodeAgreement,
                textAlign: TextAlign.center,
                style: AimTextStyles.caption.copyWith(
                  color: surfaces.textMuted,
                ),
              ),
            ),
          ),
          PlacementPrimaryButton(
            label: l10n.commonStart,
            onPressed: onStart,
          ),
        ],
      ),
    );
  }
}
