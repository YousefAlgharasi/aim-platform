// Phase 8 — P8-085 / P8-086 / P8-087 / P8-088 / P8-090 / P8-091 / P8-092
// Phase 8 — P8-085 / P8-086 / P8-087 / P8-088 / P8-089
// AiTeacherChatPage — main text chat screen for the AI Teacher feature.
//
// Provides the chat screen layout: top bar, message history list,
// loading/empty/error states, and a send row wired to
// [aiTeacherChatProvider] (P8-083). Messages render via the dedicated
// [AiChatMessageBubble] (P8-086). The input row is the dedicated
// [AiChatInputBar] (P8-087). While a reply is being generated, the
// dedicated [AiTypingIndicator] (P8-088) is appended to the message list.
// [AiLessonContextHeader] (P8-090) shows safe, caller-provided lesson
// context when available.
// [AiChatErrorState] (P8-089) renders safe retryable errors without exposing
// backend/provider internals.
//
// Security rules:
// - studentId is never supplied by this screen; the backend always resolves
//   it from the verified JWT (see chat-session-start.controller.ts).
// - This screen never calls an AI provider directly and never computes
//   mastery/level/weakness/difficulty/recommendation/review-schedule values
//   (docs/phase-8/no-aim-replacement-rule.md). It only renders backend
//   responses returned via [AiTeacherChatNotifier].
// - Bearer token is read from authFlowProvider on demand; never stored here.
// - Lesson context labels are display-only, caller-provided values from
//   backend-approved navigation/context sources. This screen never derives
//   learning state from contextRef.
//
// RTL/Arabic rules:
// - The gradient header's back button uses Directionality-aware chevron
//   icons (mirrored the same way AIMTopAppBar mirrors internally).
// - Message bubbles (AiChatMessageBubble) align to the student/ai_teacher
//   side using direction-aware MainAxisAlignment.end/start.
// - The send button is a trailing element in a Row, so it mirrors under RTL
//   automatically; no hard-coded TextDirection or Alignment.
//
// The history icon in the header opens [AiTeacherSessionHistoryPage] (a
// fully-built screen that was previously unreachable from anywhere in the
// app). It is pushed directly (no named route) since no route is declared
// for it in AppRoutePaths.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_chat_state.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import '../widgets/ai_teacher_widgets.dart';

/// Main AI Teacher text chat screen.
///
/// [contextRef] identifies what the chat is about (e.g. a lesson) and is
/// forwarded to the backend when starting a new session. If [sessionId] is
/// provided, the screen loads that session's history instead of starting a
/// new one.
class AiTeacherChatPage extends ConsumerStatefulWidget {
  const AiTeacherChatPage({
    required this.contextRef,
    this.sessionId,
    this.lessonTitle,
    this.contextLabel,
    super.key,
  });

  final String contextRef;
  final String? sessionId;
  final String? lessonTitle;
  final String? contextLabel;

  @override
  ConsumerState<AiTeacherChatPage> createState() => _AiTeacherChatPageState();
}

