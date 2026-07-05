// AIM pipeline live wiring.
// PracticeSessionPage — real lesson question practice.
//
// Flow: POST /sessions/start -> GET /sessions/:id/questions?lessonId= ->
// step through the delivered questions via the existing QuestionPage, whose
// AnswerSubmitFlow submits each answer to POST /sessions/:id/attempt (the
// call that triggers the backend AIM analysis pipeline).
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER evaluates correctness or computes any AIM value.
// - lessonId is backend-supplied by the lessons feature; sessionId is
//   backend-issued; neither comes from user input.
// - A 403 (P20-010 course gating) is displayed as a locked message and never
//   bypassed or re-derived locally.
// - Bearer token from authFlowProvider; never stored here.
//
// RTL/Arabic rules:
// - Column/EdgeInsets.symmetric — RTL-safe; icons are direction-agnostic.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/practice_session_notifier.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import 'question_page.dart';

/// Runs a real learning session over the questions published for a lesson.
///
/// Expects route arguments: `{'lessonId': String, 'lessonTitle': String}`.
class PracticeSessionPage extends ConsumerStatefulWidget {
  const PracticeSessionPage({
    required this.lessonId,
    required this.lessonTitle,
    super.key,
  });

  /// Backend-supplied lesson UUID from the lesson detail screen.
  final String lessonId;

  /// Display title from the prior lesson model.
  final String lessonTitle;

  @override
  ConsumerState<PracticeSessionPage> createState() =>
      _PracticeSessionPageState();
}

class _PracticeSessionPageState extends ConsumerState<PracticeSessionPage> {
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

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(practiceSessionProvider);
    final l10n = AppLocalizations.of(context);

    switch (state.status) {
      case PracticeSessionStatus.idle:
      case PracticeSessionStatus.loading:
        return _shell(
          AIMFullScreenLoading(
            semanticLabel: l10n.practiceSessionLoadingSemantic,
          ),
        );
      case PracticeSessionStatus.locked:
        return _shell(
          AIMFullScreenError(
            message: l10n.lessonsCourseLockedMessage,
          ),
        );
      case PracticeSessionStatus.failed:
        return _shell(
          AIMFullScreenError(
            message: state.errorMessage ?? l10n.practiceSessionFailedMessage,
            onRetry: _start,
          ),
        );
      case PracticeSessionStatus.empty:
        return _shell(
          AIMEmptyState(
            icon: const Icon(Icons.quiz_outlined),
            title: l10n.practiceSessionEmptyTitle,
            subtitle: l10n.practiceSessionEmptySubtitle,
          ),
        );
      case PracticeSessionStatus.active:
        final question = state.currentQuestion!;
        // The existing QuestionPage renders the question and submits the
        // attempt via POST /sessions/:id/attempt; a fresh key per question
        // resets the per-question answer state.
        return QuestionPage(
          key: ValueKey(question.id),
          sessionId: state.sessionId!,
          questionId: question.id,
          initialQuestion: question,
          onNext: () =>
              ref.read(practiceSessionProvider.notifier).advance(),
        );
      case PracticeSessionStatus.finished:
        return _shell(
          _PracticeCompleteContent(
            questionCount: state.questions.length,
            completionSaved: state.completionSaved,
            onDone: () {
              if (context.canPop()) context.pop();
            },
            onRetrySave: () => ref
                .read(practiceSessionProvider.notifier)
                .retryPersistCompletion(),
          ),
        );
    }
  }

  Widget _shell(Widget body) {
    return Scaffold(
      appBar: AIMTopAppBar(
        title: widget.lessonTitle,
        onBack: () {
          if (context.canPop()) context.pop();
        },
      ),
      body: body,
    );
  }
}

class _PracticeCompleteContent extends StatelessWidget {
  const _PracticeCompleteContent({
    required this.questionCount,
    required this.completionSaved,
    required this.onDone,
    required this.onRetrySave,
  });

  final int questionCount;

  /// False when POST /lessons/:id/progress + /complete failed — the lesson
  /// looks finished here but the backend never recorded it, so the next
  /// lesson/course may still be locked.
  final bool completionSaved;
  final VoidCallback onDone;
  final VoidCallback onRetrySave;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Icon(
            completionSaved ? Icons.check_circle_outline : Icons.error_outline,
            size: 64,
            color: completionSaved ? AimColors.success500 : AimColors.warning500,
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Text(
            l10n.practiceSessionCompleteTitle,
            textAlign: TextAlign.center,
            style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            l10n.practiceSessionCompleteSubtitle(questionCount),
            textAlign: TextAlign.center,
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          ),
          if (!completionSaved) ...[
            const SizedBox(height: AimSpacing.space8),
            Text(
              l10n.practiceSessionCompletionNotSavedMessage,
              textAlign: TextAlign.center,
              style: AimTextStyles.bodySm.copyWith(color: AimColors.warning500),
            ),
          ],
          const SizedBox(height: AimSpacing.sectionGap),
          if (!completionSaved) ...[
            AIMButton(
              onPressed: onRetrySave,
              fullWidth: true,
              child: Text(l10n.practiceSessionRetrySaveButton),
            ),
            const SizedBox(height: AimSpacing.space8),
          ],
          AIMButton(
            onPressed: onDone,
            fullWidth: true,
            variant: completionSaved ? AIMButtonVariant.primary : AIMButtonVariant.secondary,
            child: Text(l10n.practiceSessionDoneButton),
          ),
        ],
      ),
    );
  }
}
