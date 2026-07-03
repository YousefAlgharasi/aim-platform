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
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Conversations" (34)
//   docs/design/ui-for-all-system-mobile/screenshots/light/34-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/34-screen.png
//
// TASK-30: restyled to match design screen 34 — gradient header ("Conversations"),
// rows with a prettified contextRef title, a relative-time subtitle, and an
// Active/Ended pill.
//
// Deviations from the mockup (real-data-only rules):
// - The design's message-preview line ("...has finished. Try the next one
//   yourself!") and "N messages" count have no backing field —
//   ChatSessionListItem (chat-session-list-read.types.ts) only carries
//   sessionId/contextRef/status/createdAt/updatedAt. Both are omitted rather
//   than fabricated.
//
// Security rules:
// - studentId is never supplied by this screen; sessions are resolved by the
//   backend from the verified JWT.
// - This screen only renders backend-returned session summaries
//   (sessionId/contextRef/status/createdAt/updatedAt) and never computes or
//   displays mastery/level/weakness/difficulty/recommendation values.
//
// RTL/Arabic rules:
// - EdgeInsetsDirectional / direction-aware row layout throughout.

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

/// Converts a raw, machine-oriented `contextRef` slug (e.g. `lesson:fractions`
/// or `general`) into a readable label by taking the last colon-delimited
/// segment, replacing underscores/hyphens with spaces, and title-casing each
/// word. Same approach as `_prettifySkillId` in review_page.dart.
String _prettifyContextRef(String contextRef) {
  final lastSegment = contextRef.split(':').last;
  final words = lastSegment
      .split(RegExp(r'[_\-]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? contextRef : label;
}

const _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/// Real relative-time label (e.g. "2h ago", "Yesterday", "Jun 20") from the
/// backend-supplied `updatedAt` ISO timestamp. Same pattern as
/// `_relativeTimeLabel` in home_page.dart, extended to fall back to a plain
/// date past a week out (matches design screen 34's oldest row, "Jun 20").
String _relativeTimeLabel(String updatedAtIso) {
  final updatedAt = DateTime.tryParse(updatedAtIso);
  if (updatedAt == null) return updatedAtIso;

  final local = updatedAt.toLocal();
  final diff = DateTime.now().difference(local);
  if (diff.inMinutes < 1) return 'Just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
  if (diff.inHours < 24) return '${diff.inHours}h ago';
  if (diff.inDays == 1) return 'Yesterday';
  if (diff.inDays < 7) return '${diff.inDays}d ago';
  return '${_months[local.month - 1]} ${local.day}';
}

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
          lessonTitle: session.contextTitle,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aiTeacherChatProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _SessionHistoryHeader(),
          Expanded(
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
        ],
      ),
    );
  }
}

class _SessionHistoryHeader extends StatelessWidget {
  const _SessionHistoryHeader();

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
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
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
              'Conversations',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
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
    final title = session.contextTitle?.trim().isNotEmpty == true
        ? session.contextTitle!.trim()
        : _prettifyContextRef(session.contextRef);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      interactive: true,
      onTap: onTap,
      semanticLabel: '$title, ${isActive ? "active" : "ended"}',
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style:
                      AimTextStyles.title.copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  _relativeTimeLabel(session.updatedAt),
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.space8),
          AIMBadge(
            tone: isActive ? AIMBadgeTone.success : AIMBadgeTone.neutral,
            variant: AIMBadgeVariant.soft,
            pill: true,
            child: Text(isActive ? 'Active' : 'Ended'),
          ),
        ],
      ),
    );
  }
}
