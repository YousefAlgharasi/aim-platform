// Phase 6 — P6-070
// CourseModel — data-layer model for Course.
//
// Parses the CourseSummary from GET /curriculum/courses.
// All fields are backend-supplied verbatim. Flutter never computes or
// modifies status, sortOrder, or any curriculum hierarchy value.

import '../../logic/entity/course.dart';

/// Data-layer model extending the [Course] domain entity.
class CourseModel extends Course {
  const CourseModel({
    required super.id,
    required super.title,
    required super.status,
    required super.sortOrder,
    required super.createdAt,
    required super.updatedAt,
    super.slug,
    super.description,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String?,
      description: json['description'] as String?,
      status: json['status'] as String,
      sortOrder: (json['sortOrder'] as num).toInt(),
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'slug': slug,
        'description': description,
        'status': status,
        'sortOrder': sortOrder,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };
}
