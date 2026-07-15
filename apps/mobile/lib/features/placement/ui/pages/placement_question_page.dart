// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Placement question"
//   docs/design/ui-for-all-system-mobile/screenshots/light/21-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/21-screen.png
// Endpoints: GET /placement/questions?sectionId=, POST /placement/attempts/:id/answers
// Widgets: AIMTopAppBar, AIMProgressBar, AIMAnswerOption, AIMGradientButton,
//          AIMAlertBanner, AIMFullScreenLoading, AIMFullScreenError
//
// PlacementQuestionPage — student-facing placement question screen.
//
// Scope: Placement Test phase only.
//
// Security rules:
// - Flutter NEVER evaluates is_correct or computes any correctness signal.
// - correct_answer is NEVER in the question data — backend-only field.
// - The only student-supplied value sent to backend is answerValue.
// - No scoring, CEFR level, mastery, weakness map, or AIM Engine logic here.

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/placement_question_model.dart';
import '../../logic/provider/placement_provider.dart';
import '../../logic/provider/placement_question_notifier.dart';
import '../widgets/placement_countdown_timer.dart';
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

  /// Server-computed absolute expiry timestamp for the whole attempt
  /// (P4-052) — drives [PlacementCountdownTimer]. Null for legacy/untimed
  /// attempts (no countdown shown).
  final String? expiresAt;

  @override
  ConsumerState<PlacementQuestionPage> createState() =>
      _PlacementQuestionPageState();
}

