// Phase 6 — P6-083 / P6-084 / P6-085 / P6-089 / P6-091
// PracticeSessionPage — UI for interactive lesson practice session.

import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:path_provider/path_provider.dart';

import 'package:aim_mobile/core/logging/app_logger.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/practice_session_notifier.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_provider.dart';
import 'package:aim_mobile/features/question_answer/ui/widgets/question_fill_blank_input.dart';
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

class _PracticeQuestionSummary {
  const _PracticeQuestionSummary({
    required this.questionNumber,
    required this.stem,
    required this.userAnswer,
    required this.isCorrect,
  });

  final int questionNumber;
  final String stem;
  final String userAnswer;
  final bool isCorrect;
}

class _PracticeSessionPageState extends ConsumerState<PracticeSessionPage> {
  String? _selectedOptionId;
  String _writtenAnswer = '';
  int _correctCount = 0;
  int _wrongCount = 0;
  final List<_PracticeQuestionSummary> _questionSummaries = [];

  bool _isSubmitting = false;

  // Fallback demo state when backend has no questions seeded
  int _demoIndex = 0;
  int? _demoSelected;
  int _demoScore = 0;
  bool _demoFinished = false;
  final List<_PracticeQuestionSummary> _demoSummaries = [];

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
    if (_isSubmitting) return;
    setState(() {
      _selectedOptionId = optionId;
    });
  }

  DateTime _questionShownAt = DateTime.now();

  Future<void> _handleProceed() async {
    final state = ref.read(practiceSessionProvider);
    final currentQ = state.currentQuestion;
    if (currentQ == null || _isSubmitting) return;

    final isOptionBased = currentQ.options.isNotEmpty;
    if (isOptionBased && _selectedOptionId == null) return;
    if (!isOptionBased && _writtenAnswer.trim().isEmpty) return;

    setState(() => _isSubmitting = true);

    try {
      final token = ref.read(authFlowProvider).accessToken;

      if (token != null && state.sessionId != null) {
        // Ensure startedAt is safely in the past relative to server time to avoid clock drift rejection
        final safeShownAt = _questionShownAt.subtract(const Duration(seconds: 2));
        ref.read(questionAnswerSessionProvider.notifier).presentQuestion(
              question: currentQ,
              itemShownAt: safeShownAt.toIso8601String(),
            );
        if (isOptionBased) {
          ref.read(questionAnswerSessionProvider.notifier).selectOption(_selectedOptionId!);
        } else {
          ref.read(questionAnswerSessionProvider.notifier).updateWrittenAnswer(_writtenAnswer.trim());
        }
        await ref
            .read(questionAnswerSessionProvider.notifier)
            .submitAnswer(
              bearerToken: token,
              sessionId: state.sessionId!,
            )
            .timeout(const Duration(seconds: 8), onTimeout: () {});
      }

      final submitState = ref.read(questionAnswerSessionProvider);
      final isCorrect = submitState.attemptResult?.isCorrect ?? false;

      final answerText = isOptionBased
          ? (currentQ.options.where((o) => o.id == _selectedOptionId).firstOrNull?.text ?? '')
          : _writtenAnswer.trim();

      if (mounted) {
        setState(() {
          _questionSummaries.add(_PracticeQuestionSummary(
            questionNumber: state.currentIndex + 1,
            stem: currentQ.stem,
            userAnswer: answerText,
            isCorrect: isCorrect,
          ));
          if (isCorrect) {
            _correctCount++;
          } else {
            _wrongCount++;
          }
          _selectedOptionId = null;
          _writtenAnswer = '';
          _questionShownAt = DateTime.now();
        });
        ref.read(questionAnswerSessionProvider.notifier).reset();
        await ref.read(practiceSessionProvider.notifier).advance();
      }
    } catch (_) {
      if (mounted) {
        final answerText = isOptionBased
            ? (currentQ.options.where((o) => o.id == _selectedOptionId).firstOrNull?.text ?? '')
            : _writtenAnswer.trim();
        setState(() {
          _questionSummaries.add(_PracticeQuestionSummary(
            questionNumber: state.currentIndex + 1,
            stem: currentQ.stem,
            userAnswer: answerText,
            isCorrect: false,
          ));
          _wrongCount++;
          _selectedOptionId = null;
          _writtenAnswer = '';
          _questionShownAt = DateTime.now();
        });
        ref.read(questionAnswerSessionProvider.notifier).reset();
        await ref.read(practiceSessionProvider.notifier).advance();
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  // Fallback quiz handlers
  void _handleDemoProceed() {
    if (_demoSelected == null) return;
    final currentQ = _demoQuestions[_demoIndex];
    final isCorrect = _demoSelected == currentQ.correctIndex;
    final selectedText = currentQ.options[_demoSelected!];

    setState(() {
      _demoSummaries.add(_PracticeQuestionSummary(
        questionNumber: _demoIndex + 1,
        stem: currentQ.prompt,
        userAnswer: selectedText,
        isCorrect: isCorrect,
      ));
      if (isCorrect) {
        _demoScore++;
      }
      _demoSelected = null;
      if (_demoIndex < _demoQuestions.length - 1) {
        _demoIndex++;
      } else {
        _demoFinished = true;
      }
    });
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
    final isListening = currentQ.type == 'listening_choice' ||
        currentQ.type.toLowerCase().contains('listening') ||
        currentQ.stem.toLowerCase().startsWith('listen') ||
        currentQ.stem.toLowerCase().contains('listen to');

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

              if (isListening) ...[
                const SizedBox(height: 16),
                _PracticeAudioButton(
                  key: ValueKey('practice_audio_${currentQ.id}'),
                  questionId: currentQ.id,
                ),
              ],

              const SizedBox(height: 20),

              if (currentQ.options.isNotEmpty) ...[
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
              ] else ...[
                // Free-text / Fill-in-the-blank input
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
                        Localizations.localeOf(context).languageCode == 'ar'
                            ? 'إجابتك'
                            : 'YOUR ANSWER',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AimColors.primary500,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 14),
                      QuestionFillBlankInput(
                        key: ValueKey(currentQ.id),
                        disabled: _isSubmitting,
                        placeholder: Localizations.localeOf(context).languageCode == 'ar'
                            ? 'اكتب الإجابة هنا'
                            : 'Type the missing letter or word',
                        helper: Localizations.localeOf(context).languageCode == 'ar'
                            ? 'اكتب إجابتك ثم اضغط على ${currentIndex < totalQuestions - 1 ? "السؤال التالي" : "إكمال الجلسة"} أدناه.'
                            : 'Type your answer, then tap ${currentIndex < totalQuestions - 1 ? "Next Question" : "Complete Session"} below.',
                        onChanged: (val) {
                          setState(() {
                            _writtenAnswer = val;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ],
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
            child: ElevatedButton(
              onPressed: (!_isSubmitting &&
                      (currentQ.options.isNotEmpty
                          ? _selectedOptionId != null
                          : _writtenAnswer.trim().isNotEmpty))
                  ? _handleProceed
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AimColors.primary500,
                disabledBackgroundColor: AimColors.primary500.withValues(alpha: 0.4),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 0,
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      currentIndex < totalQuestions - 1
                          ? (Localizations.localeOf(context).languageCode == 'ar'
                              ? 'السؤال التالي'
                              : 'Next Question')
                          : (Localizations.localeOf(context).languageCode == 'ar'
                              ? 'إكمال الجلسة'
                              : 'Complete Session'),
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

    if (isSelected) {
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
              if (isSelected)
                const Icon(
                  Icons.radio_button_checked_rounded,
                  color: AimColors.primary500,
                  size: 20,
                )
              else
                Icon(
                  Icons.radio_button_unchecked_rounded,
                  color: surfaces.border,
                  size: 20,
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
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final totalQ = sessionState.questions.isNotEmpty ? sessionState.questions.length : 1;
    final accuracyPercent = ((_correctCount / totalQ) * 100).round();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      children: [
        const SizedBox(height: 12),
        // Trophy Animated Box
        Center(
          child: Stack(
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
        ),

        const SizedBox(height: 24),

        // Eyebrow Tag
        Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isArabic ? 'اكتملت الجلسة!' : 'PRACTICE COMPLETE!',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Color(0xFFD97706),
                letterSpacing: 1.0,
              ),
            ),
          ),
        ),

        const SizedBox(height: 12),

        Center(
          child: Text(
            l10n.practiceSessionCompleteTitle,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: surfaces.textPrimary,
              letterSpacing: -0.5,
            ),
          ),
        ),

        const SizedBox(height: 6),

        Center(
          child: Text(
            isArabic
                ? 'لقد أكملت جميع أسئلة التمرين لدرس ${widget.lessonTitle}.'
                : 'You finished this practice session for ${widget.lessonTitle}.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: surfaces.textSecondary,
            ),
          ),
        ),

        const SizedBox(height: 28),

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
                    isArabic ? 'صحيحة' : 'CORRECT',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: surfaces.textMuted,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$_correctCount',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF10B981),
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
                    isArabic ? 'خاطئة' : 'WRONG',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: surfaces.textMuted,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$_wrongCount',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFEF4444),
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
                    isArabic ? 'الدقة' : 'ACCURACY',
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
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: accuracyPercent >= 70
                          ? const Color(0xFF10B981)
                          : (accuracyPercent >= 40
                              ? const Color(0xFFF59E0B)
                              : const Color(0xFFEF4444)),
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
                    isArabic ? 'النقاط' : 'XP EARNED',
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
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Feedback Summary Banner (shows wrong answers count clearly)
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _wrongCount == 0
                ? const Color(0xFFD1FAE5)
                : const Color(0xFFFEF3C7),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _wrongCount == 0
                  ? const Color(0xFF10B981)
                  : const Color(0xFFF59E0B),
            ),
          ),
          child: Row(
            children: [
              Icon(
                _wrongCount == 0
                    ? Icons.emoji_events_rounded
                    : Icons.info_outline_rounded,
                color: _wrongCount == 0
                    ? const Color(0xFF065F46)
                    : const Color(0xFFB45309),
                size: 26,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _wrongCount == 0
                          ? (isArabic
                              ? 'درجة كاملة! أحسنت صنعاً'
                              : 'Perfect Score! All Correct')
                          : (isArabic
                              ? (_wrongCount == 1
                                  ? 'لديك إجابة واحدة غير صحيحة من أصل $totalQ أسئلة'
                                  : 'لديك $_wrongCount إجابات غير صحيحة من أصل $totalQ أسئلة')
                              : 'You got $_wrongCount wrong answer${_wrongCount > 1 ? 's' : ''} out of $totalQ ${totalQ == 1 ? 'question' : 'questions'}'),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: _wrongCount == 0
                            ? const Color(0xFF065F46)
                            : const Color(0xFF92400E),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _wrongCount == 0
                          ? (isArabic
                              ? 'لقد أتقنت جميع مفاهيم هذا الدرس بنجاح.'
                              : 'You mastered all concepts in this practice session.')
                          : (isArabic
                              ? 'راجع الدرس وتدرّب مجدداً لإتقان جميع الإجابات.'
                              : 'Review the lesson and practice again to master these concepts.'),
                      style: TextStyle(
                        fontSize: 12,
                        color: _wrongCount == 0
                            ? const Color(0xFF047857)
                            : const Color(0xFFB45309),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        if (_questionSummaries.isNotEmpty) ...[
          const SizedBox(height: 20),
          _buildQuestionReviewList(
            context: context,
            surfaces: surfaces,
            summaries: _questionSummaries,
            isArabic: isArabic,
          ),
        ],

        const SizedBox(height: 28),

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
    );
  }

  Widget _buildQuestionReviewList({
    required BuildContext context,
    required AimSurfaceTheme surfaces,
    required List<_PracticeQuestionSummary> summaries,
    required bool isArabic,
  }) {
    if (summaries.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.checklist_rounded,
                color: AimColors.primary500,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                isArabic ? 'مراجعة الإجابات' : 'Question Review',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: surfaces.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          for (final item in summaries) ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: item.isCorrect
                      ? const Color(0xFF10B981).withValues(alpha: 0.3)
                      : const Color(0xFFEF4444).withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: item.isCorrect
                          ? const Color(0xFFD1FAE5)
                          : const Color(0xFFFEE2E2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      item.isCorrect
                          ? Icons.check_rounded
                          : Icons.close_rounded,
                      color: item.isCorrect
                          ? const Color(0xFF10B981)
                          : const Color(0xFFEF4444),
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${isArabic ? "سؤال" : "Q"}${item.questionNumber}: ${item.stem}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: surfaces.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${isArabic ? "إجابتك:" : "Your answer:"} ${item.userAnswer.isEmpty ? (isArabic ? "(فارغ)" : "(empty)") : item.userAnswer}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: item.isCorrect
                                ? const Color(0xFF065F46)
                                : const Color(0xFFB91C1C),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
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
            child: ElevatedButton(
              onPressed: _demoSelected != null ? _handleDemoProceed : null,
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
              child: Text(
                _demoIndex < totalQuestions - 1
                    ? (Localizations.localeOf(context).languageCode == 'ar'
                        ? 'السؤال التالي'
                        : 'Next Question')
                    : (Localizations.localeOf(context).languageCode == 'ar'
                        ? 'إكمال الجلسة'
                        : 'Complete Session'),
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

    Color tileBg = surfaces.surface;
    BorderSide tileBorder = BorderSide(color: surfaces.border);
    Color textColor = surfaces.textPrimary;

    if (isSelected) {
      tileBg = AimColors.primary500.withValues(alpha: 0.08);
      tileBorder = const BorderSide(color: AimColors.primary500, width: 2);
      textColor = AimColors.primary500;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
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
              if (isSelected)
                const Icon(
                  Icons.radio_button_checked_rounded,
                  color: AimColors.primary500,
                  size: 20,
                )
              else
                Icon(
                  Icons.radio_button_unchecked_rounded,
                  color: surfaces.border,
                  size: 20,
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
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final totalQ = _demoQuestions.length;
    final accuracyPercent = ((_demoScore / totalQ) * 100).round();
    final wrongCount = totalQ - _demoScore;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      children: [
        const SizedBox(height: 12),
        // Trophy Animated Box
        Center(
          child: Stack(
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
        ),

        const SizedBox(height: 24),

        // Eyebrow Tag
        Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isArabic ? 'اكتمل التدريب التجريبي!' : 'DEMO PRACTICE COMPLETE!',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Color(0xFFD97706),
                letterSpacing: 1.0,
              ),
            ),
          ),
        ),

        const SizedBox(height: 12),

        Center(
          child: Text(
            isArabic ? 'عمل رائع!' : 'Great Job!',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: surfaces.textPrimary,
              letterSpacing: -0.5,
            ),
          ),
        ),

        const SizedBox(height: 6),

        Center(
          child: Text(
            isArabic
                ? 'أكملت جلسة التدريب التجريبية بنجاح.'
                : 'You completed the demo practice session successfully.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: surfaces.textSecondary,
            ),
          ),
        ),

        const SizedBox(height: 28),

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
                    isArabic ? 'صحيحة' : 'CORRECT',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: surfaces.textMuted,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$_demoScore',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF10B981),
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
                    isArabic ? 'خاطئة' : 'WRONG',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: surfaces.textMuted,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$wrongCount',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFEF4444),
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
                    isArabic ? 'الدقة' : 'ACCURACY',
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
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: accuracyPercent >= 70
                          ? const Color(0xFF10B981)
                          : const Color(0xFFEF4444),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Feedback Summary Banner (shows wrong answers count clearly)
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: wrongCount == 0
                ? const Color(0xFFD1FAE5)
                : const Color(0xFFFEF3C7),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: wrongCount == 0
                  ? const Color(0xFF10B981)
                  : const Color(0xFFF59E0B),
            ),
          ),
          child: Row(
            children: [
              Icon(
                wrongCount == 0
                    ? Icons.emoji_events_rounded
                    : Icons.info_outline_rounded,
                color: wrongCount == 0
                    ? const Color(0xFF065F46)
                    : const Color(0xFFB45309),
                size: 26,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      wrongCount == 0
                          ? (isArabic
                              ? 'درجة كاملة! أحسنت صنعاً'
                              : 'Perfect Score! All Correct')
                          : (isArabic
                              ? (wrongCount == 1
                                  ? 'لديك إجابة واحدة غير صحيحة من أصل $totalQ أسئلة'
                                  : 'لديك $wrongCount إجابات غير صحيحة من أصل $totalQ أسئلة')
                              : 'You got $wrongCount wrong answer${wrongCount > 1 ? 's' : ''} out of $totalQ ${totalQ == 1 ? 'question' : 'questions'}'),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: wrongCount == 0
                            ? const Color(0xFF065F46)
                            : const Color(0xFF92400E),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      wrongCount == 0
                          ? (isArabic
                              ? 'لقد أتقنت جميع مفاهيم هذا الدرس بنجاح.'
                              : 'You mastered all concepts in this practice session.')
                          : (isArabic
                              ? 'راجع الدرس وتدرّب مجدداً لإتقان جميع الإجابات.'
                              : 'Review the lesson and practice again to master these concepts.'),
                      style: TextStyle(
                        fontSize: 12,
                        color: wrongCount == 0
                            ? const Color(0xFF047857)
                            : const Color(0xFFB45309),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        if (_demoSummaries.isNotEmpty) ...[
          const SizedBox(height: 20),
          _buildQuestionReviewList(
            context: context,
            surfaces: surfaces,
            summaries: _demoSummaries,
            isArabic: isArabic,
          ),
        ],

        const SizedBox(height: 28),

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
                    _demoScore = 0;
                    _demoFinished = false;
                    _demoSummaries.clear();
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

class _PracticeAudioButton extends ConsumerStatefulWidget {
  const _PracticeAudioButton({
    required this.questionId,
    super.key,
  });

  final String questionId;

  @override
  ConsumerState<_PracticeAudioButton> createState() => _PracticeAudioButtonState();
}

class _PracticeAudioButtonState extends ConsumerState<_PracticeAudioButton> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlaying = false;
  bool _isLoading = false;
  String? _error;
  StreamSubscription? _playerStateSubscription;

  @override
  void initState() {
    super.initState();
    _playerStateSubscription = _audioPlayer.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
        });
      }
    });
  }

  @override
  void dispose() {
    _playerStateSubscription?.cancel();
    _audioPlayer.stop();
    _audioPlayer.dispose();
    super.dispose();
  }

  Uint8List _sanitizeWavHeader(Uint8List bytes) {
    if (bytes.length < 12) return bytes;
    if (bytes[0] == 0x52 &&
        bytes[1] == 0x49 &&
        bytes[2] == 0x46 &&
        bytes[3] == 0x46 &&
        bytes[8] == 0x57 &&
        bytes[9] == 0x41 &&
        bytes[10] == 0x56 &&
        bytes[11] == 0x45) {
      final copy = Uint8List.fromList(bytes);
      final byteData = ByteData.sublistView(copy);
      final riffSize = byteData.getUint32(4, Endian.little);
      if (riffSize == 0xFFFFFFFF || riffSize > copy.length - 8) {
        byteData.setUint32(4, copy.length - 8, Endian.little);
      }

      for (int i = 12; i <= copy.length - 8; i++) {
        if (copy[i] == 0x64 &&
            copy[i + 1] == 0x61 &&
            copy[i + 2] == 0x74 &&
            copy[i + 3] == 0x61) {
          final dataSize = byteData.getUint32(i + 4, Endian.little);
          if (dataSize == 0xFFFFFFFF || dataSize > copy.length - (i + 8)) {
            byteData.setUint32(i + 4, copy.length - (i + 8), Endian.little);
          }
          break;
        }
      }
      return copy;
    }
    return bytes;
  }

  Future<void> _handleTap() async {
    if (_isPlaying) {
      await _audioPlayer.stop();
      if (mounted) setState(() => _isPlaying = false);
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final tempDir = await getTemporaryDirectory();
      final candidateExtensions = ['wav', 'mp3', 'ogg'];
      File? cachedFile;
      for (final ext in candidateExtensions) {
        final f = File('${tempDir.path}/practice_audio_${widget.questionId}.$ext');
        if (await f.exists() && await f.length() > 0) {
          cachedFile = f;
          break;
        }
      }

      if (cachedFile != null) {
        if (cachedFile.path.endsWith('.wav')) {
          final raw = await cachedFile.readAsBytes();
          final sanitized = _sanitizeWavHeader(raw);
          await cachedFile.writeAsBytes(sanitized, flush: true);
        }
        AppLogger.i('PracticeAudio', 'Playing existing cached audio: ${cachedFile.path}');
        await _audioPlayer.play(DeviceFileSource(cachedFile.path));
        if (mounted) {
          setState(() {
            _isLoading = false;
            _isPlaying = true;
          });
        }
        return;
      }

      final token = ref.read(authFlowProvider).accessToken ?? '';
      AppLogger.i('PracticeAudio', 'Fetching audio for questionId: ${widget.questionId}');
      final bytes = await ref.read(questionAnswerRepositoryProvider).getQuestionAudio(
            bearerToken: token,
            questionId: widget.questionId,
          );
      AppLogger.i('PracticeAudio', 'Fetched ${bytes.length} audio bytes for questionId: ${widget.questionId}');

      if (bytes.isNotEmpty) {
        String mimeType = 'audio/wav';
        if (bytes.length >= 3 && bytes[0] == 0x49 && bytes[1] == 0x44 && bytes[2] == 0x33) {
          mimeType = 'audio/mpeg';
        } else if (bytes.length >= 2 && bytes[0] == 0xFF && (bytes[1] & 0xE0) == 0xE0) {
          mimeType = 'audio/mpeg';
        } else if (bytes.length >= 4 && bytes[0] == 0x4F && bytes[1] == 0x67 && bytes[2] == 0x67 && bytes[3] == 0x53) {
          mimeType = 'audio/ogg';
        }

        try {
          final extension = mimeType == 'audio/mpeg'
              ? 'mp3'
              : (mimeType == 'audio/ogg' ? 'ogg' : 'wav');
          final tempFile = File('${tempDir.path}/practice_audio_${widget.questionId}.$extension');
          Uint8List finalBytes = Uint8List.fromList(bytes);
          if (mimeType == 'audio/wav') {
            finalBytes = _sanitizeWavHeader(finalBytes);
          }
          await tempFile.writeAsBytes(finalBytes, flush: true);
          AppLogger.i('PracticeAudio', 'Playing audio via DeviceFileSource: ${tempFile.path}');
          await _audioPlayer.play(DeviceFileSource(tempFile.path));
        } catch (fileErr) {
          AppLogger.w('PracticeAudio', 'DeviceFileSource failed, falling back to BytesSource: $fileErr');
          await _audioPlayer.play(
            BytesSource(Uint8List.fromList(bytes), mimeType: mimeType),
          );
        }

        if (mounted) {
          setState(() {
            _isLoading = false;
            _isPlaying = true;
          });
        }
      } else {
        AppLogger.w('PracticeAudio', 'No audio bytes received (204 No Content / no script authored yet)');
        if (mounted) {
          final isAr = Localizations.localeOf(context).languageCode == 'ar';
          setState(() {
            _isLoading = false;
            _error = isAr ? 'التسجيل الصوتي غير متوفر حالياً.' : 'Audio not available yet.';
          });
        }
      }
    } catch (e, stackTrace) {
      AppLogger.e('PracticeAudio', 'Failed to play question audio: $e', e, stackTrace);
      if (!mounted) return;
      final isAr = Localizations.localeOf(context).languageCode == 'ar';
      setState(() {
        _isLoading = false;
        _isPlaying = false;
        _error = isAr ? 'تعذر تشغيل الصوت. اضغط لإعادة المحاولة.' : 'Could not play audio. Tap to retry.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isAr = Localizations.localeOf(context).languageCode == 'ar';

    final playLabel = isAr ? 'اضغط للاستماع' : 'TAP TO LISTEN';
    final playingLabel = isAr ? 'جارٍ تشغيل الصوت...' : 'PLAYING AUDIO...';
    final loadingLabel = isAr ? 'جارٍ تحميل الصوت...' : 'LOADING AUDIO...';

    final idleSubtitle = isAr
        ? 'استمع بعناية قبل اختيار إجابتك.'
        : 'Listen carefully before choosing your answer.';
    final playingSubtitle = isAr
        ? 'اضغط على زر الإيقاف لإيقاف التشغيل.'
        : 'Tap stop to pause playback.';

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _isPlaying
              ? AimColors.primary500.withValues(alpha: 0.6)
              : surfaces.border,
          width: _isPlaying ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: _isPlaying
                ? AimColors.primary500.withValues(alpha: 0.12)
                : Colors.black.withValues(alpha: 0.03),
            blurRadius: _isPlaying ? 16 : 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _isLoading ? null : _handleTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(20, 18, 20, 18),
            child: Column(
              children: [
                Row(
                  children: [
                    // Play / Pause Circle Button
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF4F46E5), Color(0xFF6366F1)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF4F46E5).withValues(alpha: 0.35),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Center(
                        child: _isLoading
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : Icon(
                                _isPlaying
                                    ? Icons.stop_rounded
                                    : Icons.play_arrow_rounded,
                                color: Colors.white,
                                size: 32,
                              ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Status text and helper
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isPlaying
                                ? playingLabel
                                : (_isLoading ? loadingLabel : playLabel),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              color: AimColors.primary500,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _error != null
                                ? _error!
                                : (_isPlaying ? playingSubtitle : idleSubtitle),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: _error != null
                                  ? AimColors.error500
                                  : surfaces.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Sound Wave Visualizer
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: List.generate(28, (index) {
                    final heights = [
                      10, 16, 26, 38, 22, 14, 30, 42, 26, 12,
                      18, 22, 34, 26, 12, 18, 24, 32, 40, 22,
                      14, 26, 36, 22, 12, 18, 26, 12,
                    ];
                    final height = heights[index % heights.length].toDouble();
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2.2),
                      width: 3.2,
                      height: _isPlaying ? height * 0.75 : height * 0.35,
                      decoration: BoxDecoration(
                        color: AimColors.primary500.withValues(
                          alpha: _isPlaying ? 0.9 : 0.25,
                        ),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
