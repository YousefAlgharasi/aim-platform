// AIM pipeline live wiring.
// SessionStartResponseModel — the payload POST /sessions/start returns.
//
// CRITICAL SECURITY RULES:
// - Every field here is backend-issued; Flutter never constructs a session id.
// - currentLevel is backend-resolved from placement; display-only, never used
//   for any local computation.
// - No mastery, weakness, difficulty, or other AIM-owned value exists here.

class SessionStartResponseModel {
  const SessionStartResponseModel({
    required this.id,
    required this.sessionType,
    required this.status,
    required this.startedAt,
    required this.currentLevel,
  });

  /// Backend-issued learning session UUID. Passed verbatim to
  /// GET /sessions/:id/questions and POST /sessions/:id/attempt.
  final String id;

  /// Backend-classified session type (e.g. lesson_practice).
  final String sessionType;

  /// Session lifecycle status (active on creation).
  final String status;

  /// ISO-8601 timestamp the backend recorded for session start.
  final String startedAt;

  /// Backend-resolved level snapshot. Display-only.
  final String currentLevel;

  factory SessionStartResponseModel.fromJson(Map<String, dynamic> json) {
    return SessionStartResponseModel(
      id: json['id'] as String,
      sessionType: json['sessionType'] as String? ?? '',
      status: json['status'] as String? ?? '',
      startedAt: json['startedAt'] as String? ?? '',
      currentLevel: json['currentLevel'] as String? ?? '',
    );
  }
}
