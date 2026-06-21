// P10-050: AssessmentListItem domain entity.
// Maps to GET /student/assessments response items.
// All fields are backend-supplied; Flutter never modifies them.

class AssessmentListItem {
  const AssessmentListItem({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.deadlineStatus,
  });

  final String id;
  final String type;
  final String title;
  final String? description;
  final String? deadlineStatus;
}
