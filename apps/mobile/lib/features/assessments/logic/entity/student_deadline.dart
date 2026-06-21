// P10-050: Student deadline domain entities.
// Maps to GET /student/assessments/deadlines response.
// All fields are backend-supplied; Flutter never modifies them.

class StudentDeadlineItem {
  const StudentDeadlineItem({
    required this.assessmentId,
    required this.assessmentTitle,
    required this.deadlineId,
    required this.opensAt,
    required this.closesAt,
    required this.extendedClosesAt,
    required this.status,
  });

  final String assessmentId;
  final String assessmentTitle;
  final String deadlineId;
  final String opensAt;
  final String closesAt;
  final String? extendedClosesAt;
  final String status;
}

class StudentDeadlines {
  const StudentDeadlines({
    required this.upcoming,
    required this.active,
    required this.late,
    required this.missed,
    required this.closed,
  });

  final List<StudentDeadlineItem> upcoming;
  final List<StudentDeadlineItem> active;
  final List<StudentDeadlineItem> late;
  final List<StudentDeadlineItem> missed;
  final List<StudentDeadlineItem> closed;
}
