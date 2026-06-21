// P10-050: AssessmentListItemModel — data-layer model.
// Parses JSON from GET /student/assessments.

import '../../logic/entity/assessment_list_item.dart';

class AssessmentListItemModel extends AssessmentListItem {
  const AssessmentListItemModel({
    required super.id,
    required super.type,
    required super.title,
    required super.description,
    required super.deadlineStatus,
  });

  factory AssessmentListItemModel.fromJson(Map<String, dynamic> json) {
    return AssessmentListItemModel(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      deadlineStatus: json['deadlineStatus'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'title': title,
        'description': description,
        'deadlineStatus': deadlineStatus,
      };
}
