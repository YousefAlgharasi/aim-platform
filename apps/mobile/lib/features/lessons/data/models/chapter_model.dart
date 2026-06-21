// Phase 6 — P6-070
// ChapterModel — data-layer model for Chapter.
//
// Parses the ChapterSummary from GET /curriculum/levels/:levelId/chapters.
// All fields are backend-supplied verbatim. Flutter never computes or
// modifies status, sortOrder, or any curriculum hierarchy value.

import '../../logic/entity/chapter.dart';

/// Data-layer model extending the [Chapter] domain entity.
class ChapterModel extends Chapter {
  const ChapterModel({
    required super.id,
    required super.levelId,
    required super.title,
    required super.status,
    required super.sortOrder,
    required super.createdAt,
    required super.updatedAt,
    super.slug,
    super.description,
  });

  factory ChapterModel.fromJson(Map<String, dynamic> json) {
    return ChapterModel(
      id: json['id'] as String,
      levelId: json['levelId'] as String,
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
        'levelId': levelId,
        'title': title,
        'slug': slug,
        'description': description,
        'status': status,
        'sortOrder': sortOrder,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };
}
