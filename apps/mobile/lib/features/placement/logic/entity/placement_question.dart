/// Domain entity for a placement test question (student-safe fields only).
///
/// Scope: Phase 4 — Placement Test only.
/// skill_code is inherited from the parent section — never set by Flutter.
class PlacementQuestion {
  const PlacementQuestion({
    required this.id,
    required this.questionType,
    required this.prompt,
    this.mediaUrl,
    required this.orderIndex,
    required this.skillCode,
  });

  /// Backend-generated UUID.
  final String id;

  /// One of: multiple_choice, true_false, fill_blank, listening_choice.
  final String questionType;

  /// Question text shown to the student.
  final String prompt;

  /// Optional audio or image URL (required for listening_choice type).
  final String? mediaUrl;

  /// Display order within the section (1-based, unique per section).
  final int orderIndex;

  /// Inherited from parent section — backend-controlled, never set by Flutter.
  final String skillCode;

  bool get isListeningQuestion => questionType == 'listening_choice';
  bool get requiresMedia => isListeningQuestion;
}
