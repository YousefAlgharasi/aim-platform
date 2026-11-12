// LessonExplanationModel — tolerant JSON parser for lessons.explanation.
//
// Returns null (instead of throwing) when the field is missing or malformed so
// a bad explanation can never break the lesson screen.

import '../../logic/entity/lesson_explanation.dart';

class LessonExplanationModel {
  const LessonExplanationModel._();

  static LessonExplanation? tryParse(Object? json) {
    if (json is! Map) return null;
    try {
      final overview = _str(json['overview']);
      final sections = <LessonExplanationSection>[];
      for (final s in _list(json['sections'])) {
        if (s is! Map) continue;
        final heading = _str(s['heading']);
        final body = _str(s['body']);
        if (heading.isEmpty && body.isEmpty) continue;
        final examples = <LessonExplanationExample>[];
        for (final e in _list(s['examples'])) {
          if (e is! Map) continue;
          final text = _str(e['text']);
          if (text.isEmpty) continue;
          final note = _str(e['note']);
          examples.add(LessonExplanationExample(
            text: text,
            note: note.isEmpty ? null : note,
          ));
        }
        sections.add(LessonExplanationSection(
          heading: heading,
          body: body,
          examples: examples,
        ));
      }
      final keyPoints = _list(json['keyPoints'])
          .map(_str)
          .where((k) => k.isNotEmpty)
          .toList();
      final mistakes = <LessonExplanationMistake>[];
      for (final m in _list(json['commonMistakes'])) {
        if (m is! Map) continue;
        final wrong = _str(m['wrong']);
        final right = _str(m['right']);
        if (wrong.isEmpty || right.isEmpty) continue;
        mistakes.add(LessonExplanationMistake(
          wrong: wrong,
          right: right,
          why: _str(m['why']),
        ));
      }
      final recap = _str(json['recap']);
      if (overview.isEmpty && sections.isEmpty) return null;
      return LessonExplanation(
        overview: overview,
        sections: sections,
        keyPoints: keyPoints,
        commonMistakes: mistakes,
        recap: recap.isEmpty ? null : recap,
      );
    } catch (_) {
      return null;
    }
  }

  static String _str(Object? v) => v is String ? v.trim() : '';
  static List<Object?> _list(Object? v) => v is List ? v : const [];
}
