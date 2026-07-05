// CurrentEnrollmentModel — data-layer model for CurrentEnrollment.
//
// Parses GET /enrollment/current and POST /courses/:id/enroll responses.
// All fields are backend-supplied verbatim.

import '../../logic/entity/current_enrollment.dart';

class CurrentEnrollmentModel extends CurrentEnrollment {
  const CurrentEnrollmentModel({
    required super.found,
    super.courseId,
    super.courseTitle,
    super.enrolledAt,
  });

  /// GET /enrollment/current — always includes `found`.
  factory CurrentEnrollmentModel.fromJson(Map<String, dynamic> json) {
    return CurrentEnrollmentModel(
      found: json['found'] as bool,
      courseId: json['courseId'] as String?,
      courseTitle: json['courseTitle'] as String?,
      enrolledAt: json['enrolledAt'] as String?,
    );
  }

  /// POST /courses/:id/enroll — always found (a fresh or existing
  /// enrollment was just confirmed active), no `found` field in the body.
  factory CurrentEnrollmentModel.fromEnrollResponse(Map<String, dynamic> json) {
    return CurrentEnrollmentModel(
      found: true,
      courseId: json['courseId'] as String?,
      courseTitle: json['courseTitle'] as String?,
      enrolledAt: json['enrolledAt'] as String?,
    );
  }
}
