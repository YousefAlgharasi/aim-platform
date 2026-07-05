// CurrentEnrollment — the student's active course, or none yet.
// All fields are backend-computed; Flutter never decides enrollment state.
class CurrentEnrollment {
  const CurrentEnrollment({
    required this.found,
    this.courseId,
    this.courseTitle,
    this.enrolledAt,
  });

  final bool found;
  final String? courseId;
  final String? courseTitle;
  final String? enrolledAt;

  static const none = CurrentEnrollment(found: false);
}
