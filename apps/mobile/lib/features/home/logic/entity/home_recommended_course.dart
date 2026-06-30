// HomeRecommendedCourse — domain entity for the "Recommended Course" Home section.
//
// courseTitle, courseDescription, and estimatedLevel are backend-computed from
// the student's placement result. Flutter never picks or ranks courses locally.

class HomeRecommendedCourse {
  const HomeRecommendedCourse({
    required this.courseId,
    required this.courseTitle,
    this.courseDescription,
    this.estimatedLevel,
  });

  final String courseId;
  final String courseTitle;
  final String? courseDescription;

  /// CEFR level annotation from the student's placement result (e.g. 'A1', 'A2', 'B1').
  /// Null when course was returned via fallback (no placement data).
  final String? estimatedLevel;
}
