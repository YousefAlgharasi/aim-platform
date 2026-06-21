// Phase 18 — P18-064
// AiTeacherSafetyStatus — read-only entity for a session's student-safe
// safety status.
//
// Mirrors AiTeacherSafetyStatusResult (ai-teacher-safety-status.types.ts,
// GET /ai-teacher/sessions/:id/safety-status). Only the reduced
// 'ok'/'limited' status and a timestamp are ever exposed — never the raw
// reason_category taxonomy or any rejected message/response content, and
// no mastery/level/weakness/difficulty/recommendation/review-schedule
// value.

class AiTeacherSafetyStatus {
  const AiTeacherSafetyStatus({
    required this.sessionId,
    required this.status,
    required this.lastCheckedAt,
  });

  final String sessionId;

  /// 'ok' | 'limited'.
  final String status;

  final String? lastCheckedAt;

  bool get isLimited => status == 'limited';
}
