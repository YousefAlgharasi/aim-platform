// Phase 6 — P6-083 / P6-084 / P6-085 / P6-089 / P6-091
// PracticeSessionPage — UI for interactive lesson practice session.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/practice_session_notifier.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class PracticeSessionPage extends ConsumerStatefulWidget {
  const PracticeSessionPage({
    required this.lessonId,
    required this.lessonTitle,
    super.key,
  });

  final String lessonId;
  final String lessonTitle;

  @override
  ConsumerState<PracticeSessionPage> createState() => _PracticeSessionPageState();
}

class _PracticeQuestion {
  const _PracticeQuestion({
    required this.id,
    required this.prompt,
    required this.translation,
    required this.options,
    required this.correctIndex,
  });

  final int id;
  final String prompt;
  final String translation;
  final List<String> options;
  final int correctIndex;
}

const _demoQuestions = [
  _PracticeQuestion(
    id: 1,
    prompt: 'Which is the most polite way to order coffee at a cafe in English?',
    translation: 'Choose the natural and polite phrasing.',
    options: [
      'Could I get a cup of coffee, please?',
      'Give me coffee now.',
      'I want a coffee.',
      'Coffee is good for me.',
    ],
    correctIndex: 0,
  ),
  _PracticeQuestion(
    id: 2,
    prompt: 'Which phrase means asking the server for the final check?',
    translation: 'Selecting the appropriate dining expression.',
    options: [
      'Where is the restroom?',
      'Could you bring us the bill, please?',
      'Do you have a table?',
      'Thanks for everything.',
    ],
    correctIndex: 1,
  ),
  _PracticeQuestion(
    id: 3,
    prompt: 'Complete: "______ do you recommend for lunch today?"',
    translation: 'Select the correct question word.',
    options: ['Why', 'Who', 'What', 'Where'],
    correctIndex: 2,
  ),
];

class _PracticeSessionPageState extends ConsumerState<PracticeSessionPage> {
  String? _selectedOptionId;
  bool _answeredCurrent = false;
  int _correctCount = 0;

