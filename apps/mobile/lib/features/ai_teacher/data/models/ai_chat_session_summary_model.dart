// Phase 8 — P8-081
// AiChatSessionSummaryModel — data-layer model for AiChatSessionSummary.
//
// Parses one entry of the response of GET /ai-teacher/sessions
// (ChatSessionListItem, chat-session-list-read.types.ts).

import '../../logic/entity/ai_chat_session_summary.dart';

class AiChatSessionSummaryModel extends AiChatSessionSummary {
  const AiChatSessionSummaryModel({
    required super.sessionId,
    required super.contextRef,
    super.contextTitle,
    required super.status,
    required super.createdAt,
    required super.updatedAt,
  });

  factory AiChatSessionSummaryModel.fromJson(Map<String, dynamic> json) {
    return AiChatSessionSummaryModel(
      sessionId: json['sessionId'] as String,
      contextRef: json['contextRef'] as String,
      contextTitle: json['contextTitle'] as String?,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'sessionId': sessionId,
        'contextRef': contextRef,
        'contextTitle': contextTitle,
        'status': status,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };

  static List<AiChatSessionSummaryModel> listFromJson(
    Map<String, dynamic> json,
  ) {
    final sessions = json['sessions'] as List<dynamic>? ?? const [];
    return sessions
        .map(
          (entry) =>
              AiChatSessionSummaryModel.fromJson(entry as Map<String, dynamic>),
        )
        .toList();
  }
}
