// Phase 6 — P6-090
// AnswerSubmitFlow — self-contained widget encapsulating the full answer
// submit interaction: submit button → loading → acknowledgement / error.
//
// This widget is the canonical entry point for triggering
// QuestionAnswerNotifier.submitAnswer from the UI. QuestionPage and any
// future lesson screen that embeds a question can use this instead of
// hand-rolling the submit interaction each time.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER evaluates correctness. The submit call sends answerValue
//   verbatim to the backend; the backend is the sole authority.
// - AttemptAcknowledgementCard is shown after submission — it carries no
//   is_correct field.
// - sessionId must be a backend-issued UUID; never constructed by Flutter.
// - Bearer token sourced externally via the caller; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric — RTL-safe.
// - AIMButton stretches full-width — direction-agnostic.
// - AIMAlertBanner respects ambient directionality.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/question_session_state.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_provider.dart';
import 'attempt_acknowledgement_card.dart';

/// Encapsulates the answer submit interaction for [QuestionPage] and any
/// lesson screen that renders a question.
///
/// Callers supply [sessionId] (backend-issued) and [bearerToken]. The widget
/// reads [questionAnswerSessionProvider] to derive its state and calls
/// [QuestionAnswerNotifier.submitAnswer] on tap.
class AnswerSubmitFlow extends ConsumerWidget {
  const AnswerSubmitFlow({
    required this.sessionId,
    required this.bearerToken,
    super.key,
  });

  /// Backend-issued session UUID from POST /sessions/start.
  final String sessionId;

  /// JWT bearer token from authFlowProvider — sourced by caller.
  final String bearerToken;

  Future<void> _submit(WidgetRef ref) async {
    await ref.read(questionAnswerSessionProvider.notifier).submitAnswer(
          bearerToken: bearerToken,
          sessionId: sessionId,
        );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(questionAnswerSessionProvider);
    return _AnswerSubmitFlowContent(
      state: state,
      onSubmit: () => _submit(ref),
    );
  }
}

class _AnswerSubmitFlowContent extends StatelessWidget {
  const _AnswerSubmitFlowContent({
    required this.state,
    required this.onSubmit,
  });

  final QuestionSessionState state;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    if (state.isSubmitted && state.attemptResult != null) {
      return AttemptAcknowledgementCard(result: state.attemptResult!);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (state.submitError != null) ...[
          AIMAlertBanner(
            tone: AIMAlertTone.error,
            child: Text(state.submitError!),
          ),
          const SizedBox(height: AimSpacing.componentGap),
        ],
        AIMButton(
          loading: state.isSubmitting,
          onPressed: state.canSubmit ? onSubmit : null,
          child: const Text('Submit Answer'),
        ),
      ],
    );
  }
}
