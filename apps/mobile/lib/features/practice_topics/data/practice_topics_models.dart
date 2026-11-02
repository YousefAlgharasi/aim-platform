// Practice Speaking + Write a Paragraph models (parse backend responses verbatim).
// The AI score is display-only; XP and correctness come from the backend.

class PracticeTopic {
  const PracticeTopic({
    required this.id,
    required this.kind,
    required this.title,
    required this.xpReward,
    this.description,
    this.levelCode,
    this.timeLimitSeconds,
    this.minWords,
  });

  factory PracticeTopic.fromJson(Map<String, dynamic> json) => PracticeTopic(
        id: json['id'] as String,
        kind: json['kind'] as String,
        title: json['title'] as String? ?? '',
        description: json['description'] as String?,
        levelCode: json['levelCode'] as String?,
        xpReward: (json['xpReward'] as num?)?.toInt() ?? 0,
        timeLimitSeconds: (json['timeLimitSeconds'] as num?)?.toInt(),
        minWords: (json['minWords'] as num?)?.toInt(),
      );

  final String id;
  final String kind;
  final String title;
  final String? description;
  final String? levelCode;
  final int xpReward;
  final int? timeLimitSeconds;
  final int? minWords;
}

/// Everything the voice screen needs to run a practice-speaking session.
class PracticeSpeakingStart {
  const PracticeSpeakingStart({required this.attemptId, required this.sessionId, required this.topic});

  factory PracticeSpeakingStart.fromJson(Map<String, dynamic> json) => PracticeSpeakingStart(
        attemptId: json['attemptId'] as String,
        sessionId: json['sessionId'] as String,
        topic: PracticeTopic.fromJson(json['topic'] as Map<String, dynamic>),
      );

  final String attemptId;
  final String sessionId;
  final PracticeTopic topic;

  /// The voice session is get-or-create by this contextRef, so opening the voice screen with it
  /// resumes the session the backend just created for this attempt.
  String get contextRef => 'practice:${topic.id}:$attemptId';
}

class WritingCorrection {
  const WritingCorrection({required this.original, required this.correction, required this.explanation});

  factory WritingCorrection.fromJson(Map<String, dynamic> json) => WritingCorrection(
        original: json['original'] as String? ?? '',
        correction: json['correction'] as String? ?? '',
        explanation: json['explanation'] as String? ?? '',
      );

  final String original;
  final String correction;
  final String explanation;
}

class WritingResult {
  const WritingResult({
    required this.score,
    required this.summary,
    required this.corrections,
    required this.xpAwarded,
  });

  factory WritingResult.fromJson(Map<String, dynamic> json) => WritingResult(
        score: ((json['score'] as num?)?.toInt() ?? 0).clamp(0, 100),
        summary: json['summary'] as String? ?? '',
        corrections: (json['corrections'] as List<dynamic>? ?? const [])
            .map((c) => WritingCorrection.fromJson(c as Map<String, dynamic>))
            .toList(),
        xpAwarded: (json['xpAwarded'] as num?)?.toInt() ?? 0,
      );

  final int score;
  final String summary;
  final List<WritingCorrection> corrections;
  final int xpAwarded;
}
