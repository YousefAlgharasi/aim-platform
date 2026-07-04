// Phase 8 — P8-081
// AiChatSessionModel — data-layer model for AiChatSession.
//
// Parses the response of POST /ai-teacher/sessions
// (StartChatSessionResult, chat-session-start.types.ts).

import '../../logic/entity/ai_chat_session.dart';

class AiChatSessionModel extends AiChatSession {
  const AiChatSessionModel({
    required super.sessionId,
    required super.studentId,
    required super.contextRef,
    required super.status,
    required super.createdAt,
    super.focusRecap,
    super.lastSessionRecap,
  });

  factory AiChatSessionModel.fromJson(Map<String, dynamic> json) {
    return AiChatSessionModel(
      sessionId: json['sessionId'] as String,
      studentId: json['studentId'] as String,
      contextRef: json['contextRef'] as String,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
      focusRecap: json['focusRecap'] as String?,
      lastSessionRecap: json['lastSessionRecap'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'sessionId': sessionId,
        'studentId': studentId,
        'contextRef': contextRef,
        'status': status,
        'createdAt': createdAt,
        'focusRecap': focusRecap,
        'lastSessionRecap': lastSessionRecap,
      };
}
