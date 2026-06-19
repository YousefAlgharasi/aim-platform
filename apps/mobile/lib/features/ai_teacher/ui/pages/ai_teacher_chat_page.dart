// Phase 8 — P8-085 / P8-086 / P8-087 / P8-088 / P8-089
// AiTeacherChatPage — main text chat screen for the AI Teacher feature.
//
// Provides the chat screen layout: top bar, message history list,
// loading/empty/error states, and a send row wired to
// [aiTeacherChatProvider] (P8-083). Messages render via the dedicated
// [AiChatMessageBubble] (P8-086). The input row is the dedicated
// [AiChatInputBar] (P8-087). While a reply is being generated, the
// dedicated [AiTypingIndicator] (P8-088) is appended to the message list.
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
//
// RTL/Arabic rules:
// - AIMTopAppBar mirrors its back arrow internally.
// - Message bubbles (AiChatMessageBubble) align to the student/ai_teacher
//   side using direction-aware MainAxisAlignment.end/start.
// - The send button is a trailing element in a Row, so it mirrors under RTL
//   automatically; no hard-coded TextDirection or Alignment.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
    super.key,
  });

  final String contextRef;
  final String? sessionId;

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
    final existingSessionId = widget.sessionId;

    if (existingSessionId != null && existingSessionId.isNotEmpty) {
      await notifier.loadHistory(
        bearerToken: token,
        sessionId: existingSessionId,
      );
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
      }
    }
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

    await notifier.sendMessage(
      bearerToken: token,
      sessionId: sessionId,
      message: text,
    );

    await notifier.loadHistory(bearerToken: token, sessionId: sessionId);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aiTeacherChatProvider);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'AI Teacher'),
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
  });

  final AiTeacherChatState chatState;
  final TextEditingController messageController;
  final Future<void> Function() onSend;

  @override
  Widget build(BuildContext context) {
    final messages = chatState.history?.messages ?? const [];
    final isSending = chatState.isSending;
    final itemCount = messages.length + (isSending ? 1 : 0);

    return Column(
      children: [
        Expanded(
          child: messages.isEmpty && !isSending
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
                  itemCount: itemCount,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AimSpacing.innerGap),
                  itemBuilder: (context, index) {
                    if (index >= messages.length) {
                      return const AiTypingIndicator();
                    }
                    return AiChatMessageBubble(message: messages[index]);
                  },
                ),
        ),
        AiChatInputBar(
          controller: messageController,
          isSending: chatState.isSending,
          onSend: onSend,
        ),
      ],
    );
  }
}
