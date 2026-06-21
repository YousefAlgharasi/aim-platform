// Phase 18 — P18-061
// AiTeacherStreamEvent — read-only entity for one SSE event from
// GET /ai-teacher/sessions/:id/messages/stream.
//
// The backend only ever emits events for an AI Teacher reply that has
// already passed the same response safety filter as the non-streaming
// send-message endpoint (docs/phase-18/ai-teacher-api-contracts.md) —
// this screen never sees unfiltered provider output and never computes
// mastery/level/weakness/difficulty/recommendation/review-schedule values.
sealed class AiTeacherStreamEvent {
  const AiTeacherStreamEvent();
}

/// One safety-filtered text chunk of the reply, in order.
class AiTeacherStreamChunk extends AiTeacherStreamEvent {
  const AiTeacherStreamChunk(this.text);

  final String text;
}

/// The terminal event for a streamed turn.
class AiTeacherStreamDone extends AiTeacherStreamEvent {
  const AiTeacherStreamDone({
    required this.isFallback,
    required this.provider,
    required this.model,
  });

  final bool isFallback;
  final String provider;
  final String model;
}
