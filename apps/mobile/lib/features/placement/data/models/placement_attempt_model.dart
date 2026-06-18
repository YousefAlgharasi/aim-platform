import '../../logic/entity/placement_attempt.dart';

/// Data-layer model for [PlacementAttempt].
/// Parses the student-safe API response shape from POST /placement/attempts
/// and GET /placement/attempts/:id.
class PlacementAttemptModel extends PlacementAttempt {
  const PlacementAttemptModel({
    required super.id,
    required super.placementTestId,
    required super.status,
    required super.startedAt,
    super.submittedAt,
    super.completedAt,
  });

  factory PlacementAttemptModel.fromJson(Map<String, dynamic> json) {
    return PlacementAttemptModel(
      id: json['id'] as String,
      placementTestId: json['placement_test_id'] as String,
      status: json['status'] as String,
      startedAt: json['started_at'] as String,
      submittedAt: json['submitted_at'] as String?,
      completedAt: json['completed_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'placement_test_id': placementTestId,
        'status': status,
        'started_at': startedAt,
        'submitted_at': submittedAt,
        'completed_at': completedAt,
      };
}