  // Fallback demo state when backend has no questions seeded
  int _demoIndex = 0;
  int? _demoSelected;
  bool _demoAnswered = false;
  int _demoScore = 0;
  bool _demoFinished = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  void _start() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(practiceSessionProvider.notifier).start(
          bearerToken: token,
          lessonId: widget.lessonId,
        );
  }

  void _onOptionTap(String optionId) {
    if (_answeredCurrent) return;
    setState(() {
      _selectedOptionId = optionId;
    });
  }

  Future<void> _handleCheckAnswer() async {
    if (_selectedOptionId == null) return;
    final token = ref.read(authFlowProvider).accessToken;
    final state = ref.read(practiceSessionProvider);
    final currentQ = state.currentQuestion;

    setState(() {
      _answeredCurrent = true;
      _correctCount++;
    });

    if (token != null && state.sessionId != null && currentQ != null) {
      ref.read(questionAnswerSessionProvider.notifier).presentQuestion(
            question: currentQ,
            itemShownAt: DateTime.now().toIso8601String(),
          );
      ref.read(questionAnswerSessionProvider.notifier).selectOption(_selectedOptionId!);
      await ref.read(questionAnswerSessionProvider.notifier).submitAnswer(
            bearerToken: token,
            sessionId: state.sessionId!,
          );
    }
  }

  Future<void> _handleNextQuestion() async {
    setState(() {
      _selectedOptionId = null;
      _answeredCurrent = false;
    });
    await ref.read(practiceSessionProvider.notifier).advance();
  }

  // Fallback quiz handlers
  void _handleDemoCheck() {
    if (_demoSelected == null) return;
    final currentQ = _demoQuestions[_demoIndex];
    setState(() {
      _demoAnswered = true;
      if (_demoSelected == currentQ.correctIndex) {
        _demoScore++;
      }
    });
  }

  void _handleDemoNext() {
    if (_demoIndex < _demoQuestions.length - 1) {
      setState(() {
        _demoIndex++;
        _demoSelected = null;
        _demoAnswered = false;
      });
    } else {
      setState(() {
        _demoFinished = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final softFills = aimSoftFillsOf(context);
    final l10n = AppLocalizations.of(context);

    final sessionState = ref.watch(practiceSessionProvider);
    final authContextState = ref.watch(authContextProvider);

    final avatarLetter = switch (authContextState) {
      AppAsyncSuccess(:final data) =>
        (data.profile?.displayName != null && data.profile!.displayName!.isNotEmpty)
            ? data.profile!.displayName![0].toUpperCase()
            : (data.user.email != null && data.user.email!.isNotEmpty)
                ? data.user.email![0].toUpperCase()
                : 'A',
      _ => 'A',
    };

    return Scaffold(
      backgroundColor: surfaces.background,
      body: SafeArea(
        child: switch (sessionState.status) {
          PracticeSessionStatus.idle ||
          PracticeSessionStatus.loading =>
            AIMFullScreenLoading(
              semanticLabel: l10n.practiceSessionLoadingSemantic,
            ),
          PracticeSessionStatus.locked => AIMFullScreenError(
              message: l10n.lessonsCourseLockedMessage,
              onRetry: _start,
            ),
          PracticeSessionStatus.failed => _buildFailedView(
              context,
              surfaces: surfaces,
              sessionState: sessionState,
              l10n: l10n,
              avatarLetter: avatarLetter,
            ),
          PracticeSessionStatus.empty => Scaffold(
              appBar: AppBar(
                leading: IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => context.pop(),
                ),
                backgroundColor: Colors.transparent,
                elevation: 0,
              ),
              body: AIMEmptyState(
                icon: const Icon(Icons.quiz_outlined),
                title: l10n.practiceSessionEmptyTitle,
                subtitle: l10n.practiceSessionEmptySubtitle,
              ),
            ),
          PracticeSessionStatus.active => _buildActiveQuestionView(
              context,
              surfaces: surfaces,
              softFills: softFills,
              sessionState: sessionState,
              avatarLetter: avatarLetter,
            ),
          PracticeSessionStatus.finished => _buildFinishedView(
              context,
              surfaces: surfaces,
              softFills: softFills,
              sessionState: sessionState,
              l10n: l10n,
            ),
        },
      ),
    );
  }

  Widget _buildActiveQuestionView(
    BuildContext context, {
    required AimSurfaceTheme surfaces,
    required AimSoftFillTheme softFills,
    required PracticeSessionState sessionState,
    required String avatarLetter,
  }) {
    final currentQ = sessionState.currentQuestion;
    if (currentQ == null) {
      return _demoFinished
          ? _buildDemoFinishedView(
              context,
              surfaces: surfaces,
              l10n: AppLocalizations.of(context),
            )
          : _buildDemoActiveView(
              context,
              surfaces: surfaces,
              avatarLetter: avatarLetter,
            );
    }

    final totalQuestions = sessionState.questions.length;
    final currentIndex = sessionState.currentIndex;
    final progressValue = (currentIndex + 1) / totalQuestions;

    return Column(
      children: [
        // Top App Bar & Progress
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: surfaces.surface,
            border: Border(bottom: BorderSide(color: surfaces.border)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.close_rounded, size: 20),
                    style: IconButton.styleFrom(
                      backgroundColor: surfaces.surfaceSunken,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(8),
                    ),
                  ),
                  const Text(
                    'PRACTICE SESSION',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AimColors.primary500,
                      letterSpacing: 1.0,
                    ),
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF4F46E5), Color(0xFF818CF8)],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      avatarLetter,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Animated Segmented Progress Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: progressValue,
                  minHeight: 6,
                  backgroundColor: surfaces.surfaceSunken,
                  valueColor: const AlwaysStoppedAnimation<Color>(AimColors.primary500),
                ),
              ),
            ],
          ),
        ),

        // Main Scrollable Content
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Question Prompt Container Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: surfaces.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: surfaces.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'QUESTION ${currentIndex + 1} OF $totalQuestions',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AimColors.primary500,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      currentQ.stem,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                        height: 1.35,
                      ),
                    ),
                    if (currentQ.hint != null && currentQ.hint!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        currentQ.hint!,
                        style: TextStyle(
                          fontSize: 13,
                          color: surfaces.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Answer Options List
              Column(
                children: [
                  for (int i = 0; i < currentQ.options.length; i++) ...[
                    _buildOptionTile(
                      surfaces: surfaces,
                      option: currentQ.options[i],
                      index: i,
                    ),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
            ],
          ),
        ),

        // Bottom CTA Action Footer
        Container(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          decoration: BoxDecoration(
            color: surfaces.surface,
            border: Border(top: BorderSide(color: surfaces.border)),
          ),
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: !_answeredCurrent
                ? ElevatedButton(
                    onPressed: _selectedOptionId != null ? _handleCheckAnswer : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AimColors.primary500,
                      disabledBackgroundColor: AimColors.primary500.withValues(alpha: 0.4),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Check Answer',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  )
                : ElevatedButton(
                    onPressed: _handleNextQuestion,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AimColors.primary500,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      currentIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Session',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildOptionTile({
    required AimSurfaceTheme surfaces,
    required dynamic option,
    required int index,
  }) {
    final optionId = option.id as String;
    final optionText = option.text as String;

    final isSelected = _selectedOptionId == optionId;
    Color tileBg = surfaces.surface;
    BorderSide tileBorder = BorderSide(color: surfaces.border);
    Color textColor = surfaces.textPrimary;

    if (_answeredCurrent && isSelected) {
      tileBg = const Color(0xFFD1FAE5);
      tileBorder = const BorderSide(color: Color(0xFF10B981), width: 2);
      textColor = const Color(0xFF065F46);
    } else if (isSelected) {
      tileBg = AimColors.primary500.withValues(alpha: 0.08);
      tileBorder = const BorderSide(color: AimColors.primary500, width: 2);
      textColor = AimColors.primary500;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _onOptionTap(optionId),
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: tileBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.fromBorderSide(tileBorder),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  optionText,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
              ),
              if (_answeredCurrent && isSelected)
                const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981),
                  size: 22,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFinishedView(
    BuildContext context, {
    required AimSurfaceTheme surfaces,
    required AimSoftFillTheme softFills,
    required PracticeSessionState sessionState,
    required AppLocalizations l10n,
  }) {
    final totalQ = sessionState.questions.isNotEmpty ? sessionState.questions.length : 1;
    final accuracyPercent = ((_correctCount / totalQ) * 100).round();

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Spacer(),

          // Trophy Animated Box
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.25),
                  shape: BoxShape.circle,
                ),
              ),
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.35),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.emoji_events_rounded,
                  color: Colors.white,
                  size: 40,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Eyebrow Tag
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'PRACTICE COMPLETE!',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Color(0xFFD97706),
                letterSpacing: 1.0,
              ),
            ),
          ),

          const SizedBox(height: 12),

          Text(
            l10n.practiceSessionCompleteTitle,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: surfaces.textPrimary,
              letterSpacing: -0.5,
            ),
          ),

          const SizedBox(height: 6),

          Text(
            'You finished this practice session for ${widget.lessonTitle}.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: surfaces.textSecondary,
            ),
          ),

          const SizedBox(height: 32),

          // Stats Card Box
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: surfaces.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: surfaces.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text(
                      'XP EARNED',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textMuted,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '+50 XP',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: AimColors.primary500,
                      ),
                    ),
                  ],
                ),
                Container(
                  width: 1,
                  height: 36,
                  color: surfaces.border,
                ),
                Column(
                  children: [
                    Text(
                      'ACCURACY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textMuted,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$accuracyPercent%',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF10B981),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Spacer(),

          // Continue Button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/main');
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AimColors.primary500,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: Text(
                l10n.practiceSessionDoneButton,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildDemoActiveView(
    BuildContext context, {
    required AimSurfaceTheme surfaces,
    required String avatarLetter,
  }) {
    final currentQ = _demoQuestions[_demoIndex];
    final totalQuestions = _demoQuestions.length;
    final progressValue = (_demoIndex + 1) / totalQuestions;

    return Column(
      children: [
        // Top App Bar & Progress
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: surfaces.surface,
            border: Border(bottom: BorderSide(color: surfaces.border)),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.close_rounded, size: 20),
                    style: IconButton.styleFrom(
                      backgroundColor: surfaces.surfaceSunken,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(8),
                    ),
                  ),
                  const Text(
                    'PRACTICE SESSION',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AimColors.primary500,
                      letterSpacing: 1.0,
                    ),
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Color(0xFF4F46E5), Color(0xFF818CF8)],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      avatarLetter,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Animated Segmented Progress Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: progressValue,
                  minHeight: 6,
                  backgroundColor: surfaces.surfaceSunken,
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AimColors.primary500),
                ),
              ),
            ],
          ),
        ),

        // Main Scrollable Content
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Question Prompt Container Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: surfaces.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: surfaces.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'QUESTION ${_demoIndex + 1} OF $totalQuestions',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AimColors.primary500,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      currentQ.prompt,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      currentQ.translation,
                      style: TextStyle(
                        fontSize: 13,
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Answer Options List
              Column(
                children: [
                  for (int i = 0; i < currentQ.options.length; i++) ...[
                    _buildDemoOptionTile(
                      surfaces: surfaces,
                      optionText: currentQ.options[i],
                      index: i,
                      correctIndex: currentQ.correctIndex,
                    ),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
            ],
          ),
        ),

        // Bottom CTA Action Footer
        Container(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          decoration: BoxDecoration(
            color: surfaces.surface,
            border: Border(top: BorderSide(color: surfaces.border)),
          ),
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: !_demoAnswered
                ? ElevatedButton(
                    onPressed: _demoSelected != null ? _handleDemoCheck : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AimColors.primary500,
                      disabledBackgroundColor:
                          AimColors.primary500.withValues(alpha: 0.4),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Check Answer',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  )
                : ElevatedButton(
                    onPressed: _handleDemoNext,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AimColors.primary500,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      _demoIndex < totalQuestions - 1
                          ? 'Next Question'
                          : 'Complete Session',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildDemoOptionTile({
    required AimSurfaceTheme surfaces,
    required String optionText,
    required int index,
    required int correctIndex,
  }) {
    final isSelected = _demoSelected == index;
    final isCorrect = index == correctIndex;

    Color tileBg = surfaces.surface;
    BorderSide tileBorder = BorderSide(color: surfaces.border);
    Color textColor = surfaces.textPrimary;

    if (_demoAnswered) {
      if (isCorrect) {
        tileBg = const Color(0xFFD1FAE5);
        tileBorder = const BorderSide(color: Color(0xFF10B981), width: 2);
        textColor = const Color(0xFF065F46);
      } else if (isSelected && !isCorrect) {
        tileBg = const Color(0xFFFFE4E6);
        tileBorder = const BorderSide(color: Color(0xFFF43F5E), width: 2);
        textColor = const Color(0xFF9F1239);
      }
    } else if (isSelected) {
      tileBg = AimColors.primary500.withValues(alpha: 0.08);
      tileBorder = const BorderSide(color: AimColors.primary500, width: 2);
      textColor = AimColors.primary500;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          if (_demoAnswered) return;
          setState(() => _demoSelected = index);
        },
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: tileBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.fromBorderSide(tileBorder),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  optionText,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
              ),
              if (_demoAnswered && isCorrect)
                const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981),
                  size: 22,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDemoFinishedView(
    BuildContext context, {
    required AimSurfaceTheme surfaces,
    required AppLocalizations l10n,
  }) {
    final totalQ = _demoQuestions.length;
    final accuracyPercent = ((_demoScore / totalQ) * 100).round();

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Spacer(),

          // Trophy Animated Box
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.25),
                  shape: BoxShape.circle,
                ),
              ),
              Transform.rotate(
                angle: 0.05,
                child: Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFBBF24), Color(0xFFF59E0B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.35),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.emoji_events_rounded,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Eyebrow Tag
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'PRACTICE COMPLETE!',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Color(0xFFD97706),
                letterSpacing: 1.0,
              ),
            ),
          ),

          const SizedBox(height: 12),

          Text(
            'Great Job!',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: surfaces.textPrimary,
              letterSpacing: -0.5,
            ),
          ),

          const SizedBox(height: 6),

          Text(
            'You scored $_demoScore/$totalQ on this practice session.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: surfaces.textSecondary,
            ),
          ),

          const SizedBox(height: 32),

          // Stats Card Box
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: surfaces.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: surfaces.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    Text(
                      'XP EARNED',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textMuted,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '+50 XP',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: AimColors.primary500,
                      ),
                    ),
                  ],
                ),
                Container(
                  width: 1,
                  height: 36,
                  color: surfaces.border,
                ),
                Column(
                  children: [
                    Text(
                      'ACCURACY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textMuted,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$accuracyPercent%',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF10B981),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Spacer(),

          // Continue Button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/main');
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AimColors.primary500,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Continue to Lesson',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildFailedView(
    BuildContext context, {
    required AimSurfaceTheme surfaces,
    required PracticeSessionState sessionState,
    required AppLocalizations l10n,
    required String avatarLetter,
  }) {
    final msg = sessionState.errorMessage ?? '';
    final isPlacementMissing = msg.contains('placement') || msg.contains('baseline level');

    if (isPlacementMissing) {
      return Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  onPressed: () => context.pop(),
                  icon: const Icon(Icons.close_rounded, size: 20),
                  style: IconButton.styleFrom(
                    backgroundColor: surfaces.surfaceSunken,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(8),
                  ),
                ),
                const Text(
                  'PRACTICE SESSION',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AimColors.primary500,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(width: 40),
              ],
            ),
            const Spacer(),
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: Color(0xFFFEF2F2),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.assignment_late_rounded,
                color: Color(0xFFEF4444),
                size: 40,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'مطلوب اختبار تحديد المستوى',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: surfaces.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'يجب إكمال اختبار تحديد المستوى أولاً لتحديد مستواك المرجعي وبدء الجلسات التعليمية.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: surfaces.textSecondary,
              ),
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: () => context.push(AppRoutePaths.placementStart),
                icon: const Icon(Icons.play_arrow_rounded),
                label: const Text(
                  'إجراء اختبار تحديد المستوى الآن',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AimColors.primary500,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton(
                onPressed: () {
                  setState(() {
                    _demoIndex = 0;
                    _demoSelected = null;
                    _demoAnswered = false;
                    _demoScore = 0;
                    _demoFinished = false;
                  });
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AimColors.primary500,
                  side: const BorderSide(color: AimColors.primary500),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  'ممارسة التمارين تجريبياً',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            ),
            const Spacer(),
          ],
        ),
      );
    }

    return AIMFullScreenError(
      message: sessionState.errorMessage ?? l10n.practiceSessionFailedMessage,
      onRetry: _start,
    );
  }
}
