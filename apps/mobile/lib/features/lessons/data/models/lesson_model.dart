// Phase 6 — P6-070
// LessonModel — data-layer model for Lesson.
//
// Parses the LessonSummary from GET /curriculum/chapters/:chapterId/lessons.
// All fields are backend-supplied verbatim. Flutter never computes or
// modifies status, sortOrder, or any curriculum hierarchy value.

import '../../logic/entity/lesson.dart';

/// Data-layer model extending the [Lesson] domain entity.
class LessonModel extends Lesson {
  const LessonModel({
    required super.id,
    required super.chapterId,
    required super.title,
    required super.description,
    required super.status,
    required super.sortOrder,
    required super.xpValue,
    required super.createdAt,
    required super.updatedAt,
    super.explanation,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) {
    return LessonModel(
      id: json['id'] as String,
      chapterId: json['chapterId'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      status: json['status'] as String,
      sortOrder: (json['sortOrder'] as num).toInt(),
      xpValue: (json['xpValue'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      explanation: _parseExplanation(json['explanation']),
    );
  }

  static String? _str(Object? v) {
    if (v is! String) return null;
    final t = v.trim();
    return t.isEmpty ? null : t;
  }

  /// Reads the written explanation defensively: anything missing or the wrong
  /// shape is skipped rather than failing the whole lesson.
  static LessonExplanation? _parseExplanation(Object? raw) {
    if (raw is! Map<String, dynamic>) return null;
    final sections = <LessonExplanationSection>[];
    for (final s in (raw['sections'] as List<dynamic>? ?? const [])) {
      if (s is! Map<String, dynamic>) continue;
      final heading = _str(s['heading']);
      if (heading == null) continue;
      final examples = <LessonExample>[];
      for (final e in (s['examples'] as List<dynamic>? ?? const [])) {
        if (e is! Map<String, dynamic>) continue;
        final text = _str(e['text']);
        if (text != null) examples.add(LessonExample(text: text, note: _str(e['note'])));
      }
      sections.add(LessonExplanationSection(
        heading: heading,
        body: (s['body'] as String?) ?? '',
        examples: examples,
      ));
    }
    final keyPoints = [
      for (final k in (raw['keyPoints'] as List<dynamic>? ?? const []))
        if (_str(k) != null) _str(k)!,
    ];
    final mistakes = <LessonMistake>[];
    for (final m in (raw['commonMistakes'] as List<dynamic>? ?? const [])) {
      if (m is! Map<String, dynamic>) continue;
      final wrong = _str(m['wrong']);
      final right = _str(m['right']);
      if (wrong != null && right != null) {
        mistakes.add(LessonMistake(wrong: wrong, right: right, why: _str(m['why']) ?? ''));
      }
    }
    final overview = _str(raw['overview']) ?? '';
    final recap = _str(raw['recap']);
    if (overview.isEmpty && sections.isEmpty && keyPoints.isEmpty && mistakes.isEmpty && recap == null) {
      return null;
    }
    return LessonExplanation(
      overview: overview,
      sections: sections,
      keyPoints: keyPoints,
      commonMistakes: mistakes,
      recap: recap,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'chapterId': chapterId,
        'title': title,
        'description': description,
        'status': status,
        'sortOrder': sortOrder,
        'xpValue': xpValue,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };
}
