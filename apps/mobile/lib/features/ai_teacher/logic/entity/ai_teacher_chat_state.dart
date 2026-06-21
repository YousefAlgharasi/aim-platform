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
    this.streamingText,
    this.isStreaming = false,
    this.safetyStatus,
  });

  final AiChatSessionModel? activeSession;
  final List<AiChatSessionSummaryModel> sessions;
  final AiChatHistoryModel? history;
  final AiTeacherReplyModel? lastReply;
  final AiTeacherFeedbackModel? lastFeedback;
  final bool isSending;

  /// Accumulated safety-filtered text chunks for an in-progress streamed
  /// reply (P18-061). Null when no stream is in progress.
  final String? streamingText;
  final bool isStreaming;

  /// Student-safe safety status for the active session (P18-064).
  final AiTeacherSafetyStatusModel? safetyStatus;

  bool get hasActiveSession => activeSession != null;
  bool get isSafetyLimited => safetyStatus?.isLimited ?? false;

  AiTeacherChatState copyWith({
    AiChatSessionModel? activeSession,
    List<AiChatSessionSummaryModel>? sessions,
    AiChatHistoryModel? history,
    AiTeacherReplyModel? lastReply,
    AiTeacherFeedbackModel? lastFeedback,
    bool? isSending,
    String? streamingText,
    bool? isStreaming,
    AiTeacherSafetyStatusModel? safetyStatus,
    bool clearLastReply = false,
    bool clearLastFeedback = false,
    bool clearStreamingText = false,
  }) {
    return AiTeacherChatState(
      activeSession: activeSession ?? this.activeSession,
      sessions: sessions ?? this.sessions,
      history: history ?? this.history,
      lastReply: clearLastReply ? null : lastReply ?? this.lastReply,
      lastFeedback:
          clearLastFeedback ? null : lastFeedback ?? this.lastFeedback,
      isSending: isSending ?? this.isSending,
      streamingText:
          clearStreamingText ? null : streamingText ?? this.streamingText,
      isStreaming: isStreaming ?? this.isStreaming,
      safetyStatus: safetyStatus ?? this.safetyStatus,
    );
  }
}
