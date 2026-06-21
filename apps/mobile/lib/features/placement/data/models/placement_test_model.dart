import '../../logic/entity/placement_test.dart';

/// Data-layer model for [PlacementTest].
/// Parses the student-safe API response shape from GET /placement/active.
class PlacementTestModel extends PlacementTest {
  const PlacementTestModel({
    required super.id,
    required super.title,
    required super.status,
    required super.totalSections,
    required super.estimatedMinutes,
  });

  factory PlacementTestModel.fromJson(Map<String, dynamic> json) {
    return PlacementTestModel(
      id: json['id'] as String,
      title: json['title'] as String,
      status: json['status'] as String,
      totalSections: json['total_sections'] as int,
      estimatedMinutes: json['estimated_minutes'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'status': status,
        'total_sections': totalSections,
        'estimated_minutes': estimatedMinutes,
      };
}
