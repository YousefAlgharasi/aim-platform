import 'voice_feedback_result.dart';
import 'voice_message.dart';
import 'voice_turn_result.dart';

/// Aggregated state for the active Voice Tutor session (P18-065 / P18-066).
/// Holds only backend-returned values; never computes mastery/level/
/// weakness/difficulty/recommendation/review-schedule data.
class VoiceTeacherSessionState {
  const VoiceTeacherSessionState({
    this.sessionId,
    this.history = const [],
    this.lastTurn,
    this.lastFeedback,
  });

  final String? sessionId;
  final List<VoiceMessage> history;
  final VoiceTurnResult? lastTurn;
  final VoiceFeedbackResult? lastFeedback;

  VoiceTeacherSessionState copyWith({
    String? sessionId,
    List<VoiceMessage>? history,
    VoiceTurnResult? lastTurn,
    VoiceFeedbackResult? lastFeedback,
  }) {
    return VoiceTeacherSessionState(
      sessionId: sessionId ?? this.sessionId,
      history: history ?? this.history,
      lastTurn: lastTurn ?? this.lastTurn,
      lastFeedback: lastFeedback ?? this.lastFeedback,
    );
  }
}
