import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/routing/routing.dart';
import '../../../../core/theme/theme.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../logic/provider/placement_gate_notifier.dart';
import '../../logic/provider/placement_provider.dart';
import '../widgets/placement_ghost_button.dart';
import '../widgets/placement_option_card.dart';
import '../widgets/placement_page_header.dart';
import '../widgets/placement_primary_button.dart';
import '../widgets/placement_progress_bar.dart';

final placementGateProvider =
    StateNotifierProvider.autoDispose<PlacementGateNotifier, PlacementGateState>(
  (ref) => PlacementGateNotifier(
    repository: ref.watch(placementRepositoryProvider),
  ),
);

class PlacementGatePage extends ConsumerStatefulWidget {
  const PlacementGatePage({super.key});

  @override
  ConsumerState<PlacementGatePage> createState() => _PlacementGatePageState();
}

class _PlacementGatePageState extends ConsumerState<PlacementGatePage> {
  int _currentStep = 0; // 0: Vision, 1: Goal Focus, 2: Daily Habit, 3: How to Start

  String? _selectedFocus;
  String _selectedHabit = '15min';
  String _selectedStartMode = 'take_placement';

  void _choose(String decision) {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(placementGateProvider.notifier).choose(token, decision);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementGateProvider);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    ref.listen<PlacementGateState>(placementGateProvider, (_, next) {
      if (context.mounted) {
        if (next is PlacementGateDecided && context.mounted) {
          if (next.decision == 'take_placement') {
            context.push(AppRoutePaths.placementStart);
          } else {
            context.go(AppRoutePaths.home);
          }
        } else if (next is PlacementGateError && context.mounted) {
          if (_selectedStartMode == 'take_placement') {
            context.push(AppRoutePaths.placementStart);
          } else {
            context.go(AppRoutePaths.home);
          }
        }
      }
    });

