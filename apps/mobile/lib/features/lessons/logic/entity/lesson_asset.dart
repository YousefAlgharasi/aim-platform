// Phase 6 — P6-076
// LessonAsset — domain entity for lesson content assets.
//
// Maps to LessonAssetSummary returned by
// GET /curriculum/lesson-assets?lessonId=:lessonId&status=published.
//
// All fields are backend-supplied verbatim. Flutter renders them; it never
// computes type, status, order, sizeBytes, durationSeconds, or metadata.
//
// Asset types: text, image, audio, video, document, vocabulary, exercise,
// external_reference.

class LessonAsset {
  const LessonAsset({
    required this.id,
    required this.lessonId,
    required this.type,
    required this.title,
    required this.order,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.url,
    this.mimeType,
    this.sizeBytes,
    this.durationSeconds,
    this.altText,
    this.thumbnailUrl,
    this.metadata,
  });

  final String id;

  /// Parent lesson UUID — backend-assigned; never modified by Flutter.
  final String lessonId;

  /// Asset type: image | audio | video | document | external_reference.
  /// Backend-controlled; Flutter renders verbatim.
  final String type;

  final String title;
  final String? description;

  /// Absolute https URL for the asset content. May be null for documents
  /// using inline metadata. Flutter never constructs or rewrites this URL.
  final String? url;

  final String? mimeType;

  /// File size in bytes. Backend-supplied; never computed by Flutter.
  final int? sizeBytes;

  /// Duration in seconds for audio/video. Backend-supplied; never computed.
  final int? durationSeconds;

  /// Alt text for image assets. Backend-supplied; never set by Flutter.
  final String? altText;

  final String? thumbnailUrl;

  /// Backend-controlled display order. Flutter never reorders assets.
  final int order;

  /// Lifecycle status. Backend-controlled; Flutter renders verbatim.
  final String status;

  /// Arbitrary metadata blob. Backend-supplied; Flutter renders verbatim.
  final Map<String, dynamic>? metadata;

  final String createdAt;
  final String updatedAt;
}
