// Phase 8 — P8-083
// AiTeacherChatState — UI-facing chat state populated only from backend data.

import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';

class AiTeacherChatState {
  const AiTeacherChatState({
    this.activeSession,
    this.sessions = const [],
    this.history,
    this.lastReply,
    this.lastFeedback,
    this.isSending = false,
  });

  final AiChatSessionModel? activeSession;
  final List<AiChatSessionSummaryModel> sessions;
  final AiChatHistoryModel? history;
  final AiTeacherReplyModel? lastReply;
  final AiTeacherFeedbackModel? lastFeedback;
  final bool isSending;

  bool get hasActiveSession => activeSession != null;

  AiTeacherChatState copyWith({
    AiChatSessionModel? activeSession,
    List<AiChatSessionSummaryModel>? sessions,
    AiChatHistoryModel? history,
    AiTeacherReplyModel? lastReply,
    AiTeacherFeedbackModel? lastFeedback,
    bool? isSending,
    bool clearLastReply = false,
    bool clearLastFeedback = false,
  }) {
    return AiTeacherChatState(
      activeSession: activeSession ?? this.activeSession,
      sessions: sessions ?? this.sessions,
      history: history ?? this.history,
      lastReply: clearLastReply ? null : lastReply ?? this.lastReply,
      lastFeedback:
          clearLastFeedback ? null : lastFeedback ?? this.lastFeedback,
      isSending: isSending ?? this.isSending,
    );
  }
}
