import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/placement_question_model.dart';
import '../../logic/provider/placement_provider.dart';
import '../../logic/provider/placement_question_notifier.dart';
import '../widgets/placement_countdown_timer.dart';
import '../widgets/placement_ghost_button.dart';
import '../widgets/placement_option_card.dart';
import '../widgets/placement_primary_button.dart';
import '../widgets/placement_speaking_answer_input.dart';

class PlacementQuestionPage extends ConsumerStatefulWidget {
  const PlacementQuestionPage({
    super.key,
    required this.sectionId,
    required this.attemptId,
    required this.sectionTitle,
    required this.sectionIndex,
    required this.totalSections,
    this.expiresAt,
  });

  final String sectionId;
  final String attemptId;
  final String sectionTitle;
  final int sectionIndex;
  final int totalSections;
  final String? expiresAt;

  @override
  ConsumerState<PlacementQuestionPage> createState() =>
      _PlacementQuestionPageState();
}

class _PlacementQuestionPageState
    extends ConsumerState<PlacementQuestionPage> {
  String? _submitError;
  late String _timerExpiresAt;

  @override
  void initState() {
    super.initState();
    _resetTimer();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadQuestions());
  }

  @override
  void didUpdateWidget(PlacementQuestionPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.attemptId != widget.attemptId ||
        oldWidget.expiresAt != widget.expiresAt ||
        oldWidget.sectionId != widget.sectionId) {
      _resetTimer();
    }
  }

  void _resetTimer() {
    DateTime? parsedExpiry;
    if (widget.expiresAt != null) {
      parsedExpiry = DateTime.tryParse(widget.expiresAt!);
    }
    
    if (parsedExpiry == null || parsedExpiry.isBefore(DateTime.now())) {
      _timerExpiresAt = DateTime.now().add(const Duration(minutes: 25)).toIso8601String();
    } else {
      _timerExpiresAt = widget.expiresAt!;
    }
  }

  void _loadQuestions() {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(placementQuestionProvider.notifier).loadQuestions(
          token,
          sectionId: widget.sectionId,
          attemptId: widget.attemptId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final state = ref.watch(placementQuestionProvider);
    final surfaces = aimSurfacesOf(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    ref.listen<PlacementQuestionState>(placementQuestionProvider, (_, next) {
      if (next is PlacementQuestionSectionComplete && context.mounted) {
        context.pop();
      }
    });

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: surfaces.background,
        body: SafeArea(
          child: Column(
            children: [
              if (state is PlacementQuestionReady)
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AimSpacing.screenPaddingMobile,
                    AimSpacing.space16,
                    AimSpacing.screenPaddingMobile,
                    AimSpacing.space12,
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const SizedBox.shrink(),
                          PlacementCountdownTimer(
                            key: ValueKey(_timerExpiresAt),
                            expiresAt: _timerExpiresAt,
                            onExpired: _onTimerExpired,
                          ),
                        ],
                      ),
                      const SizedBox(height: AimSpacing.componentGap),
                      ClipRRect(
                        borderRadius: AimRadius.borderLg,
                        child: LinearProgressIndicator(
                          value: state.displayIndex / state.totalQuestions,
                          minHeight: 8,
                          backgroundColor: AimColors.primary500.withValues(alpha: 0.1),
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            AimColors.primary500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              Expanded(
                child: switch (state) {
                  PlacementQuestionLoading() ||
                  PlacementQuestionIdle() ||
                  PlacementQuestionSectionComplete() =>
                    AIMFullScreenLoading(
                      semanticLabel: l10n.placementQuestionLoadingSemantic,
                    ),
                  PlacementQuestionError(:final message) =>
                    AIMFullScreenError(
                      message: message,
                      onRetry: _loadQuestions,
                    ),
                  PlacementQuestionReady() => _QuestionBody(
                      state: state,
                      submitError: _submitError,
                      onSelectAnswer: (ans) => ref
                          .read(placementQuestionProvider.notifier)
                          .selectAnswer(ans),
                      onSkip: () => ref
                          .read(placementQuestionProvider.notifier)
                          .skipCurrentQuestion(),
                      onSubmit: () => _submitAnswer(state),
                      onSubmitSpeaking: (bytes, mimeType) =>
                          _submitSpeakingAnswer(bytes, mimeType),
                    ),
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _onTimerExpired() {
    if (!mounted) return;
    final l10n = AppLocalizations.of(context);
    setState(() => _submitError = l10n.placementQuestionTimerExpiredError);
  }

  Future<void> _submitSpeakingAnswer(List<int> audioBytes, String mimeType) async {
    setState(() => _submitError = null);
    final token = ref.read(authFlowProvider).accessToken ?? '';
    if (token.isEmpty) return;
    try {
      await ref.read(placementQuestionProvider.notifier).submitSpeakingAnswer(
            token,
            audioBytes: audioBytes,
            mimeType: mimeType,
          );
    } catch (e) {
      if (mounted) {
        final l10n = AppLocalizations.of(context);
        setState(() {
          _submitError = e is Exception
              ? e.toString().replaceFirst('Exception: ', '')
              : l10n.placementQuestionSubmitSpeakingError;
        });
      }
    }
  }

  Future<void> _submitAnswer(PlacementQuestionReady state) async {
    setState(() => _submitError = null);
    try {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      await ref
          .read(placementQuestionProvider.notifier)
          .submitCurrentAnswer(token);
    } catch (e) {
      if (mounted) {
        final l10n = AppLocalizations.of(context);
        setState(() {
          _submitError = e is Exception
              ? e.toString().replaceFirst('Exception: ', '')
              : l10n.placementQuestionSubmitAnswerError;
        });
      }
    }
  }
}

class _QuestionBody extends StatelessWidget {
  const _QuestionBody({
    required this.state,
    required this.onSelectAnswer,
    required this.onSkip,
    required this.onSubmit,
    required this.onSubmitSpeaking,
    this.submitError,
  });

  final PlacementQuestionReady state;
  final ValueChanged<String> onSelectAnswer;
  final VoidCallback onSkip;
  final VoidCallback onSubmit;
  final void Function(List<int> audioBytes, String mimeType) onSubmitSpeaking;
  final String? submitError;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final question = state.currentQuestion;
    final isSpeaking = question.type == 'speaking';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _QuestionPromptCard(
            question: question,
            displayIndex: state.displayIndex,
            totalQuestions: state.totalQuestions,
          ),
          const SizedBox(height: AimSpacing.formFieldGap),
          Expanded(
            child: SingleChildScrollView(
              child: isSpeaking
                  ? PlacementSpeakingAnswerInput(
                      key: ValueKey(question.id),
                      prompt: question.text,
                      isSubmitting: state.isSubmitting,
                      onSelect: onSelectAnswer,
                      onRecordingComplete: onSubmitSpeaking,
                    )
                  : _AnswerInput(
                      key: ValueKey(question.id),
                      questionType: question.type,
                      questionOptions: question.options,
                      selectedAnswer: state.selectedAnswer,
                      onSelect: onSelectAnswer,
                      isSubmitting: state.isSubmitting,
                    ),
            ),
          ),
          if (submitError != null) ...[
            const SizedBox(height: AimSpacing.innerGap),
            AIMAlertBanner(
              tone: AIMAlertTone.error,
              child: Text(submitError!),
            ),
          ],
          Padding(
            padding: const EdgeInsets.only(
              top: AimSpacing.componentGap,
              bottom: AimSpacing.space24,
            ),
            child: Row(
              children: [
                Expanded(
                  child: PlacementGhostButton(
                    label: l10n.onboardingWalkthroughSkip,
                    enabled: !state.isSubmitting,
                    onPressed: onSkip,
                  ),
                ),
                const SizedBox(width: AimSpacing.componentGap),
                Expanded(
                  child: PlacementPrimaryButton(
                    label: l10n.commonSubmit,
                    enabled: state.canSubmit,
                    isLoading: state.isSubmitting,
                    onPressed: onSubmit,
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

class _QuestionPromptCard extends StatelessWidget {
  const _QuestionPromptCard({
    required this.question,
    required this.displayIndex,
    required this.totalQuestions,
  });

  final PlacementQuestionModel question;
  final int displayIndex;
  final int totalQuestions;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final parts = question.text.split('\n\n');
    final String promptHeader = parts[0];
    final String promptText = parts.length > 1 ? parts[1] : promptHeader;
    final String? passage = parts.length > 2 ? parts.sublist(2).join('\n\n') : null;

    return Container(
      padding: const EdgeInsets.all(AimSpacing.cardPadding),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: AimRadius.borderLg,
        border: Border.all(color: surfaces.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: AimColors.primary500.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            promptHeader,
            style: AimTextStyles.caption.copyWith(
              color: surfaces.textMuted,
              fontWeight: AimFontWeights.semibold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Text(
            promptText,
            style: AimTextStyles.bodyLg.copyWith(
              color: surfaces.textPrimary,
              height: 1.45,
            ),
          ),
          if (passage != null && passage.isNotEmpty) ...[
            const SizedBox(height: AimSpacing.formFieldGap),
            Container(
              padding: const EdgeInsets.all(AimSpacing.cardPadding),
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                borderRadius: AimRadius.borderSm,
              ),
              child: Text(
                passage,
                style: AimTextStyles.bodySm.copyWith(
                  fontStyle: FontStyle.italic,
                  color: surfaces.textSecondary,
                  height: 1.5,
                ),
              ),
            ),
          ],
          if (question.type == 'listening_choice') ...[
            const SizedBox(height: AimSpacing.formFieldGap),
            _ListenButton(questionId: question.id),
          ],
        ],
      ),
    );
  }
}

class _AnswerInput extends StatelessWidget {
  const _AnswerInput({
    required this.questionType,
    required this.questionOptions,
    required this.selectedAnswer,
    required this.onSelect,
    required this.isSubmitting,
    super.key,
  });

  final String questionType;
  final List<PlacementOptionModel> questionOptions;
  final String? selectedAnswer;
  final ValueChanged<String> onSelect;
  final bool isSubmitting;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return switch (questionType) {
      'multiple_choice' || 'listening_choice' => _MultipleChoiceInput(
          questionOptions: questionOptions,
          selectedAnswer: selectedAnswer,
          onSelect: onSelect,
          isSubmitting: isSubmitting,
        ),
      'true_false' => _TrueFalseInput(
          selectedAnswer: selectedAnswer,
          onSelect: onSelect,
          isSubmitting: isSubmitting,
        ),
      'fill_blank' || 'writing' => _FillBlankInput(
          selectedAnswer: selectedAnswer,
          onSelect: onSelect,
          isSubmitting: isSubmitting,
          isWriting: questionType == 'writing',
          placeholder: questionType == 'writing'
              ? 'Type your response here...'
              : 'Type your answer here...',
          rows: questionType == 'writing' ? 8 : 3,
        ),
      _ => Text(
          'Unknown question type: $questionType',
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
        ),
    };
  }
}

class _MultipleChoiceInput extends StatelessWidget {
  const _MultipleChoiceInput({
    required this.questionOptions,
    required this.selectedAnswer,
    required this.onSelect,
    required this.isSubmitting,
  });

  final List<PlacementOptionModel> questionOptions;
  final String? selectedAnswer;
  final ValueChanged<String> onSelect;
  final bool isSubmitting;

  static const _fallbackOptions = ['A', 'B', 'C', 'D'];

  @override
  Widget build(BuildContext context) {
    final hasOptionText = questionOptions.isNotEmpty;
    final options = hasOptionText
        ? questionOptions.map((o) => o.id).toList()
        : _fallbackOptions;

    return Column(
      children: [
        for (var i = 0; i < options.length; i++) ...[
          Builder(
            builder: (context) {
              final optId = options[i];
              final isSelected = selectedAnswer == optId;
              final labelText = hasOptionText
                  ? questionOptions[i].text
                  : 'Option ${options[i]}';

              return PlacementOptionCard(
                title: labelText,
                isSelected: isSelected,
                enabled: !isSubmitting,
                onTap: () => onSelect(optId),
              );
            },
          ),
          if (i < options.length - 1) const SizedBox(height: AimSpacing.innerGap),
        ],
      ],
    );
  }
}

class _TrueFalseInput extends StatelessWidget {
  const _TrueFalseInput({
    required this.selectedAnswer,
    required this.onSelect,
    required this.isSubmitting,
  });

  final String? selectedAnswer;
  final ValueChanged<String> onSelect;
  final bool isSubmitting;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: PlacementOptionCard(
            title: 'True',
            isSelected: selectedAnswer == 'true',
            enabled: !isSubmitting,
            onTap: () => onSelect('true'),
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: PlacementOptionCard(
            title: 'False',
            isSelected: selectedAnswer == 'false',
            enabled: !isSubmitting,
            onTap: () => onSelect('false'),
          ),
        ),
      ],
    );
  }
}

class _FillBlankInput extends StatefulWidget {
  const _FillBlankInput({
    required this.selectedAnswer,
    required this.onSelect,
    required this.isSubmitting,
    required this.isWriting,
    this.placeholder = 'Type your answer here…',
    this.rows = 3,
  });

  final String? selectedAnswer;
  final ValueChanged<String> onSelect;
  final bool isSubmitting;
  final bool isWriting;
  final String placeholder;
  final int rows;

  @override
  State<_FillBlankInput> createState() => _FillBlankInputState();
}

class _FillBlankInputState extends State<_FillBlankInput> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.selectedAnswer ?? '');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.isWriting) ...[
          Text(
            'Your Response',
            style: AimTextStyles.label.copyWith(
              color: surfaces.textSecondary,
              fontWeight: AimFontWeights.semibold,
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
        ],
        Container(
          decoration: BoxDecoration(
            color: surfaces.surfaceSunken,
            borderRadius: AimRadius.borderMd,
            border: Border.all(color: surfaces.border),
          ),
          child: TextField(
            controller: _controller,
            enabled: !widget.isSubmitting,
            maxLines: widget.rows,
            minLines: widget.rows,
            onChanged: (val) {
              widget.onSelect(val);
              setState(() {});
            },
            style: AimTextStyles.bodyMd.copyWith(
              color: surfaces.textPrimary,
            ),
            decoration: InputDecoration(
              hintText: widget.placeholder,
              hintStyle: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textMuted,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(AimSpacing.cardPadding),
            ),
          ),
        ),
        if (widget.isWriting) ...[
          const SizedBox(height: AimSpacing.componentGap),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Target: 3-5 sentences',
                style: AimTextStyles.caption.copyWith(
                  color: surfaces.textMuted,
                ),
              ),
              Text(
                '${_controller.text.length} characters',
                style: AimTextStyles.caption.copyWith(
                  color: surfaces.textMuted,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

class _ListenButton extends ConsumerStatefulWidget {
  const _ListenButton({required this.questionId});

  final String questionId;

  @override
  ConsumerState<_ListenButton> createState() => _ListenButtonState();
}

class _ListenButtonState extends ConsumerState<_ListenButton> {
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
    _audioPlayer.dispose();
    super.dispose();
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
      final token = ref.read(authFlowProvider).accessToken ?? '';
      final bytes = await ref.read(placementRepositoryProvider).getQuestionAudio(
            token,
            questionId: widget.questionId,
          );
      if (bytes.isNotEmpty) {
        await _audioPlayer.play(BytesSource(Uint8List.fromList(bytes)));
        if (mounted) {
          setState(() {
            _isLoading = false;
            _isPlaying = true;
          });
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _isPlaying = false;
        _error = 'Failed to load question audio.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return GestureDetector(
      onTap: _isLoading ? null : _handleTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          vertical: AimSpacing.space24,
          horizontal: AimSpacing.cardPadding,
        ),
        decoration: BoxDecoration(
          color: surfaces.surfaceSunken,
          borderRadius: AimRadius.borderMd,
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: const BoxDecoration(
                color: AimColors.primary500,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: _isLoading
                    ? SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: surfaces.textOnPrimary,
                          strokeWidth: 2,
                        ),
                      )
                    : Icon(
                        _isPlaying ? Icons.stop : Icons.play_arrow,
                        color: surfaces.textOnPrimary,
                        size: AimSizes.iconLg + 8,
                      ),
              ),
            ),
            const SizedBox(height: AimSpacing.space16),
            Text(
              _isPlaying ? 'PLAYING...' : 'TAP TO LISTEN',
              style: AimTextStyles.caption.copyWith(
                fontWeight: AimFontWeights.semibold,
                color: AimColors.primary500,
                letterSpacing: 1.2,
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: AimSpacing.innerGap),
              Text(
                _error!,
                style: AimTextStyles.caption.copyWith(color: AimColors.error500),
              ),
            ],
            const SizedBox(height: AimSpacing.space16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: List.generate(
                30,
                (index) {
                  final heights = [10, 15, 25, 40, 20, 15, 30, 45, 25, 10, 15, 20, 35, 25, 10, 15, 20, 30, 45, 20, 15, 25, 35, 20, 10, 15, 25, 35, 20, 10];
                  final height = heights[index].toDouble();
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    width: 3,
                    height: _isPlaying ? height * 0.8 : height * 0.4,
                    decoration: BoxDecoration(
                      color: AimColors.primary500.withValues(alpha: _isPlaying ? 1.0 : 0.3),
                      borderRadius: AimRadius.borderXs,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
