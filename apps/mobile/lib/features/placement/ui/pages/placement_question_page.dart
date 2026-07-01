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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/placement_question_model.dart';
import '../../logic/provider/placement_provider.dart';
import '../../logic/provider/placement_question_notifier.dart';

class PlacementQuestionPage extends ConsumerStatefulWidget {
  const PlacementQuestionPage({
    super.key,
    required this.sectionId,
    required this.attemptId,
    required this.sectionTitle,
    required this.sectionIndex,
    required this.totalSections,
  });

  final String sectionId;
  final String attemptId;
  final String sectionTitle;
  final int sectionIndex;
  final int totalSections;

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
        Navigator.of(context).pop();
      }
    });

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.sectionTitle),
      body: SafeArea(
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
              sectionIndex: widget.sectionIndex,
              totalSections: widget.totalSections,
              submitError: _submitError,
              onSelectAnswer: (answer) {
                setState(() => _submitError = null);
                ref
                    .read(placementQuestionProvider.notifier)
                    .selectAnswer(answer);
              },
              onSubmit: () => _submitAnswer(state),
            ),
        },
      ),
    );
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
// Question body
// ---------------------------------------------------------------------------

class _QuestionBody extends StatelessWidget {
  const _QuestionBody({
    required this.state,
    required this.sectionIndex,
    required this.totalSections,
    required this.onSelectAnswer,
    required this.onSubmit,
    this.submitError,
  });

  final PlacementQuestionReady state;
  final int sectionIndex;
  final int totalSections;
  final ValueChanged<String> onSelectAnswer;
  final VoidCallback onSubmit;
  final String? submitError;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final question = state.currentQuestion;

    return Padding(
      padding: const EdgeInsetsDirectional.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text(
                'Section $sectionIndex/$totalSections',
                style: AimTextStyles.label.copyWith(
                  color: surfaces.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                'Q ${state.displayIndex} of ${state.totalQuestions}',
                style: AimTextStyles.label.copyWith(
                  color: surfaces.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.innerGap),
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
          const SizedBox(height: AimSpacing.sectionGap),
          Expanded(
            child: SingleChildScrollView(
              child: _AnswerInput(
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
          const SizedBox(height: AimSpacing.componentGap),
          AIMGradientButton(
            label: state.isLastQuestion ? 'Submit Final Answer' : 'Next Question',
            gradient: AimGradients.gzHero,
            fullWidth: true,
            loading: state.isSubmitting,
            enabled: state.canSubmit,
            semanticLabel:
                state.isLastQuestion ? 'Submit final answer' : 'Next question',
            onPressed: state.canSubmit ? onSubmit : null,
          ),
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
      'fill_blank' => _FillBlankInput(
          selectedAnswer: selectedAnswer,
          onSelect: onSelect,
          isSubmitting: isSubmitting,
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
  });

  final String? selectedAnswer;
  final ValueChanged<String> onSelect;
  final bool isSubmitting;

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
      placeholder: 'Type your answer here…',
      rows: 3,
      semanticLabel: 'Your answer',
      onChanged: widget.onSelect,
    );
  }
}
