import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/theme/theme.dart';
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
    if (decision == 'take_placement') {
      context.push(AppRoutePaths.placementStart);
      return;
    } else {
      context.go(AppRoutePaths.home);
      return;
    }
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
    final surfaces = aimSurfacesOf(context);

    return Column(
      key: const ValueKey(0),
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
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
                            'AI Adaptive',
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
                          decoration: BoxDecoration(
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
                          decoration: BoxDecoration(
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
                        '📈 94% retention',
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
        const PlacementPageHeader(
          title: 'Your personal AI\nTutor, built for you.',
          subtitle:
              'Adaptive AI learning paths that evolve with your progress — lessons, quizzes, and mentorship shaped around you.',
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
    final options = [
      {'id': 'career', 'iconData': Icons.work_outline, 'label': 'Career & Work'},
      {'id': 'exams', 'iconData': Icons.school_outlined, 'label': 'Exams & School'},
      {'id': 'speaking', 'iconData': Icons.chat_bubble_outline, 'label': 'Real-life Speaking'},
      {'id': 'media', 'iconData': Icons.movie_outlined, 'label': 'Media & Culture'},
    ];

    return Column(
      key: const ValueKey(1),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const PlacementPageHeader(
          title: 'What is your\nprimary focus?',
          subtitle: 'Select the goal that matches your current target.',
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
    final options = [
      {
        'id': '5min',
        'iconData': Icons.eco_outlined,
        'label': '5 mins / day',
        'sub': 'Light — great for staying consistent',
      },
      {
        'id': '15min',
        'iconData': Icons.auto_awesome,
        'label': '15 mins / day',
        'sub': 'Balanced — recommended for most learners',
      },
      {
        'id': '30min',
        'iconData': Icons.local_fire_department_outlined,
        'label': '30 mins / day',
        'sub': 'Intensive — fastest path to fluency',
      },
    ];

    return Column(
      key: const ValueKey(2),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const PlacementPageHeader(
          title: 'Set your daily goal',
          subtitle: 'How much time will you commit to learning each day?',
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
    final isOptionA = _selectedStartMode == 'start_from_scratch';
    final isOptionB = _selectedStartMode == 'take_placement';

    return Column(
      key: const ValueKey(3),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const PlacementPageHeader(
          title: 'How would you\nlike to start?',
          subtitle:
              'Choose carefully! The placement test can only be taken once to accurately calibrate your AI tutor.',
        ),
        const SizedBox(height: AimSpacing.space32),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
          child: Row(
            children: [
              Expanded(
                child: PlacementOptionCard(
                  title: 'Start from Zero',
                  subtitle: 'Skip the test and start from the absolute basics.',
                  iconWidget: const Icon(
                    Icons.eco_rounded,
                    color: AimColors.primary500,
                    size: AimSizes.iconLg,
                  ),
                  isSelected: isOptionA,
                  height: 164,
                  onTap: () {
                    setState(() => _selectedStartMode = 'start_from_scratch');
                    _choose('start_from_scratch');
                  },
                ),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: PlacementOptionCard(
                  title: 'Test My Knowledge',
                  subtitle: 'Test your skills to let the AI find your level.',
                  iconWidget: const Icon(
                    Icons.psychology_rounded,
                    color: AimColors.primary500,
                    size: AimSizes.iconLg,
                  ),
                  isSelected: isOptionB,
                  height: 164,
                  onTap: () {
                    setState(() => _selectedStartMode = 'take_placement');
                    _choose('take_placement');
                  },
                ),
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
            label: 'Continue',
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
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.space16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          PlacementPrimaryButton(
            label: 'Continue',
            enabled: enabled,
            onPressed: onContinue,
          ),
          const SizedBox(height: AimSpacing.innerGap),
          Center(
            child: PlacementGhostButton(
              label: 'Skip',
              onPressed: onSkip,
            ),
          ),
        ],
      ),
    );
  }
}
