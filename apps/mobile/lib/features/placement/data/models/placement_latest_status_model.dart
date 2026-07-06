// PlacementLatestStatusModel — data-layer model parsing the response of
// GET /placement/attempts/latest.
//
// Lets the mobile app answer "has this student already taken the placement
// test?" without knowing an attemptId up front — used by the drawer's
// "Placement Test" menu entry (P25 UX pass).
//
// Security rules:
// - status/attemptId/result are all backend-computed and displayed as-is.
// - result is only non-null when status == 'completed'; Flutter never
//   fabricates a result for other statuses.

import 'placement_result_model.dart';

class PlacementLatestStatusModel {
  const PlacementLatestStatusModel({
    required this.status,
    required this.attemptId,
    required this.result,
  });

  factory PlacementLatestStatusModel.fromJson(Map<String, dynamic> json) {
    final resultJson = json['result'] as Map<String, dynamic>?;
    return PlacementLatestStatusModel(
      status: json['status'] as String,
      attemptId: json['attemptId'] as String?,
      result: resultJson == null
          ? null
          : PlacementResultModel.fromJson(resultJson),
    );
  }

  /// One of 'none', 'active', 'submitted', 'completed'.
  final String status;

  final String? attemptId;

  /// Only populated when [status] is 'completed'.
  final PlacementResultModel? result;
}
