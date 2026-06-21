// P10-050: StudentDeadlineModel — data-layer model.
// Parses JSON from GET /student/assessments/deadlines.

import '../../logic/entity/student_deadline.dart';

class StudentDeadlineItemModel extends StudentDeadlineItem {
  const StudentDeadlineItemModel({
    required super.assessmentId,
    required super.assessmentTitle,
    required super.deadlineId,
    required super.opensAt,
    required super.closesAt,
    required super.extendedClosesAt,
    required super.status,
  });

  factory StudentDeadlineItemModel.fromJson(Map<String, dynamic> json) {
    return StudentDeadlineItemModel(
      assessmentId: json['assessmentId'] as String,
      assessmentTitle: json['assessmentTitle'] as String,
      deadlineId: json['deadlineId'] as String,
      opensAt: json['opensAt'] as String,
      closesAt: json['closesAt'] as String,
      extendedClosesAt: json['extendedClosesAt'] as String?,
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'assessmentId': assessmentId,
        'assessmentTitle': assessmentTitle,
        'deadlineId': deadlineId,
        'opensAt': opensAt,
        'closesAt': closesAt,
        'extendedClosesAt': extendedClosesAt,
        'status': status,
      };
}

class StudentDeadlinesModel extends StudentDeadlines {
  const StudentDeadlinesModel({
    required super.upcoming,
    required super.active,
    required super.late,
    required super.missed,
    required super.closed,
  });

  factory StudentDeadlinesModel.fromJson(Map<String, dynamic> json) {
    List<StudentDeadlineItemModel> parseGroup(String key) =>
        (json[key] as List<dynamic>? ?? [])
            .map((d) =>
                StudentDeadlineItemModel.fromJson(d as Map<String, dynamic>))
            .toList();

    return StudentDeadlinesModel(
      upcoming: parseGroup('upcoming'),
      active: parseGroup('active'),
      late: parseGroup('late'),
      missed: parseGroup('missed'),
      closed: parseGroup('closed'),
    );
  }

  Map<String, dynamic> toJson() => {
        'upcoming':
            upcoming.map((d) => (d as StudentDeadlineItemModel).toJson()).toList(),
        'active':
            active.map((d) => (d as StudentDeadlineItemModel).toJson()).toList(),
        'late':
            late.map((d) => (d as StudentDeadlineItemModel).toJson()).toList(),
        'missed':
            missed.map((d) => (d as StudentDeadlineItemModel).toJson()).toList(),
        'closed':
            closed.map((d) => (d as StudentDeadlineItemModel).toJson()).toList(),
      };
}