    final isChoosing = state is PlacementGateChecking;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: AimSpacing.space20),
              PlacementProgressBar(total: 4, current: _currentStep),
              const SizedBox(height: AimSpacing.space32),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: _buildCurrentStep(isChoosing),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentStep(bool isChoosing) {
    switch (_currentStep) {
      case 0:
        return _buildVisionStep();
      case 1:
        return _buildFocusStep();
      case 2:
        return _buildHabitStep();
      case 3:
      default:
        return _buildStartStep(isChoosing);
    }
  }

  // ── Step 1: Vision Welcome ─────────────────────────────────────────────────
  Widget _buildVisionStep() {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    return Column(
      key: const ValueKey(0),
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: AimGradients.aiSoft,
                borderRadius: AimRadius.borderX2l,
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned(
                    top: AimSpacing.space24,
                    right: AimSpacing.space24,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: surfaces.surface,
                        borderRadius: AimRadius.borderSm,
                        boxShadow: [
                          BoxShadow(
                            color: AimColors.neutral900.withValues(alpha: 0.06),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('✦ ', style: TextStyle(color: AimColors.primary500)),
                          Text(
                            l10n.placementGateAiAdaptive,
                            style: AimTextStyles.caption.copyWith(
                              fontWeight: AimFontWeights.semibold,
                              color: AimColors.primary500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    width: 110,
                    height: 170,
                    decoration: BoxDecoration(
                      color: surfaces.surface,
                      borderRadius: AimRadius.borderLg,
                      boxShadow: [
                        BoxShadow(
                          color: AimColors.primary500.withValues(alpha: 0.18),
                          blurRadius: 32,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(AimSpacing.space12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 6,
                          width: double.infinity,
                          decoration: const BoxDecoration(
                            color: AimColors.primary500,
                            borderRadius: AimRadius.borderXs,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          height: 4,
                          width: 60,
                          decoration: BoxDecoration(
                            color: surfaces.border,
                            borderRadius: AimRadius.borderXs,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          height: 54,
                          decoration: const BoxDecoration(
                            gradient: AimGradients.aiSoft,
                            borderRadius: AimRadius.borderSm,
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.psychology_rounded,
                              color: AimColors.primary500,
                              size: AimSizes.iconLg,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          height: 4,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: surfaces.border,
                            borderRadius: AimRadius.borderXs,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          height: 4,
                          width: 40,
                          decoration: BoxDecoration(
                            color: surfaces.border,
                            borderRadius: AimRadius.borderXs,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Positioned(
                    bottom: AimSpacing.space24,
                    left: AimSpacing.space24,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: surfaces.surface,
                        borderRadius: AimRadius.borderSm,
                        boxShadow: [
                          BoxShadow(
                            color: AimColors.neutral900.withValues(alpha: 0.06),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Text(
                        l10n.placementGateRetention,
                        style: AimTextStyles.caption.copyWith(
                          fontWeight: AimFontWeights.semibold,
                          color: surfaces.textPrimary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        PlacementPageHeader(
          title: l10n.placementGateVisionTitle,
          subtitle: l10n.placementGateVisionSubtitle,
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        _buildBottomButtons(
          onContinue: () => setState(() => _currentStep = 1),
          onSkip: () => setState(() => _currentStep = 3),
        ),
      ],
    );
  }

  // ── Step 2: Goal Focus Calibration ─────────────────────────────────────────
  Widget _buildFocusStep() {
    final l10n = AppLocalizations.of(context);
    final options = [
      {
        'id': 'career',
        'iconData': Icons.work_outline_rounded,
        'label': l10n.placementGateFocusCareer,
        'sub': l10n.placementGateFocusCareerSub,
      },
      {
        'id': 'exams',
        'iconData': Icons.school_outlined,
        'label': l10n.placementGateFocusExams,
        'sub': l10n.placementGateFocusExamsSub,
      },
      {
        'id': 'speaking',
        'iconData': Icons.chat_bubble_outline_rounded,
        'label': l10n.placementGateFocusSpeaking,
        'sub': l10n.placementGateFocusSpeakingSub,
      },
      {
        'id': 'media',
        'iconData': Icons.movie_creation_outlined,
        'label': l10n.placementGateFocusMedia,
        'sub': l10n.placementGateFocusMediaSub,
      },
    ];

    return Column(
      key: const ValueKey(1),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
          child: Text(
            l10n.placementGateStepLabel(2, 4).toUpperCase(),
            style: AimTextStyles.caption.copyWith(
              fontWeight: AimFontWeights.bold,
              color: AimColors.primary500,
              letterSpacing: 1.2,
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.space4),
        PlacementPageHeader(
          title: l10n.placementGateFocusTitle,
          subtitle: l10n.placementGateFocusSubtitle,
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
            itemCount: options.length,
            separatorBuilder: (_, __) => const SizedBox(height: AimSpacing.componentGap),
            itemBuilder: (context, i) {
              final opt = options[i];
              final isSelected = _selectedFocus == opt['id'];
              return PlacementOptionCard(
                title: opt['label'] as String,
                subtitle: opt['sub'] as String?,
                iconWidget: Icon(
                  opt['iconData'] as IconData,
                  size: AimSizes.iconLg,
                  color: AimColors.primary500,
                ),
                isSelected: isSelected,
                onTap: () => setState(() => _selectedFocus = opt['id'] as String),
              );
            },
          ),
        ),
        _buildBottomButtons(
          enabled: _selectedFocus != null,
          onContinue: () => setState(() => _currentStep = 2),
          onSkip: () => setState(() => _currentStep = 3),
        ),
      ],
    );
  }

  // ── Step 3: Daily Habit Lock In ────────────────────────────────────────────
  Widget _buildHabitStep() {
    final l10n = AppLocalizations.of(context);
    final options = [
      {
        'id': '5min',
        'iconData': Icons.eco_outlined,
        'label': l10n.placementGateHabit5Min,
        'sub': l10n.placementGateHabit5MinSub,
      },
      {
        'id': '15min',
        'iconData': Icons.auto_awesome_outlined,
        'label': l10n.placementGateHabit15Min,
        'sub': l10n.placementGateHabit15MinSub,
      },
      {
        'id': '30min',
        'iconData': Icons.local_fire_department_outlined,
        'label': l10n.placementGateHabit30Min,
        'sub': l10n.placementGateHabit30MinSub,
      },
    ];

    return Column(
      key: const ValueKey(2),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
          child: Text(
            l10n.placementGateStepLabel(3, 4).toUpperCase(),
            style: AimTextStyles.caption.copyWith(
              fontWeight: AimFontWeights.bold,
              color: AimColors.primary500,
              letterSpacing: 1.2,
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.space4),
        PlacementPageHeader(
          title: l10n.placementGateHabitTitle,
          subtitle: l10n.placementGateHabitSubtitle,
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
            itemCount: options.length,
            separatorBuilder: (_, __) => const SizedBox(height: AimSpacing.componentGap),
            itemBuilder: (context, i) {
              final opt = options[i];
              final isSelected = _selectedHabit == opt['id'];
              return PlacementOptionCard(
                title: opt['label'] as String,
                subtitle: opt['sub'] as String,
                iconWidget: Icon(
                  opt['iconData'] as IconData,
                  size: AimSizes.iconLg,
                  color: AimColors.primary500,
                ),
                isSelected: isSelected,
                onTap: () => setState(() => _selectedHabit = opt['id'] as String),
              );
            },
          ),
        ),
        _buildBottomButtons(
          onContinue: () => setState(() => _currentStep = 3),
          onSkip: () => setState(() => _currentStep = 3),
        ),
      ],
    );
  }

  // ── Step 4: How to Start / Placement Gate Frame ──────────────────────────────
  Widget _buildStartStep(bool isChoosing) {
    final l10n = AppLocalizations.of(context);
    final isOptionA = _selectedStartMode == 'start_from_scratch';
    final isOptionB = _selectedStartMode == 'take_placement';

    return Column(
      key: const ValueKey(3),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
          child: Text(
            l10n.placementGateStepLabel(4, 4).toUpperCase(),
            style: AimTextStyles.caption.copyWith(
              fontWeight: AimFontWeights.bold,
              color: AimColors.primary500,
              letterSpacing: 1.2,
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.space4),
        PlacementPageHeader(
          title: l10n.placementGateStartTitle,
          subtitle: l10n.placementGateStartSubtitle,
        ),
        const SizedBox(height: AimSpacing.space32),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
          child: Column(
            children: [
              PlacementOptionCard(
                title: l10n.placementGateStartFromZeroTitle,
                subtitle: l10n.placementGateStartFromZeroSub,
                iconWidget: const Icon(
                  Icons.outlined_flag_rounded,
                  color: AimColors.primary500,
                  size: AimSizes.iconLg,
                ),
                isSelected: isOptionA,
                onTap: () {
                  setState(() => _selectedStartMode = 'start_from_scratch');
                },
              ),
              const SizedBox(height: AimSpacing.space24),
              Stack(
                clipBehavior: Clip.none,
                children: [
                  PlacementOptionCard(
                    title: l10n.placementGateTestKnowledgeTitle,
                    subtitle: l10n.placementGateTestKnowledgeSub,
                    iconWidget: const Icon(
                      Icons.track_changes_rounded,
                      color: AimColors.primary500,
                      size: AimSizes.iconLg,
                    ),
                    isSelected: isOptionB,
                    onTap: () {
                      setState(() => _selectedStartMode = 'take_placement');
                    },
                  ),
                  Positioned(
                    top: -10,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: AimColors.primary500,
                          borderRadius: BorderRadius.circular(100),
                          boxShadow: [
                            BoxShadow(
                              color: AimColors.primary500.withValues(alpha: 0.45),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star_rounded,
                              size: 11,
                              color: AimColors.neutral0,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              l10n.placementGateRecommendedBadge.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: AimColors.neutral0,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AimSpacing.screenPaddingMobile,
            AimSpacing.space16,
            AimSpacing.screenPaddingMobile,
            AimSpacing.space24,
          ),
          child: PlacementPrimaryButton(
            label: l10n.commonContinue,
            isLoading: isChoosing,
            onPressed: () => _choose(_selectedStartMode),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomButtons({
    required VoidCallback onContinue,
    required VoidCallback onSkip,
    bool enabled = true,
  }) {
    final l10n = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          PlacementPrimaryButton(
            label: l10n.commonContinue,
            enabled: enabled,
            onPressed: onContinue,
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Center(
            child: PlacementGhostButton(
              label: l10n.onboardingWalkthroughSkip,
              onPressed: onSkip,
            ),
          ),
        ],
      ),
    );
  }
}
