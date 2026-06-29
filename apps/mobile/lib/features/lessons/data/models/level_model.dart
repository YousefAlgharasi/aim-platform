// LevelModel — data-layer model for Level.
//
// Parses the LevelSummary from GET /curriculum/courses/:courseId/levels.
// All fields are backend-supplied verbatim. Flutter never computes or
// modifies status, sortOrder, or any curriculum hierarchy value.

import '../../logic/entity/level.dart';

/// Data-layer model extending the [Level] domain entity.
class LevelModel extends Level {
  const LevelModel({
    required super.id,
    required super.courseId,
    required super.title,
    required super.status,
    required super.sortOrder,
    required super.createdAt,
    required super.updatedAt,
    super.code,
    super.slug,
    super.description,
  });

  factory LevelModel.fromJson(Map<String, dynamic> json) {
    return LevelModel(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      title: json['title'] as String,
      code: json['code'] as String?,
      slug: json['slug'] as String?,
      description: json['description'] as String?,
      status: json['status'] as String,
      sortOrder: (json['sortOrder'] as num).toInt(),
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
