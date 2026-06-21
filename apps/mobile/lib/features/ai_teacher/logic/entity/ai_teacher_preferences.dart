class AiTeacherPreferences {
  const AiTeacherPreferences({
    this.preferTextReplies = false,
    this.reducedMotion = false,
  });

  final bool preferTextReplies;
  final bool reducedMotion;

  AiTeacherPreferences copyWith({
    bool? preferTextReplies,
    bool? reducedMotion,
  }) {
    return AiTeacherPreferences(
      preferTextReplies: preferTextReplies ?? this.preferTextReplies,
      reducedMotion: reducedMotion ?? this.reducedMotion,
    );
  }
}
