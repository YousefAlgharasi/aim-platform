import '../../logic/entity/placement_section.dart';

/// Data-layer model for [PlacementSection].
/// Parses the student-safe API response shape from GET /placement/active/sections.
class PlacementSectionModel extends PlacementSection {
  const PlacementSectionModel({
    required super.id,
    required super.title,
    required super.skillCode,
    required super.orderIndex,
    required super.totalQuestions,
  });

  factory PlacementSectionModel.fromJson(Map<String, dynamic> json) {
    return PlacementSectionModel(
      id: json['id'] as String,
      title: json['title'] as String,
      skillCode: json['skill_code'] as String,
      orderIndex: json['order_index'] as int,
      totalQuestions: json['total_questions'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'skill_code': skillCode,
        'order_index': orderIndex,
        'total_questions': totalQuestions,
      };
}
