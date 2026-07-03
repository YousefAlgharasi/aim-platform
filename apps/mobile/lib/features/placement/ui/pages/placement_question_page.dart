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
import 'package:go_router/go_router.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/placement_question_model.dart';
import '../../logic/provider/placement_provider.dart';
import '../../logic/provider/placement_question_notifier.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

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
        context.pop();
      }
    });

    final loc = AppLocalizations.of(context);
    final counter = switch (state) {
      PlacementQuestionReady() =>
        loc.placementQuestionCounter(state.displayIndex, state.totalQuestions),
      _ => null,
    };

    return Scaffold(
      appBar: _PlacementQuestionHeader(
        title: widget.sectionTitle,
        counter: counter,
      ),
      body: SafeArea(
        child: switch (state) {
          PlacementQuestionIdle() ||
          PlacementQuestionLoading() ||
          PlacementQuestionSectionComplete() =>
            AIMFullScreenLoading(semanticLabel: loc.placementLoadingQuestionSemantic),
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
        final loc = AppLocalizations.of(context);
        setState(() {
          _submitError = e is Exception
              ? loc.placementSubmitAnswerFailedWithReason(
                  e.toString().replaceFirst('Exception: ', ''),
                )
              : loc.placementSubmitAnswerFailedGeneric;
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
              label: AppLocalizations.of(context).commonBack,
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
    this.submitError,
  });

  final PlacementQuestionReady state;
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
            label: state.isLastQuestion
                ? AppLocalizations.of(context).placementSubmitFinalAnswerButton
                : AppLocalizations.of(context).placementNextQuestionButton,
            gradient: AimGradients.gzHero,
            fullWidth: true,
            loading: state.isSubmitting,
            enabled: state.canSubmit,
            semanticLabel: state.isLastQuestion
                ? AppLocalizations.of(context).placementSubmitFinalAnswerSemantic
                : AppLocalizations.of(context).placementNextQuestionSemantic,
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
          AppLocalizations.of(context).placementUnknownQuestionType(questionType),
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
    final loc = AppLocalizations.of(context);
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
                ? loc.placementOptionWithTextSemantic(
                    options[i], questionOptions[i].text)
                : loc.placementOptionSemantic(options[i]),
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
    final loc = AppLocalizations.of(context);
    return Row(
      children: [
        Expanded(
          child: AIMAnswerOption(
            state: selectedAnswer == 'true'
                ? AIMAnswerOptionState.selected
                : AIMAnswerOptionState.defaultState,
            onTap: isSubmitting ? null : () => onSelect('true'),
            semanticLabel: loc.placementTrueOption,
            child: Text(loc.placementTrueOption),
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: AIMAnswerOption(
            state: selectedAnswer == 'false'
                ? AIMAnswerOptionState.selected
                : AIMAnswerOptionState.defaultState,
            onTap: isSubmitting ? null : () => onSelect('false'),
            semanticLabel: loc.placementFalseOption,
            child: Text(loc.placementFalseOption),
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
    final loc = AppLocalizations.of(context);
    return AIMTextarea(
      controller: _controller,
      disabled: widget.isSubmitting,
      placeholder: loc.placementAnswerPlaceholder,
      rows: 3,
      semanticLabel: loc.placementYourAnswerSemantic,
      onChanged: widget.onSelect,
    );
  }
}
