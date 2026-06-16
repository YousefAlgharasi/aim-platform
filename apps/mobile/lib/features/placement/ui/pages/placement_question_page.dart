// Phase 4 — P4-067
// PlacementQuestionPage — student-facing placement question screen.
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Load questions for the current section on mount.
//   2. Render the current question prompt and answer input:
//        - multiple_choice / listening_choice: option buttons (A, B, C, D)
//        - true_false: two buttons ("True", "False")
//        - fill_blank: text field
//   3. "Submit Answer" sends the answer to the backend.
//   4. After all questions in the section are answered, pops back to the
//      section page so it can advance to the next section or submit.
//
// Security rules:
// - Flutter NEVER evaluates is_correct or computes any correctness signal.
// - correct_answer is NEVER in the question data — backend-only field.
// - The only student-supplied value sent to backend is answerValue.
// - student_id is JWT-resolved server-side — never sent by Flutter.
// - No scoring, CEFR level, mastery, weakness map, or AIM Engine logic here.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_question_notifier.dart';

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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      ref.read(placementQuestionProvider.notifier).loadQuestions(
            token,
            sectionId: widget.sectionId,
            attemptId: widget.attemptId,
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementQuestionProvider);

    // When section is complete, pop back so the section page can advance.
    ref.listen<PlacementQuestionState>(placementQuestionProvider, (_, next) {
      if (next is PlacementQuestionSectionComplete && context.mounted) {
        Navigator.of(context).pop();
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.sectionTitle),
        automaticallyImplyLeading: false,
      ),
      body: switch (state) {
        PlacementQuestionIdle() ||
        PlacementQuestionLoading() =>
          const Center(child: CircularProgressIndicator()),
        PlacementQuestionError(:final message) => _ErrorBody(
            message: message,
            onRetry: () {
              setState(() => _submitError = null);
              final token = ref.read(authFlowProvider).accessToken ?? '';
              ref.read(placementQuestionProvider.notifier).loadQuestions(
                    token,
                    sectionId: widget.sectionId,
                    attemptId: widget.attemptId,
                  );
            },
          ),
        PlacementQuestionSectionComplete() =>
          const Center(child: CircularProgressIndicator()),
        PlacementQuestionReady() => _QuestionBody(
            state: state as PlacementQuestionReady,
            sectionIndex: widget.sectionIndex,
            totalSections: widget.totalSections,
            submitError: _submitError,
            onSelectAnswer: (answer) {
              setState(() => _submitError = null);
              ref
                  .read(placementQuestionProvider.notifier)
                  .selectAnswer(answer);
            },
            onSubmit: () => _submitAnswer(state as PlacementQuestionReady),
          ),
      },
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
        setState(() => _submitError = 'Failed to submit answer. Please try again.');
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
    final theme = Theme.of(context);
    final question = state.currentQuestion;

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header: section progress + question progress
          Row(
            children: [
              Text(
                'Section $sectionIndex/$totalSections',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
              const Spacer(),
              Text(
                'Q ${state.displayIndex} of ${state.totalQuestions}',
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Question progress bar
          LinearProgressIndicator(
            value: state.totalQuestions > 0
                ? state.displayIndex / state.totalQuestions
                : 0,
            backgroundColor:
                theme.colorScheme.onSurface.withOpacity(0.12),
            minHeight: 4,
            borderRadius: BorderRadius.circular(2),
          ),
          const SizedBox(height: 28),

          // Question prompt
          Text(
            question.prompt,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w500,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),

          // Answer input — type-specific
          Expanded(
            child: SingleChildScrollView(
              child: _AnswerInput(
                questionType: question.questionType,
                selectedAnswer: state.selectedAnswer,
                onSelect: onSelectAnswer,
                isSubmitting: state.isSubmitting,
              ),
            ),
          ),

          // Submit error
          if (submitError != null) ...[
            const SizedBox(height: 8),
            Text(
              submitError!,
              style: theme.textTheme.bodySmall?.copyWith(color: Colors.red),
              textAlign: TextAlign.center,
            ),
          ],

          const SizedBox(height: 16),

          // Submit button
          FilledButton(
            onPressed: state.canSubmit ? onSubmit : null,
            child: state.isSubmitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    state.isLastQuestion ? 'Submit Final Answer' : 'Next Question',
                    style: const TextStyle(fontSize: 16),
                  ),
          ),
          const SizedBox(height: 16),
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
    required this.selectedAnswer,
    required this.onSelect,
    required this.isSubmitting,
  });

  final String questionType;
  final String? selectedAnswer;
  final ValueChanged<String> onSelect;
  final bool isSubmitting;

  @override
  Widget build(BuildContext context) {
    return switch (questionType) {
      'multiple_choice' || 'listening_choice' => _MultipleChoiceInput(
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
      _ => Text('Unknown question type: $questionType'),
    };
  }
}

// ---------------------------------------------------------------------------
// Multiple choice: A / B / C / D buttons
// ---------------------------------------------------------------------------

class _MultipleChoiceInput extends StatelessWidget {
  const _MultipleChoiceInput({
    required this.selectedAnswer,
    required this.onSelect,
    required this.isSubmitting,
  });

  final String? selectedAnswer;
  final ValueChanged<String> onSelect;
  final bool isSubmitting;

  static const _options = ['A', 'B', 'C', 'D'];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: _options
          .map((option) => Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: _OptionButton(
                  label: option,
                  isSelected: selectedAnswer == option,
                  onTap: isSubmitting ? null : () => onSelect(option),
                ),
              ))
          .toList(),
    );
  }
}

class _OptionButton extends StatelessWidget {
  const _OptionButton({
    required this.label,
    required this.isSelected,
    this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = theme.colorScheme.primary;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected
              ? color.withOpacity(0.12)
              : theme.colorScheme.surface,
          border: Border.all(
            color: isSelected ? color : theme.colorScheme.outline,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isSelected ? color : Colors.transparent,
                border: Border.all(
                  color: isSelected ? color : theme.colorScheme.outline,
                ),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : null,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// True / False buttons
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
          child: _TrueFalseButton(
            label: 'True',
            value: 'true',
            isSelected: selectedAnswer == 'true',
            onTap: isSubmitting ? null : () => onSelect('true'),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _TrueFalseButton(
            label: 'False',
            value: 'false',
            isSelected: selectedAnswer == 'false',
            onTap: isSubmitting ? null : () => onSelect('false'),
          ),
        ),
      ],
    );
  }
}

class _TrueFalseButton extends StatelessWidget {
  const _TrueFalseButton({
    required this.label,
    required this.value,
    required this.isSelected,
    this.onTap,
  });

  final String label;
  final String value;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = value == 'true'
        ? const Color(0xFF27AE60)
        : const Color(0xFFE74C3C);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.12) : Colors.transparent,
          border: Border.all(
            color: isSelected ? color : theme.colorScheme.outline,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? color : null,
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Fill in the blank — text field
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
    _controller.addListener(() {
      widget.onSelect(_controller.text);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      enabled: !widget.isSubmitting,
      decoration: const InputDecoration(
        hintText: 'Type your answer here…',
        border: OutlineInputBorder(),
      ),
      maxLines: 3,
      textCapitalization: TextCapitalization.sentences,
    );
  }
}

// ---------------------------------------------------------------------------
// Error body
// ---------------------------------------------------------------------------

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}
