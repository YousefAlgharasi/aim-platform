// Phase 18 — P18-062
// AiTeacherSessionHistoryPage — conversation history list screen.
//
// Lists the student's AI Teacher chat sessions via
// [AiTeacherChatNotifier.loadSessions] (already wired since Phase 8/9) and
// opens [AiTeacherChatPage] with the selected session's id to view/continue
// that conversation. No new state-layer or repository changes were needed:
// [AiTeacherChatState.sessions] already existed and is fully backed by the
// backend session-list endpoint.
//
// Security rules:
// - studentId is never supplied by this screen; sessions are resolved by the
//   backend from the verified JWT.
// - This screen only renders backend-returned session summaries
//   (sessionId/contextRef/status/createdAt/updatedAt) and never computes or
//   displays mastery/level/weakness/difficulty/recommendation values.
//
// RTL/Arabic rules:
// - AIMTopAppBar mirrors its back arrow internally.
// - List tiles use EdgeInsetsDirectional and direction-aware row layout.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_chat_session_summary.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_chat_state.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'ai_teacher_chat_page.dart';
import '../widgets/ai_chat_error_state.dart';

/// Lists the student's AI Teacher conversations and opens the chat screen
/// for a selected session.
class AiTeacherSessionHistoryPage extends ConsumerStatefulWidget {
  const AiTeacherSessionHistoryPage({super.key});

  @override
  ConsumerState<AiTeacherSessionHistoryPage> createState() =>
      _AiTeacherSessionHistoryPageState();
}

class _AiTeacherSessionHistoryPageState
    extends ConsumerState<AiTeacherSessionHistoryPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref
        .read(aiTeacherChatProvider.notifier)
        .loadSessions(bearerToken: token);
  }

  void _openSession(AiChatSessionSummary session) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AiTeacherChatPage(
          contextRef: session.contextRef,
          sessionId: session.sessionId,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aiTeacherChatProvider);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'AI Teacher Conversations'),
      body: SafeArea(
        child: switch (state) {
          AppAsyncLoading() => const AIMFullScreenLoading(
              semanticLabel: 'Loading AI Teacher conversations',
            ),
          AppAsyncIdle() => const AIMFullScreenLoading(
              semanticLabel: 'Loading AI Teacher conversations',
            ),
          AppAsyncFailure() => AiChatErrorState(onRetry: _load),
          AppAsyncSuccess(:final data) => _SessionListContent(
              chatState: data,
              onTap: _openSession,
            ),
        },
      ),
    );
  }
}

class _SessionListContent extends StatelessWidget {
  const _SessionListContent({required this.chatState, required this.onTap});

  final AiTeacherChatState chatState;
  final void Function(AiChatSessionSummary) onTap;

  @override
  Widget build(BuildContext context) {
    final sessions = chatState.sessions;

    if (sessions.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.forum_outlined),
        title: 'No conversations yet',
        subtitle: 'Start chatting with AI Teacher to see your history here.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      itemCount: sessions.length,
      separatorBuilder: (_, __) => const SizedBox(height: AimSpacing.innerGap),
      itemBuilder: (context, index) {
        final session = sessions[index];
        return _SessionTile(session: session, onTap: () => onTap(session));
      },
    );
  }
}

class _SessionTile extends StatelessWidget {
  const _SessionTile({required this.session, required this.onTap});

  final AiChatSessionSummary session;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isActive = session.status == 'active';

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsetsDirectional.all(AimSpacing.innerGap),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    session.contextRef,
                    style: AimTextStyles.bodyMd,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    session.updatedAt,
                    style: AimTextStyles.caption.copyWith(
                      color: surfaces.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: AimSpacing.space8),
            AIMBadge(
              tone: isActive ? AIMBadgeTone.success : AIMBadgeTone.neutral,
              variant: AIMBadgeVariant.soft,
              child: Text(isActive ? 'Active' : 'Closed'),
            ),
          ],
        ),
      ),
    );
  }
}
