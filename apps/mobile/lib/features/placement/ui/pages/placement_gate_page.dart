import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
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
        backgroundColor: isDark
            ? const Color(0xFF0F172A)
            : const Color(0xFFEEF0F7),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Container(
                margin: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.06),
                      blurRadius: 32,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      PlacementProgressBar(total: 4, current: _currentStep),
                      const SizedBox(height: 28),
                      Expanded(
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 250),
                          transitionBuilder: (child, animation) =>
                              FadeTransition(
                            opacity: animation,
                            child: SlideTransition(
                              position: Tween<Offset>(
                                begin: const Offset(0.04, 0),
                                end: Offset.zero,
                              ).animate(animation),
                              child: child,
                            ),
                          ),
                          child: _buildCurrentStep(isChoosing),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      key: const ValueKey(0),
      children: [
        // ── Illustration area ─────────────────────────────────────────
        Expanded(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDark
                      ? [
                          const Color(0xFF1E1B4B),
                          const Color(0xFF1E293B),
                        ]
                      : [
                          const Color(0xFFEEF2FF),
                          const Color(0xFFF5F3FF),
                        ],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // ✦ AI Adaptive badge — top right
                  Positioned(
                    top: 18,
                    right: 18,
                    child: _FloatingBadge(
                      isDark: isDark,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('✦ ',
                              style: TextStyle(
                                  color: AimColors.primary500, fontSize: 10)),
                          Text(
                            l10n.placementGateAiAdaptive,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AimColors.primary500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // ── Main illustration: undraw_chat_ai SVG ─────────────
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 16),
                    child: SvgPicture.asset(
                      'assets/images/undraw_chat_ai.svg',
                      fit: BoxFit.contain,
                    ),
                  ),
                  // 94% retention badge — bottom left
                  Positioned(
                    bottom: 18,
                    left: 18,
                    child: _FloatingBadge(
                      isDark: isDark,
                      child: Text(
                        l10n.placementGateRetention,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? const Color(0xFFCBD5E1)
                              : const Color(0xFF334155),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        // ── Header ─────────────────────────────────────────────────────
        PlacementPageHeader(
          title: l10n.placementGateVisionTitle,
          subtitle: l10n.placementGateVisionSubtitle,
        ),
        const SizedBox(height: 20),
        // ── Buttons ────────────────────────────────────────────────────
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
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            l10n.placementGateStepLabel(4, 4).toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AimColors.primary500,
              letterSpacing: 1.4,
            ),
          ),
        ),
        const SizedBox(height: 6),
        PlacementPageHeader(
          title: l10n.placementGateStartTitle,
          subtitle: l10n.placementGateStartSubtitle,
        ),
        const SizedBox(height: 24),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              // Option A — Start from Zero (unselected by default)
              PlacementOptionCard(
                title: l10n.placementGateStartFromZeroTitle,
                subtitle: l10n.placementGateStartFromZeroSub,
                iconWidget: const Icon(
                  Icons.outlined_flag_rounded,
                  color: AimColors.primary500,
                  size: 22,
                ),
                isSelected: isOptionA,
                onTap: () {
                  setState(() => _selectedStartMode = 'start_from_scratch');
                },
              ),
              const SizedBox(height: 12),
              // Option B — Test My Knowledge (pre-selected + RECOMMENDED badge)
              Stack(
                clipBehavior: Clip.none,
                children: [
                  PlacementOptionCard(
                    title: l10n.placementGateTestKnowledgeTitle,
                    subtitle: l10n.placementGateTestKnowledgeSub,
                    iconWidget: const Icon(
                      Icons.track_changes_rounded,
                      color: AimColors.primary500,
                      size: 22,
                    ),
                    isSelected: isOptionB,
                    onTap: () {
                      setState(() => _selectedStartMode = 'take_placement');
                    },
                  ),
                  Positioned(
                    top: -11,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: AimColors.primary500,
                          borderRadius: BorderRadius.circular(100),
                          boxShadow: [
                            BoxShadow(
                              color: AimColors.primary500
                                  .withValues(alpha: 0.40),
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
                              size: 10,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              l10n.placementGateRecommendedBadge
                                  .toUpperCase(),
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                                letterSpacing: 0.8,
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
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
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

// ── Floating badge helper ─────────────────────────────────────────────────────
class _FloatingBadge extends StatelessWidget {
  const _FloatingBadge({required this.isDark, required this.child});

  final bool isDark;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.07),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