class _AiTeacherChatPageState extends ConsumerState<AiTeacherChatPage> {
  final _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _init());
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  String? get _token => ref.read(authFlowProvider).accessToken;

  Future<void> _init() async {
    final token = _token;
    if (token == null || token.isEmpty) return;

    final notifier = ref.read(aiTeacherChatProvider.notifier);
    // Prefer a session this widget already resolved (e.g. via a prior
    // successful startSession earlier in this widget's lifetime, or a
    // retry after a transient error) over widget.sessionId alone — a
    // fresh-open ("start a new session") page never carries a
    // widget.sessionId, so without this, retrying after any failure would
    // start an unrelated brand-new session and the just-sent conversation
    // would appear to vanish.
    final existingSessionId = widget.sessionId ?? _activeSessionId();

    if (existingSessionId != null && existingSessionId.isNotEmpty) {
      await notifier.loadHistory(
        bearerToken: token,
        sessionId: existingSessionId,
      );
      await _loadSafetyStatus(existingSessionId);
      return;
    }

    await notifier.startSession(
      bearerToken: token,
      contextRef: widget.contextRef,
    );

    final state = ref.read(aiTeacherChatProvider);
    if (state is AppAsyncSuccess<AiTeacherChatState>) {
      final session = state.data.activeSession;
      if (session != null) {
        await notifier.loadHistory(
          bearerToken: token,
          sessionId: session.sessionId,
        );
        await _loadSafetyStatus(session.sessionId);
      }
    }
  }

  String? _activeSessionId() {
    final state = ref.read(aiTeacherChatProvider);
    if (state is AppAsyncSuccess<AiTeacherChatState>) {
      return state.data.history?.sessionId ?? state.data.activeSession?.sessionId;
    }
    return null;
  }

  Future<void> _loadSafetyStatus(String sessionId) async {
    final token = _token;
    if (token == null || token.isEmpty) return;
    await ref.read(aiTeacherChatProvider.notifier).loadSafetyStatus(
          bearerToken: token,
          sessionId: sessionId,
        );
  }

  Future<void> _sendMessage() async {
    final token = _token;
    final text = _messageController.text.trim();
    if (token == null || token.isEmpty || text.isEmpty) return;

    final state = ref.read(aiTeacherChatProvider);
    if (state is! AppAsyncSuccess<AiTeacherChatState>) return;

    final sessionId =
        state.data.history?.sessionId ?? state.data.activeSession?.sessionId;
    if (sessionId == null) return;

    final notifier = ref.read(aiTeacherChatProvider.notifier);
    _messageController.clear();

    await notifier.streamMessage(
      bearerToken: token,
      sessionId: sessionId,
      message: text,
    );

    await _loadSafetyStatus(sessionId);
  }

  Future<void> _onSelectPrompt(String prompt) async {
    _messageController.text = prompt;
    await _sendMessage();
  }

  Future<void> _onFeedback(String messageId, String rating) async {
    final token = _token;
    if (token == null || token.isEmpty) return;

    await ref.read(aiTeacherChatProvider.notifier).submitFeedback(
          bearerToken: token,
          messageId: messageId,
          rating: rating,
        );
  }

  void _openHistory() {
    context.push(AppRoutePaths.aiTeacherHistory);
  }

  void _openSettings() {
    context.push(AppRoutePaths.aiTeacherSettings);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aiTeacherChatProvider);

    return Scaffold(
      appBar: _AiTeacherChatHeader(
        onOpenHistory: _openHistory,
        onOpenSettings: _openSettings,
      ),
      body: SafeArea(
        child: switch (state) {
          AppAsyncLoading() => const AIMFullScreenLoading(
              semanticLabel: 'Loading AI Teacher chat',
            ),
          AppAsyncIdle() => const AIMFullScreenLoading(
              semanticLabel: 'Loading AI Teacher chat',
            ),
          AppAsyncFailure() => AiChatErrorState(
              onRetry: _init,
            ),
          AppAsyncSuccess(:final data) => _ChatContent(
              chatState: data,
              messageController: _messageController,
              onSend: _sendMessage,
              onSelectPrompt: _onSelectPrompt,
              onFeedback: _onFeedback,
              lessonTitle: widget.lessonTitle,
              contextLabel: widget.contextLabel,
            ),
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Content widget
// ---------------------------------------------------------------------------

class _ChatContent extends StatelessWidget {
  const _ChatContent({
    required this.chatState,
    required this.messageController,
    required this.onSend,
    required this.onSelectPrompt,
    required this.onFeedback,
    this.lessonTitle,
    this.contextLabel,
  });

  final AiTeacherChatState chatState;
  final TextEditingController messageController;
  final Future<void> Function() onSend;
  final Future<void> Function(String) onSelectPrompt;
  final Future<void> Function(String messageId, String rating) onFeedback;
  final String? lessonTitle;
  final String? contextLabel;

  @override
  Widget build(BuildContext context) {
    final messages = chatState.history?.messages ?? const [];
    final isSending = chatState.isSending;
    final itemCount = messages.length + (isSending ? 1 : 0);
    final safeLessonTitle = lessonTitle?.trim();
    final showLessonHeader =
        safeLessonTitle != null && safeLessonTitle.isNotEmpty;

    // P21-020: focusRecap/lastSessionRecap are ephemeral fields on the
    // session/history response, never persisted ai_chat_messages rows —
    // rendered as distinct callouts here, never as chat bubbles.
    final focusRecap = chatState.history?.focusRecap;
    final lastSessionRecap = chatState.activeSession?.lastSessionRecap;

    final streamingText = chatState.isStreaming ? chatState.streamingText ?? '' : null;
    final streamItemCount = itemCount + (streamingText != null ? 1 : 0);
    final isEmpty = messages.isEmpty && !isSending && streamingText == null;
    // The quick-action prompt row stays visible above the input bar for the
    // whole conversation (not just the empty state), matching the design.
    // It is only hidden while a reply is actively being sent/streamed.
    final showPromptsRow = !isSending && streamingText == null;

    return Column(
      children: [
        if (chatState.isSafetyLimited)
          const Padding(
            padding: EdgeInsetsDirectional.fromSTEB(
              AimSpacing.screenPaddingMobile,
              AimSpacing.sectionGap,
              AimSpacing.screenPaddingMobile,
              0,
            ),
            child: AiSafetyBlockBanner(),
          ),
        if (showLessonHeader)
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AimSpacing.screenPaddingMobile,
              AimSpacing.sectionGap,
              AimSpacing.screenPaddingMobile,
              0,
            ),
            child: AiLessonContextHeader(
              lessonTitle: safeLessonTitle,
              contextLabel: contextLabel,
            ),
          ),
        if (focusRecap != null && focusRecap.isNotEmpty)
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AimSpacing.screenPaddingMobile,
              AimSpacing.sectionGap,
              AimSpacing.screenPaddingMobile,
              0,
            ),
            child: AiFocusRecapCallout(focusRecap: focusRecap),
          ),
        if (lastSessionRecap != null && lastSessionRecap.isNotEmpty)
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AimSpacing.screenPaddingMobile,
              AimSpacing.sectionGap,
              AimSpacing.screenPaddingMobile,
              0,
            ),
            child: AiWelcomeBackCard(lastSessionRecap: lastSessionRecap),
          ),
        Expanded(
          child: isEmpty
              ? const AIMEmptyState(
                  icon: Icon(Icons.chat_bubble_outline_rounded),
                  title: 'Ask AI Teacher anything',
                  subtitle: 'Start the conversation by sending a message.',
                )
              : ListView.separated(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AimSpacing.screenPaddingMobile,
                    vertical: AimSpacing.sectionGap,
                  ),
                  itemCount: streamItemCount,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AimSpacing.innerGap),
                  itemBuilder: (context, index) {
                    if (index >= messages.length + (isSending ? 1 : 0)) {
                      return AiStreamingMessageBubble(text: streamingText!);
                    }
                    if (index >= messages.length) {
                      return const AiTypingIndicator();
                    }
                    return AiChatMessageBubble(
                      message: messages[index],
                      onFeedback: onFeedback,
                    );
                  },
                ),
        ),
        if (showPromptsRow) ...[
          AiSuggestedPromptsRow(
            disabled: isSending,
            onSelect: (prompt) => onSelectPrompt(prompt),
          ),
          const SizedBox(height: AimSpacing.innerGap),
        ],
        AiChatInputBar(
          controller: messageController,
          isSending: chatState.isSending || chatState.isStreaming,
          onSend: onSend,
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

/// Gradient header for the AI Teacher chat screen.
///
/// Mirrors the gradient-hero-header pattern used elsewhere (e.g.
/// register_page.dart's back button styling), with an added small circular
/// AI-avatar icon (plus a green "online" dot, since the AI is always
/// available — unlike a human presence indicator, this is not a fabricated
/// claim) and a history action that opens [AiTeacherSessionHistoryPage].
class _AiTeacherChatHeader extends StatelessWidget
    implements PreferredSizeWidget {
  const _AiTeacherChatHeader({
    required this.onOpenHistory,
    required this.onOpenSettings,
  });

  final VoidCallback onOpenHistory;
  final VoidCallback onOpenSettings;

  @override
  Size get preferredSize => const Size.fromHeight(88);

  @override
  Widget build(BuildContext context) {
    final direction = Directionality.of(context);

    return Container(
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.space8,
        AimSpacing.space8,
        AimSpacing.space8,
        AimSpacing.space12,
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
                onTap: () => context.pop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      direction == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space8),
            Stack(
              clipBehavior: Clip.none,
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space8),
                    child: Icon(
                      Icons.auto_awesome_rounded,
                      size: AimSizes.iconSm,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
                PositionedDirectional(
                  end: -1,
                  bottom: -1,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AimColors.success500,
                      shape: BoxShape.circle,
                      border:
                          Border.all(color: AimColors.neutral0, width: 1.5),
                    ),
                    child: const SizedBox(width: 10, height: 10),
                  ),
                ),
              ],
            ),
            const SizedBox(width: AimSpacing.space8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'AI Teacher',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AimTextStyles.h3.copyWith(
                      color: AimColors.neutral0,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    'Always here to help',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AimTextStyles.bodySm.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.85),
                    ),
                  ),
                ],
              ),
            ),
            Semantics(
              button: true,
              label: 'Conversation history',
              child: InkWell(
                onTap: onOpenHistory,
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.history_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space4),
            Semantics(
              button: true,
              label: 'AI Teacher settings',
              child: InkWell(
                onTap: onOpenSettings,
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.settings_outlined,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
