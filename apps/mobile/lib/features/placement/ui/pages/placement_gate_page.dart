// Modern Auth Pages — Figma Redesign: Onboarding Flow & Placement Gate
//
// Screens implemented:
// - Screen 4A: Vision Welcome ("Your personal AI Tutor, built for you")
// - Screen 4B: Goal Focus Calibration ("What is your primary focus?")
// - Screen 4C: Daily Habit Lock In ("Set your daily goal")
// - Screen 4D / Frame: How to Start ("Start from Zero" vs "Test My Knowledge")

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routing/routing.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../logic/provider/placement_gate_notifier.dart';
import '../../logic/provider/placement_provider.dart';

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

  // Step 2 selection
  String? _selectedFocus;

  // Step 3 selection
  String _selectedHabit = '15min';

  // Step 4 selection ('take_placement' or 'start_from_scratch')
  String _selectedStartMode = 'take_placement';

  void _choose(String decision) {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(placementGateProvider.notifier).choose(token, decision);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementGateProvider);

    ref.listen<PlacementGateState>(placementGateProvider, (_, next) {
      if (next is PlacementGateDecided && context.mounted) {
        if (next.decision == 'take_placement') {
          context.go(AppRoutePaths.placementStart);
        } else {
          context.go(AppRoutePaths.home);
        }
      }
    });

    final isChoosing = state is PlacementGateChecking;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 20),
            // ── Top Progress Dots (4 steps) ──────────────────────────────
            _ProgressDots(total: 4, current: _currentStep),
            const SizedBox(height: 36),

            // ── Step Content ─────────────────────────────────────────────
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                child: _buildCurrentStep(isChoosing),
              ),
            ),
          ],
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
    return Column(
      key: const ValueKey(0),
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFFEEF2FF), Color(0xFFE0E7FF)],
                ),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Floating badge top right
                  Positioned(
                    top: 24,
                    right: 24,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.06),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('✦ ', style: TextStyle(color: Color(0xFF4F46E5))),
                          Text(
                            'AI Adaptive',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF4F46E5),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Phone Mockup Graphic
                  Container(
                    width: 110,
                    height: 170,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF4F46E5).withValues(alpha: 0.18),
                          blurRadius: 32,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 6,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: const Color(0xFF4F46E5),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          height: 4,
                          width: 60,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE2E8F0),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          height: 54,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFEEF2FF), Color(0xFFC7D2FE)],
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Center(
                            child: Icon(
                              Icons.psychology_rounded,
                              color: Color(0xFF4F46E5),
                              size: 24,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          height: 4,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE2E8F0),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          height: 4,
                          width: 40,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE2E8F0),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Floating badge bottom left
                  Positioned(
                    bottom: 24,
                    left: 24,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.06),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Text(
                        '📈 94% retention',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Your personal AI\nTutor, built for you.',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w700,
                  fontSize: 30,
                  height: 1.2,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.3,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'Adaptive AI learning paths that evolve with your progress — lessons, quizzes, and mentorship shaped around you.',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w400,
                  fontSize: 14,
                  height: 1.5,
                  color: Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
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
      {'id': 'career', 'icon': '💼', 'label': 'Career & Work'},
      {'id': 'exams', 'icon': '🎓', 'label': 'Exams & School'},
      {'id': 'speaking', 'icon': '💬', 'label': 'Real-life Speaking'},
      {'id': 'media', 'icon': '🎬', 'label': 'Media & Culture'},
    ];

    return Column(
      key: const ValueKey(1),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'What is your\nprimary focus?',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w700,
                  fontSize: 30,
                  height: 1.2,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.3,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'Select the goal that matches your current target.',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w400,
                  fontSize: 14,
                  height: 1.5,
                  color: Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            itemCount: options.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) {
              final opt = options[i];
              final isSelected = _selectedFocus == opt['id'];
              return GestureDetector(
                onTap: () => setState(() => _selectedFocus = opt['id'] as String),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF4F46E5).withValues(alpha: 0.08) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFCBD5E1),
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(opt['icon'] as String, style: const TextStyle(fontSize: 22)),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          opt['label'] as String,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      if (isSelected)
                        Container(
                          width: 20,
                          height: 20,
                          decoration: const BoxDecoration(
                            color: Color(0xFF4F46E5),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check, size: 14, color: Colors.white),
                        ),
                    ],
                  ),
                ),
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
        'icon': '🌱',
        'label': '5 mins / day',
        'sub': 'Light — great for staying consistent',
      },
      {
        'id': '15min',
        'icon': '✦',
        'label': '15 mins / day',
        'sub': 'Balanced — recommended for most learners',
      },
      {
        'id': '30min',
        'icon': '🔥',
        'label': '30 mins / day',
        'sub': 'Intensive — fastest path to fluency',
      },
    ];

    return Column(
      key: const ValueKey(2),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Set your daily goal',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w700,
                  fontSize: 30,
                  height: 1.2,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.3,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'How much time will you commit to learning each day?',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w400,
                  fontSize: 14,
                  height: 1.5,
                  color: Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            itemCount: options.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) {
              final opt = options[i];
              final isSelected = _selectedHabit == opt['id'];
              return GestureDetector(
                onTap: () => setState(() => _selectedHabit = opt['id'] as String),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF4F46E5).withValues(alpha: 0.08) : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFCBD5E1),
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(opt['icon'] as String, style: const TextStyle(fontSize: 22)),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              opt['label'] as String,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              opt['sub'] as String,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (isSelected)
                        Container(
                          width: 20,
                          height: 20,
                          decoration: const BoxDecoration(
                            color: Color(0xFF4F46E5),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check, size: 14, color: Colors.white),
                        ),
                    ],
                  ),
                ),
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
        // ── Title & Subtitle ───────────────────────────────────────────────
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'How would you\nlike to start?',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w700,
                  fontSize: 30,
                  height: 1.2,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.3,
                ),
              ),
              SizedBox(height: 12),
              Text(
                'Choose carefully! The placement test can only be taken once to accurately calibrate your AI tutor.',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w400,
                  fontSize: 14,
                  height: 1.5,
                  color: Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 36),

        // ── 164x164 Square Option Cards Row ────────────────────────────────
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Row(
            children: [
              // Option A: Start from Zero (164px height)
              Expanded(
                child: GestureDetector(
                  onTap: () =>
                      setState(() => _selectedStartMode = 'start_from_scratch'),
                  child: Container(
                    height: 164,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isOptionA
                          ? const Color(0xFF4F46E5).withValues(alpha: 0.1)
                          : const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isOptionA
                            ? const Color(0xFF4F46E5)
                            : const Color(0xFFCBD5E1),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Text('🌱', style: TextStyle(fontSize: 28)),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Start from Zero',
                              style: TextStyle(
                                fontFamily: 'IBMPlexSans',
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                height: 1.15,
                                color: isOptionA
                                    ? const Color(0xFF4F46E5)
                                    : const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Skip the test and start from the absolute basics.',
                              style: TextStyle(
                                fontFamily: 'IBMPlexSans',
                                fontSize: 10,
                                fontWeight: FontWeight.w400,
                                height: 1.3,
                                color: isOptionA
                                    ? const Color(0xFF4F46E5)
                                    : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),

              // Option B: Test My Knowledge (164px height)
              Expanded(
                child: GestureDetector(
                  onTap: () =>
                      setState(() => _selectedStartMode = 'take_placement'),
                  child: Container(
                    height: 164,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isOptionB
                          ? const Color(0xFF4F46E5).withValues(alpha: 0.1)
                          : const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isOptionB
                            ? const Color(0xFF4F46E5)
                            : const Color(0xFFCBD5E1),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Align(
                          alignment: Alignment.centerLeft,
                          child: Icon(
                            Icons.psychology_rounded,
                            color: Color(0xFF4F46E5),
                            size: 28,
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Test My Knowledge',
                              style: TextStyle(
                                fontFamily: 'IBMPlexSans',
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                height: 1.15,
                                color: isOptionB
                                    ? const Color(0xFF4F46E5)
                                    : const Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Test your skills to let the AI find your level.',
                              style: TextStyle(
                                fontFamily: 'IBMPlexSans',
                                fontSize: 10,
                                fontWeight: FontWeight.w400,
                                height: 1.3,
                                color: isOptionB
                                    ? const Color(0xFF4F46E5)
                                    : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        const Spacer(),

        // ── Primary Button: "Continue" ─────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: DecoratedBox(
              decoration: const BoxDecoration(
                color: Color(0xFF4F46E5), // solid indigo per Figma
                borderRadius: BorderRadius.all(Radius.circular(12)),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x334F46E5), // rgba(79,70,229,0.2)
                    blurRadius: 6,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: isChoosing ? null : () => _choose(_selectedStartMode),
                  borderRadius: BorderRadius.circular(12),
                  child: Center(
                    child: isChoosing
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text(
                            'Continue',
                            style: TextStyle(
                              fontFamily: 'IBMPlexSans',
                              fontWeight: FontWeight.w500,
                              fontSize: 16,
                              color: Color(0xFFF8FAFC),
                              height: 1.5,
                            ),
                          ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ── Bottom Action Buttons (Continue & Skip for steps 1-3) ──────────────────
  Widget _buildBottomButtons({
    required VoidCallback onContinue,
    required VoidCallback onSkip,
    bool enabled = true,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 52,
            child: DecoratedBox(
              decoration: const BoxDecoration(
                color: Color(0xFF4F46E5), // solid indigo per Figma
                borderRadius: BorderRadius.all(Radius.circular(12)),
                boxShadow: [
                  BoxShadow(
                    color: Color(0x334F46E5), // rgba(79,70,229,0.2)
                    blurRadius: 6,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                child: InkWell(
                  onTap: onContinue,
                  borderRadius: BorderRadius.circular(12),
                  child: const Center(
                    child: Text(
                      'Continue',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSans',
                        fontWeight: FontWeight.w500,
                        fontSize: 16,
                        color: Color(0xFFF8FAFC),
                        height: 1.5,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Center(
            child: TextButton(
              onPressed: onSkip,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                tapTargetSize: MaterialTapTargetSize.padded,
                overlayColor: const Color(0xFF4F46E5).withValues(alpha: 0.12),
              ),
              child: const Text(
                'Skip',
                style: TextStyle(
                  fontFamily: 'IBMPlexSans',
                  fontWeight: FontWeight.w500,
                  fontSize: 16,
                  color: Color(0xFF0F172A),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Top Progress Dots (4 steps indicator) ────────────────────────────────────
class _ProgressDots extends StatelessWidget {
  const _ProgressDots({
    required this.total,
    required this.current,
  });

  final int total;
  final int current;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: List.generate(total, (i) {
          final active = i == current;
          return Expanded(
            child: Container(
              height: 5,
              margin: EdgeInsets.only(right: i < total - 1 ? 8 : 0),
              decoration: BoxDecoration(
                color: active ? const Color(0xFF4F46E5) : const Color(0xFF4F46E5).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          );
        }),
      ),
    );
  }
}
