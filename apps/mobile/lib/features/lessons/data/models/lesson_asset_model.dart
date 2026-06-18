// Phase 6 — P6-076
// LessonAssetModel — data-layer model for LessonAsset.
//
// Parses LessonAssetSummary from
// GET /curriculum/lesson-assets?lessonId=:lessonId&status=published.
//
// All fields are backend-supplied verbatim. Flutter never computes type,
// status, order, sizeBytes, durationSeconds, or metadata.

import '../../logic/entity/lesson_asset.dart';

/// Data-layer model extending the [LessonAsset] domain entity.
class LessonAssetModel extends LessonAsset {
  const LessonAssetModel({
    required super.id,
    required super.lessonId,
    required super.type,
    required super.title,
    required super.order,
    required super.status,
    required super.createdAt,
    required super.updatedAt,
    super.description,
    super.url,
    super.mimeType,
    super.sizeBytes,
    super.durationSeconds,
    super.altText,
    super.thumbnailUrl,
    super.metadata,
  });

  factory LessonAssetModel.fromJson(Map<String, dynamic> json) {
    return LessonAssetModel(
      id: json['id'] as String,
      lessonId: json['lessonId'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      url: json['url'] as String?,
      mimeType: json['mimeType'] as String?,
      sizeBytes: (json['sizeBytes'] as num?)?.toInt(),
      durationSeconds: (json['durationSeconds'] as num?)?.toInt(),
      altText: json['altText'] as String?,
      thumbnailUrl: json['thumbnailUrl'] as String?,
      order: (json['order'] as num).toInt(),
      status: json['status'] as String,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'lessonId': lessonId,
        'type': type,
        'title': title,
        'description': description,
        'url': url,
        'mimeType': mimeType,
        'sizeBytes': sizeBytes,
        'durationSeconds': durationSeconds,
        'altText': altText,
        'thumbnailUrl': thumbnailUrl,
        'order': order,
        'status': status,
        'metadata': metadata,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
      };
}
