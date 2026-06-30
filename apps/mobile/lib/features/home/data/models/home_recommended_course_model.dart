// HomeRecommendedCourseModel — data-layer model.
//
// Parses GET /lessons/recommended-course.
// Backend picks the course based on the student's placement result.

import '../../logic/entity/home_recommended_course.dart';

class HomeRecommendedCourseModel extends HomeRecommendedCourse {
  const HomeRecommendedCourseModel({
    required super.courseId,
    required super.courseTitle,
    super.courseDescription,
    super.estimatedLevel,
  });

  factory HomeRecommendedCourseModel.fromJson(Map<String, dynamic> json) {
    return HomeRecommendedCourseModel(
      courseId: json['courseId'] as String,
      courseTitle: json['courseTitle'] as String,
      courseDescription: json['courseDescription'] as String?,
      estimatedLevel: json['estimatedLevel'] as String?,
    );
  }
}
