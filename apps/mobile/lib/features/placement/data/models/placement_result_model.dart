// Phase 4 — P4-069 / P4-070
// PlacementResultModel — data-layer model for PlacementResult.
//
// P4-070 fix: PlacementSkillMastery now requires [signal] from the backend.
// Flutter must NEVER compute signal from masteryScore locally.
// The backend sends 'signal' ('strong'/'developing'/'emerging') in the
// skill_mastery_map response. If the backend does not yet include it,
// we fall back to 'unknown' — never to a locally-computed threshold check.

import '../../logic/entity/placement_result.dart';
import '../../logic/entity/placement_skill_mastery.dart';

/// Data-layer model for [PlacementResult].
/// Parses the student-safe API response from GET /placement/attempts/:id/result.
///
/// All scoring fields are backend-computed. Flutter must never calculate or
/// infer estimated_level, skill_mastery_map, weakness_map, or initial_path_id.
class PlacementResultModel extends PlacementResult {
  const PlacementResultModel({
    required super.id,
    required super.placementAttemptId,
    required super.estimatedLevel,
    required super.skillMasteryMap,
    required super.weaknesses,
    required super.initialPathId,
    required super.createdAt,
    super.recommendedCourseId,
    super.unlockedCourseIds,
    super.note,
  });

  factory PlacementResultModel.fromJson(Map<String, dynamic> json) {
    return PlacementResultModel(
      id: json['id'] as String,
      placementAttemptId: json['placement_attempt_id'] as String,
      estimatedLevel: json['estimated_level'] as String,
      skillMasteryMap: _parseSkillMasteryMap(
        _asStringMap(json['skill_mastery_map']),
      ),
      weaknesses: _parseWeaknesses(
        _asStringMap(json['weakness_map']),
      ),
      initialPathId: json['initial_path_id'] as String?,
      createdAt: json['created_at'] as String,
      recommendedCourseId: json['recommended_course_id'] as String?,
      unlockedCourseIds: (json['unlocked_course_ids'] as List<dynamic>?)
              ?.map((id) => id as String)
              .toList() ??
          const [],
      note: json['note'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'placement_attempt_id': placementAttemptId,
        'estimated_level': estimatedLevel,
        'skill_mastery_map': {
          for (final entry in skillMasteryMap.entries)
            entry.key: {
              'total_questions': entry.value.totalQuestions,
              'correct_answers': entry.value.correctAnswers,
              'mastery_score': entry.value.masteryScore,
              'signal': entry.value.signal,
            }
        },
        'weakness_map': {
          'weaknesses': weaknesses
              .map((w) => {
                    'skill_code': w.skillCode,
                    'mastery_score': w.masteryScore,
                    'priority': w.priority,
                    if (w.signal != null) 'signal': w.signal,
                  })
              .toList(),
        },
        'initial_path_id': initialPathId,
        'created_at': createdAt,
        'recommended_course_id': recommendedCourseId,
        'unlocked_course_ids': unlockedCourseIds,
        'note': note,
      };
}

Map<String, dynamic> _asStringMap(Object? value) {
  if (value == null) return {};
  return Map<String, dynamic>.from(value as Map);
}

Map<String, PlacementSkillMastery> _parseSkillMasteryMap(
  Map<String, dynamic> raw,
) {
  final result = <String, PlacementSkillMastery>{};
  for (final entry in raw.entries) {
    final data = Map<String, dynamic>.from(entry.value as Map);
    // P4-070: signal must come from backend — never computed locally.
    // Fallback to 'unknown' if backend does not yet send the field.
    final signal = data['signal'] as String? ?? 'unknown';
    result[entry.key] = PlacementSkillMastery(
      skillCode: entry.key,
      totalQuestions: data['total_questions'] as int,
      correctAnswers: data['correct_answers'] as int,
      masteryScore: (data['mastery_score'] as num).toDouble(),
      signal: signal,
    );
  }
  return result;
}

List<PlacementWeakness> _parseWeaknesses(Map<String, dynamic> raw) {
  final list = raw['weaknesses'] as List<dynamic>? ?? [];
  return list.map((item) {
    final data = Map<String, dynamic>.from(item as Map);
    return PlacementWeakness(
      skillCode: data['skill_code'] as String,
      masteryScore: (data['mastery_score'] as num).toDouble(),
      priority: data['priority'] as int,
      signal: data['signal'] as String?,
    );
  }).toList();
}
