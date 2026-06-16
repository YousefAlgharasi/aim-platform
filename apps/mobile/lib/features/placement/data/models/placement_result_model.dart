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
  });

  factory PlacementResultModel.fromJson(Map<String, dynamic> json) {
    return PlacementResultModel(
      id: json['id'] as String,
      placementAttemptId: json['placement_attempt_id'] as String,
      estimatedLevel: json['estimated_level'] as String,
      skillMasteryMap: _parseSkillMasteryMap(
        json['skill_mastery_map'] as Map<String, dynamic>? ?? {},
      ),
      weaknesses: _parseWeaknesses(
        json['weakness_map'] as Map<String, dynamic>? ?? {},
      ),
      initialPathId: json['initial_path_id'] as String,
      createdAt: json['created_at'] as String,
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
            }
        },
        'weakness_map': {
          'weaknesses': weaknesses
              .map((w) => {
                    'skill_code': w.skillCode,
                    'mastery_score': w.masteryScore,
                    'priority': w.priority,
                  })
              .toList(),
        },
        'initial_path_id': initialPathId,
        'created_at': createdAt,
      };
}

Map<String, PlacementSkillMastery> _parseSkillMasteryMap(
  Map<String, dynamic> raw,
) {
  final result = <String, PlacementSkillMastery>{};
  for (final entry in raw.entries) {
    final data = entry.value as Map<String, dynamic>;
    result[entry.key] = PlacementSkillMastery(
      skillCode: entry.key,
      totalQuestions: data['total_questions'] as int,
      correctAnswers: data['correct_answers'] as int,
      masteryScore: (data['mastery_score'] as num).toDouble(),
    );
  }
  return result;
}

List<PlacementWeakness> _parseWeaknesses(Map<String, dynamic> raw) {
  final list = raw['weaknesses'] as List<dynamic>? ?? [];
  return list.map((item) {
    final data = item as Map<String, dynamic>;
    return PlacementWeakness(
      skillCode: data['skill_code'] as String,
      masteryScore: (data['mastery_score'] as num).toDouble(),
      priority: data['priority'] as int,
    );
  }).toList();
}