class _PlacementQuestionPageState
    extends ConsumerState<PlacementQuestionPage> {
  String? _submitError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadQuestions());
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
    final state = ref.watch(placementQuestionProvider);

    ref.listen<PlacementQuestionState>(placementQuestionProvider, (_, next) {
      if (next is PlacementQuestionSectionComplete && context.mounted) {
        context.pop();
      }
    });

    final counter = switch (state) {
      PlacementQuestionReady() =>
        '${state.displayIndex} of ${state.totalQuestions}',
      _ => null,
    };

    return Scaffold(
      appBar: _PlacementQuestionHeader(
        title: widget.sectionTitle,
        counter: counter,
      ),
      body: SafeArea(
        child: Column(
          children: [
            if (widget.expiresAt != null)
              Padding(
                padding: const EdgeInsets.only(
                  top: AimSpacing.space8,
                  right: AimSpacing.screenPaddingMobile,
                ),
                child: Align(
                  alignment: AlignmentDirectional.centerEnd,
                  child: PlacementCountdownTimer(
                    expiresAt: widget.expiresAt!,
                    onExpired: _onTimerExpired,
                  ),
                ),
              ),
            Expanded(
              child: switch (state) {
                PlacementQuestionIdle() ||
                PlacementQuestionLoading() ||
                PlacementQuestionSectionComplete() =>
                  const AIMFullScreenLoading(semanticLabel: 'Loading question'),
                PlacementQuestionError(:final message) => AIMFullScreenError(
                    message: message,
                    onRetry: () {
                      setState(() => _submitError = null);
                      _loadQuestions();
                    },
                  ),
                PlacementQuestionReady() => _QuestionBody(
                    state: state,
                    submitError: _submitError,
                    onSelectAnswer: (answer) {
                      setState(() => _submitError = null);
                      ref
                          .read(placementQuestionProvider.notifier)
                          .selectAnswer(answer);
                    },
                    onSubmit: () => _submitAnswer(state),
                    onSubmitSpeaking: (bytes, mimeType) =>
                        _submitSpeakingAnswer(bytes, mimeType),
                  ),
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Server enforces attempt expiry independently (PlacementAttemptTimerService)
  /// — this only surfaces the state to the student and returns them to the
  /// section list, where the backend's own rejection/auto-submit takes over.
  void _onTimerExpired() {
    if (!mounted) return;
    setState(() => _submitError = 'Time is up — this attempt has been submitted.');
  }

  Future<void> _submitSpeakingAnswer(List<int> audioBytes, String mimeType) async {
    setState(() => _submitError = null);
    try {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      await ref.read(placementQuestionProvider.notifier).submitSpeakingAnswer(
            token,
            audioBytes: audioBytes,
            mimeType: mimeType,
          );
    } catch (e) {
      if (mounted) {
        setState(() {
          _submitError = e is Exception
              ? 'Failed to submit recording: ${e.toString().replaceFirst('Exception: ', '')}'
              : 'Failed to submit recording. Please try again.';
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
        setState(() {
          _submitError = e is Exception
              ? 'Failed to submit answer: ${e.toString().replaceFirst('Exception: ', '')}'
              : 'Failed to submit answer. Please try again.';
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Gradient header — title + real "N of totalQuestions" counter (design
// screen 21's top bar).
// ---------------------------------------------------------------------------

class _PlacementQuestionHeader extends StatelessWidget
    implements PreferredSizeWidget {
  const _PlacementQuestionHeader({required this.title, this.counter});

  final String title;
  final String? counter;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Text(
                title,
                style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (counter != null)
              Text(
                counter!,
                style: AimTextStyles.bodySm.copyWith(
                  color: AimColors.neutral0.withValues(alpha: 0.85),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Question body
// ---------------------------------------------------------------------------

class _QuestionBody extends StatelessWidget {
  const _QuestionBody({
    required this.state,
    required this.onSelectAnswer,
    required this.onSubmit,
    required this.onSubmitSpeaking,
    this.submitError,
  });

  final PlacementQuestionReady state;
  final ValueChanged<String> onSelectAnswer;
  final VoidCallback onSubmit;
  final void Function(List<int> audioBytes, String mimeType) onSubmitSpeaking;
  final String? submitError;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final question = state.currentQuestion;
    final isSpeaking = question.type == 'speaking';

    return Padding(
      padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Question counter now lives in the header's trailing area
          // (design screen 21) — see _PlacementQuestionHeader.
          AIMProgressBar(
            value: state.displayIndex.toDouble(),
            max: state.totalQuestions.toDouble(),
            size: AIMProgressBarSize.sm,
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            question.text,
            style: AimTextStyles.bodyLg.copyWith(color: surfaces.textPrimary),
          ),
          if (question.type == 'listening_choice') ...[
            const SizedBox(height: AimSpacing.componentGap),
            _ListenButton(questionId: question.id),
          ],
          const SizedBox(height: AimSpacing.sectionGap),
          Expanded(
            child: SingleChildScrollView(
              child: isSpeaking
                  ? PlacementSpeakingAnswerInput(
                      key: ValueKey(question.id),
                      prompt: question.text,
                      isSubmitting: state.isSubmitting,
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
            const SizedBox(height: AimSpacing.componentGap),
            AIMAlertBanner(
              tone: AIMAlertTone.error,
              child: Text(submitError!),
            ),
          ],
          // Speaking questions submit themselves once recording stops
          // (PlacementSpeakingAnswerInput) — no separate Next/Submit button.
          if (!isSpeaking) ...[
            const SizedBox(height: AimSpacing.componentGap),
            AIMGradientButton(
              label: state.isLastQuestion ? 'Submit Final Answer' : 'Next question',
              gradient: AimGradients.gzHero,
              fullWidth: true,
              loading: state.isSubmitting,
              enabled: state.canSubmit,
              semanticLabel:
                  state.isLastQuestion ? 'Submit final answer' : 'Next question',
              onPressed: state.canSubmit ? onSubmit : null,
            ),
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Answer input — switches on question type
// ---------------------------------------------------------------------------

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
          placeholder: questionType == 'writing'
              ? 'Write your response here…'
              : 'Type your answer here…',
          rows: questionType == 'writing' ? 8 : 3,
        ),
      _ => Text(
          'Unknown question type: $questionType',
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
        ),
    };
  }
}

// ---------------------------------------------------------------------------
// Multiple choice: A / B / C / D options
// ---------------------------------------------------------------------------

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
          AIMAnswerOption(
            optionKey: options[i],
            state: selectedAnswer == options[i]
                ? AIMAnswerOptionState.selected
                : AIMAnswerOptionState.defaultState,
            onTap: isSubmitting ? null : () => onSelect(options[i]),
            semanticLabel: hasOptionText
                ? 'Option ${options[i]}: ${questionOptions[i].text}'
                : 'Option ${options[i]}',
            child: Text(
              hasOptionText
                  ? '${options[i]}) ${questionOptions[i].text}'
                  : options[i],
            ),
          ),
          if (i < options.length - 1)
            const SizedBox(height: AimSpacing.componentGap),
        ],
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// True / False options
// ---------------------------------------------------------------------------

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
          child: AIMAnswerOption(
            state: selectedAnswer == 'true'
                ? AIMAnswerOptionState.selected
                : AIMAnswerOptionState.defaultState,
            onTap: isSubmitting ? null : () => onSelect('true'),
            semanticLabel: 'True',
            child: const Text('True'),
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: AIMAnswerOption(
            state: selectedAnswer == 'false'
                ? AIMAnswerOptionState.selected
                : AIMAnswerOptionState.defaultState,
            onTap: isSubmitting ? null : () => onSelect('false'),
            semanticLabel: 'False',
            child: const Text('False'),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Fill in the blank — text input
// ---------------------------------------------------------------------------

class _FillBlankInput extends StatefulWidget {
  const _FillBlankInput({
    required this.selectedAnswer,
    required this.onSelect,
    required this.isSubmitting,
    this.placeholder = 'Type your answer here…',
    this.rows = 3,
  });

  final String? selectedAnswer;
  final ValueChanged<String> onSelect;
  final bool isSubmitting;
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
    return AIMTextarea(
      controller: _controller,
      disabled: widget.isSubmitting,
      placeholder: widget.placeholder,
      rows: widget.rows,
      semanticLabel: 'Your answer',
      onChanged: widget.onSelect,
    );
  }
}

// ---------------------------------------------------------------------------
// Listen button — plays the backend-synthesized audio for a listening_choice
// question. Fetches fresh bytes on every tap (no client-side caching); the
// backend itself does not persist audio across requests today either.
// ---------------------------------------------------------------------------

class _ListenButton extends ConsumerWidget {
  const _ListenButton({required this.questionId});

  final String questionId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return QuestionAudioPlayButton(
      fetchAudioBytes: () async {
        final token = ref.read(authFlowProvider).accessToken ?? '';
        final bytes = await ref.read(placementRepositoryProvider).getQuestionAudio(
              token,
              questionId: questionId,
            );
        return Uint8List.fromList(bytes);
      },
    );
  }
}
