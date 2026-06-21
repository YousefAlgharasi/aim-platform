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
    required super.createdAt,
    required super.updatedAt,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) {
    return LessonModel(
      id: json['id'] as String,
      chapterId: json['chapterId'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      status: json['status'] as String,
      sortOrder: (json['sortOrder'] as num).toInt(),
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'chapterId': chapterId,
        'title': title,
        'description': description,
        'status': status,
        'sortOrder': sortOrder,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };
}
