// Phase 6 — P6-089 / P6-090
// QuestionPage — Student question/answer screen MVP.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Question page"
//   docs/design/ui-for-all-system-mobile/screenshots/light/32-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/32-screen.png
//   NOTE: the screenshots depict the multiple-choice branch of this screen
//   (gradient "Practice" header, small-caps topic label, lettered options).
//   There is no design reference for the fill-in-the-blank branch; that
//   branch keeps its existing plain-input treatment (see
//   question_fill_blank_input.dart) — only the shared chrome (header, topic
//   label) is restyled to match the screenshot here.
// Endpoints: POST /sessions/start, POST /sessions/:id/attempt
//
// Accepts [sessionId] and [questionId] as route arguments (both
// backend-supplied). Loads the question, collects the student's answer,
// and delegates submission to [AnswerSubmitFlow] (P6-090).
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER evaluates correctness locally.
// - Flutter NEVER calls the AIM Engine or any AI provider.
// - selectedOptionId / writtenAnswer submitted verbatim via notifier.
// - attemptResult (backend ack) contains no is_correct field.
// - sessionId and questionId must be backend-supplied; never user input.
// - Bearer token from authFlowProvider; never stored in this widget.
// - question.tags is backend-supplied; the topic label below only reformats
//   underscores/hyphens into spaced title case for display — it never
//   invents or alters the underlying tag content.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric / EdgeInsetsDirectional — RTL-safe.
// - Gradient header back button uses AlignmentDirectional + mirrored icon,
//   matching register_page.dart's pattern.
// - AIMAnswerOption uses leading-edge text alignment internally.
// - Column/CrossAxisAlignment: direction-aware.

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/core/widgets/audio/question_audio_play_button.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/question_session_state.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../widgets/question_answer_widgets.dart';

class QuestionPage extends ConsumerStatefulWidget {
  const QuestionPage({
    required this.sessionId,
    required this.questionId,
    this.initialQuestion,
    this.onNext,
    super.key,
  });

  /// Backend-issued session UUID from POST /sessions/start.
  final String sessionId;

  /// Backend-issued question UUID from lesson/session data.
  final String questionId;

  /// Optional backend-delivered question (from
  /// GET /sessions/:id/questions?lessonId=). When provided, the page presents
  /// it directly instead of fetching by id — the delivered payload is the
  /// same student-safe shape (no correctness data).
  final QuestionModel? initialQuestion;

  /// Optional callback shown as a "Next" action after the backend
  /// acknowledges the attempt — used by the practice session flow to advance
  /// to the next delivered question.
  final VoidCallback? onNext;

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
    final initial = widget.initialQuestion;
    if (initial != null) {
      ref.read(questionAnswerSessionProvider.notifier).presentQuestion(
            question: initial,
            itemShownAt: DateTime.now().toUtc().toIso8601String(),
          );
      return;
    }
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(questionAnswerSessionProvider.notifier).loadQuestion(
          bearerToken: token,
          questionId: widget.questionId,
          itemShownAt: DateTime.now().toUtc().toIso8601String(),
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(questionAnswerSessionProvider);
    final token = ref.watch(authFlowProvider).accessToken ?? '';

    return Scaffold(
      appBar: const _PracticeHeader(),
      body: _buildBody(state),
      bottomNavigationBar: state.hasQuestion
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.screenPaddingMobile,
                  vertical: AimSpacing.space16,
                ),
                child: state.isSubmitted
                    ? (widget.onNext != null
                        ? AIMButton(
                            onPressed: widget.onNext,
                            fullWidth: true,
                            child: Text(
                              AppLocalizations.of(context)
                                  .practiceNextQuestionButton,
                            ),
                          )
                        : const SizedBox.shrink())
                    : AnswerSubmitFlow(
                        sessionId: widget.sessionId,
                        bearerToken: token,
                      ),
              ),
            )
          : null,
    );
  }

  /// Backend-supplied tag slugs (e.g. "present_perfect") are display-only
  /// reformatted into spaced title case (e.g. "Present Perfect"). This never
  /// invents content — it only reformats what the backend already sent.
  String _prettifyTag(String tag) {
    return tag
        .split(RegExp('[_-]'))
        .where((word) => word.isNotEmpty)
        .map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase())
        .join(' ');
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
    final surfaces = aimSurfacesOf(context);
    final topicLabel =
        question.tags.isNotEmpty ? _prettifyTag(question.tags.first) : null;

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      children: [
        if (topicLabel != null) ...[
          Text(
            topicLabel.toUpperCase(),
            style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
          ),
          const SizedBox(height: AimSpacing.space8),
        ],
        QuestionStemCard(question: question),
        if (question.type == 'listening_choice') ...[
          const SizedBox(height: AimSpacing.componentGap),
          _QuestionListenButton(questionId: question.id),
        ],
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
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Listen button — plays backend-synthesized audio for a listening_choice
// practice question. Fetches fresh bytes on every tap, same pattern as
// PlacementQuestionPage's _ListenButton.
// ---------------------------------------------------------------------------

class _QuestionListenButton extends ConsumerWidget {
  const _QuestionListenButton({required this.questionId});

  final String questionId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return QuestionAudioPlayButton(
      fetchAudioBytes: () async {
        final token = ref.read(authFlowProvider).accessToken ?? '';
        final bytes = await ref.read(questionAnswerRepositoryProvider).getQuestionAudio(
              bearerToken: token,
              questionId: questionId,
            );
        return Uint8List.fromList(bytes);
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Gradient header — static "Practice" title (design screen 32's top bar).
// ---------------------------------------------------------------------------

class _PracticeHeader extends StatelessWidget implements PreferredSizeWidget {
  const _PracticeHeader();

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
            Text(
              'Practice',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
