// Phase 6 — P6-089
// QuestionPage — Student question/answer screen MVP.
//
// Accepts [sessionId] and [questionId] as route arguments (both
// backend-supplied). Loads the question, collects the student's answer,
// and submits it to the backend.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER evaluates correctness locally.
// - Flutter NEVER calls the AIM Engine or any AI provider.
// - selectedOptionId / writtenAnswer are submitted verbatim to the backend.
// - attemptResult (backend acknowledgement) contains no is_correct field.
// - All AIM-owned values are shown only via backend-approved APIs (separate
//   session state endpoint, out of scope here).
// - sessionId and questionId must be backend-supplied; never from user input.
// - Bearer token from authFlowProvider; never stored in this widget.
//
// RTL/Arabic rules:
// - Row/Column/CrossAxisAlignment: direction-aware.
// - AIMTopAppBar handles RTL icon mirroring.
// - EdgeInsets.symmetric — safe for RTL.
// - AIMAnswerOption uses leading-edge text alignment internally.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/question_session_state.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_provider.dart';
import '../widgets/question_answer_widgets.dart';

/// Student question/answer screen.
///
/// Route arguments must be passed as [QuestionPageArgs].
class QuestionPage extends ConsumerStatefulWidget {
  const QuestionPage({
    required this.sessionId,
    required this.questionId,
    super.key,
  });

  /// Backend-issued session UUID from POST /sessions/start.
  final String sessionId;

  /// Backend-issued question UUID from lesson/session data.
  final String questionId;

  @override
  ConsumerState<QuestionPage> createState() => _QuestionPageState();
}

class _QuestionPageState extends ConsumerState<QuestionPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadQuestion());
  }

  void _loadQuestion() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(questionAnswerSessionProvider.notifier).loadQuestion(
          bearerToken: token,
          questionId: widget.questionId,
          itemShownAt: DateTime.now().toUtc().toIso8601String(),
        );
  }

  Future<void> _submit() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(questionAnswerSessionProvider.notifier).submitAnswer(
          bearerToken: token,
          sessionId: widget.sessionId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(questionAnswerSessionProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: 'Question'),
      body: _buildBody(state),
      bottomNavigationBar: _buildSubmitBar(state),
    );
  }

  Widget _buildBody(QuestionSessionState state) {
    if (state.isLoadingQuestion) {
      return const AIMFullScreenLoading(semanticLabel: 'Loading question');
    }

    if (state.questionError != null) {
      return AIMFullScreenError(
        message: state.questionError!,
        onRetry: _loadQuestion,
      );
    }

    if (!state.hasQuestion) {
      return const AIMFullScreenLoading(semanticLabel: 'Loading question');
    }

    final question = state.question!;
    final isOptionBased = question.type == 'multiple_choice' ||
        question.type == 'true_false' ||
        question.type == 'multiple_select' ||
        question.type == 'listening_choice';

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      children: [
        QuestionStemCard(question: question),
        const SizedBox(height: AimSpacing.sectionGap),
        if (state.isSubmitted && state.attemptResult != null)
          AttemptAcknowledgementCard(result: state.attemptResult!)
        else if (isOptionBased)
          QuestionOptionsList(
            options: question.options,
            selectedOptionId: state.selectedOptionId,
            onOptionTapped: (id) =>
                ref.read(questionAnswerSessionProvider.notifier).selectOption(id),
            disabled: state.isSubmitting,
          )
        else
          QuestionFillBlankInput(
            disabled: state.isSubmitting || state.isSubmitted,
            onChanged: (v) => ref
                .read(questionAnswerSessionProvider.notifier)
                .updateWrittenAnswer(v),
          ),
        if (state.submitError != null) ...[
          const SizedBox(height: AimSpacing.componentGap),
          AIMAlertBanner(
            tone: AIMAlertTone.error,
            child: Text(state.submitError!),
          ),
        ],
      ],
    );
  }

  Widget? _buildSubmitBar(QuestionSessionState state) {
    if (!state.hasQuestion || state.isSubmitted) return null;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.space16,
        ),
        child: AIMButton(
          loading: state.isSubmitting,
          onPressed: state.canSubmit ? _submit : null,
          child: const Text('Submit Answer'),
        ),
      ),
    );
  }
}
